import { User } from 'discordeno/transformers';
import { ApplicationCommandOptionTypes, ButtonStyles } from 'discordeno/types';

import starsRepository from '../../database/repositories/starsRepository';
import { postCoinflipMatch } from '../../utils/apiRequests/statistics';
import { randomFromArray } from '../../utils/miscUtils';
import { collectResponseComponentInteraction } from '../../utils/discord/collectorUtils';
import userRepository from '../../database/repositories/userRepository';
import {
  createActionRow,
  createButton,
  disableComponents,
  generateCustomId,
} from '../../utils/discord/componentUtils';
import { mentionUser } from '../../utils/discord/userUtils';
import { MessageFlags } from '../../utils/discord/messageUtils';
import { createCommand } from '../../structures/command/createCommand';

const CoinflipCommand = createCommand({
  path: '',
  name: 'coinflip',
  description: '「📀」・Disputa num jogo de Cara e Coroa com um amigo',
  descriptionLocalizations: { 'en-US': '「📀」・Dispute in a coin toss game with a friend' },
  options: [
    {
      name: 'user',
      description: 'Usuário para disputar',
      descriptionLocalizations: { 'en-US': 'User to dispute' },
      type: ApplicationCommandOptionTypes.User,
      required: true,
    },
    {
      name: 'aposta',
      nameLocalizations: { 'en-US': 'bet' },
      description: 'Valor da aposta',
      descriptionLocalizations: { 'en-US': 'Bet ammount' },
      type: ApplicationCommandOptionTypes.Integer,
      required: true,
      minValue: 1,
    },
  ],
  category: 'economy',
  authorDataFields: ['estrelinhas'],
  execute: async (ctx, finishCommand) => {
    const user = ctx.getOption<User>('user', 'users', true);
    const input = ctx.getOption<number>('aposta', false, true);

    if (user.toggles.bot)
      return finishCommand(
        ctx.makeMessage({
          content: ctx.prettyResponse('error', 'commands:coinflip.bot'),
          flags: MessageFlags.EPHEMERAL,
        }),
      );

    if (user.id === ctx.author.id)
      return finishCommand(
        ctx.makeMessage({
          content: ctx.prettyResponse('error', 'commands:coinflip.self-mention'),
          flags: MessageFlags.EPHEMERAL,
        }),
      );

    if (input > ctx.authorData.estrelinhas)
      return finishCommand(
        ctx.makeMessage({
          content: ctx.prettyResponse('error', 'commands:coinflip.poor', {
            user: mentionUser(ctx.author.id),
          }),
          flags: MessageFlags.EPHEMERAL,
        }),
      );

    const targetData = await userRepository.ensureFindUser(user.id);

    if (targetData.ban)
      return finishCommand(
        ctx.makeMessage({
          content: ctx.prettyResponse('error', 'commands:coinflip.banned-user'),
          flags: MessageFlags.EPHEMERAL,
        }),
      );

    if (input > targetData.estrelinhas)
      return finishCommand(
        ctx.makeMessage({
          content: ctx.prettyResponse('error', 'commands:coinflip.poor', {
            user: mentionUser(user.id),
          }),
          flags: MessageFlags.EPHEMERAL,
        }),
      );

    const confirmButton = createButton({
      customId: generateCustomId('CONFIRM', ctx.interaction.id),
      label: ctx.locale('commands:coinflip.bet'),
      style: ButtonStyles.Success,
    });

    ctx.makeMessage({
      content: ctx.locale('commands:coinflip.confirm', {
        value: input,
        author: mentionUser(ctx.author.id),
        mention: mentionUser(user.id),
      }),
      components: [createActionRow([confirmButton])],
    });

    const collected = await collectResponseComponentInteraction(
      ctx.channelId,
      user.id,
      `${ctx.interaction.id}`,
      10_000,
    );

    if (!collected)
      return finishCommand(
        ctx.makeMessage({
          components: [
            createActionRow(disableComponents(ctx.locale('common:timesup'), [confirmButton])),
          ],
        }),
      );

    const availableOptions = ['cara', 'coroa'];
    const choice = randomFromArray(availableOptions);

    const winner = choice === 'cara' ? ctx.author : user;
    const loser = choice === 'coroa' ? ctx.author : user;

    await ctx.makeMessage({
      content: ctx.locale('commands:coinflip.text', {
        choice: ctx.locale(`commands:coinflip.${choice as 'cara'}`),
        value: input,
        winner: mentionUser(winner.id),
        loser: mentionUser(loser.id),
      }),
      components: [],
    });

    starsRepository.addStars(winner.id, input);
    starsRepository.removeStars(loser.id, input);
    postCoinflipMatch(`${winner.id}`, `${loser.id}`, input);
    finishCommand();
  },
});

export default CoinflipCommand;
