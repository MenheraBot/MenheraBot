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
    }
    this.client.user.setActivity('🥱 | Acabei de acoidar :3');

    console.log('[READY] Menhera se conectou com o Discord!');

    setInterval(async () => {
      const shardId = this.client.shard.ids[0];
      const atividade = await http.getActivity(shardId);
      this.client.user.setPresence({ activity: atividade });
      this.client.repositories.statusRepository.CreateOrUpdate(shardId, this.client.ws.ping, Date.now(), this.client.guilds.cache.size, `${this.client.uptime}`);
    }, 1000 * 60);
  }
};
