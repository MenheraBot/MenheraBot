import { ActionRow, ApplicationCommandOptionTypes, ButtonStyles } from 'discordeno/types';

import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import userRepository from '../../database/repositories/userRepository';
import {
  getRouletteProfitTaxes,
  getRouletteTaxedProfit,
} from '../../modules/roulette/getRouletteTaxes';
import starsRepository from '../../database/repositories/starsRepository';
import { postRoulleteGame, postTransaction } from '../../utils/apiRequests/statistics';
import { SelectMenuInteraction } from '../../types/interaction';
import {
  createActionRow,
  createButton,
  createCustomId,
  createSelectMenu,
  resolveSeparatedStrings,
} from '../../utils/discord/componentUtils';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { randomFromArray } from '../../utils/miscUtils';
import { ROULETTE_NUMBERS, WIN_MULTIPLIERS } from '../../modules/roulette/constants';

import { createCommand } from '../../structures/command/createCommand';
import { bot } from '../..';
import { ApiTransactionReason } from '../../types/api';

const finishRouletteBet = async (
  ctx: ComponentInteractionContext<SelectMenuInteraction>,
): Promise<void> => {
  const [resolvedId, stringBet, operation] = ctx.sentData;

  const bet = Number(stringBet);

  const randomValue = randomFromArray(ROULETTE_NUMBERS);

  const finishMatch = async (profit: number, selection: string, didWin: boolean) => {
    const authorData = await userRepository.ensureFindUser(ctx.user.id);

    if (bet > authorData.estrelinhas)
      return ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:roleta.poor'),
        components: [],
        embeds: [],
      });

    const profitAfterTaxes = getRouletteTaxedProfit(profit);

    const winOrLose = didWin ? 'win' : 'lose';

    const finishEmbed = createEmbed({
      color: hexStringToNumber(authorData.selectedColor),
      title: ctx.locale(`commands:roleta.${winOrLose}-title`),
      description: ctx.locale(`commands:roleta.${winOrLose}`, {
        bet,
        profit: profitAfterTaxes + bet,
        taxes: (getRouletteProfitTaxes(profit) * 100).toFixed(2),
        number: randomValue,
        operation,
        selection:
          operation === 'STRAIGHT' || operation === 'SPLIT'
            ? selection
            : ctx.locale(`commands:roleta.${selection as 'first'}`),
      }),
    });

    if (didWin) {
      starsRepository.addStars(ctx.user.id, profitAfterTaxes);
      postTransaction(
        `${bot.id}`,
        `${ctx.user.id}`,
        profitAfterTaxes,
        'estrelinhas',
        ApiTransactionReason.ROULETTE_COMMAND,
      );
    } else {
      starsRepository.removeStars(ctx.user.id, bet);
      postTransaction(
        `${ctx.user.id}`,
        `${bot.id}`,
        bet,
        'estrelinhas',
        ApiTransactionReason.ROULETTE_COMMAND,
      );
    }

    postRoulleteGame(
      `${ctx.user.id}`,
      bet,
      operation,
      didWin ? profitAfterTaxes + bet : profit,
      didWin,
      selection,
    );

    ctx.makeMessage({ embeds: [finishEmbed], components: [] });
  };

  if (operation === 'SPLIT' && resolvedId !== 'BET') {
    const numberSelected = Number(ctx.interaction.data.values[0]);

    const menu = createSelectMenu({
      customId: createCustomId(1, ctx.user.id, ctx.commandId, 'BET', bet, operation),
      placeholder: ctx.locale('commands:roleta.select-bord'),
      options: [],
    });

    if (numberSelected < 36 && numberSelected !== 0)
      menu.options.push({
        label: `${ctx.locale('commands:roleta.number')} ${numberSelected + 1}`,
        value: `${numberSelected} | ${numberSelected + 1}`,
      });

    if (numberSelected < 34 && numberSelected !== 0)
      menu.options.push({
        label: `${ctx.locale('commands:roleta.number')} ${numberSelected + 3}`,
        value: `${numberSelected} | ${numberSelected + 3}`,
      });

    if (numberSelected > 2)
      menu.options.push({
        label: `${ctx.locale('commands:roleta.number')} ${numberSelected - 3}`,
        value: `${numberSelected} | ${numberSelected - 3}`,
      });

    if (numberSelected > 0)
      menu.options.push({
        label: `${ctx.locale('commands:roleta.number')} ${numberSelected - 1}`,
        value: `${numberSelected} | ${numberSelected - 1}`,
      });

    if (numberSelected === 0)
      menu.options.push(
        {
          label: `${ctx.locale('commands:roleta.number')} ${numberSelected + 1}`,
          value: `${numberSelected} | ${numberSelected + 1}`,
        },
        {
          label: `${ctx.locale('commands:roleta.number')} ${numberSelected + 2}`,
          value: `${numberSelected} | ${numberSelected + 2}`,
        },
        {
          label: `${ctx.locale('commands:roleta.number')} ${numberSelected + 3}`,
          value: `${numberSelected} | ${numberSelected + 3}`,
        },
      );

    ctx.makeMessage({ components: [createActionRow([menu])] });
    return;
  }

  switch (operation) {
    case 'STRAIGHT':
      return finishMatch(
        bet * WIN_MULTIPLIERS.STRAIGHT,
        ctx.interaction.data.values[0],
        Number(ctx.interaction.data.values[0]) === randomValue.value,
      );

    case 'SPLIT':
      return finishMatch(
        bet * WIN_MULTIPLIERS.SPLIT,
        ctx.interaction.data.values[0],
        resolveSeparatedStrings(ctx.interaction.data.values[0]).includes(`${randomValue.value}`),
      );

    case 'DOZENS':
      return finishMatch(
        bet * WIN_MULTIPLIERS.DOZENS,
        ctx.interaction.data.values[0],
        ctx.interaction.data.values[0] === randomValue.dozen,
      );

    case 'ODDEVEN':
      return finishMatch(
        bet * WIN_MULTIPLIERS.ODDEVEN,
        ctx.interaction.data.values[0],
        ctx.interaction.data.values[0] === randomValue.parity,
      );

    case 'COLOR':
      return finishMatch(
        bet * WIN_MULTIPLIERS.COLOR,
        ctx.interaction.data.values[0],
        ctx.interaction.data.values[0] === randomValue.color,
      );

    case 'LOWHIGH':
      return finishMatch(
        bet * WIN_MULTIPLIERS.LOWHIGH,
        ctx.interaction.data.values[0],
        ctx.interaction.data.values[0] === randomValue.size,
      );
  }
};

const executeAskForBetsButton = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [operation, bet] = ctx.sentData;

  const toSendComponents: ActionRow[] = [];

  switch (operation) {
    case 'STRAIGHT':
    case 'SPLIT': {
      const firstCustomId = createCustomId(
        1,
        ctx.user.id,
        ctx.commandId,
        operation === 'STRAIGHT' ? 'BET 1' : 'FIRST',
        bet,
        operation,
      );

      const secondCustomId = createCustomId(
        1,
        ctx.user.id,
        ctx.commandId,
        operation === 'STRAIGHT' ? 'BET 2' : 'SECOND',
        bet,
        operation,
      );

      const placeholder = ctx.locale(
        `commands:roleta.${operation === 'STRAIGHT' ? 'make-bet' : 'main-number'}`,
      );

      const firstSelectMenu = createSelectMenu({
        customId: firstCustomId,
        placeholder,
        options: [],
      });

      const secondSelectMenu = createSelectMenu({
        customId: secondCustomId,
        placeholder,
        options: [],
      });

      for (let i = 0; i <= 36; i++)
        (i <= 18 ? firstSelectMenu : secondSelectMenu).options.push({
          label: `${ctx.locale('commands:roleta.number')} ${i}`,
          value: `${i}`,
        });

      toSendComponents.push(
        createActionRow([firstSelectMenu]),
        createActionRow([secondSelectMenu]),
      );
      break;
    }
    case 'LOWHIGH':
    case 'COLOR':
    case 'ODDEVEN': {
      const firstLabel =
        // eslint-disable-next-line no-nested-ternary
        operation === 'COLOR' ? 'red' : operation === 'ODDEVEN' ? 'odd' : 'low';

      const secondLabel =
        // eslint-disable-next-line no-nested-ternary
        operation === 'COLOR' ? 'black' : operation === 'ODDEVEN' ? 'even' : 'high';

      const selectMenu = createSelectMenu({
        customId: createCustomId(1, ctx.user.id, ctx.commandId, 'BET', bet, operation),
        placeholder: ctx.locale('commands:roleta.make-bet'),
        options: [
          { label: ctx.locale(`commands:roleta.${firstLabel}`), value: firstLabel },
          { label: ctx.locale(`commands:roleta.${secondLabel}`), value: secondLabel },
        ],
      });

      toSendComponents.push(createActionRow([selectMenu]));
      break;
    }
    case 'DOZENS': {
      const selectMenu = createSelectMenu({
        customId: createCustomId(1, ctx.user.id, ctx.commandId, 'BET', bet, operation),
        placeholder: ctx.locale('commands:roleta.make-bet'),
        options: [
          { label: ctx.locale('commands:roleta.first'), value: 'first' },
          { label: ctx.locale('commands:roleta.second'), value: 'second' },
          { label: ctx.locale('commands:roleta.third'), value: 'third' },
        ],
      });

      toSendComponents.push(createActionRow([selectMenu]));
      break;
    }
  }

  ctx.makeMessage({ components: toSendComponents });
};

const RouletteCommand = createCommand({
  path: '',
  name: 'roleta',
  nameLocalizations: { 'en-US': 'roulette' },
  description: '「🎡」・O famoso jogo da roleta, aposte em algo e ganhe milhões de estrelinhas',
  descriptionLocalizations: {
    'en-US': '「🎡」・The famous Roulette Game, bet on something and win millions of stars',
  },
  options: [
    {
      name: 'aposta',
      nameLocalizations: { 'en-US': 'bet' },
      description: 'Valor da aposta',
      descriptionLocalizations: { 'en-US': 'Bet amount' },
      type: ApplicationCommandOptionTypes.Integer,
      required: true,
      minValue: 10,
      maxValue: 50000,
    },
  ],
  category: 'economy',
  authorDataFields: ['estrelinhas', 'selectedColor'],
  commandRelatedExecutions: [executeAskForBetsButton, finishRouletteBet],
  execute: async (ctx, finishCommand) => {
    const bet = ctx.getOption<number>('aposta', false, true);

    if (ctx.authorData.estrelinhas < bet)
      return finishCommand(
        ctx.makeMessage({ content: ctx.prettyResponse('error', 'commands:roleta.poor') }),
      );

    const embed = createEmbed({
      color: hexStringToNumber(ctx.authorData.selectedColor),
      title: ctx.prettyResponse('estrelinhas', 'commands:roleta.title'),
      description: ctx.locale('commands:roleta.description'),
      fields: [
        {
          name: ctx.locale('commands:roleta.straight-up-title'),
          value: ctx.locale('commands:roleta.straight-up-value', {
            profit: bet * WIN_MULTIPLIERS.STRAIGHT,
            multiplier: WIN_MULTIPLIERS.STRAIGHT,
          }),
          inline: true,
        },
        {
          name: ctx.locale('commands:roleta.split-title'),
          value: ctx.locale('commands:roleta.split-value', {
            profit: bet * WIN_MULTIPLIERS.SPLIT,
            multiplier: WIN_MULTIPLIERS.SPLIT,
          }),
          inline: true,
        },
        {
          name: ctx.locale('commands:roleta.dozens-title'),
          value: ctx.locale('commands:roleta.dozens-value', {
            profit: bet * WIN_MULTIPLIERS.DOZENS,
            multiplier: WIN_MULTIPLIERS.DOZENS,
          }),
          inline: true,
        },
        {
          name: ctx.locale('commands:roleta.color-title'),
          value: ctx.locale('commands:roleta.color-value', {
            profit: bet * WIN_MULTIPLIERS.COLOR,
            multiplier: WIN_MULTIPLIERS.COLOR,
          }),
          inline: true,
        },
        {
          name: ctx.locale('commands:roleta.oddeven-title'),
          value: ctx.locale('commands:roleta.oddeven-value', {
            profit: bet * WIN_MULTIPLIERS.ODDEVEN,
            multiplier: WIN_MULTIPLIERS.ODDEVEN,
          }),
          inline: true,
        },
        {
          name: ctx.locale('commands:roleta.lowhigh-title'),
          value: ctx.locale('commands:roleta.lowhigh-value', {
            profit: bet * WIN_MULTIPLIERS.LOWHIGH,
            multiplier: WIN_MULTIPLIERS.LOWHIGH,
          }),
          inline: true,
        },
      ],
    });

    const straightButton = createButton({
      customId: createCustomId(0, ctx.author.id, ctx.commandId, 'STRAIGHT', bet),
      style: ButtonStyles.Primary,
      label: ctx.locale('commands:roleta.straight-up-title'),
    });

    const splitButton = createButton({
      customId: createCustomId(0, ctx.author.id, ctx.commandId, 'SPLIT', bet),
      style: ButtonStyles.Primary,
      label: ctx.locale('commands:roleta.split-title'),
    });

    const dozensButton = createButton({
      customId: createCustomId(0, ctx.author.id, ctx.commandId, 'DOZENS', bet),
      style: ButtonStyles.Primary,
      label: ctx.locale('commands:roleta.dozens-title'),
    });

    const colorButton = createButton({
      customId: createCustomId(0, ctx.author.id, ctx.commandId, 'COLOR', bet),
      style: ButtonStyles.Primary,
      label: ctx.locale('commands:roleta.color-title'),
    });

    const oddevenButton = createButton({
      customId: createCustomId(0, ctx.author.id, ctx.commandId, 'ODDEVEN', bet),
      style: ButtonStyles.Primary,
      label: ctx.locale('commands:roleta.oddeven-title'),
    });

    const lowhighButton = createButton({
      customId: createCustomId(0, ctx.author.id, ctx.commandId, 'LOWHIGH', bet),
      style: ButtonStyles.Primary,
      label: ctx.locale('commands:roleta.lowhigh-title'),
    });

    ctx.makeMessage({
      embeds: [embed],
      components: [
        createActionRow([straightButton, splitButton, dozensButton]),
        createActionRow([colorButton, oddevenButton, lowhighButton]),
      ],
    });

    finishCommand();
  },
});

export default RouletteCommand;
