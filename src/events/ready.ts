import http from '@utils/HTTPrequests';

import Dbl from '@utils/DBL';
import MenheraClient from 'MenheraClient';

export default class ReadyEvent {
  constructor(public client: MenheraClient) {
    this.client = client;
  }

  async run() {
    if (!this.client.user) return;
    if (!this.client.shard) return;

    const INTERVAL = 1000 * 60;
    const MENHERA_DEV_ID = '708014856711962654';
    const FIRST_SHARD_ID = 0;

    const updateActivity = async (shard: number) => {
      if (!this.client.user) return;

      const activity = await http.getActivity(shard);
      return this.client.user.setPresence({ activity });
    };

    const saveCurrentBotStatus = async () => {
      if (!this.client.shard) return;

      const allShardsPing = await this.client.shard.broadcastEval('this.ws.ping');
      const allShardsUptime = await this.client.shard.broadcastEval('this.ws.client.uptime');
      const guildsPerShardCount = await this.client.shard.broadcastEval('this.guilds.cache.size');

      allShardsPing.map(async (shardPing, id) => {
        this.client.repositories.statusRepository.CreateOrUpdate(
          id,
          shardPing,
          Date.now(),
          guildsPerShardCount[id],
          allShardsUptime[id],
        );
      });
    };

    if (this.client.user.id === MENHERA_DEV_ID) {
      const firstShard = this.client.shard?.ids[0];

      setInterval(async () => {
        updateActivity(firstShard);
      }, INTERVAL);

      if (firstShard === FIRST_SHARD_ID) {
        const DiscordBotList = new Dbl(this.client);
        DiscordBotList.init();

        setInterval(async () => {
          saveCurrentBotStatus();
        }, INTERVAL);
      }
    }

    this.client.user.setActivity('🥱 | Acabei de acoidar :3');

    console.log('[READY] Menhera se conectou com o Discord!');
  }
}
