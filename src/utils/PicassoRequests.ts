import { IPicassoReturnData } from '@custom_types/Menhera';
import InteractionCommandContext from '@structures/command/InteractionContext';
import axios from 'axios';

const PicassoRequest = axios.create({
  baseURL: `${process.env.API_URL}/picasso`,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': process.env.MENHERA_AGENT as string,
    Authorization: process.env.API_TOKEN as string,
  },
});

export enum PicassoRoutes {
  Fluffety = 'fluffety',
  Astolfo = 'astolfo',
  Vasco = 'vasco',
  Preview = 'preview',
  EightBall = '8ball',
  Philo = 'philo',
  Ship = 'ship',
  Trisal = 'trisal',
  Profile = 'profile',
  Gado = 'gado',
  Macetava = 'macetava',
  Blackjack = 'blackjack',
  BETA = 'beta',
}

export const requestPicassoImage = async <T>(
  route: PicassoRoutes,
  data: T,
  ctx: InteractionCommandContext,
): Promise<IPicassoReturnData> => {
  if (ctx.client.picassoWs.isAlive)
    return ctx.client.picassoWs.makeRequest({
      id: ctx.interaction.id,
      type: route,
      ...data,
    });

  const result = await PicassoRequest.post(`/${route}`, { data }).catch(() => null);
  if (!result) return { err: true };
  return { err: false, data: Buffer.from(result.data, 'base64') };
};
