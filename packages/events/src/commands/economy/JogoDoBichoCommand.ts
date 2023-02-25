import { ApplicationCommandOptionTypes, ButtonStyles, TextStyles } from 'discordeno/types';

import userRepository from '../../database/repositories/userRepository';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import starsRepository from '../../database/repositories/starsRepository';
import { extractFields } from '../../utils/discord/modalUtils';
import { ModalInteraction, SelectMenuInteraction } from '../../types/interaction';
import {
  BICHO_ANIMALS,
  BICHO_BET_MULTIPLIER,
  getBetType,
  mapResultToAnimal,
} from '../../modules/bicho/finishBets';
import { capitalize, millisToHours, millisToSeconds } from '../../utils/miscUtils';
import {
  canRegisterBet,
  didUserAlreadyBet,
  GAME_DURATION,
  getCurrentGameStatus,
  getLastGameStatus,
  registerUserBet,
} from '../../modules/bicho/bichoManager';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { createCommand } from '../../structures/command/createCommand';
import {
  createActionRow,
  createButton,
  createCustomId,
  createSelectMenu,
  createTextInput,
} from '../../utils/discord/componentUtils';
import { COLORS } from '../../structures/constants';
import bichoRepository from '../../database/repositories/bichoRepository';
import { BichoBetType } from '../../modules/bicho/types';

const tabledAnimals = (() => {
  let text = '';

  for (let i = 0; i < 100; i += 4) {
    const currentAnimal = BICHO_ANIMALS[Math.floor(i / 4)];
    text += `**[${i} - ${i + 3}]**  ${capitalize(currentAnimal)}\n`;
  }

  return text;
})();

const displayBichoTable = async (ctx: ComponentInteractionContext): Promise<void> => {
  const embed = createEmbed({
    title: ctx.locale('commands:bicho.how-to-title'),
    color: COLORS.Purple,
    description: ctx.locale('commands:bicho.how-to-description', {
      duration: millisToHours(GAME_DURATION),
      table: tabledAnimals,
    }),
  });

  ctx.makeMessage({ embeds: [embed], components: [] });
};

const finishUserBet = async (
  ctx: ComponentInteractionContext<SelectMenuInteraction>,
): Promise<void> => {
  const whereToGoAnimals = {
    ONE: 'UNITY',
    SECOND: 'ONE',
    THIRD: 'SECOND',
    CORNER: 'THIRD',
    SEQUENCE: 'UNITY',
  };

  if (!canRegisterBet(ctx.user.id))
    return ctx.makeMessage({ content: ctx.prettyResponse('error', 'commands:bicho.already') });

  await ctx.ack();

  const [selectedBet, bet] = ctx.sentData;

  switch (selectedBet) {
    case 'MODAL': {
      const userInput = extractFields(ctx.interaction as ModalInteraction)[0].value;
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

      const userData = await userRepository.ensureFindUser(ctx.user.id);

      if (Number(bet) > userData.estrelinhas)
        return ctx.makeMessage({
          content: ctx.prettyResponse('error', 'commands:bicho.poor'),
          components: [],
        });

      await starsRepository.removeStars(ctx.user.id, Number(bet));
      registerUserBet(ctx.user.id, Number(bet), `${polishedNumber}`);
      break;
    }
    case 'UNITY': {
      ctx.makeMessage({
        embeds: [],
        components: [],
        content: ctx.prettyResponse('success', 'commands:bicho.success'),
      });

      const userData = await userRepository.ensureFindUser(ctx.user.id);

      if (Number(bet) > userData.estrelinhas)
        return ctx.makeMessage({
          content: ctx.prettyResponse('error', 'commands:bicho.poor'),
          components: [],
        });

      await starsRepository.removeStars(ctx.user.id, Number(bet));

      registerUserBet(ctx.user.id, Number(bet), ctx.interaction.data.values[0]);
      break;
    }
    case 'SEQUENCE':
    case 'SECOND':
    case 'ONE':
    case 'CORNER':
    case 'THIRD': {
      const newSelectMenu = createSelectMenu({
        customId: createCustomId(
          1,
          ctx.user.id,
          ctx.commandId,
          whereToGoAnimals[selectedBet as 'THIRD'],
          bet,
        ),

        placeholder: ctx.locale('commands:bicho.animal', {
          option: '',
        }),
        options: [],
      });

      for (let i = 0; i < 25; i++)
        newSelectMenu.options.push({
          label: `${capitalize(BICHO_ANIMALS[i])}`,
          value: `${ctx.interaction.data.values[0]} | ${BICHO_ANIMALS[i]}`,
        });

      ctx.makeMessage({ components: [createActionRow([newSelectMenu])] });
      break;
    }
  }
};

const executeBetType = async (
  ctx: ComponentInteractionContext<SelectMenuInteraction>,
): Promise<void> => {
  const [bet] = ctx.sentData;

  switch (ctx.interaction.data.values[0]) {
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

      await ctx.respondWithModal({
        title: ctx.locale('commands:bicho.bet-title'),
        customId: createCustomId(1, ctx.user.id, ctx.commandId, 'MODAL', bet),
        components: [createActionRow([betInput])],
      });

      break;
    }
    case 'animal':
    case 'sequence':
    case 'corner': {
      const selectMenu = createSelectMenu({
        customId: createCustomId(
          1,
          ctx.user.id,
          ctx.commandId,
          ctx.interaction.data.values[0] !== 'animal'
            ? ctx.interaction.data.values[0].toUpperCase()
            : 'UNITY',
          bet,
        ),
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

      ctx.makeMessage({ components: [createActionRow([selectMenu])] });
      break;
    }
  }
};

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
  commandRelatedExecutions: [executeBetType, finishUserBet, displayBichoTable],
  execute: async (ctx, finishCommand) => {
    const bet = ctx.getOption<number>('aposta', false);

    if (!bet) {
      const lastRaffle = await getLastGameStatus();
      const currentRaffle = await getCurrentGameStatus();

      const prettyResults = (index: number) =>
        lastRaffle
          ? lastRaffle.results[index].join(', ')
          : ctx.locale('commands:bicho.no-register');

      const getAnimalFromResults = (index: number) =>
        lastRaffle ? capitalize(mapResultToAnimal(lastRaffle.results[index])) : '?';

      const embed = createEmbed({
        color: hexStringToNumber(ctx.authorData.selectedColor),
        title: ctx.locale('commands:bicho.sorted-title'),
        footer: { text: ctx.locale('commands:bicho.footer') },
        description: ctx.locale('commands:bicho.sorted-description', {
          nextDate:
            currentRaffle.dueDate > 0
              ? `<t:${millisToSeconds(currentRaffle.dueDate)}:R>`
              : ctx.locale('commands:bicho.no-register'),
          lastDate: lastRaffle?.dueDate
            ? `<t:${millisToSeconds(lastRaffle.dueDate)}:R>`
            : ctx.locale('commands:bicho.no-register'),
          value: currentRaffle.betsOn ?? ctx.locale('commands:bicho.no-register'),
          users: currentRaffle.usersIn ?? ctx.locale('commands:bicho.no-register'),
          biggestProfit: lastRaffle?.biggestProfit ?? 0,
          first: prettyResults(0),
          firstAnimal: getAnimalFromResults(0),
          second: prettyResults(1),
          secondAnimal: getAnimalFromResults(1),
          third: prettyResults(2),
          thirdAnimal: getAnimalFromResults(2),
          fourth: prettyResults(3),
          fourthAnimal: getAnimalFromResults(3),
          fifth: prettyResults(4),
          fifthAnimal: getAnimalFromResults(4),
        }),
        fields: [],
      });

      const animalNumbersButtons = createButton({
        customId: createCustomId(2, ctx.author.id, ctx.commandId),
        label: ctx.locale('commands:bicho.how-to'),
        style: ButtonStyles.Primary,
      });

      if (await didUserAlreadyBet(ctx.author.id)) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const userBet = (await bichoRepository.getAllUserBets()).find(
          (a) => `${a.id}` === `${ctx.author.id}`,
        )!;

        const betType = getBetType(userBet.option);

        const optionBetToText = (option: string, type: BichoBetType): string => {
          switch (type) {
            case 'unity':
            case 'ten':
            case 'hundred':
            case 'thousand':
              return option;

            case 'animal':
              return capitalize(option);

            case 'sequence':
              return option
                .split(' | ')
                .map((text, i) => `${i + 1}° ${capitalize(text)}`)
                .join('. ');

            case 'corner':
              return option.split(' | ').map(capitalize).join(', ');
          }
        };

        embed.fields?.push({
          name: ctx.locale('commands:bicho.in'),
          value: ctx.locale('commands:bicho.in-description', {
            type: ctx.locale(`commands:bicho.bet-types.${betType}`),
            option: optionBetToText(userBet.option, betType),
            profit: userBet.bet * BICHO_BET_MULTIPLIER[betType],
          }),
        });
      }

      ctx.makeMessage({ embeds: [embed], components: [createActionRow([animalNumbersButtons])] });
      return finishCommand();
    }

    if (bet > ctx.authorData.estrelinhas)
      return finishCommand(
        ctx.makeMessage({ content: ctx.prettyResponse('error', 'commands:bicho.poor') }),
      );

    const currentRaffle = await getCurrentGameStatus();

    if (!currentRaffle || currentRaffle.dueDate <= Date.now())
      return finishCommand(
        ctx.makeMessage({ content: ctx.prettyResponse('error', 'commands:bicho.close') }),
      );

    if (!canRegisterBet(ctx.author.id))
      return finishCommand(
        ctx.makeMessage({ content: ctx.prettyResponse('error', 'commands:bicho.already') }),
      );

    const embed = createEmbed({
      title: ctx.locale('commands:bicho.bet-title'),
      color: hexStringToNumber(ctx.authorData.selectedColor),
      description: ctx.locale('commands:bicho.bet-description', BICHO_BET_MULTIPLIER),
    });

    const firstMenu = createSelectMenu({
      customId: createCustomId(0, ctx.author.id, ctx.commandId, bet),
      options: [
        { label: ctx.locale('commands:bicho.number'), value: 'number' },
        { label: ctx.locale('commands:bicho.one-animal'), value: 'animal' },
        { label: ctx.locale('commands:bicho.sequence'), value: 'sequence' },
        { label: ctx.locale('commands:bicho.corner'), value: 'corner' },
      ],
    });

    ctx.makeMessage({ embeds: [embed], components: [createActionRow([firstMenu])] });
    finishCommand();
  },
});

export default BichoCommand;
