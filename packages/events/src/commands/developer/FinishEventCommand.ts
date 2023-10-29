import { ApplicationCommandOptionTypes } from 'discordeno/types';

import { createCommand } from '../../structures/command/createCommand';
import { halloweenEventModel } from '../../database/collections';
import eventRepository from '../../database/repositories/eventRepository';

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
      const res = await halloweenEventModel.find({ ban: false }, ['allTimeTreats', 'id'], {
        limit: 10,
        sort: { allTimeTreats: -1 },
      });

      const otherRes = await halloweenEventModel.find({ allTimeTricks: { $size: 14 } });

      return ctx.makeMessage({
        content: `Pra dar a badge de top vai ser: ${JSON.stringify(
          res.map(eventRepository.parseMongoUserToRedisUser),
        )}\n\nPra dar badge de todos vai ser: ${JSON.stringify(
          otherRes.map(eventRepository.parseMongoUserToRedisUser),
        )}`,
      });
    }

    ctx.makeMessage({ content: 'sim' });
  },
});

export default DeployCommand;
