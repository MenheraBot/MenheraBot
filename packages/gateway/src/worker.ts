import { createGatewayManager, GatewayManager, GetGatewayBot, Intents } from 'discordeno';
import { parentPort } from 'worker_threads';
import config from './config';

const { DISCORD_TOKEN } = config();

let gateway: GatewayManager;
const log = { info: console.log, debug: console.log, error: console.error };

const spawnGateway = (shardId: number, options: Partial<GatewayManager>) => {
  log.info(`Spawning the worker gateway for shard #${shardId}\n`);

  gateway = createGatewayManager({
    gatewayConfig: {
      token: DISCORD_TOKEN,
      intents: Intents.Guilds,
    },
    gatewayBot: options.gatewayBot as GetGatewayBot,
    firstShardId: shardId,
    lastShardId: options.lastShardId ?? shardId,
    async handleDiscordPayload(shard, data) {
      // TRIGGER RAW EVENT
      if (!data.t) return;

      /* const id =
        (data.t && ['GUILD_CREATE', 'GUILD_DELETE', 'GUILD_UPDATE'].includes(data.t)
          ? (data.d as any)?.id
          : (data.d as any)?.guild_id) ?? '000000000000000000'; */

      // IF FINAL SHARD BECAME READY TRIGGER NEXT WORKER
      if (data.t === 'READY') {
        log.info(`Shard online`);

        if (shardId === gateway.lastShardId) {
          parentPort?.postMessage(
            JSON.stringify({
              type: 'ALL_SHARDS_READY',
            }),
          );
        }
      }

      // DONT SEND THESE EVENTS USELESS TO BOT
      if (['GUILD_LOADED_DD'].includes(data.t)) return;

      parentPort?.postMessage(
        JSON.stringify({ type: 'BROADCAST_EVENT', data: { shardId: shard.id, data } }),
      );
    },
  });

  // START THE GATEWAY
  gateway.spawnShards();

  return gateway;
};

interface IdentifyPayload {
  type: 'IDENTIFY';
  shardId: number;
  shards: number;
  sessionStartLimit: {
    total: number;
    remaining: number;
    resetAfter: number;
    maxConcurrency: number;
  };
  shardsRecommended: number;
  sessionStartLimitTotal: number;
  sessionStartLimitRemaining: number;
  sessionStartLimitResetAfter: number;
  maxConcurrency: number;
  maxShards: number;
  lastShardId: number;
  workerId: number;
}

parentPort?.on('message', (message) => {
  const data = JSON.parse(message) as IdentifyPayload;

  if (data.type === 'IDENTIFY') {
    gateway = spawnGateway(data.shardId, {
      firstShardId: data.shardId,
      lastShardId: data.lastShardId ?? data.shardId,
      spawnShardDelay: 5000,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore akskadk
      gatewayBot: data.gatewayBot,
    });
  }
});
