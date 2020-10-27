module.exports = class ShardReconnectReceive {
    constructor(client) {
        this.client = client
    }

    run(shard) {
        console.log(`[SHARDI] Shard ${shard} ta voltando!`)
    }
}