import HttpRequests from '@utils/HTTPrequests';
import { Client } from 'discord.js-light';
import MenheraClient from 'MenheraClient';
import { IStatusData } from 'types/Types';

export const postBotStatus = (client: MenheraClient): void => {
  setInterval(async () => {
    if (!client.shard) return;
    if (!client.user) return;
    const info = (await client.shard.fetchClientValues('guilds.cache.size')) as number[];
    await HttpRequests.postBotStatus(client.user.id, info);
  }, 1800000);
};
export const postShardStatus = (client: MenheraClient): void => {
  setInterval(async () => {
    const ShardingEnded = await client.isShardingProcessEnded();
    if (!ShardingEnded) return;

    const getShardsInfo = (c: Client<true>) => {
      const memoryUsed = process.memoryUsage().heapUsed;
      const { uptime } = c;
      const guilds = c.guilds.cache.size;
      const unavailable = c.guilds.cache.reduce((p, b) => (b.available ? p : p + 1), 0);
      const { ping } = c.ws;
      const members = c.guilds.cache.reduce((p, b) => (b.available ? p + b.memberCount : p), 0);
      const id = c.shard?.ids[0] ?? 0;

      return { memoryUsed, uptime, guilds, unavailable, ping, members, id };
    };

    const results = await client.shard?.broadcastEval(getShardsInfo);
    if (!results) return;

    const toSendData: IStatusData[] = Array(client.shard?.count)
      .fill('a')
      .map((_, i) => ({
        ...results[i],
        lastPingAt: Date.now(),
      }));

    await HttpRequests.postShardStatus(toSendData);
  }, 15 * 1000);
};
