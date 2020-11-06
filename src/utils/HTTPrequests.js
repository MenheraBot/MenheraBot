const request = require("request-promise")
const config = require("../../config.json")
module.exports.status = async (data) => {

    let options = {
        method: 'POST',
        uri: `${config.api_IP}/api/comunicate/${data}`,
        body: {
            message: "Terminating"
        },
        json: true
    };

    request(options).catch((err) => console.log('[HTTP ERROR] ' + err.message));
}

module.exports.shards = async (data, shard) => {

    let options = {
        method: 'POST',
        uri: `${config.api_IP}/api/comunicate/shard/${data}`,
        body: {
            shard: shard
        },
        json: true
    };

    request(options).catch((err) => console.log('[HTTP ERROR] ' + err.message));
}

module.exports.postCommand = async (data) => {

    let options = {
        method: 'POST',
        uri: `${config.api_IP}/api/stats/commands`,
        body: {
            authorName: data.authorName,
            authorId: data.authorId,
            guildName: data.guildName,
            guildId: data.guildId,
            commandName: data.commandName,
            data: data.data
        },
        json: true
    };

    request(options).catch((err) => console.log('[HTTP ERROR]' + err.message));
}

module.exports.clearCommands = async () => {
    let options = {
        method: 'POST',
        uri: `${config.api_IP}/api/stats/commands/clear`,
    };

    request(options).catch((err) => console.log('[HTTP ERROR] ' + err.message));
}