const request = require("request")
const config = require("../../config.json")
module.exports.status = async (data) => {
    request.post(`${config.api_IP}/api/comunicate/${data}`, {
        json: {
            message: "Terminating"
        }
    })
}

module.exports.shards = (data, shard) => {
    request.post(`${config.api_IP}/api/comunicate/shard/${data}`, {
        json: {
            shard: shard
        }
    })
}