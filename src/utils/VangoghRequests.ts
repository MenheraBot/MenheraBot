import { IVangoghReturnData } from '@custom_types/Menhera';
import InteractionCommandContext from '@structures/command/InteractionContext';
import axios from 'axios';

const VangoghRequest = axios.create({
  baseURL: `${process.env.API_URL}/vangogh`,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': process.env.MENHERA_AGENT as string,
    Authorization: process.env.API_TOKEN as string,
  },
});

export enum VangoghRoutes {
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

export const requestVangoghImage = async <T>(
  route: VangoghRoutes,
  data: T,
  ctx: InteractionCommandContext,
): Promise<IVangoghReturnData> => {
  if (ctx.client.vangoghWs.isAlive)
    return ctx.client.vangoghWs.makeRequest({
      id: ctx.interaction.id,
      requestType: route,
      ...data,
    });

  const result = await VangoghRequest.post(`/${route}`, data).catch(() => null);
  if (!result) return { err: true };
  return { err: false, data: Buffer.from(result.data, 'base64') };
};
