module.exports = class ShardReconnectReceive {
  constructor(client) {
    this.client = client;
  }

  run(shard) {
    console.log(`[SHARD] Shard ${shard} ta voltando!`);
    // if (this.client.user.id === '708014856711962654') http.shards("reconnecting", shard)
  }
};
