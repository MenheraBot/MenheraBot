module.exports = class ShardReconnectReceive {
  constructor(client) {
    this.client = client;
  }

  run(shard) {
    console.log(`[SHARD] Shard ${shard} ta voltando!`);
    // http.shards("reconnecting", shard) || Só ignora o request enquanto não shardeio tudo (fica spammando o chat de status)
  }
};
