/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ApplicationCommandOptionTypes, ButtonComponent, ButtonStyles } from 'discordeno/types';
import { User } from 'discordeno/transformers';
import { createCommand } from '../../structures/command/createCommand.js';
import { getUserDailies } from '../../modules/dailies/getUserDailies.js';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils.js';
import { getDailyById } from '../../modules/dailies/dailies.js';
import {
  createActionRow,
  createButton,
  createCustomId,
} from '../../utils/discord/componentUtils.js';
import { Award, DatabaseDaily } from '../../modules/dailies/types.js';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext.js';
import userRepository from '../../database/repositories/userRepository.js';
import { InteractionContext } from '../../types/menhera.js';
import { Plants } from '../../modules/fazendinha/constants.js';
import { AvailablePlants } from '../../modules/fazendinha/types.js';
import farmerRepository from '../../database/repositories/farmerRepository.js';
import { addPlants } from '../../modules/fazendinha/siloUtils.js';
import { DatabaseUserSchema } from '../../types/database.js';
import { getUniqueDaily } from '../../modules/dailies/calculateUserDailies.js';
import { getMillisecondsToTheEndOfDay, millisToSeconds } from '../../utils/miscUtils.js';
import { getDisplayName } from '../../utils/discord/userUtils.js';

const getDailyStatus = (daily: DatabaseDaily): 'reedem' | 'unfinished' | 'reedemed' =>
  daily.redeemed ? 'reedemed' : daily.has >= daily.need ? 'reedem' : 'unfinished';

const getAwardEmoji = (ctx: InteractionContext, award: Award<string | number>): string => {
  switch (award.type) {
    case 'hunt':
      return ctx.safeEmoji(award.helper as 'demons');
    case 'estrelinhas':
    case 'roll':
      return ctx.safeEmoji(award.type);
    case 'plant':
    case 'seed':
      return Plants[award.helper as AvailablePlants].emoji;
  }
};

const getMissionsEmbed = (
  ctx: InteractionContext,
  user: DatabaseUserSchema,
  userDailies: DatabaseDaily[],
  isChangeEmbed: boolean,
  username: string,
) =>
  createEmbed({
    title: ctx.prettyResponse(
      'calendar',
      isChangeEmbed ? 'commands:daily.change-title' : 'commands:daily.title',
      { username },
    ),
    color: hexStringToNumber(user.selectedColor),
    footer: isChangeEmbed ? { text: ctx.locale('commands:daily.change-footer') } : undefined,
    description: `- ${userDailies
      .map((d) => {
        const daily = getDailyById(d.id);
        return ctx.locale(`commands:daily.descriptions.${daily.type}`, {
          ...d,
          specification: daily.specificationDisplay?.(ctx, d.specification!) ?? d.specification,
          count: d.need,
          emoji: isChangeEmbed
            ? ctx.safeEmoji('swap')
            : d.has < d.need
              ? ctx.safeEmoji('hourglass')
              : d.redeemed
                ? ctx.safeEmoji('success')
                : ctx.safeEmoji('gift'),
        });
      })
      .join('\n- ')}\n\n${ctx.locale('commands:daily.reset', {
      unix: millisToSeconds(Date.now() + getMillisecondsToTheEndOfDay()),
    })}`,
  });

const getMissionButtons = (
  ctx: InteractionContext,
  userDailies: DatabaseDaily[],
  action: 'REEDEM' | 'CHANGE',
) =>
  userDailies.map((daily, index) =>
    createButton({
      label:
        action === 'CHANGE'
          ? ctx.locale('commands:daily.change', { index: index + 1 })
          : ctx.locale(`commands:daily.${getDailyStatus(daily)}`, {
              index: index + 1,
              need: daily.need,
              has: daily.has,
            }),
      style:
        action === 'CHANGE'
          ? ButtonStyles.Danger
          : getDailyStatus(daily) === 'reedem'
            ? ButtonStyles.Success
            : ButtonStyles.Secondary,
      customId: createCustomId(0, ctx.user.id, ctx.originalInteractionId, action, index),
      disabled:
        action !== 'CHANGE'
          ? getDailyStatus(daily) !== 'reedem'
          : getDailyStatus(daily) !== 'unfinished',
    }),
  ) as [ButtonComponent];

const changeDaily = async (
  ctx: ComponentInteractionContext,
  userDailies: DatabaseDaily[],
  dailyIndex: number,
): Promise<void> => {
  const userDaily = getUniqueDaily(userDailies);
  userDailies[dailyIndex] = { ...userDaily, changed: true };

  await userRepository.updateUser(ctx.user.id, { dailies: userDailies });

  const daily = getDailyById(userDaily.id);

  const newDailyDescription = ctx.locale(`commands:daily.descriptions.${daily.type}`, {
    ...userDaily,
    specification:
      daily.specificationDisplay?.(ctx, userDaily.specification!) ?? userDaily.specification,
    count: userDaily.need,
    emoji: ctx.safeEmoji('swap'),
  });

  ctx.makeMessage({
    content: ctx.prettyResponse('success', 'commands:daily.success-changed', {
      newDaily: newDailyDescription,
      index: dailyIndex + 1,
    }),
    components: [],
    embeds: [],
  });
};

const handleButtonInteractions = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [action, dailyIndex, itemIndex] = ctx.sentData;

  const user = await userRepository.ensureFindUser(ctx.user.id);
  const userDailies = await getUserDailies(user);

  const cannotChange = userDailies.some((d) => d.changed);

  if (action === 'DISPLAY_CHANGE') {
    if (cannotChange)
      return ctx.makeMessage({
        components: [],
        embeds: [],
        content: ctx.prettyResponse('error', 'commands:daily.already-changed'),
      });

    const embed = getMissionsEmbed(ctx, user, userDailies, true, ctx.user.username);
    const buttons = getMissionButtons(ctx, userDailies, 'CHANGE');

    return ctx.makeMessage({ components: [createActionRow(buttons)], embeds: [embed] });
  }

  if (action === 'CHANGE') {
    if (cannotChange)
      return ctx.makeMessage({
        components: [],
        embeds: [],
        content: ctx.prettyResponse('error', 'commands:daily.already-changed'),
      });

    return changeDaily(ctx, userDailies, Number(dailyIndex));
  }

  const missionToReedem = userDailies[Number(dailyIndex)];

  if (missionToReedem.need > missionToReedem.has)
    return ctx.makeMessage({
      components: [],
      embeds: [],
      content: ctx.prettyResponse('error', 'commands:daily.cannot-reedem'),
    });

  if (missionToReedem.redeemed)
    return ctx.makeMessage({
      components: [],
      embeds: [],
      content: ctx.prettyResponse('error', 'commands:daily.already-reedemed'),
    });

  if (action === 'SELECT_ITEM') {
    const selectedAward = missionToReedem.awards[Number(itemIndex)];

    let updateObject: unknown = {};
    let updateFunction: Function = userRepository.updateUserWithSpecialData;

    switch (selectedAward.type) {
      case 'estrelinhas': {
        updateFunction = userRepository.updateUserWithSpecialData;
        updateObject = { $inc: { estrelinhas: selectedAward.value } };
        break;
      }
      case 'roll': {
        updateFunction = userRepository.updateUserWithSpecialData;
        updateObject = { $inc: { rolls: selectedAward.value } };
        break;
      }
      case 'hunt': {
        updateFunction = userRepository.updateUserWithSpecialData;
        updateObject = { $inc: { [selectedAward.helper as 'demons']: selectedAward.value } };
        break;
      }
      case 'seed': {
        const farmer = await farmerRepository.getFarmer(ctx.user.id);
        updateFunction = farmerRepository.updateSeeds;
        updateObject = addPlants(farmer.seeds, [
          { plant: selectedAward.helper as AvailablePlants, amount: selectedAward.value },
        ]);
        break;
      }
      case 'plant': {
        const farmer = await farmerRepository.getFarmer(ctx.user.id);
        updateFunction = farmerRepository.updateSilo;
        updateObject = addPlants(farmer.silo, [
          { plant: selectedAward.helper as AvailablePlants, weight: selectedAward.value },
        ]);
        break;
      }
      default:
        throw new Error(
          `The selected award of type ${selectedAward.type} was not implemented to be given`,
        );
    }

    missionToReedem.redeemed = true;
    await updateFunction(ctx.user.id, updateObject);
    await userRepository.updateUser(ctx.user.id, { dailies: user.dailies });

    return ctx.makeMessage({
      embeds: [],
      components: [],
      content: ctx.prettyResponse('success', 'commands:daily.reedemed-success', {
        emoji: getAwardEmoji(ctx, selectedAward),
        value: selectedAward.value,
      }),
    });
  }

  if (action === 'REEDEM') {
    const buttons: ButtonComponent[] = [];
    const embed = createEmbed({
      fields: [],
      title: ctx.locale('commands:daily.reedem-title'),
      color: hexStringToNumber(user.selectedColor),
    });

    missionToReedem.awards.forEach((award, index) => {
      embed.fields?.push({
        name: ctx.locale(`commands:daily.reedem-options.${award.type}`, { index: index + 1 }),
        value: `${award.value}x ${getAwardEmoji(ctx, award)}`,
        inline: true,
      });
      buttons.push(
        createButton({
          label: ctx.locale(`commands:daily.reedem-options.${award.type}`, { index: index + 1 }),
          style: ButtonStyles.Primary,
          customId: createCustomId(
            0,
            ctx.user.id,
            ctx.originalInteractionId,
            'SELECT_ITEM',
            dailyIndex,
            index,
          ),
        }),
      );
    });

    ctx.makeMessage({
      embeds: [embed],
      components: [createActionRow(buttons as [ButtonComponent])],
    });
  }
};

const DailyCommand = createCommand({
  path: '',
  name: 'daily',
  description: '「📅」・Veja e resgate suas missões diárias',
  descriptionLocalizations: { 'en-US': '「📅」・See and reedem your daily missions' },
  category: 'info',
  authorDataFields: ['dailies', 'dailyDayId', 'selectedColor', 'estrelinhas'],
  options: [
    {
      name: 'user',
      type: ApplicationCommandOptionTypes.User,
      description: 'Usuário para ver suas dailies',
      descriptionLocalizations: { 'en-US': 'User to check the dailies' },
      required: false,
    },
  ],
  commandRelatedExecutions: [handleButtonInteractions],
  execute: async (ctx, finishCommand) => {
    finishCommand();
    const userToCheck = ctx.getOption<User>('user', 'users', false) ?? ctx.author;

    const userData =
      userToCheck.id === ctx.user.id
        ? ctx.authorData
        : await userRepository.ensureFindUser(userToCheck.id);

    const userDailies = await getUserDailies(userData);

    const embed = getMissionsEmbed(ctx, userData, userDailies, false, getDisplayName(userToCheck));

    const buttons = getMissionButtons(ctx, userDailies, 'REEDEM');

    const cannotChangeDaily = userDailies.some((d) => d.changed);

    buttons.push(
      createButton({
        label: ctx.locale('commands:daily.change-daily'),
        style: ButtonStyles.Secondary,
        customId: createCustomId(0, ctx.user.id, ctx.originalInteractionId, 'DISPLAY_CHANGE'),
        disabled: cannotChangeDaily,
      }),
    );

    ctx.makeMessage({
      embeds: [embed],
      components: userToCheck.id === ctx.user.id ? [createActionRow(buttons)] : [],
    });
  },
});

export default DailyCommand;
