import {
  ActionRow,
  ApplicationCommandOptionTypes,
  ButtonStyles,
  InteractionResponseTypes,
} from 'discordeno/types';

import { getProfitTaxes, getTaxedProfit } from '../../modules/roulette/getTaxedProfit';
import starsRepository from '../../database/repositories/starsRepository';
import { postRoulleteGame } from '../../utils/apiRequests/statistics';
import { bot } from '../../index';
import cacheRepository from '../../database/repositories/cacheRepository';
import InteractionCollector from '../../structures/InteractionCollector';
import { ComponentInteraction, SelectMenuInteraction } from '../../types/interaction';
import { collectResponseComponentInteraction } from '../../utils/discord/collectorUtils';
import {
  createActionRow,
  createButton,
  createSelectMenu,
  generateCustomId,
  resolveCustomId,
  resolveSeparatedStrings,
} from '../../utils/discord/componentUtils';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { randomFromArray } from '../../utils/miscUtils';
import {
  HOURLY_ROULETTE_HIGH_VALUE_BET_LIMIT,
  ROULETTE_NUMBERS,
  WIN_MULTIPLIERS,
} from '../../modules/roulette/constants';

import { createCommand } from '../../structures/command/createCommand';

const WalletCommand = createCommand({
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
      minValue: 1,
      maxValue: 15_000,
    },
  ],
  category: 'economy',
  authorDataFields: ['estrelinhas', 'selectedColor'],
  execute: async (ctx) => {
    const bet = ctx.getOption<number>('aposta', false, true);

    if (ctx.authorData.estrelinhas < bet)
      return ctx.makeMessage({ content: ctx.prettyResponse('error', 'commands:roleta.poor') });

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
      customId: `${ctx.interaction.id} | STRAIGHT`,
      style: ButtonStyles.Primary,
      label: ctx.locale('commands:roleta.straight-up-title'),
    });

    const splitButton = createButton({
      customId: `${ctx.interaction.id} | SPLIT`,
      style: ButtonStyles.Primary,
      label: ctx.locale('commands:roleta.split-title'),
    });

    const dozensButton = createButton({
      customId: `${ctx.interaction.id} | DOZENS`,
      style: ButtonStyles.Primary,
      label: ctx.locale('commands:roleta.dozens-title'),
    });

    const colorButton = createButton({
      customId: `${ctx.interaction.id} | COLOR`,
      style: ButtonStyles.Primary,
      label: ctx.locale('commands:roleta.color-title'),
    });

    const oddevenButton = createButton({
      customId: `${ctx.interaction.id} | ODDEVEN`,
      style: ButtonStyles.Primary,
      label: ctx.locale('commands:roleta.oddeven-title'),
    });

    const lowhighButton = createButton({
      customId: `${ctx.interaction.id} | LOWHIGH`,
      style: ButtonStyles.Primary,
      label: ctx.locale('commands:roleta.lowhigh-title'),
    });

    const highValuesUsages = await cacheRepository.getRouletteUsages(ctx.author.id);

    if (highValuesUsages >= HOURLY_ROULETTE_HIGH_VALUE_BET_LIMIT && bet >= 10_000) {
      straightButton.disabled = true;
      straightButton.style = ButtonStyles.Secondary;

      splitButton.style = ButtonStyles.Secondary;
      splitButton.disabled = true;
    }

    ctx.makeMessage({
      embeds: [embed],
      components: [
        createActionRow([straightButton, splitButton, dozensButton]),
        createActionRow([colorButton, oddevenButton, lowhighButton]),
      ],
    });

    const selectedButton = await collectResponseComponentInteraction<ComponentInteraction>(
      ctx.channelId,
      ctx.author.id,
      `${ctx.interaction.id}`,
      14_000,
    );

    if (!selectedButton) {
      embed.footer = { text: ctx.locale('common:timesup') };
      return ctx.makeMessage({ components: [], embeds: [embed] });
    }

    const operation = resolveCustomId(selectedButton.data.customId);
    const toSendComponents: ActionRow[] = [];

    switch (operation) {
      case 'STRAIGHT':
      case 'SPLIT': {
        const firstCustomId = generateCustomId(
          operation === 'STRAIGHT' ? 'BET 1' : 'FIRST',
          ctx.interaction.id,
        );

        const secondCustomId = generateCustomId(
          operation === 'STRAIGHT' ? 'BET 2' : 'SECOND',
          ctx.interaction.id,
        );

        const placeholder = ctx.locale(
          `commands:roleta.${operation === 'STRAIGHT' ? 'make-bet' : 'main-number'}`,
        );

        const firstSelectMenu = createSelectMenu({
          customId: generateCustomId(firstCustomId, ctx.interaction.id),
          placeholder,
          options: [],
        });

        const secondSelectMenu = createSelectMenu({
          customId: generateCustomId(secondCustomId, ctx.interaction.id),
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
          customId: generateCustomId('BET', ctx.interaction.id),
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
          customId: generateCustomId('BET', ctx.interaction.id),
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

    const filter = (int: ComponentInteraction) =>
      int.user.id === ctx.author.id && int.data.customId.startsWith(`${ctx.interaction.id}`);

    const collector = new InteractionCollector({
      channelId: ctx.channelId,
      filter,
      idle: 14_000,
    });

    const randomValue = randomFromArray(ROULETTE_NUMBERS);

    const finishMatch = (profit: number, selection: string, didWin: boolean) => {
      collector.stop();

      const isHighValueBet = (operation === 'STRAIGHT' || operation === 'SPLIT') && bet >= 10_000;
      if (isHighValueBet) cacheRepository.incrementRouletteHourlyUsage(ctx.author.id);

      const profitAfterTaxes = getTaxedProfit(profit);

      const winOrLose = didWin ? 'win' : 'lose';

      const finishEmbed = createEmbed({
        color: hexStringToNumber(ctx.authorData.selectedColor),
        title: ctx.locale(`commands:roleta.${winOrLose}-title`),
        description: ctx.locale(`commands:roleta.${winOrLose}`, {
          bet,
          profit: profitAfterTaxes,
          taxes: getProfitTaxes(profit),
          number: randomValue,
          operation,
          selection:
            operation === 'STRAIGHT' || operation === 'SPLIT'
              ? selection
              : ctx.locale(`commands:roleta.${selection as 'first'}`),
        }),
      });

      if (didWin) starsRepository.addStars(ctx.author.id, profitAfterTaxes);
      else starsRepository.removeStars(ctx.author.id, bet);

      postRoulleteGame(
        `${ctx.author.id}`,
        bet,
        operation,
        didWin ? profitAfterTaxes : profit,
        didWin,
        selection,
      );

      ctx.makeMessage({ embeds: [finishEmbed], components: [] });
    };

    collector.on('collect', (int: SelectMenuInteraction) => {
      bot.helpers.sendInteractionResponse(int.id, int.token, {
        type: InteractionResponseTypes.DeferredUpdateMessage,
      });

      const resolvedId = resolveCustomId(int.data.customId);

      if (operation === 'SPLIT' && resolvedId !== 'BET') {
        const numberSelected = Number(int.data.values[0]);

        const menu = createSelectMenu({
          customId: generateCustomId('BET', ctx.interaction.id),
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
            int.data.values[0],
            Number(int.data.values[0]) === randomValue.value,
          );

        case 'SPLIT':
          return finishMatch(
            bet * WIN_MULTIPLIERS.SPLIT,
            int.data.values[0],
            resolveSeparatedStrings(int.data.values[0]).includes(`${randomValue.value}`),
          );

        case 'DOZENS':
          return finishMatch(
            bet * WIN_MULTIPLIERS.DOZENS,
            int.data.values[0],
            int.data.values[0] === randomValue.dozen,
          );

        case 'ODDEVEN':
          return finishMatch(
            bet * WIN_MULTIPLIERS.ODDEVEN,
            int.data.values[0],
            int.data.values[0] === randomValue.parity,
          );

        case 'COLOR':
          return finishMatch(
            bet * WIN_MULTIPLIERS.COLOR,
            int.data.values[0],
            int.data.values[0] === randomValue.color,
          );

        case 'LOWHIGH':
          return finishMatch(
            bet * WIN_MULTIPLIERS.LOWHIGH,
            int.data.values[0],
            int.data.values[0] === randomValue.size,
          );
      }
    });
  },
});

export default WalletCommand;
