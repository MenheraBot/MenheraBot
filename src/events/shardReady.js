module.exports = class ShardReadyReceive {
    constructor(client) {
        this.client = client
    }

    run(shard) {
        console.log(`[SHARD] Shard ${shard} ta voando alto!`)
    }
}