import MenheraClient from 'MenheraClient';
import HttpRequests from '@utils/HTTPrequests';
import { IStatusData } from '@utils/Types';
import HttpServer from '@structures/server/server';
import DBLWebhook from '@structures/server/controllers/DBLWebhook';

export default class ReadyEvent {
  constructor(private client: MenheraClient) {}

  async run(): Promise<void> {
    if (!this.client.user) return;
    if (this.client.user.id !== process.env.MENHERA_ID) return;
    if (!this.client.shard) return;

    const isMasterShard = (id: number) => id === 0;

    const updateActivity = async (shard: number) =>
      this.client.user?.setActivity(await HttpRequests.getActivity(shard));

    const shardId = this.client.shard.ids[0];

    setInterval(() => {
      updateActivity(shardId);
    }, 1000 * 60);

    if (isMasterShard(shardId)) {
      HttpServer.getInstance().registerRouter('DBL', DBLWebhook(this.client));

      const allBannedUsers = await this.client.repositories.userRepository.getAllBannedUsersId();
      await this.client.repositories.blacklistRepository.addBannedUsers(allBannedUsers);
      await HttpRequests.resetCommandsUses();

      setInterval(() => {
        this.postShardStatus();
      }, 15 * 1000);

      setInterval(async () => {
        if (!this.client.shard) return;
        if (!this.client.user) return;
        const info = (await this.client.shard.fetchClientValues('guilds.cache.size')) as number[];
        await HttpRequests.postBotStatus(this.client.user.id, info);
      }, 1800000);
    }

    console.log('[READY] Menhera se conectou com o Discord!');
  }

  async postShardStatus(): Promise<void> {
    const ShardingEnded = await this.client.isShardingProcessEnded();
    if (!ShardingEnded) return;

    const results = (await Promise.all([
      this.client.shard?.broadcastEval(() => process.memoryUsage().heapUsed),
      this.client.shard?.broadcastEval((c) => c.uptime),
      this.client.shard?.fetchClientValues('guilds.cache.size'),
      this.client.shard?.broadcastEval((c) =>
        c.guilds.cache.reduce((p, b) => (b.available ? p : p + 1), 0),
      ),
      this.client.shard?.broadcastEval((c) => c.ws.ping),

      this.client.shard?.broadcastEval((c) =>
        c.guilds.cache.reduce((p, b) => (b.available ? p + b.memberCount : p), 0),
      ),
      this.client.shard?.broadcastEval((c) => c.shard?.ids[0]),
    ])) as number[][];

    const toSendData: IStatusData[] = Array(this.client.shard?.count)
      .fill('a')
      .map((_, i) => ({
        memoryUsed: results[0][i],
        uptime: results[1][i],
        guilds: results[2][i],
        unavailable: results[3][i],
        ping: results[4][i],
        members: results[5][i],
        id: results[6][i],
        lastPingAt: Date.now(),
      }));

    await HttpRequests.postShardStatus(toSendData);
  }
}
