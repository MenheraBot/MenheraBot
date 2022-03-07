import HttpRequests from '@utils/HTTPrequests';
import MenheraClient from 'MenheraClient';
import { IStatusData } from '@utils/Types';

export const postBotStatus = (client: MenheraClient): void => {
  setInterval(async () => {
    if (!client.cluster) return;
    if (!client.user) return;
    const info = (await client.cluster.fetchClientValues('guilds.cache.size')) as number[];
    await HttpRequests.postBotStatus(client.user.id, info);
  }, 1800000);
};
export const postShardStatus = (client: MenheraClient): void => {
  setInterval(async () => {
    if (!client.shardProcessEnded) return;

    const getShardsInfo = (c: MenheraClient) => {
      const memoryUsed = process.memoryUsage().rss;
      const { uptime } = c;
      const guilds = c.guilds.cache.size;
      const unavailable = c.guilds.cache.reduce((p, b) => (b.available ? p : p + 1), 0);
      const { ping } = c.ws;
      const members = c.guilds.cache.reduce((p, b) => (b.available ? p + b.memberCount : p), 0);
      const id = c.cluster.id ?? 0;

      return { memoryUsed, uptime, guilds, unavailable, ping, members, id };
    };

    // @ts-expect-error Client n é sexual
    const results = await client.cluster.broadcastEval(getShardsInfo);
    if (!results) return;

    const toSendData: IStatusData[] = Array(client.cluster?.count)
      .fill('a')
      .map((_, i) => ({
        ...results[i],
        lastPingAt: Date.now(),
      }));

    await HttpRequests.postShardStatus(toSendData);
  }, 15 * 1000);
};
