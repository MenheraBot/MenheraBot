const http = require('../utils/HTTPrequests');

module.exports = class ShardReadyReceive {
  constructor(client) {
    this.client = client;
  }

  run(shard) {
    console.log(`[SHARD] Shard ${shard} ta voando alto!`);
    http.shards('ready', shard);
  }
};
