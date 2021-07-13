const request = require('request-promise');

module.exports.getImageUrl = async (type) => {
  const options = {
    method: 'GET',
    uri: `${process.env.API_IP}/api/assets/${type}`,
    headers: {
      'User-Agent': 'MenheraClient',
      token: process.env.API_TOKEN,
    },
    json: true,
  };

  const response = await request(options).catch((err) =>
    console.log(`[HTTP ERROR] ${err.message}`),
  );

  return response?.url || 'https://i.imgur.com/DHVUlFf.png';
};

module.exports.postRpg = async (userId, userClass, userLevel, dungeonLevel, death, date) => {
  const options = {
    method: 'POST',
    uri: `${process.env.API_IP}/api/rpg`,
    headers: {
      'User-Agent': 'MenheraClient',
      token: process.env.API_TOKEN,
    },
    body: {
      userId,
      userClass,
      userLevel,
      dungeonLevel,
      death,
      date,
    },
    json: true,
  };
  await request(options).catch((err) => console.log(`[HTTP ERROR] ${err.message}`));
};

module.exports.getActivity = async (shard) => {
  const options = {
    method: 'GET',
    uri: `${process.env.API_IP}/api/activity`,
    headers: {
      'User-Agent': 'MenheraClient',
      token: process.env.API_TOKEN,
    },
    body: {
      shard: shard || 0,
    },
    json: true,
  };

  const result = await request(options).catch((err) => console.log(`[HTTP ERROR] ${err.message}`));
  if (!result)
    return { name: `❤️ | Menhera foi criada pela Lux | Shard ${shard}`, type: 'PLAYING' };
  return result;
};

module.exports.postCommand = async (data) => {
  const options = {
    method: 'POST',
    uri: `${process.env.API_IP}/api/commands`,
    headers: {
      'User-Agent': 'MenheraClient',
      token: process.env.API_TOKEN,
    },
    body: {
      authorName: data.authorName,
      authorId: data.authorId,
      guildName: data.guildName,
      guildId: data.guildId,
      commandName: data.commandName,
      data: data.data,
      args: data.args,
    },
    json: true,
  };

  await request(options).catch((err) => console.log(`[HTTP ERROR]${err.message}`));
};

module.exports.getProfileCommands = async (id) => {
  const options = {
    method: 'GET',
    uri: `${process.env.API_IP}/api/usages/user`,
    headers: {
      'User-Agent': 'MenheraClient',
      token: process.env.API_TOKEN,
    },
    body: {
      userId: id,
    },
    json: true,
  };

  let has = false;

  await request(options)
    .then((data) => {
      has = data;
    })
    .catch((err) => console.log(`[HTTP ERROR] ${err.message}`));

  return has;
};

module.exports.getTopCommands = async () => {
  const options = {
    method: 'GET',
    uri: `${process.env.API_IP}/api/usages/top/command`,
    headers: {
      'User-Agent': 'MenheraClient',
      token: process.env.API_TOKEN,
    },
    json: true,
  };

  let has = false;

  await request(options)
    .then((data) => {
      has = data;
    })
    .catch((err) => console.log(`[HTTP ERROR] ${err.message}`));

  return has;
};

module.exports.getTopUsers = async () => {
  const options = {
    method: 'GET',
    uri: `${process.env.API_IP}/api/usages/top/user`,
    headers: {
      'User-Agent': 'MenheraClient',
      token: process.env.API_TOKEN,
    },
    json: true,
  };

  let has = false;

  await request(options)
    .then((data) => {
      has = data;
    })
    .catch((err) => console.log(`[HTTP ERROR] ${err.message}`));

  return has;
};

module.exports.getCoinflipUserStats = async (id) => {
  const options = {
    method: 'GET',
    uri: `${process.env.API_IP}/api/coinflip`,
    headers: {
      'User-Agent': 'MenheraClient',
      token: process.env.API_TOKEN,
    },
    body: {
      userId: id,
    },
    json: true,
  };

  let has = false;

  await request(options)
    .then((data) => {
      has = data;
    })
    .catch((err) => console.log(`[HTTP ERROR] ${err.message}`));
  return has;
};

module.exports.postCoinflipGame = async (winnerId, loserId, betValue, date) => {
  const options = {
    method: 'POST',
    uri: `${process.env.API_IP}/api/coinflip`,
    headers: {
      'User-Agent': 'MenheraClient',
      token: process.env.API_TOKEN,
    },
    body: {
      winnerId,
      loserId,
      betValue,
      date,
    },
    json: true,
  };

  await request(options).catch((err) => console.log(`[HTTP ERROR] ${err.message}`));
};

module.exports.postBlackJack = async (userId, didWin, betValue) => {
  const options = {
    method: 'POST',
    uri: `${process.env.API_IP}/api/blackjack`,
    headers: {
      'User-Agent': 'MenheraClient',
      token: process.env.API_TOKEN,
    },
    body: {
      userId,
      didWin,
      betValue,
    },
    json: true,
  };

  await request(options).catch((err) => console.log(`[HTTP ERROR] ${err.message}`));
};

module.exports.getBlackJackStats = async (id) => {
  const options = {
    method: 'GET',
    uri: `${process.env.API_IP}/api/blackjack`,
    headers: {
      'User-Agent': 'MenheraClient',
      token: process.env.API_TOKEN,
    },
    body: {
      userId: id,
    },
    json: true,
  };

  let has = false;

  await request(options)
    .then((data) => {
      has = data;
    })
    .catch((err) => console.log(`[HTTP ERROR] ${err.message}`));
  return has;
};
