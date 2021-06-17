const http = require('../utils/HTTPrequests');
const Dbl = require('../utils/DBL');
const { StatusPage } = require('../utils/StatusManager');

module.exports = class ReadyEvent {
  constructor(client) {
    this.client = client;
  }

  async run() {
    if (this.client.user.id === '708014856711962654' && this.client.shard.ids[0] === 0) {
      const DiscordBotList = new Dbl(this.client);
      DiscordBotList.init();
      const status = new StatusPage(this.client);
      status.submit();
    }
    this.client.user.setActivity('🥱 | Acabei de acoidar :3');

    console.log('[READY] Menhera se conectou com o Discord!');

    setInterval(async () => {
      const atividade = await http.getActivity(this.client.shard.ids[0]);
      this.client.user.setPresence({
        activity: atividade,
      });

      if (this.client.user.id === '708014856711962654' && this.client.shard.ids[0] === 0) {
        const allShardsPing = await this.client.shard.broadcastEval('this.ws.ping');
        const allShardsUptime = await this.client.shard.broadcastEval('this.ws.client.uptime');
        const guildsPerShardCount = await this.client.shard.broadcastEval('this.guilds.cache.size');

        allShardsPing.map(async (shardPing, id) => {
          const ping = await this.client.database.Status.findById(id);

          if (!ping) {
            const newShard = new this.client.database.Status({
              _id: id, ping: shardPing, guilds: guildsPerShardCount[id], uptime: allShardsUptime[id], lastPingAt: Date.now(),
            });
            await newShard.save();
          } else {
            ping.ping = shardPing;
            ping.lastPingAt = Date.now();
            ping.guilds = guildsPerShardCount[id];
            ping.uptime = `${allShardsUptime[id]}`;
            await ping.save();
          }
        });
      }
    }, 1000 * 60);
  }
};
