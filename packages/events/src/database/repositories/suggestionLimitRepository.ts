import { BigString } from 'discordeno/types';
import { suggestionLimitModel } from '../collections';
import { DatabaseSuggestionLimitSchema } from '../../types/database';

const getLimitData = async (userId: BigString): Promise<DatabaseSuggestionLimitSchema | null> => {
  const suggestionData = await suggestionLimitModel.findOne({ id: `${userId}` });

  return suggestionData;
};

const limitUser = async (userId: BigString, suggestion: string, create: boolean): Promise<void> => {
  if (create)
    await suggestionLimitModel.create({
      id: `${userId}`,
      limited: true,
      limitedAt: Date.now(),
      suggestion,
    });
  else
    await suggestionLimitModel.updateOne(
      { id: `${userId}` },
      {
        limited: true,
        limitedAt: Date.now(),
        suggestion,
      },
    );
};

const freeUser = async (userId: BigString): Promise<void> => {
  await suggestionLimitModel.updateOne(
    { id: `${userId}` },
    {
      limited: false,
    },
  );
};

export default { getLimitData, limitUser, freeUser };
