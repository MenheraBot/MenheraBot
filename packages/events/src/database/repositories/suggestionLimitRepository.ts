import { BigString } from '@discordeno/bot';
import { suggestionLimitModel } from '../collections.js';
import { DatabaseSuggestionLimitSchema } from '../../types/database.js';

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
