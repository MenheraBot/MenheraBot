import Dbl from '@utils/DBL';
import MenheraClient from 'MenheraClient';
import HttpRequests from '@utils/HTTPrequests';
import { IStatusData } from '@utils/Types';

export default class ReadyEvent {
  constructor(private client: MenheraClient) {}

  async run(): Promise<void> {
    if (!this.client.user) return;

    const INTERVAL = 1000 * 60;
    const MAIN_MENHERA_ID = '708014856711962654';
    const LAST_SHARD_ID = (this.client.shard?.count as number) - 1;

    const updateActivity = async (shard: number) => {
      if (!this.client.user) return;

      const activity = await HttpRequests.getActivity(shard);
      return this.client.user.setActivity(activity);
    };

    if (this.client.user.id === MAIN_MENHERA_ID) {
      if (!this.client.shard) return;
      const firstShard = this.client.shard.ids[0];

      setInterval(() => {
        updateActivity(firstShard);
      }, INTERVAL);

      if (firstShard === LAST_SHARD_ID) {
        const DiscordBotList = new Dbl(this.client);
        await DiscordBotList.init();

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
            this.client.shard?.ids[0],
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

        const allBannedUsers = await this.client.repositories.userRepository.getAllBannedUsersId();
        await this.client.repositories.blacklistRepository.addBannedUsers(allBannedUsers);
        await HttpRequests.resetCommandsUses();
      }
    }

    this.client.user.setActivity('🥱 | Acabei de acoidar :3');

    console.log('[READY] Menhera se conectou com o Discord!');
  }
}
