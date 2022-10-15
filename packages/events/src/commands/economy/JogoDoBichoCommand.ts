import {
  ActionRow,
  ApplicationCommandOptionTypes,
  InteractionResponseTypes,
  TextStyles,
} from 'discordeno/types';

import starsRepository from '../../database/repositories/starsRepository';
import { extractFields } from '../../utils/discord/modalUtils';
import InteractionCollector from '../../structures/InteractionCollector';
import {
  ComponentInteraction,
  ModalInteraction,
  SelectMenuInteraction,
} from '../../types/interaction';
import { collectResponseComponentInteraction } from '../../utils/discord/collectorUtils';
import { BICHO_ANIMALS, BICHO_BET_MULTIPLIER } from '../../modules/bicho/finishBets';
import { capitalize, millisToSeconds } from '../../utils/miscUtils';
import {
  canRegisterBet,
  getCurrentGameStatus,
  getLastGameStatus,
  registerUserBet,
} from '../../modules/bicho/bichoManager';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { createCommand } from '../../structures/command/createCommand';
import {
  createActionRow,
  createSelectMenu,
  createTextInput,
  disableComponents,
  resolveCustomId,
} from '../../utils/discord/componentUtils';
import { bot } from '../../index';

const BichoCommand = createCommand({
  path: '',
  name: 'bicho',
  nameLocalizations: { 'en-US': 'animal' },
  description: '「🦌」・Aposte no famoso Jogo do Bicho',
  descriptionLocalizations: { 'en-US': '「🦌」・Bet on the Animal Game' },
  options: [
    {
      name: 'aposta',
      nameLocalizations: { 'en-US': 'bet' },
      description: 'Valor da aposta',
      descriptionLocalizations: { 'en-US': 'Bet amount' },
      type: ApplicationCommandOptionTypes.Integer,
      required: false,
      minValue: 1,
      maxValue: 500000,
    },
  ],
  category: 'economy',
  authorDataFields: ['estrelinhas', 'selectedColor'],
  execute: async (ctx) => {
    const bet = ctx.getOption<number>('aposta', false);

    if (!bet) {
      const lastRaffle = getLastGameStatus();
      const currentRaffle = getCurrentGameStatus();

      const embed = createEmbed({
        color: hexStringToNumber(ctx.authorData.selectedColor),
        title: ctx.locale('commands:bicho.sorted-title'),
        description: ctx.locale('commands:bicho.sorted-description', {
          nextDate: currentRaffle?.dueDate
            ? `<t:${millisToSeconds(currentRaffle.dueDate)}:R>`
            : ctx.locale('commands:bicho.no-register'),
          lastDate: lastRaffle?.dueDate
            ? `<t:${millisToSeconds(lastRaffle.dueDate)}:R>`
            : ctx.locale('commands:bicho.no-register'),
          value:
            currentRaffle?.bets.reduce((p, c) => p + c.bet, 0) ??
            ctx.locale('commands:bicho.no-register'),
          first: lastRaffle
            ? lastRaffle.results[0].join(', ')
            : ctx.locale('commands:bicho.no-register'),
          second: lastRaffle
            ? lastRaffle.results[1].join(', ')
            : ctx.locale('commands:bicho.no-register'),
          third: lastRaffle
            ? lastRaffle.results[2].join(', ')
            : ctx.locale('commands:bicho.no-register'),
          fourth: lastRaffle
            ? lastRaffle.results[3].join(', ')
            : ctx.locale('commands:bicho.no-register'),
          fifth: lastRaffle
            ? lastRaffle.results[4].join(', ')
            : ctx.locale('commands:bicho.no-register'),
          biggestProfit: lastRaffle?.biggestProfit ?? 0,
        }),
        fields: [],
      });

      if (currentRaffle?.bets.some((a) => a.id === ctx.author.id))
        embed.fields?.push({
          name: ctx.locale('commands:bicho.in'),
          value: ctx.locale('commands:bicho.in-description'),
        });

      return ctx.makeMessage({ embeds: [embed] });
    }

    if (bet > ctx.authorData.estrelinhas)
      return ctx.makeMessage({ content: ctx.prettyResponse('error', 'commands:bicho.poor') });

    const currentRaffle = getCurrentGameStatus();

    if (!currentRaffle || currentRaffle.dueDate <= Date.now())
      return ctx.makeMessage({ content: ctx.prettyResponse('error', 'commands:bicho.close') });

    if (!canRegisterBet(ctx.author.id))
      return ctx.makeMessage({ content: ctx.prettyResponse('error', 'commands:bicho.already') });

    const embed = createEmbed({
      title: ctx.locale('commands:bicho.bet-title'),
      color: hexStringToNumber(ctx.authorData.selectedColor),
      description: ctx.locale('commands:bicho.bet-description', BICHO_BET_MULTIPLIER),
    });

    const firstMenu = createSelectMenu({
      customId: `${ctx.interaction.id} | SELECT`,
      options: [
        { label: ctx.locale('commands:bicho.number'), value: 'number' },
        { label: ctx.locale('commands:bicho.one-animal'), value: 'animal' },
        { label: ctx.locale('commands:bicho.sequence'), value: 'sequence' },
        { label: ctx.locale('commands:bicho.corner'), value: 'corner' },
      ],
    });

    ctx.makeMessage({ embeds: [embed], components: [createActionRow([firstMenu])] });

    const selection = await collectResponseComponentInteraction<SelectMenuInteraction>(
      ctx.channelId,
      ctx.author.id,
      `${ctx.interaction.id}`,
      15_000,
      false,
    );

    if (!selection)
      return ctx.makeMessage({
        components: [createActionRow(disableComponents(ctx.locale('common:timesup'), [firstMenu]))],
      });

    const toSendComponents: ActionRow[] = [];

    switch (selection.data.values[0]) {
      case 'number': {
        const betInput = createTextInput({
          customId: 'BET',
          minLength: 1,
          maxLength: 4,
          required: true,
          style: TextStyles.Short,
          label: ctx.locale('commands:bicho.label', {
            min: 0,
            max: 9999,
          }),
        });

        bot.helpers.sendInteractionResponse(selection.id, selection.token, {
          type: InteractionResponseTypes.Modal,
          data: {
            title: ctx.locale('commands:bicho.bet-title'),
            customId: `${ctx.interaction.id} | MODAL`,
            components: [createActionRow([betInput])],
          },
        });

        break;
      }
      case 'animal':
      case 'sequence':
      case 'corner': {
        bot.helpers.sendInteractionResponse(selection.id, selection.token, {
          type: InteractionResponseTypes.DeferredUpdateMessage,
        });

        const selectMenu = createSelectMenu({
          customId: `${ctx.interaction.id} | ${
            selection.data.values[0] !== 'animal' ? selection.data.values[0].toUpperCase() : 'UNITY'
          }`,
          placeholder: ctx.locale('commands:bicho.animal', {
            option: ctx.locale('commands:bicho.first'),
          }),
          options: [],
        });

        for (let i = 0; i < 25; i++)
          selectMenu.options.push({
            label: `${capitalize(BICHO_ANIMALS[i])}`,
            value: `${BICHO_ANIMALS[i]}`,
          });

        toSendComponents.push(createActionRow([selectMenu]));
        break;
      }
    }

    ctx.makeMessage({ components: toSendComponents });

    const filter = (int: ComponentInteraction) =>
      int.user.id === ctx.author.id && int.data.customId.startsWith(`${ctx.interaction.id}`);

    const collector = new InteractionCollector<ComponentInteraction>({
      channelId: ctx.channelId,
      filter,
      idle: selection.data.values[0].length === 1 ? 25_000 : 20_000,
    });

    const whereToGoAnimals = {
      ONE: 'UNITY',
      SECOND: 'ONE',
      THIRD: 'SECOND',
      CORNER: 'THIRD',
      SEQUENCE: 'UNITY',
    };

    collector.on('end', (_, reason) => {
      if (reason === 'idle')
        ctx.makeMessage({
          content: ctx.prettyResponse('error', 'common:timesup'),
          components: [],
          embeds: [],
        });
    });

    collector.on('collect', async (int: SelectMenuInteraction) => {
      await bot.helpers.sendInteractionResponse(int.id, int.token, {
        type: InteractionResponseTypes.DeferredUpdateMessage,
      });

      switch (resolveCustomId(int.data.customId)) {
        case 'MODAL': {
          collector.stop();

          const userInput = extractFields(int as ModalInteraction)[0].value;
          const polishedNumber = parseInt(userInput, 10);

          if (Number.isNaN(polishedNumber))
            return ctx.makeMessage({
              embeds: [],
              components: [],
              content: ctx.prettyResponse('error', 'commands:bicho.invalid-bet'),
            });

          if (polishedNumber < 0 || polishedNumber > 9999)
            return ctx.makeMessage({
              embeds: [],
              components: [],
              content: ctx.prettyResponse('error', 'commands:bicho.invalid-bet'),
            });

          ctx.makeMessage({
            embeds: [],
            components: [],
            content: ctx.prettyResponse('success', 'commands:bicho.success'),
          });

          await starsRepository.removeStars(ctx.author.id, bet);
          registerUserBet(ctx.author.id, bet, `${polishedNumber}`);
          break;
        }
        case 'UNITY': {
          collector.stop();

          ctx.makeMessage({
            embeds: [],
            components: [],
            content: ctx.prettyResponse('success', 'commands:bicho.success'),
          });

          await starsRepository.removeStars(ctx.author.id, bet);

          registerUserBet(ctx.author.id, bet, int.data.values[0]);
          break;
        }
        case 'SEQUENCE':
        case 'SECOND':
        case 'ONE':
        case 'CORNER':
        case 'THIRD': {
          const newSelectMenu = createSelectMenu({
            customId: `${ctx.interaction.id} | ${
              whereToGoAnimals[resolveCustomId(int.data.customId) as 'THIRD']
            }`,
            placeholder: ctx.locale('commands:bicho.animal', {
              option: '',
            }),
            options: [],
          });

          for (let i = 0; i < 25; i++)
            newSelectMenu.options.push({
              label: `${capitalize(BICHO_ANIMALS[i])}`,
              value: `${int.data.values[0]} | ${BICHO_ANIMALS[i]}`,
            });

          ctx.makeMessage({ components: [createActionRow([newSelectMenu])] });
          break;
        }
      }
    });
  },
});

export default BichoCommand;
