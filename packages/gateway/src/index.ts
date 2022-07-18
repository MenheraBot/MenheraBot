import { Client } from 'net-ipc';
import restRequest from 'restRequest';
import { createGatewayManager, DiscordGatewayPayload, routes, Shard } from 'discordeno';

import config from './config';

const { DISCORD_TOKEN, REST_AUTHORIZATION } = config();

const client = new Client({ path: '/run/menhera.sock' });
client.connect().catch(console.error);

(async () => {
  const result = await restRequest(
    {
      Authorization: REST_AUTHORIZATION,
      method: 'GET',
      url: routes.GATEWAY_BOT(),
      body: undefined,
    },
    client,
  ).then((res) => ({
    url: res.url,
    shards: res.shards,
    sessionStartLimit: {
      total: res.session_start_limit.total,
      remaining: res.session_start_limit.remaining,
      resetAfter: res.session_start_limit.reset_after,
      maxConcurrency: res.session_start_limit.max_concurrency,
    },
  }));

  const gateway = createGatewayManager({
      // LOAD DATA FROM DISCORDS RECOMMENDATIONS OR YOUR OWN CUSTOM ONES HERE
      shardsRecommended: options.shardsRecommended,
      sessionStartLimitTotal: options.sessionStartLimitTotal,
      sessionStartLimitRemaining: options.sessionStartLimitRemaining,
      sessionStartLimitResetAfter: options.sessionStartLimitResetAfter,
      maxConcurrency: options.maxConcurrency,
      maxShards: options.maxShards,
      // SET STARTING SHARD ID
      firstShardId: shardId,
      // SET LAST SHARD ID
      lastShardId: options.lastShardId ?? shardId,
      // THE AUTHORIZATION WE WILL USE ON OUR EVENT HANDLER PROCESS
      secretKey: EVENT_HANDLER_SECRET_KEY,
      token: DISCORD_TOKEN,
      intents: ["GuildMessages", "Guilds", "GuildMembers"],
      handleDiscordPayload: async function (_, data, shardId) {
        // TRIGGER RAW EVENT
        if (!data.t) return;
  
        const id = (data.t &&
            ["GUILD_CREATE", "GUILD_DELETE", "GUILD_UPDATE"].includes(data.t)
          ? (data.d as any)?.id
          : (data.d as any)?.guild_id) ?? "000000000000000000";
  
        // IF FINAL SHARD BECAME READY TRIGGER NEXT WORKER
        if (data.t === "READY") {
          log.info(
            `Shard online`,
          );
  
          if (shardId === gateway.lastShardId) {
            // @ts-ignore
            postMessage(
              JSON.stringify({
                type: "ALL_SHARDS_READY",
              }),
            );
          }
        }
  
        // DONT SEND THESE EVENTS USELESS TO BOT
        if (["GUILD_LOADED_DD"].includes(data.t)) return;
  
        // Debug mode only
        log.debug(`New Event:\n`, data);
  
        await fetch(`http://${EVENT_HANDLER_URL}:${EVENT_HANDLER_PORT}`, {
          headers: {
            Authorization: gateway.secretKey,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            shardId,
            data,
          }),
        })
          .then((res) => {
            // BELOW IS FOR DENO MEMORY LEAK
            return res.text();
          })
          .catch((err) => log.error("Error Sending Event:\n", err));
      },
    });
  
    // START THE GATEWAY
    gateway.spawnShards(gateway, shardId);
  
    return gateway;
  }
  );
})();
