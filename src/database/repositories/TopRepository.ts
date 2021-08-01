/* eslint-disable no-underscore-dangle */
import { Users } from '@structures/DatabaseCollections';

// eslint-disable-next-line no-shadow
enum TOP_ENUM {
  mamou = 'mamou',
  stars = 'estrelinhas',
}

export default class TopRepository {
  constructor(private userModal: typeof Users) {
    this.userModal = userModal;
  }

  async _getTop(userID: string, topType: string): Promise<{ rank: number }> {
    const res = await this.userModal.aggregate([
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

  async getUserHuntRank(userID: string, huntType: string): Promise<{ rank: number }> {
    return this._getTop(userID, huntType);
  }
}
