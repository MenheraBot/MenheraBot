import { ApplicationCommandOptionTypes } from 'discordeno/types';

import { createCommand } from '../../structures/command/createCommand';
import { halloweenEventModel } from '../../database/collections';
import eventRepository from '../../database/repositories/eventRepository';
import userRepository from '../../database/repositories/userRepository';
import badgeRepository from '../../database/repositories/badgeRepository';
import starsRepository from '../../database/repositories/starsRepository';
import { postTransaction } from '../../utils/apiRequests/statistics';
import { bot } from '../..';
import { ApiTransactionReason } from '../../types/api';

const DeployCommand = createCommand({
  path: '',
  name: 'evento',
  description: '[DEV] Termina o evento ',
  options: [
    {
      type: ApplicationCommandOptionTypes.String,
      name: 'option',
      description: 'miau',
      choices: [
        {
          name: 'Ver',
          value: 'ver',
        },
        {
          name: 'fazer',
          value: 'fazer',
        },
      ],
      required: true,
    },
    {
      name: 'senha',
      description: 'senha pra fazer deploy global pra ter certeza que n apertei errado',
      type: ApplicationCommandOptionTypes.String,
      required: false,
    },
  ],
  devsOnly: true,
  category: 'dev',
  authorDataFields: [],
  execute: async (ctx, finishCommand) => {
    finishCommand();
    const option = ctx.getOption<'ver' | 'fazer'>('option', false, true);

    if (option === 'ver') {
      await ctx.makeMessage({ content: ':star:' });

      const res = await halloweenEventModel.find({ ban: false }, ['allTimeTreats', 'id'], {
        limit: 10,
        sort: { allTimeTreats: -1 },
      });

      await ctx.followUp({
        content: `Pra dar a badge de top vai ser: ${JSON.stringify(
          res.map(eventRepository.parseMongoUserToRedisUser),
        )}`,
      });

      const otherRes = await halloweenEventModel.find({ allTimeTricks: { $size: 14 } });

      ctx.followUp({
        content: `Total: ${otherRes.length}, ${otherRes.map((a) => `${a.id} `)}`,
      });

      return ctx.followUp({
        content: `\n\nPra dar badge de todos vai ser: ${JSON.stringify(
          otherRes.map(eventRepository.parseMongoUserToRedisUser),
        )}`,
      });
    }

    const senha = ctx.getOption<string>('senha', false);

    if (!senha) return ctx.makeMessage({ content: 'sem senha' });

    bot.finishedEvent = true;

    await ctx.makeMessage({ content: 'BORA QUE BORA :star:' });

    const res = await halloweenEventModel.find({ ban: false }, ['allTimeTreats', 'id'], {
      limit: 10,
      sort: { allTimeTreats: -1 },
    });

    res.forEach(async (a) => {
      const data = await userRepository.ensureFindUser(a.id);

      if (!data.badges.some((b) => b.id === 25)) badgeRepository.giveBadgeToUser(a.id, 25);
    });

    const otherRes = await halloweenEventModel.find({ allTimeTricks: { $size: 14 } });

    otherRes.forEach(async (a) => {
      const data = await userRepository.ensureFindUser(a.id);

      if (!data.badges.some((b) => b.id === 26)) badgeRepository.giveBadgeToUser(a.id, 26);
    });

    ctx.makeMessage({
      content: `Pessoas que pegou todas coisa ${otherRes.length}\nTop 10 do evento ${res.length}`,
    });

    const usersWithStars = await halloweenEventModel.find({ candies: { $gt: 0 } });

    ctx.followUp({
      content: `Users que não gastaram os doces: ${usersWithStars.length}`,
    });

    usersWithStars.forEach((a) => {
      starsRepository.addStars(a.id, a.candies * 1000);
      eventRepository.updateUser(a.id, { candies: 0 });
      postTransaction(
        `${bot.id}`,
        a.id,
        a.candies * 1000,
        'estrelinhas',
        ApiTransactionReason.SIMON_SAYS_ADD,
      );
    });
  },
});

export default DeployCommand;
