/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ApplicationCommandOptionTypes,
  ButtonComponent,
  ButtonStyles,
  MessageFlags,
} from '@discordeno/bot';
import { createCommand } from '../../structures/command/createCommand.js';
import { getUserDailies } from '../../modules/dailies/getUserDailies.js';
import { hexStringToNumber } from '../../utils/discord/embedUtils.js';
import { getDailyById } from '../../modules/dailies/dailies.js';
import {
  createActionRow,
  createButton,
  createContainer,
  createCustomId,
  createSection,
  createSeparator,
  createTextDisplay,
} from '../../utils/discord/componentUtils.js';
import { Award, DatabaseDaily } from '../../modules/dailies/types.js';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext.js';
import userRepository from '../../database/repositories/userRepository.js';
import { InteractionContext } from '../../types/menhera.js';
import { Items, Plants } from '../../modules/fazendinha/constants.js';
import { AvailableItems, AvailablePlants } from '../../modules/fazendinha/types.js';
import farmerRepository from '../../database/repositories/farmerRepository.js';
import { addItems, addPlants, getSiloLimits } from '../../modules/fazendinha/siloUtils.js';
import { DatabaseUserSchema } from '../../types/database.js';
import { getUniqueDaily } from '../../modules/dailies/calculateUserDailies.js';
import { getMillisecondsToTheEndOfDay, millisToSeconds } from '../../utils/miscUtils.js';
import { getDisplayName } from '../../utils/discord/userUtils.js';
import { User } from '../../types/discordeno.js';
import {
  extractNameAndIdFromEmoji,
  setComponentsV2Flag,
} from '../../utils/discord/messageUtils.js';

const getDailyStatus = (daily: DatabaseDaily): 'reedem' | 'unfinished' | 'reedemed' =>
  daily.redeemed ? 'reedemed' : daily.has >= daily.need ? 'reedem' : 'unfinished';

const displayDailies = async (
  ctx: InteractionContext,
  userData: DatabaseUserSchema,
  user: User,
) => {
  const userDailies = await getUserDailies(userData);

  const components = getMissionComponents(ctx, userData, userDailies, false, getDisplayName(user));

  return ctx.makeLayoutMessage({
    components: [components],
  });
};

const getAwardEmoji = (
  ctx: InteractionContext,
  award: Pick<Award<string | number>, 'helper'> & { type: Award<string | number>['type'] | string },
): string => {
  switch (award.type) {
    case 'hunt':
      return ctx.safeEmoji(award.helper as 'demons');
    case 'estrelinhas':
    case 'roll':
      return ctx.safeEmoji(award.type);
    case 'plant':
    case 'seed':
      return Plants[award.helper as AvailablePlants].emoji;
    default:
      return Items[AvailableItems.Fertilizer].emoji;
  }
};

const getMissionComponents = (
  ctx: InteractionContext,
  user: DatabaseUserSchema,
  userDailies: DatabaseDaily[],
  isChangeEmbed: boolean,
  username: string,
) => {
  const isFromUser = `${ctx.user.id}` === user.id;

  const cannotChangeDaily = userDailies.some((a) => a.changed);

  const titleDisplay = createTextDisplay(
    `## ${ctx.prettyResponse(
      'calendar',
      isChangeEmbed ? 'commands:daily.change-title' : 'commands:daily.title',
      { username },
    )}`,
  );

  return createContainer({
    accentColor: hexStringToNumber(user.selectedColor),
    components: [
      isFromUser
        ? createSection({
            accessory: createButton({
              label: ctx.locale(isChangeEmbed ? 'common:cancel' : 'commands:daily.change-daily'),
              style: ButtonStyles.Secondary,
              customId: createCustomId(
                0,
                ctx.user.id,
                ctx.originalInteractionId,
                isChangeEmbed ? 'CANCEL' : 'DISPLAY_CHANGE',
              ),
              disabled: !isFromUser || cannotChangeDaily,
            }),
            components: [titleDisplay],
          })
        : titleDisplay,

      createTextDisplay(
        `- ${userDailies
          .map((d, i) => {
            const daily = getDailyById(d.id);
            return `**(${i + 1})** ${ctx.locale(`commands:daily.descriptions.${daily.type}`, {
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
            })}`;
          })
          .join('\n- ')}`,
      ),
      ...(isFromUser
        ? [
            createActionRow(
              userDailies.map((daily, index) =>
                createButton({
                  label: isChangeEmbed
                    ? ctx.locale('commands:daily.change', { index: index + 1 })
                    : ctx.locale(`commands:daily.${getDailyStatus(daily)}`, {
                        index: index + 1,
                        need: daily.need,
                        has: daily.has,
                      }),
                  style: isChangeEmbed
                    ? ButtonStyles.Danger
                    : getDailyStatus(daily) === 'reedem'
                      ? ButtonStyles.Success
                      : ButtonStyles.Secondary,
                  customId: createCustomId(
                    0,
                    ctx.user.id,
                    ctx.originalInteractionId,
                    isChangeEmbed ? 'CHANGE' : 'REEDEM',
                    index,
                  ),
                  disabled: !isChangeEmbed
                    ? getDailyStatus(daily) !== 'reedem'
                    : getDailyStatus(daily) !== 'unfinished',
                }),
              ),
            ),
          ]
        : []),
      createSeparator(false, true),
      createTextDisplay(
        `-# ${ctx.locale(`commands:daily.${isChangeEmbed ? 'change-footer' : 'reset'}`, {
          unix: millisToSeconds(Date.now() + getMillisecondsToTheEndOfDay()),
        })}`,
      ),
    ],
  });
};

const changeDaily = async (
  ctx: ComponentInteractionContext,
  userData: DatabaseUserSchema,
  userDailies: DatabaseDaily[],
  dailyIndex: number,
): Promise<void> => {
  const userDaily = getUniqueDaily(userDailies);
  userDailies[dailyIndex] = { ...userDaily, changed: true };

  await userRepository.updateUser(ctx.user.id, { dailies: userDailies });

  const daily = getDailyById(userDaily.id);

  await displayDailies(ctx, { ...userData, dailies: userDailies }, ctx.user);

  const newDailyDescription = ctx.locale(`commands:daily.descriptions.${daily.type}`, {
    ...userDaily,
    specification:
      daily.specificationDisplay?.(ctx, userDaily.specification!) ?? userDaily.specification,
    count: userDaily.need,
    emoji: ctx.safeEmoji('swap'),
  });

  await ctx.followUp({
    flags: setComponentsV2Flag(MessageFlags.Ephemeral),
    components: [
      createTextDisplay(
        ctx.prettyResponse('success', 'commands:daily.success-changed', {
          newDaily: newDailyDescription,
          index: dailyIndex + 1,
        }),
      ),
    ],
  });
};

const handleButtonInteractions = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [action, dailyIndex, itemIndex] = ctx.sentData;

  const user = await userRepository.ensureFindUser(ctx.user.id);
  const userDailies = await getUserDailies(user);

  const cannotChange = userDailies.some((d) => d.changed);

  if (action === 'CANCEL') return displayDailies(ctx, user, ctx.user);

  if (action === 'DISPLAY_CHANGE') {
    if (cannotChange)
      return ctx.makeLayoutMessage({
        components: [
          createTextDisplay(ctx.prettyResponse('error', 'commands:daily.already-changed')),
        ],
      });

    const components = getMissionComponents(ctx, user, userDailies, true, ctx.user.username);

    return ctx.makeLayoutMessage({ components: [components] });
  }

  if (action === 'CHANGE') {
    if (cannotChange)
      return ctx.makeLayoutMessage({
        components: [
          createTextDisplay(ctx.prettyResponse('error', 'commands:daily.already-changed')),
        ],
      });

    return changeDaily(ctx, user, userDailies, Number(dailyIndex));
  }

  const missionToReedem = userDailies[Number(dailyIndex)];

  if (missionToReedem.need > missionToReedem.has)
    return ctx.makeLayoutMessage({
      components: [createTextDisplay(ctx.prettyResponse('error', 'commands:daily.cannot-reedem'))],
    });

  if (missionToReedem.redeemed)
    return ctx.makeLayoutMessage({
      components: [
        createTextDisplay(ctx.prettyResponse('error', 'commands:daily.already-reedemed')),
      ],
    });

  if (action === 'SELECT_ITEM') {
    const selectedAward = missionToReedem.awards[Number(itemIndex)];

    let updateObject: unknown = {};
    let updateFunction: Function = userRepository.updateUserWithSpecialData;

    const farmer = await farmerRepository.getFarmer(ctx.user.id);

    const siloLimits = getSiloLimits(farmer);

    const available = siloLimits.limit - siloLimits.used;

    const cannotRedeem = () =>
      ctx.respondInteraction({
        flags: setComponentsV2Flag(MessageFlags.Ephemeral),
        components: [
          createTextDisplay(
            ctx.prettyResponse('error', 'commands:fazendinha.silo.silo-is-full', {
              limit: siloLimits.limit,
            }),
          ),
        ],
      });

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

        const prize = {
          plant: selectedAward.helper as AvailablePlants,
          amount: selectedAward.value,
        };

        if (prize.amount > available) return cannotRedeem();

        updateObject = addPlants(farmer.seeds, [prize]);
        break;
      }
      case 'plant': {
        const farmer = await farmerRepository.getFarmer(ctx.user.id);
        updateFunction = farmerRepository.updateSilo;

        const prize = {
          plant: selectedAward.helper as AvailablePlants,
          weight: selectedAward.value,
        };

        if (prize.weight > available) return cannotRedeem();

        updateObject = addPlants(farmer.silo, [prize]);
        break;
      }
      case 'fertilizer': {
        const farmer = await farmerRepository.getFarmer(ctx.user.id);
        updateFunction = farmerRepository.updateItems;

        const prize = { id: AvailableItems.Fertilizer, amount: selectedAward.value };

        if (prize.amount > available) return cannotRedeem();

        updateObject = addItems(farmer.items, [prize]);
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

    await displayDailies(ctx, user, ctx.user);

    return ctx.followUp({
      flags: setComponentsV2Flag(MessageFlags.Ephemeral),
      components: [
        createTextDisplay(
          ctx.prettyResponse('success', 'commands:daily.reedemed-success', {
            emoji: getAwardEmoji(ctx, selectedAward),
            value: selectedAward.value,
          }),
        ),
      ],
    });
  }

  if (action === 'REEDEM') {
    const buttons: ButtonComponent[] = [];

    const components = createContainer({
      accentColor: hexStringToNumber(user.selectedColor),
      components: [
        createSection({
          components: [
            createTextDisplay(`## ${ctx.prettyResponse('gift', 'commands:daily.reedem-title')}`),
          ],
          accessory: createButton({
            label: ctx.locale('common:cancel'),
            style: ButtonStyles.Secondary,
            customId: createCustomId(0, ctx.user.id, ctx.originalInteractionId, 'CANCEL'),
          }),
        }),
        createTextDisplay(
          missionToReedem.awards
            .map((award, index) => {
              buttons.push(
                createButton({
                  label: ctx.locale(`commands:daily.reedem-options.${award.type}`, {
                    index: index + 1,
                  }),
                  style: ButtonStyles.Primary,
                  emoji:
                    award.type === 'fertilizer'
                      ? extractNameAndIdFromEmoji(getAwardEmoji(ctx, award))
                      : { name: getAwardEmoji(ctx, award) },
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

              return `- ${ctx.locale(`commands:daily.reedem-options.${award.type}`, { index: index + 1 })} ${getAwardEmoji(ctx, award)}`;
            })
            .join('\n'),
        ),
        createActionRow(buttons),
      ],
    });

    ctx.makeLayoutMessage({
      components: [components],
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

    return displayDailies(ctx, userData, userToCheck);
  },
});

export default DailyCommand;

export { getAwardEmoji };
