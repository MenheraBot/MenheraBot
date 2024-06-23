/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ButtonComponent, ButtonStyles } from 'discordeno/types';
import { createCommand } from '../../structures/command/createCommand';
import { getUserDailies } from '../../modules/dailies/getUserDailies';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { getDailyById } from '../../modules/dailies/dailies';
import { createActionRow, createButton, createCustomId } from '../../utils/discord/componentUtils';
import { Award, DatabaseDaily } from '../../modules/dailies/types';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import userRepository from '../../database/repositories/userRepository';
import { InteractionContext } from '../../types/menhera';
import { Plants } from '../../modules/fazendinha/constants';
import { AvailablePlants } from '../../modules/fazendinha/types';
import farmerRepository from '../../database/repositories/farmerRepository';
import { addItems } from '../../modules/fazendinha/siloUtils';
import { DatabaseUserSchema } from '../../types/database';
import { getUniqueDaily } from '../../modules/dailies/calculateUserDailies';

const getDailyStatus = (daily: DatabaseDaily): 'reedem' | 'unfinished' | 'reedemed' =>
  // eslint-disable-next-line no-nested-ternary
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
) =>
  createEmbed({
    title: ctx.prettyResponse(
      'calendar',
      isChangeEmbed ? 'commands:daily.change-title' : 'commands:daily.title',
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
      .join('\n- ')}`,
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
      disabled: action !== 'CHANGE' && getDailyStatus(daily) !== 'reedem',
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

    const embed = getMissionsEmbed(ctx, user, userDailies, true);
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
    // eslint-disable-next-line @typescript-eslint/ban-types
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
        updateObject = addItems(farmer.seeds, [
          { plant: selectedAward.helper as AvailablePlants, amount: selectedAward.value },
        ]);
        break;
      }
      case 'plant': {
        const farmer = await farmerRepository.getFarmer(ctx.user.id);
        updateFunction = farmerRepository.updateSilo;
        updateObject = addItems(farmer.silo, [
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
  commandRelatedExecutions: [handleButtonInteractions],
  execute: async (ctx, finishCommand) => {
    finishCommand();

    const userDailies = await getUserDailies(ctx.authorData);

    const embed = getMissionsEmbed(ctx, ctx.authorData, userDailies, false);

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

    ctx.makeMessage({ embeds: [embed], components: [createActionRow(buttons)] });
  },
});

export default DailyCommand;
