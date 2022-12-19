import {
  ActivityTypes,
  createShardManager,
  DiscordUnavailableGuild,
  GatewayOpcodes,
  Shard,
  ShardSocketCloseCodes,
  ShardState,
} from 'discordeno';
import { parentPort, workerData } from 'worker_threads';

const script = workerData;
// eslint-disable-next-line no-console
const log = { info: console.log, debug: console.log, error: console.error };

if (!parentPort) throw new Error('Ué, worker não tem uma parent port');

const identifyPromises = new Map<number, () => void>();

let guildsIn = 0;
const guildsPerShards = new Map<number, number>();

const statedAt = Date.now();

const manager = createShardManager({
  gatewayConfig: {
    intents: script.intents,
    token: script.token,
  },
  shardIds: [],
  createShardOptions: {
    stopHeartbeating: (shard) => {
      clearInterval(shard.heart.intervalId);
      shard.heart.intervalId = undefined;
      clearTimeout(shard.heart.timeoutId);
      shard.heart.timeoutId = undefined;
    },
    startHeartbeating: (shard, interval) => {
      shard.heart.interval = interval;

      // Only set the shard's state to `Unidentified`
      // if heartbeating has not been started due to an identify or resume action.
      if ([ShardState.Disconnected, ShardState.Offline].includes(shard.state)) {
        shard.state = ShardState.Unidentified;
      }

      // The first heartbeat needs to be send with a random delay between `0` and `interval`
      // Using a `setTimeout(_, jitter)` here to accomplish that.
      // `Math.random()` can be `0` so we use `0.5` if this happens
      // Reference: https://discord.com/developers/docs/topics/gateway#heartbeating
      const jitter = Math.ceil(shard.heart.interval * (Math.random() || 0.5));

      // @ts-expect-error Type error here lol
      shard.heart.timeoutId = setTimeout(() => {
        // Using a direct socket.send call here because heartbeat requests are reserved by us.
        try {
          shard.socket?.send(
            JSON.stringify({
              op: GatewayOpcodes.Heartbeat,
              d: shard.previousSequenceNumber,
            }),
          );
        } catch {
          log.info('[ERRROR] Hit the gateway reconnect error UwU');
        }

        shard.heart.lastBeat = Date.now();
        shard.heart.acknowledged = false;

        // After the random heartbeat jitter we can start a normal interval.
        // @ts-expect-error Type error here lol
        shard.heart.intervalId = setInterval(async () => {
          // gateway.debug("GW DEBUG", `Running setInterval in heartbeat file. Shard: ${shardId}`);

          // gateway.debug("GW HEARTBEATING", { shardId, shard: currentShard });

          // The Shard did not receive a heartbeat ACK from Discord in time,
          // therefore we have to assume that the connection has failed or got "zombied".
          // The Shard needs to start a re-identify action accordingly.
          // Reference: https://discord.com/developers/docs/topics/gateway#heartbeating-example-gateway-heartbeat-ack
          if (!shard.heart.acknowledged) {
            shard.close(
              ShardSocketCloseCodes.ZombiedConnection,
              'Zombied connection, did not receive an heartbeat ACK in time.',
            );

            return shard.identify();
          }

          shard.heart.acknowledged = false;

          // Using a direct socket.send call here because heartbeat requests are reserved by us.
          try {
            shard.socket?.send(
              JSON.stringify({
                op: GatewayOpcodes.Heartbeat,
                d: shard.previousSequenceNumber,
              }),
            );
          } catch {
            log.info('[ERRROR] Hit the gateway reconnect error UwU');
          }

          shard.heart.lastBeat = Date.now();

          shard.events.heartbeat?.(shard);
        }, shard.heart.interval);
      }, jitter);
    },
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
        guildsIn -= 1;
        const oldValue = guildsPerShards.get(shard.id) ?? 0;
        guildsPerShards.set(shard.id, oldValue - 1);
      }
    }

    if (message.t === 'GUILD_CREATE') {
      guildsIn += 1;
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
    case 'GET_GUILD_COUNT': {
      parentPort?.postMessage({
        type: 'NONCE_REPLY',
        nonce: message.nonce,
        data: { guilds: guildsIn },
      });
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
