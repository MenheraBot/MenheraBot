const http = require('../utils/HTTPrequests');

module.exports = class ShardDisconnectReceive {
  constructor(client) {
    this.client = client;
  }

  run(shard) {
    console.log(`[SHARD] Shard ${shard} foi de base`);
    if (this.client.user.id === '708014856711962654') http.shards('disconnect', shard);
  }
};
