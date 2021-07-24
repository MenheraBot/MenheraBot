/* eslint-disable no-underscore-dangle */
import { Users } from '@structures/DatabaseCollections';

const TOP_TYPES = {
  mamou: 'mamou',
  stars: 'estrelinhas',
};

export default class TopRepository {
  constructor(private userModal: typeof Users) {
    this.userModal = userModal;
  }

  async _getTop(userID: string, topType: string) {
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

  async getUserMamouRank(userID: string) {
    return this._getTop(userID, TOP_TYPES.mamou);
  }

  async getUserStarsRank(userID: string) {
    return this._getTop(userID, TOP_TYPES.stars);
  }

  async getUserHuntRank(userID: string, huntType: string) {
    return this._getTop(userID, huntType);
  }
}
