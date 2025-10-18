import { ButtonStyles } from '@discordeno/bot';
import ChatInputInteractionContext from '../../structures/command/ChatInputInteractionContext.js';
import { DatabaseFarmerSchema } from '../../types/database.js';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils.js';
import {
  createActionRow,
  createButton,
  createCustomId,
} from '../../utils/discord/componentUtils.js';
import { MAX_SILO_UPGRADES, SILO_LIMIT_INCREASE_BY_LEVEL } from './constants.js';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext.js';
import farmerRepository from '../../database/repositories/farmerRepository.js';
import userRepository from '../../database/repositories/userRepository.js';
import starsRepository from '../../database/repositories/starsRepository.js';
import { getSiloLimits } from './siloUtils.js';
import { postTransaction } from '../../utils/apiRequests/statistics.js';
import { ApiTransactionReason } from '../../types/api.js';
import { bot } from '../../index.js';

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
    customId: createCustomId(5, ctx.user.id, ctx.originalInteractionId, 'UPGRADE'),
  });

  ctx.makeMessage({
    embeds: [embed],
    components: [createActionRow([buyButton])],
  });
};

export { executeAdministrateSilo, handleUpgradeSilo };
