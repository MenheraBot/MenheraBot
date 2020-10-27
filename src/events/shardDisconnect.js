module.exports = class ShardDisconnectReceive {
    constructor(client) {
        this.client = client
    }

    run(shard) {
        console.log(`[SHARD] Shard ${shard} foi de base`)
    }
}