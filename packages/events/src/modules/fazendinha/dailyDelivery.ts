import {
  ButtonStyles,
  MessageFlags,
  SeparatorComponent,
  TextDisplayComponent,
} from '@discordeno/bot';
import { DatabaseFarmerSchema } from '../../types/database.js';
import { InteractionContext } from '../../types/menhera.js';
import { hexStringToNumber } from '../../utils/discord/embedUtils.js';
import { getMillisecondsToTheEndOfDay, millisToSeconds } from '../../utils/miscUtils.js';
import { FINISH_ALL_DELIVERIES_BONUS, Plants } from './constants.js';
import { getUserDeliveries } from './deliveryUtils.js';
import {
  createButton,
  createContainer,
  createCustomId,
  createSection,
  createSeparator,
  createTextDisplay,
} from '../../utils/discord/componentUtils.js';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext.js';
import farmerRepository from '../../database/repositories/farmerRepository.js';
import { checkNeededPlants, ignorePlantQuality, removePlantsIgnoringQuality } from './siloUtils.js';
import starsRepository from '../../database/repositories/starsRepository.js';
import { postTransaction } from '../../utils/apiRequests/statistics.js';
import { bot } from '../../index.js';
import { ApiTransactionReason } from '../../types/api.js';
import executeDailies from '../dailies/executeDailies.js';
import userRepository from '../../database/repositories/userRepository.js';
import { setComponentsV2Flag } from '../../utils/discord/messageUtils.js';
import { PlantQuality } from './types.js';

const executeButtonPressed = async (ctx: ComponentInteractionContext): Promise<void> => {
  const farmer = await farmerRepository.getFarmer(ctx.user.id);
  const [daily] = ctx.sentData;

  const dailyUser = farmer.dailies[Number(daily)];

  if (typeof dailyUser === 'undefined')
    return ctx.respondInteraction({
      flags: MessageFlags.Ephemeral,
      content: ctx.prettyResponse('error', 'commands:fazendinha.entregas.no-longer-available'),
    });

  if (dailyUser.finished)
    return ctx.respondInteraction({
      flags: MessageFlags.Ephemeral,
      content: ctx.prettyResponse('error', 'commands:fazendinha.entregas.already-finished'),
    });

  const totalSilo = ignorePlantQuality(farmer.silo);
  const totalNeeded = ignorePlantQuality(dailyUser.needs);

  const canFinishDaily = totalNeeded.every((e) => checkNeededPlants([e], totalSilo));

  if (!canFinishDaily)
    return ctx.respondInteraction({
      flags: MessageFlags.Ephemeral,
      content: ctx.prettyResponse('error', 'commands:fazendinha.entregas.no-plants'),
    });

  dailyUser.finished = true;

  const [removedPlants, mainQuality] = removePlantsIgnoringQuality(farmer.silo, dailyUser.needs);

  const bonusMultiplier = mainQuality
    ? { [PlantQuality.Best]: 0.2, [PlantQuality.Normal]: 0.1, [PlantQuality.Worst]: 0 }[mainQuality]
    : 0;

  const userAward = Math.floor(dailyUser.award + dailyUser.award * bonusMultiplier);

  await Promise.all([
    starsRepository.addStars(ctx.user.id, userAward),
    postTransaction(
      `${bot.id}`,
      `${ctx.user.id}`,
      userAward,
      'estrelinhas',
      ApiTransactionReason.DAILY_FARM,
    ),
    farmerRepository.finishDelivery(
      ctx.user.id,
      farmer.dailies,
      removedPlants,
      dailyUser.experience,
    ),
  ]);

  const user = await userRepository.ensureFindUser(ctx.user.id);

  await executeDailies.finishDelivery(user);

  const updatedFarmer = await farmerRepository.getFarmer(ctx.user.id);

  await executeDailyDelivery(ctx, updatedFarmer, user.selectedColor);

  const followupComponents: (TextDisplayComponent | SeparatorComponent)[] = [
    createTextDisplay(
      ctx.locale('commands:fazendinha.entregas.deliver', {
        award: userAward,
        xp: dailyUser.experience,
        bonus:
          bonusMultiplier > 0
            ? ctx.locale('commands:fazendinha.entregas.bonus', { bonus: bonusMultiplier * 100 })
            : '',
      }),
    ),
  ];

  if (farmer.dailies.every((a) => a.finished)) {
    const bonus = FINISH_ALL_DELIVERIES_BONUS;

    await Promise.all([
      postTransaction(
        `${bot.id}`,
        `${ctx.user.id}`,
        bonus,
        'estrelinhas',
        ApiTransactionReason.DAILY_FARM,
      ),
      starsRepository.addStars(ctx.user.id, bonus),
    ]);

    followupComponents.push(
      createSeparator(true, false),
      createTextDisplay(
        `### ${ctx.prettyResponse('smile', 'commands:fazendinha.entregas.finished-bonus', {
          award: bonus,
        })}`,
      ),
    );
  }

  await ctx.followUp({
    components: [
      createContainer({
        accentColor: hexStringToNumber(user.selectedColor),
        components: followupComponents,
      }),
    ],
    flags: setComponentsV2Flag(MessageFlags.Ephemeral),
  });
};

const executeDailyDelivery = async (
  ctx: InteractionContext,
  farmer: DatabaseFarmerSchema,
  embedColor: string,
): Promise<void> => {
  const endsIn = getMillisecondsToTheEndOfDay() + Date.now();

  const userDeliveries = getUserDeliveries(farmer);

  const container = createContainer({
    accentColor: hexStringToNumber(embedColor),
    components: [
      createTextDisplay(
        `## ${ctx.locale('commands:fazendinha.entregas.daily-deliveries')}\n${ctx.locale(
          'commands:fazendinha.entregas.description',
          {
            bonus: FINISH_ALL_DELIVERIES_BONUS,
            unix: millisToSeconds(endsIn),
          },
        )}`,
      ),
    ],
  });

  const noQualitySilo = ignorePlantQuality(farmer.silo);

  userDeliveries.forEach((a, i) => {
    container.components.push(
      createSeparator(),
      createSection({
        accessory: createButton({
          label: ctx.locale('commands:fazendinha.entregas.deliver-button'),
          style: ButtonStyles.Primary,
          customId: createCustomId(4, ctx.user.id, ctx.originalInteractionId, i),
          disabled: a.finished || !checkNeededPlants(ignorePlantQuality(a.needs), noQualitySilo),
        }),
        components: [
          createTextDisplay(
            `### ${ctx.locale(
              `commands:fazendinha.entregas.deliver-embed-name${a.finished ? '-finished' : ''}`,
              { index: i + 1 },
            )}\n${ctx.locale('commands:fazendinha.entregas.deliver-embed-field', {
              award: a.award,
              xp: a.experience,
            })}\n${a.needs.map((b) =>
              ctx.locale('commands:fazendinha.entregas.deliver-embed-field-need', {
                amount: b.weight ?? b.amount,
                emoji: Plants[b.plant].emoji,
              }),
            )}`,
          ),
        ],
      }),
    );
  });

  container.components.push(
    createSeparator(),
    createTextDisplay(`-# ${ctx.locale('commands:fazendinha.entregas.footer')}`),
  );

  ctx.makeLayoutMessage({ components: [container] });
};

export { executeDailyDelivery, executeButtonPressed };
