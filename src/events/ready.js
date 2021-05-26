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
      http.status('ready');
      http.clearCommands();
    }
    this.client.user.setActivity('🥱 | Acabei de acoidar :3');

    console.log('[READY] Menhera se conectou com o Discord!');

    setInterval(async () => {
      const shardId = this.client.shard.ids[0];
      const atividade = await http.getActivity(shardId);
      this.client.user.setPresence({
        activity: atividade,
      });
      const ping = await this.client.database.Status.findById(shardId);
      if (!ping) {
        const newShard = new this.client.database.Status({
          _id: shardId, ping: this.client.ws.ping, guilds: this.client.guilds.cache.size, uptime: this.client.uptime, lastPingAt: Date.now(),
        });
        await newShard.save();
      } else {
        ping.ping = this.client.ws.ping;
        ping.lastPingAt = Date.now();
        ping.guilds = this.client.guilds.cache.size;
        ping.uptime = this.client.uptime;
        await ping.save();
      }
    }, 1000 * 60);
  }
};
