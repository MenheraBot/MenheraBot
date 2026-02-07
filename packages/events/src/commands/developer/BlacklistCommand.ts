import { ApplicationCommandOptionTypes, ButtonStyles } from '@discordeno/bot';

import blacklistRepository from '../../database/repositories/blacklistRepository.js';
import userRepository from '../../database/repositories/userRepository.js';
import { createCommand } from '../../structures/command/createCommand.js';
import { getAllUserBans } from '../../utils/apiRequests/statistics.js';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext.js';
import {
  createActionRow,
  createButton,
  createCustomId,
} from '../../utils/discord/componentUtils.js';
import { User } from '../../types/discordeno.js';
import { getDisplayName } from '../../utils/discord/userUtils.js';

const executeAllTimeBans = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [userId] = ctx.sentData;

  await ctx.visibleAck(false);

  const allTimeBans = await getAllUserBans(userId);

  ctx.makeMessage({
    content: `\`\`\`js\n\n\n== ALL TIME BANS ==\n${allTimeBans
      .map((a) => `• ${new Date(Number(a.date)).toISOString()} :: "${a.reason}"`)
      .join('\n')}\n\`\`\`\n\n**Parabéns por foder com o Postgres**`,
  });
};

const BlacklistCommand = createCommand({
  path: '',
  name: 'blacklist',
  description: '[DEV] Manipula os bans da Menhera',
  options: [
    {
      type: ApplicationCommandOptionTypes.String,
      name: 'tipo',
      description: 'Tipo do comando',
      required: true,
      choices: [
        {
          name: 'Adicionar',
          value: 'add',
        },
        {
          name: 'Remover',
          value: 'remove',
        },
        {
          name: 'Ver',
          value: 'view',
        },
      ],
    },
    {
      type: ApplicationCommandOptionTypes.User,
      name: 'user',
      description: 'Usuario pra banir',
      required: true,
    },
    {
      type: ApplicationCommandOptionTypes.String,
      name: 'motivo',
      description: 'Motivo do ban',
      required: false,
    },
  ],
  devsOnly: true,
  category: 'dev',
  authorDataFields: [],
  commandRelatedExecutions: [executeAllTimeBans],
  execute: async (ctx, finishCommand) => {
    const user = ctx.getOption<User>('user', 'users', true);

    switch (ctx.getOption('tipo', false, true)) {
      case 'add': {
        if (!user)
          return finishCommand(
            ctx.makeMessage({
              content: 'user not found',
            }),
          );

        const reason = ctx.getOption<string>('motivo', false);

        if (!reason)
          return finishCommand(
            ctx.makeMessage({
              content:
                'Se for banir um usuário, da um motivo bacana pq se n depois fode pra dar desban',
            }),
          );

        await blacklistRepository.banUser(user.id, reason);

        await ctx.makeMessage({ content: 'Usuário banido de usar a Menhera!' });
        return finishCommand();
      }
      case 'remove': {
        await blacklistRepository.unbanUser(user.id);

        await ctx.makeMessage({ content: 'Usuário desbanido' });
        return finishCommand();
      }
      case 'view': {
        if (!user) return finishCommand(ctx.makeMessage({ content: 'User not found' }));

        const usr = await userRepository.getBannedUserInfo(user.id);

        if (!usr) return finishCommand(ctx.makeMessage({ content: 'Nenhum user na DB' }));

        const msg = `== CURRENT BAN INFO ==\n\n• User :: ${user.username} [${
          getDisplayName(user)
        }] - (${user.id})\n• Banned :: ${usr.ban}\n• Reason :: ${usr.banReason}`;

        const button = createButton({
          customId: createCustomId(0, ctx.user.id, ctx.originalInteractionId, user.id),
          label: 'Ver todos Bans',
          style: ButtonStyles.Danger,
          emoji: { id: 759603958418767922n, name: 'atencao' },
        });

        await ctx.makeMessage({
          content: `\`\`\`js\n${msg}\`\`\``,
          components: [createActionRow([button])],
        });
        finishCommand();
      }
    }
  },
});

export default BlacklistCommand;
