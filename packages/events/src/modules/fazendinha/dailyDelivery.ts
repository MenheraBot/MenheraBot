import { ActionRow, ButtonStyles } from 'discordeno';
import { DatabaseFarmerSchema } from '../../types/database';
import { InteractionContext } from '../../types/menhera';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { getMillisecondsToTheEndOfDay, millisToSeconds } from '../../utils/miscUtils';
import { Plants } from './constants';
import { getUserDailies } from './deliveryUtils';
import { createActionRow, createButton, createCustomId } from '../../utils/discord/componentUtils';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import farmerRepository from '../../database/repositories/farmerRepository';
import { checkNeededItems, removeItems } from './siloUtils';
import starsRepository from '../../database/repositories/starsRepository';
import { postTransaction } from '../../utils/apiRequests/statistics';
import { bot } from '../..';
import { ApiTransactionReason } from '../../types/api';

const executeButtonPressed = async (ctx: ComponentInteractionContext): Promise<void> => {
  const farmer = await farmerRepository.getFarmer(ctx.user.id);
  const [daily] = ctx.sentData;

  const dailyUser = farmer.dailies[Number(daily)];

  if (typeof dailyUser === 'undefined')
    return ctx.makeMessage({
      components: [],
      embeds: [],
      content: 'Essa entrega não está mais disponível!',
    });

  if (dailyUser.finished)
    return ctx.makeMessage({
      components: [],
      embeds: [],
      content: 'Você já finalizou essa entrega.',
    });

  const canFinishDaily = dailyUser.needs.every((e) => checkNeededItems([e], farmer.silo));

  if (!canFinishDaily)
    return ctx.makeMessage({
      components: [],
      embeds: [],
      content: 'Tu não tem as plantas necessárias para essa entrega',
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
      0,
    ),
    farmerRepository.finishDaily(
      ctx.user.id,
      farmer.dailies,
      removeItems(farmer.silo, dailyUser.needs),
      dailyUser.experience,
    ),
  ]);

  ctx.makeMessage({
    content: `Você completou essa entrega! Tu recebeu **${dailyUser.award}** :star: e ${dailyUser.experience} XP`,
    components: [],
    embeds: [],
  });
};

const executeDailyDelivery = async (
  ctx: InteractionContext,
  farmer: DatabaseFarmerSchema,
  embedColor: string,
): Promise<void> => {
  const endsIn = getMillisecondsToTheEndOfDay() + Date.now();
  const embed = createEmbed({
    title: 'Entregas Diárias',
    color: hexStringToNumber(embedColor),
    fields: [],
    description: `Uma vez por dia o caminhão de entregas aparecerá em sua fazendinha para buscar por entregas. Preencha todos os pedidos e ganhe prêmios\n\nO caminhão partirá <t:${millisToSeconds(
      endsIn,
    )}:R>`,
  });

  const userDailies = getUserDailies(farmer);

  const toSendComponents: ActionRow[] = [];

  userDailies.forEach((a, i) => {
    embed.fields?.push({
      name: `${a.finished ? '~~' : ''}Entrega ${i + 1}${a.finished ? '~~ ✅' : ''}`,
      inline: true,
      value: `Estrelinhas: **${a.award}** :star:\nExperiência: **${a.experience}**\n${a.needs.map(
        (b) => `${b.amount}x ${Plants[b.plant].emoji}`,
      )}`,
    });

    const index = Math.floor(i / 3);

    const button = createButton({
      label: `Entregar ${i + 1}`,
      style: ButtonStyles.Primary,
      customId: createCustomId(4, ctx.user.id, ctx.commandId, i),
      disabled: a.finished,
    });

    if (typeof toSendComponents[index] === 'undefined')
      toSendComponents.push(createActionRow([button]));
    else toSendComponents[index].components.push(button);
  });

  ctx.makeMessage({ embeds: [embed], components: toSendComponents });
};

export { executeDailyDelivery, executeButtonPressed };
