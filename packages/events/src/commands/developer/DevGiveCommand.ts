import { User } from 'discordeno/transformers';
import { ApplicationCommandOptionTypes } from 'discordeno/types';
import userRepository from '../../database/repositories/userRepository';

import { createCommand } from '../../structures/command/createCommand';
import titlesRepository from '../../database/repositories/titlesRepository';
import giveRepository from '../../database/repositories/giveRepository';
import notificationRepository from '../../database/repositories/notificationRepository';

const GiveBadgeCommand = createCommand({
  path: '',
  name: 'give',
  description: '[DEV] Dá.',
  options: [
    {
      name: 'badge',
      description: '[DEV] Dá uma Badge pra alguém',
      type: ApplicationCommandOptionTypes.SubCommand,
      options: [
        {
          name: 'user',
          description: 'User pra da badge',
          type: ApplicationCommandOptionTypes.User,
          required: true,
        },
        {
          name: 'badgeid',
          description: 'id da badge',
          type: ApplicationCommandOptionTypes.Integer,
          autocomplete: true,
          required: true,
        },
      ],
    },
    {
      name: 'titulo',
      description: '[DEV] Dá um titulo pra alguem',
      type: ApplicationCommandOptionTypes.SubCommand,
      options: [
        {
          name: 'user',
          description: 'User pra da o itutlo',
          type: ApplicationCommandOptionTypes.User,
          required: true,
        },
        {
          name: 'titleid',
          description: 'id do titulo',
          type: ApplicationCommandOptionTypes.Integer,
          required: true,
        },
      ],
    },
  ],
  devsOnly: true,
  category: 'dev',
  authorDataFields: [],
  execute: async (ctx, finishCommand) => {
    finishCommand();
    const subCommand = ctx.getSubCommand();

    if (subCommand === 'badge') {
      const { id: userId } = ctx.getOption<User>('user', 'users', true);
      const badgeId = ctx.getOption<number>('badgeid', false, true);

      const userData = await userRepository.ensureFindUser(userId);

      if (userData.badges.some((a) => a.id === badgeId))
        return finishCommand(ctx.makeMessage({ content: 'Este usuário já possui esta badge!' }));

      await giveRepository.giveBadgeToUser(userId, badgeId as 1);

      notificationRepository.createNotification(
        userId,
        'commands:notificações.notifications.lux-gave-badge',
        {},
      );

      return ctx.makeMessage({ content: 'Badge adicionada a conta do user UwU' });
    }

    const { id: userId } = ctx.getOption<User>('user', 'users', true);
    const titleId = ctx.getOption<number>('titleid', false, true);

    const titleExists = await titlesRepository.getTitleInfo(titleId);

    if (!titleExists) return ctx.makeMessage({ content: 'Titulo nao existe' });

    const userTitles = await userRepository.ensureFindUser(userId);

    if (userTitles.titles.some((a) => a.id === titleId))
      return ctx.makeMessage({ content: 'Esse usuário ja tem esse titulo' });

    await giveRepository.giveTitleToUser(userId, titleId);

    notificationRepository.createNotification(
      userId,
      'commands:notificações.notifications.lux-gave-title',
      {},
    );

    return ctx.makeMessage({ content: 'Titulo adicionado na conta do user UwU' });
  },
});

export default GiveBadgeCommand;
