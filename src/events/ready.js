const http = require('../utils/HTTPrequests');
const Dbl = require('../utils/DBL');

module.exports = class ReadyEvent {
  constructor(client) {
    this.client = client;
  }

  async run() {
    if (this.client.user.id === '708014856711962654' && this.client.shard.id === 0) {
      const DiscordBotList = new Dbl(this.client);
      DiscordBotList.init();
      http.status('ready');
      http.clearCommands();
    }
    this.client.user.setActivity('🥱 | Acabei de acoidar :3');

    console.log('[READY] Menhera se conectou com o Discord!');

    setInterval(async () => {
      const atividade = await http.getActivity();
      this.client.user.setPresence({
        activity: atividade,
      });
    }, 1000 * 60);
  }
};
