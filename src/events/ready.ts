import http from '@utils/HTTPrequests';

import Dbl from '@utils/DBL';
import MenheraClient from 'src/MenheraClient';

export default class ReadyEvent {
  constructor(private client: MenheraClient) {}

  async run(): Promise<void> {
    if (!this.client.user) return;

    const INTERVAL = 1000 * 60;
    const MAIN_MENHERA_ID = '708014856711962654';
    const LAST_SHARD_ID = (this.client.shard?.count as number) - 1;

    const updateActivity = async (shard: number) => {
      if (!this.client.user) return;

      const activity = await http.getActivity(shard);
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

        const allBannedUsers = await this.client.repositories.userRepository.getAllBannedUsersId();
        await this.client.repositories.blacklistRepository.addBannedUsers(allBannedUsers);
      }
    }

    this.client.user.setActivity('🥱 | Acabei de acoidar :3');

    console.log('[READY] Menhera se conectou com o Discord!');
  }
}
