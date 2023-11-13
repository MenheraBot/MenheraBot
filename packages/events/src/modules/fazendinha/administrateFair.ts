import { ActionRow, ButtonStyles } from 'discordeno/types';
import ChatInputInteractionContext from '../../structures/command/ChatInputInteractionContext';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import farmerRepository from '../../database/repositories/farmerRepository';
import userRepository from '../../database/repositories/userRepository';
import starsRepository from '../../database/repositories/starsRepository';
import { postTransaction } from '../../utils/apiRequests/statistics';
import { ApiTransactionReason } from '../../types/api';
import { bot } from '../..';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { getDisplayName, getUserAvatar } from '../../utils/discord/userUtils';
import fairRepository from '../../database/repositories/fairRepository';
import { Plants } from './constants';
import { createActionRow, createButton, createCustomId } from '../../utils/discord/componentUtils';

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

const executeAdministrateFair = async (ctx: ChatInputInteractionContext): Promise<void> => {
  const fromUser = await fairRepository.getUserProducts(ctx.user.id);

  const embed = createEmbed({
    author: {
      name: getDisplayName(ctx.user),
      iconUrl: getUserAvatar(ctx.user, { enableGif: true }),
    },
    color: hexStringToNumber(ctx.authorData.selectedColor),
    fields: [],
  });

  if (fromUser.length === 0) {
    embed.description = 'Você não possui itens anunciados no momento';
    return ctx.makeMessage({ embeds: [embed] });
  }

  const toSendComponents: ActionRow[] = [];

  fromUser.forEach((item, i) => {
    embed.fields?.push({
      name: `(${i + 1}) ${item['name_pt-BR']}`,
      value: `${item.price} :star:\n${Plants[item.plantType].emoji} ${item.amount}x`,
    });

    const index = Math.floor(i / 3);

    const button = createButton({
      label: `Remover anúncio ${i + 1}`,
      style: ButtonStyles.Danger,
      customId: createCustomId(6, ctx.user.id, ctx.commandId, i),
    });

    if (typeof toSendComponents[index] === 'undefined')
      toSendComponents.push(createActionRow([button]));
    else toSendComponents[index].components.push(button);
  });

  ctx.makeMessage({ embeds: [embed], components: toSendComponents });
};

export { executeAdministrateFair, handleUpgradeSilo };
