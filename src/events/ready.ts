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

    const shardId = this.client.shard.ids[0];

    const isMasterShard = (id: number) => id === (this.client.shard?.count as number) - 1;
    const updateActivity = async (shard: number) => {
      if (!this.client.user) return;

      const activity = await HttpRequests.getActivity(shard);
      this.client.user.setActivity(activity);
    };

    setInterval(() => {
      updateActivity(shardId);
    }, 1000 * 60);

    if (shardId === 0) {
      HttpServer.getInstance().registerRouter('DBL', DBLWebhook(this.client));

      const allBannedUsers = await this.client.repositories.userRepository.getAllBannedUsersId();
      await this.client.repositories.blacklistRepository.addBannedUsers(allBannedUsers);
      await HttpRequests.resetCommandsUses();
    }

    if (isMasterShard(shardId)) {
      const postShardStatus = async () => {
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
      };

      setInterval(() => {
        postShardStatus();
      }, 15 * 1000);
    }

    console.log('[READY] Menhera se conectou com o Discord!');
  }
}
