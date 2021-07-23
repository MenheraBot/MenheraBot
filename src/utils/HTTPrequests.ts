import request from 'request-promise';
import { ICommandUsedData, IRESTGameStats } from './Types';

export const getImageUrl = async (type: string): Promise<string> => {
  const options = {
    method: 'GET',
    uri: `${process.env.API_IP}/api/assets/${type}`,
    headers: {
      'User-Agent': 'MenheraClient',
      token: process.env.API_TOKEN,
    },
    json: true,
  };

  const response = await request(options).catch((err: Error) =>
    console.log(`[HTTP ERROR] ${err.message}`),
  );

  return response?.url || 'https://i.imgur.com/DHVUlFf.png';
};
export const postRpg = async (
  userId: string,
  userClass: string,
  userLevel: number,
  dungeonLevel: number,
  death: boolean,
  date: number,
): Promise<void> => {
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
  await request(options).catch((err: Error) => console.log(`[HTTP ERROR] ${err.message}`));
};

type activity = 'PLAYING' | 'WATCHING' | 'STREAMING' | 'LISTENING';

export const getActivity = async (shard: number): Promise<{ name: string; type: activity }> => {
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

  const result = await request(options).catch((err: Error) =>
    console.log(`[HTTP ERROR] ${err.message}`),
  );
  if (!result)
    return { name: `❤️ | Menhera foi criada pela Lux | Shard ${shard}`, type: 'PLAYING' };
  return result;
};

export const postCommand = async (data: ICommandUsedData): Promise<void> => {
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

  await request(options).catch((err: Error) => console.log(`[HTTP ERROR]${err.message}`));
};

export const getProfileCommands = async (
  id: string,
): Promise<
  boolean | { cmds: { count: number }; array: Array<{ name: string; count: number }> }
> => {
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

  let has: boolean | Array<{ name: string; count: number }> = false;

  await request(options)
    .then((data: Array<{ name: string; count: number }>) => {
      has = data;
    })
    .catch((err: Error) => console.log(`[HTTP ERROR] ${err.message}`));

  return has;
};

export const getTopCommands = async (): Promise<boolean | { name: string; count: number }[]> => {
  const options = {
    method: 'GET',
    uri: `${process.env.API_IP}/api/usages/top/command`,
    headers: {
      'User-Agent': 'MenheraClient',
      token: process.env.API_TOKEN,
    },
    json: true,
  };

  let has: boolean | { name: string; count: number }[] = false;

  await request(options)
    .then((data: { name: string; count: number }[]) => {
      has = data;
    })
    .catch((err: Error) => console.log(`[HTTP ERROR] ${err.message}`));

  return has;
};

export const getTopUsers = async (): Promise<boolean | { id: string; uses: number }[]> => {
  const options = {
    method: 'GET',
    uri: `${process.env.API_IP}/api/usages/top/user`,
    headers: {
      'User-Agent': 'MenheraClient',
      token: process.env.API_TOKEN,
    },
    json: true,
  };

  let has: boolean | { id: string; uses: number }[] = false;

  await request(options)
    .then((data: { id: string; uses: number }[]) => {
      has = data;
    })
    .catch((err: Error) => console.log(`[HTTP ERROR] ${err.message}`));

  return has;
};

export const getCoinflipUserStats = async (id: string): Promise<boolean | IRESTGameStats> => {
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

  let has: boolean | IRESTGameStats = false;

  await request(options)
    .then((data: IRESTGameStats) => {
      has = data;
    })
    .catch((err: Error) => console.log(`[HTTP ERROR] ${err.message}`));
  return has;
};

export const postCoinflipGame = async (
  winnerId: string,
  loserId: string,
  betValue: number,
  date: number,
): Promise<void> => {
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

  await request(options).catch((err: Error) => console.log(`[HTTP ERROR] ${err.message}`));
};

export const postBlackJack = async (
  userId: string,
  didWin: boolean,
  betValue: number,
): Promise<void> => {
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

export const getBlackJackStats = async (id: string): Promise<boolean | IRESTGameStats> => {
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

  let has: boolean | IRESTGameStats = false;

  await request(options)
    .then((data: IRESTGameStats) => {
      has = data;
    })
    .catch((err: Error) => console.log(`[HTTP ERROR] ${err.message}`));
  return has;
};
