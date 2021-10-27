/* eslint-disable no-underscore-dangle */
import { Users } from '@structures/DatabaseCollections';
import { IUserSchema } from '@utils/Types';

// eslint-disable-next-line no-shadow
enum TOP_ENUM {
  mamou = 'mamou',
  stars = 'estrelinhas',
}

export default class TopRepository {
  constructor(private userModal: typeof Users) {}

  async _getTop(
    userID: string,
    topType: string,
    ignoredUsers: string[] = [],
  ): Promise<{ rank: number }> {
    const res = await this.userModal.aggregate([
      {
        $project: {
          [topType]: true,
          id: true,
          ban: true,
        },
      },
      {
        $match: {
          id: { $nin: ignoredUsers },
          ban: false,
        },
      },
      {
        $sort: {
          [topType]: -1,
        },
      },
      {
        $group: {
          _id: false,
          user: {
            $push: {
              _id: '$id',
              [topType]: `$${topType}`,
            },
          },
        },
      },
      {
        $unwind: {
          path: '$user',
          includeArrayIndex: 'rank',
        },
      },
      {
        $match: {
          'user._id': userID,
        },
      },
    ]);

    return res[0];
  }

  async getUserMamouRank(userID: string): Promise<{ rank: number }> {
    return this._getTop(userID, TOP_ENUM.mamou);
  }

  async getUserStarsRank(userID: string): Promise<{ rank: number }> {
    return this._getTop(userID, TOP_ENUM.stars);
  }

  async getUserHuntRank(
    userID: string,
    huntType: keyof IUserSchema,
    ignoredUsers: string[] = [],
  ): Promise<{ rank: number }> {
    return this._getTop(userID, huntType, ignoredUsers);
  }
}
