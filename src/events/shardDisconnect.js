const http = require("../utils/HTTPrequests")
module.exports = class ShardDisconnectReceive {
    constructor(client) {
        this.client = client
    }

    run(shard) {
        console.log(`[SHARD] Shard ${shard} foi de base`)
        http.shards("disconnect", shard)
    }
}