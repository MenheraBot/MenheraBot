import { ActivityTypes, createShardManager, DiscordUnavailableGuild, Shard } from 'discordeno';
import { parentPort, workerData } from 'worker_threads';

const script = workerData;
// eslint-disable-next-line no-console
const log = { info: console.log, debug: console.log, error: console.error };

if (!parentPort) throw new Error('Ué, worker não tem uma parent port');

const identifyPromises = new Map<number, () => void>();

const guildsPerShards = new Map<number, number>();

const statedAt = Date.now();

const manager = createShardManager({
  gatewayConfig: {
    intents: script.intents,
    token: script.token,
  },
  shardIds: [],
  createShardOptions: {
    makePresence: async (shardId) => {
      return {
        activities: [
          {
            name: `❤️ Atualizada e Preparada! | Shard ${shardId} `,
            type: ActivityTypes.Game,
            createdAt: Date.now(),
          },
        ],
        status: 'online',
      };
    },
  },
  totalShards: script.totalShards,
  handleMessage: async (shard, message) => {
    if (message.t === 'READY') {
      log.info(`[WORKER] Shard ${shard.id} is online`);
      parentPort?.postMessage({ type: 'SHARD_READY' });
    }

    if (message.t === 'GUILD_DELETE') {
      const guild = message.d as DiscordUnavailableGuild;
      if (!guild.unavailable) {
        const oldValue = guildsPerShards.get(shard.id) ?? 0;
        guildsPerShards.set(shard.id, oldValue - 1);
      }
    }

    if (message.t === 'GUILD_CREATE') {
      const oldValue = guildsPerShards.get(shard.id) ?? 0;
      guildsPerShards.set(shard.id, oldValue + 1);
    }

    if (['GUILD_DELETE', 'INTERACTION_CREATE'].includes(message.t ?? ''))
      parentPort?.postMessage({
        type: 'BROADCAST_EVENT',
        data: { shardId: shard.id, data: message },
      });
  },
  requestIdentify: async (shardId) => {
    return new Promise((res) => {
      identifyPromises.set(shardId, res);

      const identifyRequest = {
        type: 'REQUEST_IDENTIFY',
        shardId,
      };

      parentPort?.postMessage(identifyRequest);
    });
  },
});

const buildShardInfo = (shard: Shard) => {
  return {
    workerId: script.workerId,
    shardId: shard.id,
    ping: shard.heart.rtt ?? -1,
    guilds: guildsPerShards.get(shard.id) ?? 0,
    uptime: Date.now() - statedAt,
  };
};

parentPort?.on('message', async (message) => {
  switch (message.type) {
    case 'IDENTIFY_SHARD': {
      await manager.identify(message.shardId);
      break;
    }
    case 'ALLOW_IDENTIFY': {
      identifyPromises.get(message.shardId)?.();
      identifyPromises.delete(message.shardId);

      break;
    }
    case 'GET_SHARDS_INFO': {
      const infos = manager.shards.map(buildShardInfo);

      parentPort?.postMessage({
        type: 'NONCE_REPLY',
        nonce: message.nonce,
        data: infos,
      });
      break;
    }
  }
});
