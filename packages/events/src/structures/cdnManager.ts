/* eslint-disable camelcase */
import axios from 'axios';

import { logger } from '../utils/logger';
import { getEnviroments } from '../utils/getEnviroments';
import { debugError } from '../utils/debugError';

interface AssetsLimit {
  angry: number;
  bicuda: number;
  bite: number;
  cry: number;
  disgusted: number;
  fear: number;
  fodase: number;
  grumble: number;
  hug: number;
  humor: number;
  kill: number;
  kiss_mouth: number;
  kiss_cheek: number;
  kiss_forehead: number;
  kiss_hand: number;
  laugh: number;
  mamar: number;
  pat: number;
  poke: number;
  punch: number;
  resurrect: number;
  sarrar: number;
  sarrar_sozinho: number;
  shot: number;
  shy: number;
  slap: number;
  sniff: number;
  think: number;
}

let assetsLimit: AssetsLimit;

export const getAssetLink = (type: keyof AssetsLimit): string => {
  if (!assetsLimit || !assetsLimit[type]) {
    updateAssets();

    return 'https://i.imgur.com/HftTDov.png';
  }

  const random = Math.floor(Math.random() * assetsLimit[type]);

  const extension = type === 'humor' || type === 'fodase' ? 'png' : 'gif';

  return `${process.env.CDN_URL}/images/${type}/${random}.${extension}`;
};

export const updateAssets = async (): Promise<void> => {
  const { CDN_URL } = getEnviroments(['CDN_URL']);

  if (process.env.NOMICROSERVICES) return;

  const result = await axios.get(CDN_URL).catch(debugError);
  if (!result) return logger.error('[CDN] Error when updating assets');

  assetsLimit = result.data;

  return logger.info('[CDN] Assets have been updated');
};
