import axios from 'axios';

import { debugError } from '../utils/debugError.js';
import { logger } from '../utils/logger.js';
import { MenheraClient } from '../types/menhera.js';
import { getEnviroments } from '../utils/getEnviroments.js';

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
  shot: number;
  shy: number;
  slap: number;
  sniff: number;
  think: number;
}

let assetsLimit: AssetsLimit;

const { CDN_URL } = getEnviroments(['CDN_URL']);

export const getAssetLink = (type: keyof AssetsLimit): string => {
  if (!assetsLimit || !assetsLimit[type]) {
    updateAssets();

    return `${CDN_URL}/images/internal/api_error.png`;
  }

  const random = Math.floor(Math.random() * assetsLimit[type]);

  const extension = type === 'humor' || type === 'fodase' ? 'png' : 'gif';

  return `${CDN_URL}/images/${type}/${random}.${extension}`;
};

export const getProfileImageUrl = (imageId: number, bot: MenheraClient): string =>
  `${bot.cdnUrl}/images/profiles/${imageId}.png`;

export const updateAssets = async (): Promise<void> => {
  if (process.env.NOMICROSERVICES || process.env.NODE_ENV === 'test') return;

  const result = await axios.get(CDN_URL).catch(debugError);
  if (!result) return logger.error('[CDN] Error when updating assets');

  assetsLimit = result.data;

  return logger.info('[CDN] Assets have been updated');
};
