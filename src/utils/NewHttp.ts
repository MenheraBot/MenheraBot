import axios from 'axios';

import { IBlackjackCards, IHttpPicassoReutrn } from '@utils/Types';

const request = axios.create({
  baseURL: 'http://localhost:2080',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'Menhera-Client',
  },
});

export default class HttpRequests {
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
    user: string,
    marry: string,
    usageCommands: number,
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
