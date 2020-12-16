const request = require('request-promise');
const config = require('../../config.json');

module.exports.getActivity = async () => {
  const options = {
    method: 'GET',
    uri: `${config.api_IP}/api/activity`,
    headers: {
      'User-Agent': 'MenheraClient',
      token: config.api_TOKEN,
    },
    json: true,
  };

  const result = await request(options).catch((err) => console.log(`[HTTP ERROR] ${err.message}`));
  if (!result) return { name: '❤️ | Menhera foi criada pela Lux', type: 'PLAYING' };
  return result;
};

module.exports.status = async (data) => {
  const options = {
    method: 'POST',
    uri: `${config.api_IP}/api/${data}`,
    headers: {
      'User-Agent': 'MenheraClient',
      token: config.api_TOKEN,
    },
    body: {
      message: 'Terminating',
    },
    json: true,
  };

  request(options).catch((err) => console.log(`[HTTP ERROR] ${err.message}`));
};

module.exports.shards = async (data, shard) => {
  const options = {
    method: 'POST',
    uri: `${config.api_IP}/api/shard/${data}`,
    headers: {
      'User-Agent': 'MenheraClient',
      token: config.api_TOKEN,
    },
    body: {
      shard,
    },
    json: true,
  };

  request(options).catch((err) => console.log(`[HTTP ERROR] ${err.message}`));
};

module.exports.postCommand = async (data) => {
  const options = {
    method: 'POST',
    uri: `${config.api_IP}/api/commands`,
    headers: {
      'User-Agent': 'MenheraClient',
      token: config.api_TOKEN,
    },
    body: {
      authorName: data.authorName,
      authorId: data.authorId,
      guildName: data.guildName,
      guildId: data.guildId,
      commandName: data.commandName,
      data: data.data,
    },
    json: true,
  };

  request(options).catch((err) => console.log(`[HTTP ERROR]${err.message}`));
};

module.exports.clearCommands = async () => {
  const options = {
    method: 'POST',
    headers: {
      'User-Agent': 'MenheraClient',
      token: config.api_TOKEN,
    },
    uri: `${config.api_IP}/api/commands/clear`,
  };

  request(options).catch((err) => console.log(`[HTTP ERROR] ${err.message}`));
};

module.exports.getCommands = async () => {
  const options = {
    method: 'GET',
    uri: `${config.api_IP}/api/commands/?cmds=true`,
    headers: {
      'User-Agent': 'MenheraClient',
      token: config.api_TOKEN,
    },
  };

  let cmds;

  await request(options).then((data) => {
    const obj = JSON.parse(data);
    cmds = obj.length;
  }).catch((err) => console.log(`[HTTP ERROR] ${err.message}`));

  return (cmds) || 'MUITOS';
};

module.exports.getProfileCommands = async (id) => {
  const options = {
    method: 'GET',
    uri: `${config.api_IP}/api/usages/user`,
    headers: {
      'User-Agent': 'MenheraClient',
      token: config.api_TOKEN,
    },
    body: {
      userId: id,
    },
    json: true,
  };

  let has = false;

  await request(options).then((data) => {
    has = data;
  }).catch((err) => console.log(`[HTTP ERROR] ${err.message}`));

  return has;
};

module.exports.getTopCommands = async () => {
  const options = {
    method: 'GET',
    uri: `${config.api_IP}/api/usages/top/command`,
    headers: {
      'User-Agent': 'MenheraClient',
      token: config.api_TOKEN,
    },
    json: true,
  };

  let has = false;

  await request(options).then((data) => {
    has = data;
  }).catch((err) => console.log(`[HTTP ERROR] ${err.message}`));

  return has;
};

module.exports.getTopUsers = async () => {
  const options = {
    method: 'GET',
    uri: `${config.api_IP}/api/usages/top/user`,
    headers: {
      'User-Agent': 'MenheraClient',
      token: config.api_TOKEN,
    },
    json: true,
  };

  let has = false;

  await request(options).then((data) => {
    has = data;
  }).catch((err) => console.log(`[HTTP ERROR] ${err.message}`));

  return has;
};
