import { createShardManager, DiscordUnavailableGuild } from 'discordeno';
import { parentPort, workerData } from 'worker_threads';

const script = workerData;
// eslint-disable-next-line no-console
const log = { info: console.log, debug: console.log, error: console.error };

if (!parentPort) throw new Error('Ué, worker não tem uma parent port');

const identifyPromises = new Map<number, () => void>();

let guildsIn = 0;

const manager = createShardManager({
  gatewayConfig: {
    intents: script.intents,
    token: script.token,
  },
  shardIds: [],
  totalShards: script.totalShards,
  handleMessage: async (shard, message) => {
    if (message.t === 'READY') {
      log.info(`[WORKER] Shard ${shard.id} is online`);
      if (shard.id === manager.totalShards - 1) parentPort?.postMessage({ type: 'SHARDING_ENDED' });
    }

    if (message.t === 'GUILD_DELETE') {
      const guild = message.d as DiscordUnavailableGuild;
      if (!guild.unavailable) guildsIn -= 1;
    }

    if (message.t === 'GUILD_CREATE') guildsIn += 1;

    if (['GUILD_CREATE', 'GUILD_DELETE', 'INTERACTION_CREATE'].includes(message.t ?? ''))
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
    case 'GET_GUILD_COUNT': {
      parentPort?.postMessage({
        type: 'NONCE_REPLY',
        nonce: message.nonce,
        data: { guilds: guildsIn },
      });
    }
  }
});
