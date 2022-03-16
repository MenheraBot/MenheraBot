/* eslint-disable camelcase */
import axios from 'axios';

import {
  AvailableCardBackgroundThemes,
  AvailableCardThemes,
  AvailableProfilesThemes,
  AvailableTableThemes,
  AvailableThemeTypes,
  BichoBetType,
  IBlackjackCards,
  ICommandsData,
  ICommandUsedData,
  IDisabled,
  IPicassoReturnData,
  IRESTGameStats,
  IRESTHuntStats,
  IStatusData,
  IUserDataToProfile,
  ThemeFiles,
} from '@utils/Types';
import { User } from 'discord.js-light';
import type { ActivityType } from 'discord.js';
import { UserBattleConfig } from '@roleplay/Types';
import { debugError, MayNotExists } from './Util';

const PicassoRequest = axios.create({
  baseURL: `${process.env.API_URL}/picasso`,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': process.env.MENHERA_AGENT,
    Authorization: process.env.API_TOKEN,
  },
});

const topggRequest = axios.create({
  baseURL: `https://top.gg/api`,
  headers: {
    'Content-Type': 'application/json',
    Authorization: process.env.DBL_TOKEN,
  },
});

const apiRequest = axios.create({
  baseURL: `${process.env.API_URL}/data`,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': process.env.MENHERA_AGENT,
    Authorization: process.env.API_TOKEN,
  },
});

const StatusRequest = axios.create({
  baseURL: `${process.env.API_URL}/info`,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': process.env.MENHERA_AGENT,
    Authorization: process.env.API_TOKEN,
  },
});

export default class HttpRequests {
  static async getAssetImageUrl(type: string): Promise<string> {
    try {
      const data = await apiRequest.get(`/assets/${type}`);
      return data.data.url;
    } catch {
      return 'https://i.imgur.com/HftTDov.png';
    }
  }

  static async getUserBattleConfig(
    userId: string,
  ): Promise<{ error: false; data: { config: UserBattleConfig } } | { error: true }> {
    const result = await apiRequest.get(`/roleplay/battleconf/?userId=${userId}`).catch(debugError);

    if (!result || result.status !== 200) return { error: true };

    return { error: false, data: result.data };
  }

  static async updateUserBattleConfig(userId: string, config: UserBattleConfig): Promise<void> {
    await apiRequest.patch(`/roleplay/battleconf/?userId=${userId}`, { config }).catch(debugError);
  }

  static async postCommandStatus(commands: ICommandsData[]): Promise<void> {
    await StatusRequest.post('/commands', { data: { commands } }).catch(debugError);
  }

  static async postShardStatus(shards: IStatusData[]): Promise<void> {
    await StatusRequest.put('/shards', { data: { shards } }).catch(debugError);
  }

  static async updateCommandStatusMaintenance(
    commandName: string,
    maintenance: IDisabled,
  ): Promise<void> {
    await StatusRequest.patch(`/commands/${commandName}`, {
      data: { disabled: maintenance },
    }).catch(debugError);
  }

  static async getProfileCommands(
    id: string,
  ): Promise<false | { cmds: { count: number }; array: Array<{ name: string; count: number }> }> {
    try {
      const data = await apiRequest.get('/usages/user', { data: { userId: id } });
      if (data.status === 200) return data.data;
    } catch {
      return false;
    }
    return false;
  }

  static async getTopCommands(): Promise<false | { name: string; usages: number }[]> {
    try {
      const data = await apiRequest.get('/usages/top/command');
      if (data.status === 200) return data.data;
    } catch {
      return false;
    }

    return false;
  }

  static async postBotStatus(
    botId: string,
    serverCount: number,
    shardCount: number,
  ): Promise<void> {
    await topggRequest
      .post(`/bots/${botId}/stats`, { server_count: serverCount, shard_count: shardCount })
      .catch(debugError);
  }

  static async getTopUsers(): Promise<false | { id: string; uses: number }[]> {
    try {
      const data = await apiRequest.get('/usages/top/user');
      if (data.status === 200) return data.data;
    } catch {
      return false;
    }
    return false;
  }

  static async getCoinflipUserStats(id: string): Promise<IRESTGameStats | { error: true }> {
    try {
      const data = await apiRequest.get('/statistics/coinflip', { data: { userId: id } });
      if (data.status === 400) return { error: true };
      if (!data.data.error) return data.data;
    } catch {
      return { error: true };
    }

    return { error: true };
  }

  static async postCommand(info: ICommandUsedData): Promise<void> {
    await apiRequest
      .post('/usages/commands', {
        authorId: info.authorId,
        guildId: info.guildId,
        commandName: info.commandName,
        data: info.data,
        args: info.args,
        shardId: info.shardId,
      })
      .catch(debugError);
  }

  static async getActivity(
    clusterId: number,
  ): Promise<{ name: string; type: Exclude<ActivityType, 'CUSTOM'> }> {
    /*  try {
      const data = await apiRequest.get('/activity', { data: { shard: shard || 0 } });
      return data.data;
    } catch { */
    return { name: `❤️ | Menhera foi criada pela Lux | Cluster ${clusterId}`, type: 'PLAYING' };
    // }
  }

  static async getBlackJackStats(id: string): Promise<IRESTGameStats | { error: true }> {
    try {
      const data = await apiRequest.get('/statistics/blackjack', { data: { userId: id } });
      if (data.status === 400) return { error: true };
      if (!data.data.error) return data.data;
    } catch {
      return { error: true };
    }

    return { error: true };
  }

  static async postBlackJack(userId: string, didWin: boolean, betValue: number): Promise<void> {
    await apiRequest.post('/statistics/blackjack', { userId, didWin, betValue }).catch(debugError);
  }

  static async postCoinflipGame(
    winnerId: string,
    loserId: string,
    betValue: number,
    date: number,
  ): Promise<void> {
    await apiRequest
      .post('/statistics/coinflip', { winnerId, loserId, betValue, date })
      .catch(debugError);
  }

  static async postBichoGame(
    userId: string,
    value: number,
    betType: BichoBetType,
    betSelection: string,
  ): Promise<MayNotExists<{ gameId: number }>> {
    return apiRequest
      .post('/statistics/bicho', { userId, value, betType, betSelection })
      .catch(debugError)
      .then((a) => a?.data);
  }

  static async userWinBicho(gameId: number): Promise<void> {
    if (!gameId) return;
    await apiRequest.patch('/statistics/bicho', { gameId });
  }

  static async postHuntCommand(
    userId: string,
    huntType: string,
    { value, success, tries }: { value: number; success: number; tries: number },
  ): Promise<void> {
    await apiRequest
      .post('/statistics/hunt', { userId, huntType, value, success, tries })
      .catch(debugError);
  }

  static async getHuntUserStats(id: string): Promise<IRESTHuntStats | { error: true }> {
    try {
      const data = await apiRequest.get('/statistics/hunt', { data: { userId: id } });
      if (data.status === 400) return { error: true };
      if (!data.data.error) return data.data;
    } catch {
      return { error: true };
    }

    return { error: true };
  }

  static async astolfoRequest(text: string): Promise<IPicassoReturnData> {
    try {
      const data = await PicassoRequest.get('/astolfo', { data: { text } });
      return { err: false, data: Buffer.from(data.data) };
    } catch {
      return { err: true };
    }
  }

  static async statusRequest(
    user: unknown,
    userAvatarLink: string,
    i18n: unknown,
  ): Promise<IPicassoReturnData> {
    try {
      const data = await PicassoRequest.get('/status', { data: { user, userAvatarLink, i18n } });
      return { err: false, data: Buffer.from(data.data) };
    } catch {
      return { err: true };
    }
  }

  static async vascoRequest(
    user: string,
    quality: string,
    username: string,
    position: string,
  ): Promise<IPicassoReturnData> {
    try {
      const data = await PicassoRequest.get('/vasco', {
        data: { user, quality, username, position },
      });
      return { err: false, data: Buffer.from(data.data) };
    } catch {
      return { err: true };
    }
  }

  static async previewRequest(
    theme: ThemeFiles['theme'],
    previewType: AvailableThemeTypes,
  ): Promise<IPicassoReturnData> {
    try {
      const data = await PicassoRequest.get('/preview', { data: { theme, previewType } });
      return { err: false, data: Buffer.from(data.data) };
    } catch {
      return { err: true };
    }
  }

  static async EightballRequest<T>(sendData: T): Promise<IPicassoReturnData> {
    try {
      const data = await PicassoRequest.get('/8ball', { data: sendData });
      return { err: false, data: Buffer.from(data.data) };
    } catch {
      return { err: true };
    }
  }

  static async philoRequest(text: string): Promise<IPicassoReturnData> {
    try {
      const data = await PicassoRequest.get('/philo', { data: { text } });
      return { err: false, data: Buffer.from(data.data) };
    } catch {
      return { err: true };
    }
  }

  static async shipRequest(
    linkOne: string,
    linkTwo: string,
    shipValue: number,
  ): Promise<IPicassoReturnData> {
    try {
      const data = await PicassoRequest.get('/ship', { data: { linkOne, linkTwo, shipValue } });
      return { err: false, data: Buffer.from(data.data) };
    } catch {
      return { err: true };
    }
  }

  static async trisalRequest(
    userOne: string,
    userTwo: string,
    userThree: string,
  ): Promise<IPicassoReturnData> {
    try {
      const data = await PicassoRequest.get('/trisal', { data: { userOne, userTwo, userThree } });
      return { err: false, data: Buffer.from(data.data) };
    } catch {
      return { err: true };
    }
  }

  static async profileRequest(
    user: IUserDataToProfile,
    marry: User | null,
    usageCommands:
      | boolean
      | { cmds: { count: number }; array: Array<{ name: string; count: number }> },
    i18n: unknown,
    type: AvailableProfilesThemes,
  ): Promise<IPicassoReturnData> {
    try {
      const data = await PicassoRequest.get('/profile', {
        data: {
          user,
          marry,
          usageCommands,
          i18n,
          type,
        },
      });
      return { err: false, data: Buffer.from(data.data) };
    } catch {
      return { err: true };
    }
  }

  static async gadoRequest(image: string): Promise<IPicassoReturnData> {
    try {
      const data = await PicassoRequest.get('/gado', { data: { image } });
      return { err: false, data: Buffer.from(data.data) };
    } catch {
      return { err: true };
    }
  }

  static async getUserDeleteUsages(userId: string): Promise<{ count?: number; err: boolean }> {
    try {
      const data = await apiRequest.get('/usages/user/delete', { data: { userId } });
      if (data) return { count: data.data.count, err: false };
      return { err: true };
    } catch {
      return { err: true };
    }
  }

  static async macetavaRequest(
    image: string,
    authorName: string,
    authorDiscriminator: string,
    authorImage: string,
  ): Promise<IPicassoReturnData> {
    try {
      const data = await PicassoRequest.get('/macetava', {
        data: {
          image,
          authorName,
          authorDiscriminator,
          authorImage,
        },
      });
      return { err: false, data: Buffer.from(data.data) };
    } catch {
      return { err: true };
    }
  }

  static async blackjackRequest(
    aposta: number,
    userCards: Array<IBlackjackCards>,
    menheraCards: Array<IBlackjackCards>,
    userTotal: number,
    menheraTotal: number,
    isEnd: boolean,
    i18n: unknown,
    cardTheme: AvailableCardThemes,
    tableTheme: AvailableTableThemes,
    backgroundCardTheme: AvailableCardBackgroundThemes,
  ): Promise<IPicassoReturnData> {
    try {
      if (!isEnd) menheraCards[1].hidden = true;
      const data = await PicassoRequest.get('/blackjack', {
        data: {
          userCards,
          menheraCards,
          userTotal,
          menheraTotal,
          i18n,
          aposta,
          cardTheme,
          tableTheme,
          backgroundCardTheme,
        },
      });
      return { err: false, data: Buffer.from(data.data) };
    } catch {
      return { err: true };
    }
  }

  static async inactiveUsers(users: string[]): Promise<{ user_id: string; date: number } | null> {
    try {
      const data = await apiRequest.get('/usages/inactive', { data: users });
      return data.data;
    } catch {
      return null;
    }
  }
}
