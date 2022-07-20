import {
  CreateGatewayManager,
  createGatewayManager,
  GatewayManager,
  GetGatewayBot,
  Intents,
} from 'discordeno';
import { parentPort } from 'worker_threads';
import config from './config';

const { DISCORD_TOKEN } = config(['DISCORD_TOKEN']);

let gateway: GatewayManager;
// eslint-disable-next-line no-console
const log = { info: console.log, debug: console.log, error: console.error };

const spawnGateway = (options: Partial<CreateGatewayManager>) => {
  log.info(
    `[GATEWAY] Spawning the worker gateway for Shards ${options.firstShardId} - ${options.lastShardId}`,
  );

  gateway = createGatewayManager({
    gatewayConfig: {
      token: DISCORD_TOKEN,
      intents: Intents.Guilds,
    },
    totalShards: options.totalShards,
    gatewayBot: options.gatewayBot as GetGatewayBot,
    firstShardId: options.firstShardId,
    lastShardId: options.lastShardId,
    async handleDiscordPayload(shard, data) {
      if (!data.t) return;

      // IF FINAL SHARD BECAME READY TRIGGER NEXT WORKER
      if (data.t === 'READY') {
        log.info(`[WORKER] Shard ${shard.id} is online`);

        if (shard.id === gateway.lastShardId) {
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

export interface IdentifyPayload {
  type: 'IDENTIFY';
  firstShardId: number;
  lastShardId: number;
  gatewayBot: GetGatewayBot;
  totalShards: number;
}

parentPort?.on('message', (message) => {
  const data = JSON.parse(message) as IdentifyPayload;

  if (data.type === 'IDENTIFY') {
    gateway = spawnGateway({
      firstShardId: data.firstShardId,
      lastShardId: data.lastShardId ?? data.firstShardId,
      spawnShardDelay: 5000,
      totalShards: data.totalShards,
      gatewayBot: data.gatewayBot,
    });
  }
});
