import config from './config';

const { DISCORD_TOKEN, EVENT_HANDLER_PORT, EVENT_HANDLER_URL, EVENT_HANDLER_SECRET_KEY } = config();
import { createGatewayManager, GatewayManager, GetGatewayBot, Intents } from 'discordeno';
import axios from 'axios';
let gateway: GatewayManager;
const log = { info: console.log, debug: console.log, error: console.error };

function spawnGateway(shardId: number, options: Partial<GatewayManager>) {
  log.info(`Spawning the worker gateway for shard #${shardId}\n`, options);
  gateway = createGatewayManager({
    // LOAD DATA FROM DISCORDS RECOMMENDATIONS OR YOUR OWN CUSTOM ONES HERE
    gatewayConfig: {
      token: DISCORD_TOKEN,
      intents: Intents.Guilds,
    },
    gatewayBot: options.gatewayBot as GetGatewayBot,
    firstShardId: shardId,
    lastShardId: options.lastShardId ?? shardId,
    handleDiscordPayload: async function (shard, data) {
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
          // @ts-ignore
          postMessage(
            JSON.stringify({
              type: 'ALL_SHARDS_READY',
            }),
          );
        }
      }

      // DONT SEND THESE EVENTS USELESS TO BOT
      if (['GUILD_LOADED_DD'].includes(data.t)) return;

      // Debug mode only
      log.debug(`New Event:\n`, data);

      await axios
        .post(
          `http://${EVENT_HANDLER_URL}:${EVENT_HANDLER_PORT}`,
          {
            shardId,
            data,
          },
          {
            headers: {
              Authorization: EVENT_HANDLER_SECRET_KEY,
              'Content-Type': 'application/json',
            },
          },
        )
        .catch((err) => log.error('Error Sending Event:\n', err));
    },
  });

  // START THE GATEWAY
  gateway.spawnShards();

  return gateway;
}

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

// @ts-ignore this should not be erroring
self.onmessage = async function (message: MessageEvent<string>) {
  log.debug(`New Message:\n`, message.data);

  const data = JSON.parse(message.data) as IdentifyPayload;

  if (data.type === 'IDENTIFY') {
    gateway = spawnGateway(data.shardId, {
      firstShardId: data.shardId,
      lastShardId: data.lastShardId ?? data.shardId,
      spawnShardDelay: 5000,
    });
  }
};
