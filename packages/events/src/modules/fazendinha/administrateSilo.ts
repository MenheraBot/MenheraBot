import { ButtonStyles } from 'discordeno/types';
import ChatInputInteractionContext from '../../structures/command/ChatInputInteractionContext';
import { DatabaseFarmerSchema } from '../../types/database';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { createActionRow, createButton, createCustomId } from '../../utils/discord/componentUtils';
import { MAX_SILO_UPGRADES, SILO_LIMIT_INCREASE_BY_LEVEL } from './constants';
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

  if (farmer.siloUpgrades >= MAX_SILO_UPGRADES)
    return ctx.makeMessage({
      content: ctx.prettyResponse('error', 'commands:fazendinha.admin.silo.limit'),
      embeds: [],
      components: [],
    });

  const cost = 50_000 + farmer.siloUpgrades * 15_000;

  if (user.estrelinhas < cost)
    return ctx.makeMessage({
      components: [],
      embeds: [],
      content: ctx.prettyResponse('error', 'commands:fazendinha.admin.silo.poor'),
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

  ctx.makeMessage({
    components: [],
    content: ctx.prettyResponse('success', 'commands:fazendinha.admin.silo.success'),
    embeds: [],
  });
};

const executeAdministrateSilo = async (
  ctx: ChatInputInteractionContext,
  farmer: DatabaseFarmerSchema,
): Promise<void> => {
  const cost = 50_000 + farmer.siloUpgrades * 15_000;

  const embed = createEmbed({
    title: ctx.locale('commands:fazendinha.admin.silo.title'),
    color: hexStringToNumber(ctx.authorData.selectedColor),
    fields: [],
    description: ctx.locale('commands:fazendinha.admin.silo.description', {
      increase: SILO_LIMIT_INCREASE_BY_LEVEL,
      cost,
      limit: getSiloLimits(farmer).limit,
    }),
  });

  const buyButton = createButton({
    label: ctx.locale('commands:fazendinha.admin.silo.button'),
    style: ButtonStyles.Primary,
    customId: createCustomId(5, ctx.user.id, ctx.commandId, 'UPGRADE'),
  });

  ctx.makeMessage({
    embeds: [embed],
    components: [createActionRow([buyButton])],
  });
};

export { executeAdministrateSilo, handleUpgradeSilo };
