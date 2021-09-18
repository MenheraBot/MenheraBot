import Dbl from '@utils/DBL';
import MenheraClient from 'MenheraClient';
import HttpRequests from '@utils/HTTPrequests';

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

    const postShardStatus = async (shardId: number) => {
      const memoryUsed = process.memoryUsage().heapUsed;
      const uptime = this.client.uptime ?? 0;
      const guilds = this.client.guilds.cache.size;
      const unavailable = this.client.guilds.cache.reduce((p, c) => (c.available ? p : p + 1), 0);
      const { ping } = this.client.ws;
      const lastPingAt = Date.now();
      const members = this.client.guilds.cache.reduce((p, c) => p + c.memberCount, 0);

      await HttpRequests.postShardStatus({
        id: shardId,
        guilds,
        lastPingAt,
        members,
        memoryUsed,
        ping,
        unavailable,
        uptime,
      });
    };

    if (this.client.user.id === MAIN_MENHERA_ID) {
      if (!this.client.shard) return;
      const firstShard = this.client.shard.ids[0];

      setInterval(() => {
        updateActivity(firstShard);
      }, INTERVAL);

      setInterval(() => {
        postShardStatus(firstShard);
      }, 15 * 1000);

      if (firstShard === LAST_SHARD_ID) {
        const DiscordBotList = new Dbl(this.client);
        await DiscordBotList.init();

        const allBannedUsers = await this.client.repositories.userRepository.getAllBannedUsersId();
        await this.client.repositories.blacklistRepository.addBannedUsers(allBannedUsers);
      }
    }

    this.client.user.setActivity('🥱 | Acabei de acoidar :3');

    console.log('[READY] Menhera se conectou com o Discord!');
  }
}
