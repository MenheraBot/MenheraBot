import { ActionRow, ButtonStyles } from 'discordeno';
import { DatabaseFarmerSchema } from '../../types/database.js';
import { InteractionContext } from '../../types/menhera.js';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils.js';
import { getMillisecondsToTheEndOfDay, millisToSeconds } from '../../utils/miscUtils.js';
import { FINISH_ALL_DELIVERIES_BONUS, Plants } from './constants.js';
import { getUserDeliveries } from './deliveryUtils.js';
import {
  createActionRow,
  createButton,
  createCustomId,
} from '../../utils/discord/componentUtils.js';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext.js';
import farmerRepository from '../../database/repositories/farmerRepository.js';
import { checkNeededPlants, removePlants } from './siloUtils.js';
import starsRepository from '../../database/repositories/starsRepository.js';
import { postTransaction } from '../../utils/apiRequests/statistics.js';
import { bot } from '../../index.js';
import { ApiTransactionReason } from '../../types/api.js';
import executeDailies from '../dailies/executeDailies.js';
import userRepository from '../../database/repositories/userRepository.js';

const executeButtonPressed = async (ctx: ComponentInteractionContext): Promise<void> => {
  const farmer = await farmerRepository.getFarmer(ctx.user.id);
  const [daily] = ctx.sentData;

  const dailyUser = farmer.dailies[Number(daily)];

  if (typeof dailyUser === 'undefined')
    return ctx.makeMessage({
      components: [],
      embeds: [],
      content: ctx.prettyResponse('error', 'commands:fazendinha.entregas.no-longer-available'),
    });

  if (dailyUser.finished)
    return ctx.makeMessage({
      components: [],
      embeds: [],
      content: ctx.prettyResponse('error', 'commands:fazendinha.entregas.already-finished'),
    });

  const canFinishDaily = dailyUser.needs.every((e) => checkNeededPlants([e], farmer.silo));

  if (!canFinishDaily)
    return ctx.makeMessage({
      components: [],
      embeds: [],
      content: ctx.prettyResponse('error', 'commands:fazendinha.entregas.no-plants'),
    });

  dailyUser.finished = true;

  await Promise.all([
    starsRepository.addStars(ctx.user.id, dailyUser.award),
    postTransaction(
      `${bot.id}`,
      `${ctx.user.id}`,
      dailyUser.award,
      'estrelinhas',
      ApiTransactionReason.DAILY_FARM,
    ),
    farmerRepository.finishDelivery(
      ctx.user.id,
      farmer.dailies,
      removePlants(farmer.silo, dailyUser.needs),
      dailyUser.experience,
    ),
  ]);

  await executeDailies.finishDelivery(await userRepository.ensureFindUser(ctx.user.id));

  await ctx.makeMessage({
    content: ctx.prettyResponse('wink', 'commands:fazendinha.entregas.deliver', {
      award: dailyUser.award,
      xp: dailyUser.experience,
    }),
    components: [],
    embeds: [],
  });

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

    ctx.followUp({
      content: ctx.prettyResponse('smile', 'commands:fazendinha.entregas.finished-bonus', {
        award: bonus,
      }),
    });
  }
};

const executeDailyDelivery = async (
  ctx: InteractionContext,
  farmer: DatabaseFarmerSchema,
  embedColor: string,
): Promise<void> => {
  const endsIn = getMillisecondsToTheEndOfDay() + Date.now();

  const userDevlieries = getUserDeliveries(farmer);

  const embed = createEmbed({
    title: ctx.locale('commands:fazendinha.entregas.daily-deliveries'),
    color: hexStringToNumber(embedColor),
    fields: [],
    description: ctx.locale('commands:fazendinha.entregas.description', {
      bonus: FINISH_ALL_DELIVERIES_BONUS,
      unix: millisToSeconds(endsIn),
    }),
  });

  const toSendComponents: ActionRow[] = [];

  userDevlieries.forEach((a, i) => {
    embed.fields?.push({
      name: ctx.locale(
        `commands:fazendinha.entregas.deliver-embed-name${a.finished ? '-finished' : ''}`,
        { index: i + 1 },
      ),
      inline: true,
      value: `${ctx.locale('commands:fazendinha.entregas.deliver-embed-field', {
        award: a.award,
        xp: a.experience,
      })}\n${a.needs.map((b) =>
        ctx.locale('commands:fazendinha.entregas.deliver-embed-field-need', {
          amount: b.weight ?? b.amount,
          emoji: Plants[b.plant].emoji,
        }),
      )}`,
    });

    const index = Math.floor(i / 3);

    const button = createButton({
      label: ctx.locale('commands:fazendinha.entregas.deliver-button', { index: i + 1 }),
      style: ButtonStyles.Primary,
      customId: createCustomId(4, ctx.user.id, ctx.originalInteractionId, i),
      disabled: a.finished,
    });

    if (typeof toSendComponents[index] === 'undefined')
      toSendComponents.push(createActionRow([button]));
    else toSendComponents[index].components.push(button);
  });

  ctx.makeMessage({ embeds: [embed], components: toSendComponents });
};

export { executeDailyDelivery, executeButtonPressed };
