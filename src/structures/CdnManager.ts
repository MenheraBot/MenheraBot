/* eslint-disable no-restricted-syntax */
import { debugError } from '@utils/Util';
import axios from 'axios';

export interface AssetsLimit {
  angry: number;
  bicuda: number;
  bite: number;
  cheek: number;
  cry: number;
  disgusted: number;
  fear: number;
  fodase: number;
  grumble: number;
  hug: number;
  humor: number;
  kill: number;
  kiss: number;
  laugh: number;
  mamar: number;
  pat: number;
  poke: number;
  punch: number;
  resurrect: number;
  sarrar: number;
  // eslint-disable-next-line camelcase
  sarrar_sozinho: number;
  shot: number;
  shy: number;
  slap: number;
  sniff: number;
  think: number;
}

let assetsLimit: AssetsLimit;

export const getAssetLink = (type: keyof AssetsLimit): string => {
  if (!assetsLimit || !assetsLimit[type]) return 'https://i.imgur.com/HftTDov.png';

  const random = Math.floor(Math.random() * assetsLimit[type]);

  const extension = type === 'humor' || type === 'fodase' ? 'png' : 'gif';

  return `${process.env.CDN_URL}/images/${type}/${random}.${extension}`;
};

export const updateAssets = async (): Promise<string> => {
  const result = await axios.get(process.env.CDN_URL as string).catch(debugError);
  if (!result) return 'Error when updating assets';

  assetsLimit = result.data;

  return 'Assets have been updated';
};
