/* eslint-disable no-underscore-dangle */
const TOP_TYPES = {
  mamou: 'mamou',
  stars: 'estrelinhas',
};

module.exports = class TopRepository {
  constructor(userModal) {
    this.userModal = userModal;
  }

  async _getTop(userID, topType) {
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

  async getUserMamouRank(userID) {
    return this._getTop(userID, TOP_TYPES.mamou);
  }

  async getUserStarsRank(userID) {
    return this._getTop(userID, TOP_TYPES.stars);
  }

  async getUserHuntRank(userID, huntType) {
    return this._getTop(userID, huntType)
  }
};
