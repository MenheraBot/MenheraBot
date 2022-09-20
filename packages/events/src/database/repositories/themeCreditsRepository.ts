import { BigString } from 'discordeno/types';

import { themeCreditsModel } from '../collections';
import { DatabaseCreditsSchema } from '../../types/database';

const registerTheme = async (
  themeId: number,
  ownerId: BigString,
  royalty: number,
): Promise<void> => {
  await themeCreditsModel.create({
    ownerId,
    themeId,
    royalty,
    totalEarned: 0,
    registeredAt: Date.now(),
  });
};

const findThemeInfo = async (themeId: number): Promise<DatabaseCreditsSchema | null> => {
  return themeCreditsModel.findOne({ themeId });
};

export default { registerTheme, findThemeInfo };
