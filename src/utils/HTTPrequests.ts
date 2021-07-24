import axios from 'axios';

import {
  IBlackjackCards,
  ICommandUsedData,
  IHttpPicassoReutrn,
  IRESTGameStats,
  IUserDataToProfile,
} from '@utils/Types';
import { User } from 'discord.js';

type activity = 'PLAYING' | 'WATCHING' | 'STREAMING' | 'LISTENING';

const request = axios.create({
  baseURL: 'http://localhost:2080',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'Menhera-Client',
  },
});

const apiRequest = axios.create({
  baseURL: `${process.env.API_IP}/api`,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'Menhera-Client',
    token: process.env.API_TOKEN,
  },
});

export default class HttpRequests {
  static async getAssetImageUrl(type: string): Promise<string> {
    try {
      const data = await apiRequest.get(`/assets/${type}`);
      return data.data.url;
    } catch {
      return 'https://i.imgur.com/DHVUlFf.png';
    }
  }

  static async getProfileCommands(
    id: string,
  ): Promise<boolean | { cmds: { count: number }; array: Array<{ name: string; count: number }> }> {
    try {
      const data = await apiRequest.get('/usages/user', { data: { userId: id } });
      if (data.status === 200) return data.data;
    } catch {
      return false;
    }
    return false;
  }

  static async getTopCommands(): Promise<boolean | { name: string; count: number }[]> {
    try {
      const data = await apiRequest.get('/usages/top/command');
      if (data.status === 200) return data.data;
    } catch {
      return false;
    }

    return false;
  }

  static async getTopUsers(): Promise<boolean | { id: string; uses: number }[]> {
    try {
      const data = await apiRequest.get('/usages/top/user');
      if (data.status === 200) return data.data;
    } catch {
      return false;
    }
    return false;
  }

  static async getCoinflipUserStats(id: string): Promise<IRESTGameStats> {
    try {
      const data = await apiRequest.get('/coinflip', { data: { userId: id } });
      if (data.status === 400) return { error: true };
      if (!data.data.error) return data.data;
    } catch {
      return { error: true };
    }

    return { error: true };
  }

  static async postCommand(data: ICommandUsedData): Promise<void> {
    await apiRequest
      .post('/commands', {
        data: {
          authorName: data.authorName,
          authorId: data.authorId,
          guildName: data.guildName,
          guildId: data.guildId,
          commandName: data.commandName,
          data: data.data,
          args: data.args,
        },
      })
      .catch(() => null);
  }

  static async getActivity(shard: number): Promise<{ name: string; type: activity }> {
    try {
      const data = await apiRequest.get('/activity', { data: { shard: shard || 0 } });
      return data.data;
    } catch {
      return { name: `❤️ | Menhera foi criada pela Lux | Shard ${shard}`, type: 'PLAYING' };
    }
  }

  static async getBlackJackStats(id: string): Promise<IRESTGameStats> {
    try {
      const data = await apiRequest.get('/blackjack', { data: { userId: id } });
      if (data.status === 400) return { error: true };
      if (!data.data.error) return data.data;
    } catch {
      return { error: true };
    }

    return { error: true };
  }

  static async postBlackJack(userId: string, didWin: boolean, betValue: number): Promise<void> {
    await apiRequest.post('/blackjack', { data: { userId, didWin, betValue } }).catch(() => null);
  }

  static async postCoinflipGame(
    winnerId: string,
    loserId: string,
    betValue: number,
    date: number,
  ): Promise<void> {
    await apiRequest
      .post('/coinflip', { data: { winnerId, loserId, betValue, date } })
      .catch(() => null);
  }

  static async postRpg(
    userId: string,
    userClass: string,
    userLevel: number,
    dungeonLevel: number,
    death: boolean,
    date: number,
  ): Promise<void> {
    await apiRequest
      .post('/rpg', { data: { userId, userClass, userLevel, dungeonLevel, death, date } })
      .catch(() => null);
  }

  static async astolfoRequest(text: string): Promise<IHttpPicassoReutrn> {
    try {
      const data = await request.get('/astolfo', { data: { text } });
      return { err: false, data: data.data };
    } catch {
      return { err: true };
    }
  }

  static async philoRequest(text: string): Promise<IHttpPicassoReutrn> {
    try {
      const data = await request.get('/philo', { data: { text } });
      return { err: false, data: data?.data };
    } catch {
      return { err: true };
    }
  }

  static async shipRequest(
    linkOne: string,
    linkTwo: string,
    shipValue: number,
  ): Promise<IHttpPicassoReutrn> {
    try {
      const data = await request.get('/ship', { data: { linkOne, linkTwo, shipValue } });
      return { err: false, data: data?.data };
    } catch {
      return { err: true };
    }
  }

  static async trisalRequest(
    userOne: string,
    userTwo: string,
    userThree: string,
  ): Promise<IHttpPicassoReutrn> {
    try {
      const data = await request.get('/trisal', { data: { userOne, userTwo, userThree } });
      return { err: false, data: data?.data };
    } catch {
      return { err: true };
    }
  }

  static async profileRequest(
    user: IUserDataToProfile,
    marry: string | User,
    usageCommands:
      | boolean
      | { cmds: { count: number }; array: Array<{ name: string; count: number }> },
    i18n: unknown,
  ): Promise<IHttpPicassoReutrn> {
    try {
      const data = await request.get('/profile', {
        data: {
          user,
          marry,
          usageCommands,
          i18n,
        },
      });
      return { err: false, data: data?.data };
    } catch {
      return { err: true };
    }
  }

  static async statusRequest(
    user: string,
    userAvatarLink: string,
    i18n: unknown,
  ): Promise<IHttpPicassoReutrn> {
    try {
      const data = await request.get('/status', {
        data: { user, userAvatarLink, i18n },
      });
      return { err: false, data: data?.data };
    } catch {
      return { err: true };
    }
  }

  static async gadoRequest(image: string): Promise<IHttpPicassoReutrn> {
    try {
      const data = await request.get('/gado', { data: { image } });
      return { err: false, data: data?.data };
    } catch {
      return { err: true };
    }
  }

  static async macetavaRequest(
    image: string,
    authorName: string,
    authorDiscriminator: string,
    authorImage: string,
  ): Promise<IHttpPicassoReutrn> {
    try {
      const data = await request.get('/macetava', {
        data: {
          image,
          authorName,
          authorDiscriminator,
          authorImage,
        },
      });
      return { err: false, data: data?.data };
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
  ) {
    try {
      if (!isEnd) menheraCards[1].hidden = true;
      const data = await request.get('/blackjack', {
        data: {
          userCards,
          menheraCards,
          userTotal,
          menheraTotal,
          i18n,
          aposta,
        },
      });
      return { err: false, data: data?.data };
    } catch {
      return { err: true };
    }
  }
}
