import http from '@utils/HTTPrequests';

import Dbl from '@utils/DBL';
import MenheraClient from 'MenheraClient';
import Event from '@structures/Event';

export default class ReadyEvent extends Event {
  constructor(public client: MenheraClient) {
    super(client);
  }

  async run(): Promise<void> {
    if (!this.client.user) return;

    const INTERVAL = 1000 * 60;
    const MAIN_MENHERA_ID = '708014856711962654';
    const FIRST_SHARD_ID = 0;

    const updateActivity = async (shard: number) => {
      if (!this.client.user) return;

      const activity = await http.getActivity(shard);
      return this.client.user.setActivity(activity);
    };

    const saveCurrentBotStatus = async () => {
      if (!this.client.shard) return;
      const allShardsPing = (await this.client.shard.fetchClientValues('ws.ping')) as number[];
      const allShardsUptime = (await this.client.shard.fetchClientValues(
        'ws.client.uptime',
      )) as number[];
      const guildsPerShardCount = (await this.client.shard.fetchClientValues(
        'guilds.cache.size',
      )) as number[];

      allShardsPing.forEach((shardPing, id) => {
        this.client.repositories.statusRepository.CreateOrUpdate(
          id,
          shardPing,
          Date.now(),
          guildsPerShardCount[id],
          allShardsUptime[id],
        );
      });
    };

    if (this.client.user.id === MAIN_MENHERA_ID) {
      if (!this.client.shard) return;
      const firstShard = this.client.shard.ids[0];

      setInterval(() => {
        updateActivity(firstShard);
      }, INTERVAL);

      if (firstShard === FIRST_SHARD_ID) {
        const DiscordBotList = new Dbl(this.client);
        await DiscordBotList.init();

        setInterval(() => {
          saveCurrentBotStatus();
        }, INTERVAL);
      }
    }

    await this.client.user.setActivity('🥱 | Acabei de acoidar :3');

    console.log('[READY] Menhera se conectou com o Discord!');
  }
}
