const http = require('../utils/HTTPrequests');
const Dbl = require('../utils/DBL');

module.exports = class ReadyEvent {
  constructor(client) {
    this.client = client;
  }

  async run() {
    if (this.client.user.id === '708014856711962654' && this.client.shard.ids[0] === 0) {
      const DiscordBotList = new Dbl(this.client);
      DiscordBotList.init();
      setInterval(async () => {
        const atividade = await http.getActivity(this.client.shard.ids[0]);
        this.client.user.setPresence({ activity: atividade });

        const allShardsPing = await this.client.shard.broadcastEval('this.ws.ping');
        const allShardsUptime = await this.client.shard.broadcastEval('this.ws.client.uptime');
        const guildsPerShardCount = await this.client.shard.broadcastEval('this.guilds.cache.size');

        allShardsPing.map(async (shardPing, id) => {
          this.client.repositories.statusRepository.CreateOrUpdate(
            id,
            shardPing,
            Date.now(),
            guildsPerShardCount[id],
            `${allShardsUptime[id]}`,
          );
        });
      }, 1000 * 60);
    }

    if (this.client.user.id === '708014856711962654' && this.client.shard.ids[0] !== 0) {
      setInterval(async () => {
        const atividade = await http.getActivity(this.client.shard.ids[0]);
        this.client.user.setPresence({ activity: atividade });
      }, 1000 * 60);
    }

    this.client.user.setActivity('🥱 | Acabei de acoidar :3');

    console.log('[READY] Menhera se conectou com o Discord!');
  }
};
