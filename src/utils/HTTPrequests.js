const request = require("request-promise")
const config = require("../../config.json")
module.exports.status = async (data) => {

    const options = {
        method: 'POST',
        uri: `${config.api_IP}/api/comunicate/${data}`,
        headers: {
            'User-Agent': "MenheraClient",
            'token': config.api_TOKEN
        },
        body: {
            message: "Terminating"
        },
        json: true
    };

    request(options).catch((err) => console.log('[HTTP ERROR] ' + err.message));
}

module.exports.shards = async (data, shard) => {

    const options = {
        method: 'POST',
        uri: `${config.api_IP}/api/comunicate/shard/${data}`,
        headers: {
            'User-Agent': "MenheraClient",
            'token': config.api_TOKEN
        },
        body: {
            shard: shard
        },
        json: true
    };

    request(options).catch((err) => console.log('[HTTP ERROR] ' + err.message));
}

module.exports.postCommand = async (data) => {

    const options = {
        method: 'POST',
        uri: `${config.api_IP}/api/stats/commands`,
        headers: {
            'User-Agent': "MenheraClient",
            'token': config.api_TOKEN
        },
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
        headers: {
            'User-Agent': "MenheraClient",
            'token': config.api_TOKEN
        },
        uri: `${config.api_IP}/api/stats/commands/clear`,
    };

    request(options).catch((err) => console.log('[HTTP ERROR] ' + err.message));
}

module.exports.getCommands = async () => {
    const options = {
        method: 'GET',
        uri: `${config.api_IP}/api/stats/commands/?cmds=true`,
        headers: {
            'User-Agent': "MenheraClient",
            'token': config.api_TOKEN
        }
    }

    let cmds

    await request(options).then((data) => {
        const obj = JSON.parse(data);
        cmds = obj.lenght
    }).catch((err) => console.log('[HTTP ERROR] ' +err.message))

    return (cmds) ? cmds : "MUITOS"
}

module.exports.postLogs = async (log) => {

    const options = {
        method: 'POST',
        uri: `${config.api_IP}/api/logs`,
        headers: {
            'User-Agent': "MenheraClient",
            'token': config.api_TOKEN
        },
        body: {
            info: log
        }
    }

    request(options).catch((err) => console.log('[HTTP ERROR]' + err.message));

}