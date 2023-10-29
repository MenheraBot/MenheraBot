import { ApplicationCommandOptionTypes } from 'discordeno/types';

import { createCommand } from '../../structures/command/createCommand';
import { halloweenEventModel } from '../../database/collections';
import eventRepository from '../../database/repositories/eventRepository';
import userRepository from '../../database/repositories/userRepository';
import badgeRepository from '../../database/repositories/badgeRepository';

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
      content: `Total de ruim ${otherRes.length}\nTotal de outro ${res.length}`,
    });
  },
});

export default DeployCommand;
