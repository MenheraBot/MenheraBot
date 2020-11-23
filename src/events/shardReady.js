const http = require('../utils/HTTPrequests');

module.exports = class ShardReadyReceive {
  constructor(client) {
    this.client = client;
  }

  run(shard) {
    console.log(`[SHARD] Shard ${shard} ta voando alto!`);
    if (this.client.user.id === '708014856711962654') http.shards('ready', shard);
  }
};
