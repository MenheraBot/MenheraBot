import { usersModel } from '../database/collections';
import { getMillisecondsToTheEndOfDay } from '../utils/miscUtils';

let inactiveTimeout: NodeJS.Timeout;

const inactivityPunishment = async (): Promise<void> => {
  clearTimeout(inactiveTimeout);
  inactiveTimeout = setTimeout(async () => {
    const inactiveUsers = await usersModel.find(
      {
        $and: [
          {
            isBot: { $ne: true },
          },
          {
            $or: [
              { lastCommandAt: { $lte: Date.now() - 1_209_600_000 } },
              { lastCommandAt: { $exists: false } },
            ],
          },
          {
            $or: [
              { estrelinhas: { $gte: 250_000 } },
              { demons: { $gte: 60 } },
              { giants: { $gte: 50 } },
              { angels: { $gte: 40 } },
              { archangels: { $gte: 30 } },
              { demigods: { $gte: 20 } },
              { gods: { $gte: 7 } },
            ],
          },
        ],
      },
      [
        'estrelinhas',
        'id',
        'lastCommandAt',
        'demons',
        'giants',
        'angels',
        'archangels',
        'demigods',
        'gods',
      ],
    );

    const ids = inactiveUsers.map((a) => a.id);

    const updatedData = inactiveUsers.map((a) => {
      const weeks =
        !a.lastCommandAt || a.lastCommandAt === 0
          ? 10
          : parseFloat(((Date.now() - a.lastCommandAt) / 1_209_600_000).toFixed(1));

      const toReduceValue = (source: number, divider: number): number => {
        const toDivide = source / divider >= 4 ? 4 : 8;
        const multiplied = Math.floor((source / toDivide) * weeks);
        return Math.min(multiplied, source) * -1;
      };

      const estrelinhas = toReduceValue(a.estrelinhas, 250_000);
      const demons = toReduceValue(a.demons, 50);
      const giants = toReduceValue(a.giants, 45);
      const angels = toReduceValue(a.angels, 30);
      const archangels = toReduceValue(a.archangels, 10);
      const demigods = toReduceValue(a.demigods, 5);
      const gods = toReduceValue(a.gods, 2);

      return { $inc: { estrelinhas, demons, giants, angels, archangels, demigods, gods } };
    });

    if (inactiveUsers.length > 0) {
      const bulkUpdate = usersModel.collection.initializeUnorderedBulkOp();

      ids.forEach((id, index) => {
        bulkUpdate.find({ id }).updateOne(updatedData[index]);
      });

      await bulkUpdate.execute();
    }

    inactivityPunishment();
  }, getMillisecondsToTheEndOfDay());
};

export { inactivityPunishment };
