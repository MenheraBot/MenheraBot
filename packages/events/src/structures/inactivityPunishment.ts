import { bot } from '..';
import { usersModel } from '../database/collections';
import { ApiTransactionReason } from '../types/api';
import { postTransaction } from '../utils/apiRequests/statistics';
import { debugError } from '../utils/debugError';
import { createEmbed } from '../utils/discord/embedUtils';
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
        'inactivityWarned',
        'demigods',
        'gods',
      ],
    );

    const ids = inactiveUsers.map((a) => a.id);

    const updatedData = inactiveUsers.map((a) => {
      if (!a.inactivityWarned) return { $set: { inactivityWarned: true } };

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

      ids.forEach(async (id, index) => {
        if (typeof updatedData[index].$inc !== 'undefined') {
          const embed = createEmbed({
            title: `⚠️ Alerta de inatividade`,
            description:
              'Percebi que você está a mais de duas semanas sem usar nenhum comando meu... Por ordens da minha mãe, eu devo pegar um pouco de tudo que você tem em sua carteira, para que os outros que ainda usam meus comandos possam reutilizar.\n\nCaso tu queira evitar de perder itens, **use algum comando de economia, como `/pix`, `/mamar`, `/blackjack`, etc.**',
            color: 0xe62020,
            image: {
              url: 'https://i.pinimg.com/474x/9f/2d/9b/9f2d9b9809fa3b0058487bf3bf81ad25.jpg',
            },
          });

          bot.helpers.getDmChannel(id).then((userDm) => {
            bot.helpers
              .sendMessage(userDm.id, { embeds: [embed] })
              .catch((e) => debugError(e, false));
          });
        } else {
          // @ts-expect-error This is ensured
          Object.entries(updatedData[index].$inc).map((a) =>
            a[1] !== 0
              ? postTransaction(
                  `${id}`,
                  `${bot.id}`,
                  a[1] * -1,
                  a[0] as 'estrelinhas',
                  ApiTransactionReason.INACTIVITY_PUNISHMENT,
                )
              : '',
          );
        }

        bulkUpdate.find({ id }).updateOne(updatedData[index]);
      });

      await bulkUpdate.execute();
    }

    inactivityPunishment();
  }, getMillisecondsToTheEndOfDay());
};

export { inactivityPunishment };
