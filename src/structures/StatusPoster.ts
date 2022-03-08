import HttpRequests from '@utils/HTTPrequests';
import MenheraClient from 'MenheraClient';
import { IStatusData, ShardsDataReturn } from '@utils/Types';

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
      const shardsInfo = c.ws.shards.reduce<ShardsDataReturn[]>((acc, shard) => {
        // @ts-expect-error connectedAt is private
        const { id, ping, connectedAt } = shard;
        let guilds = 0;
        let members = 0;
        let unavailable = 0;

        c.guilds.cache.forEach((a) => {
          if (a.shardId !== id) return;
          if (!a.available) {
            unavailable += 1;
            return;
          }
          guilds += 1;
          members += a.memberCount;
        });

        acc.push({ id, ping, guilds, members, unavailable, uptime: Date.now() - connectedAt });
        return acc;
      }, []);

      return { memoryUsed, shards: shardsInfo, clusterId: c.cluster.id };
    };

    // @ts-expect-error Client n é sexual
    const results = (await client.cluster.broadcastEval(getShardsInfo)) as {
      memoryUsed: number;
      clusterId: number;
      shards: ShardsDataReturn[];
    }[];
    if (!results) return;

    const toSendData: IStatusData[] = Array(client.options.shardCount)
      .fill('a')
      .map((_, i) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const clusterData = results.find((a) => a.shards.some((b) => b.id === i))!;
        const shardData = clusterData.shards.filter((a) => a.id === i)[0];
        return {
          clusterId: clusterData.clusterId,
          guilds: shardData.guilds,
          id: shardData.id,
          lastPingAt: Date.now(),
          members: shardData.members,
          memoryUsed: clusterData.memoryUsed,
          ping: shardData.ping,
          unavailable: shardData.unavailable,
          uptime: shardData.uptime,
        };
      });

    await HttpRequests.postShardStatus(toSendData);
  }, 15 * 1000);
};
