import { ButtonStyles } from 'discordeno/types';
import ChatInputInteractionContext from '../../structures/command/ChatInputInteractionContext';
import { DatabaseFarmerSchema } from '../../types/database';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { createActionRow, createButton, createCustomId } from '../../utils/discord/componentUtils';
import { SILO_LIMIT_INCREASE_BY_LEVEL } from './constants';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import farmerRepository from '../../database/repositories/farmerRepository';
import userRepository from '../../database/repositories/userRepository';
import starsRepository from '../../database/repositories/starsRepository';
import { getSiloLimits } from './siloUtils';
import { postTransaction } from '../../utils/apiRequests/statistics';
import { ApiTransactionReason } from '../../types/api';
import { bot } from '../..';

const handleUpgradeSilo = async (ctx: ComponentInteractionContext): Promise<void> => {
  const farmer = await farmerRepository.getFarmer(ctx.user.id);
  const user = await userRepository.ensureFindUser(ctx.user.id);

  const cost = 50_000 + farmer.siloUpgrades * 15_000;

  if (user.estrelinhas < cost)
    return ctx.makeMessage({
      components: [],
      embeds: [],
      content: 'Voce não tem estrelinhas o suficiente para aumentar seu silo',
    });

  await Promise.all([
    starsRepository.removeStars(ctx.user.id, cost),
    farmerRepository.upgradeSilo(ctx.user.id),
    postTransaction(
      `${ctx.user.id}`,
      `${bot.id}`,
      cost,
      'estrelinhas',
      ApiTransactionReason.UPGRADE_FARM,
      0,
    ),
  ]);

  ctx.makeMessage({ components: [], content: `Você melhorou seu silo!`, embeds: [] });
};

const executeAdministrateSilo = async (
  ctx: ChatInputInteractionContext,
  farmer: DatabaseFarmerSchema,
): Promise<void> => {
  const cost = 50_000 + farmer.siloUpgrades * 15_000;

  const embed = createEmbed({
    title: 'Melhorar seu silo',
    color: hexStringToNumber(ctx.authorData.selectedColor),
    fields: [],
    description: `Melhore seu silo em **${SILO_LIMIT_INCREASE_BY_LEVEL}** espaços por apenas **${cost}** :star:\nAtualmente você possui **${
      getSiloLimits(farmer).limit
    }** espaços de limite`,
  });

  const buyButton = createButton({
    label: 'Melhorar silo',
    style: ButtonStyles.Primary,
    customId: createCustomId(5, ctx.user.id, ctx.commandId, 'UPGRADE'),
  });

  ctx.makeMessage({
    embeds: [embed],
    components: [createActionRow([buyButton])],
  });
};

export { executeAdministrateSilo, handleUpgradeSilo };
