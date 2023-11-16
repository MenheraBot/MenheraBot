import { Interaction, User } from 'discordeno/transformers';
import { findBestMatch } from 'string-similarity';
import { ButtonStyles } from 'discordeno/types';
import { getOptionFromInteraction } from '../../structures/command/getCommandOption';
import { InteractionContext } from '../../types/menhera';
import fairRepository from '../../database/repositories/fairRepository';
import { DatabaseFarmerSchema } from '../../types/database';
import { addItems, getSiloLimits } from './siloUtils';
import userRepository from '../../database/repositories/userRepository';
import starsRepository from '../../database/repositories/starsRepository';
import farmerRepository from '../../database/repositories/farmerRepository';
import { postTransaction } from '../../utils/apiRequests/statistics';
import { ApiTransactionReason } from '../../types/api';
import { respondWithChoices } from '../../utils/discord/interactionRequests';
import {
  createActionRow,
  createButton,
  createCustomId,
  createSelectMenu,
  resolveSeparatedStrings,
} from '../../utils/discord/componentUtils';
import { createEmbed } from '../../utils/discord/embedUtils';
import { getDisplayName, getUserAvatar, mentionUser } from '../../utils/discord/userUtils';
import { MAX_ITEMS_PER_FAIR_PAGE, Plants } from './constants';
import ChatInputInteractionContext from '../../structures/command/ChatInputInteractionContext';

const listItemAutocomplete = async (interaction: Interaction): Promise<void | null> => {
  const input = getOptionFromInteraction<string>(interaction, 'item', false) ?? '';

  const availableItems = await fairRepository.getAnnoucementNames(
    interaction.locale === 'en-US' ? 'en-US' : 'pt-BR',
  );

  if (availableItems.length === 0)
    return respondWithChoices(interaction, [{ name: 'Não há anúncios disponíveis', value: 's' }]);

  const ratings = findBestMatch(input, availableItems)
    .ratings.sort((a, b) => b.rating - a.rating)
    .slice(0, 10);

  respondWithChoices(
    interaction,
    ratings.map((item, i) => {
      const [name, id] = resolveSeparatedStrings(item.target);

      return {
        name: `${name} (${i + 1})`,
        value: id,
      };
    }),
  );
};

const executeBuyItem = async (
  ctx: InteractionContext,
  farmer: DatabaseFarmerSchema,
  item: string,
): Promise<void> => {
  const exists = await fairRepository.doesAnnouncementExists(item);

  if (!exists)
    return ctx.makeMessage({ components: [], embeds: [], content: `Este anúncio não existe mais` });

  const announcement = await fairRepository.getAnnouncement(item);

  if (!announcement)
    return ctx.makeMessage({ components: [], embeds: [], content: `Este anúncio não existe mais` });

  if (announcement.userId === `${ctx.user.id}`)
    return ctx.makeMessage({
      components: [],
      embeds: [],
      content: `Você não pode comprar seus próprios itens`,
    });

  const userLimits = getSiloLimits(farmer);

  if (userLimits.used + announcement.amount > userLimits.limit)
    return ctx.makeMessage({
      components: [],
      embeds: [],
      content: `Você não tem espaço suficiente em seu silo para comprar isso`,
    });

  const user = await userRepository.ensureFindUser(ctx.user.id);

  if (user.estrelinhas < announcement.price)
    return ctx.makeMessage({
      components: [],
      embeds: [],
      content: `Você não tem estrelinhas o suficiente para comprar isso`,
    });

  if (announcement.plantType > farmer.biggestSeed)
    return ctx.makeMessage({
      components: [],
      embeds: [],
      content: `Você não pode comprar esse item porque ainda não o desbloqueou!`,
    });

  await Promise.all([
    starsRepository.addStars(announcement.userId, announcement.price),
    starsRepository.removeStars(ctx.user.id, announcement.price),
    fairRepository.deleteAnnouncement(announcement._id),
    farmerRepository.updateSilo(
      ctx.user.id,
      addItems(farmer.silo, [{ amount: announcement.amount, plant: announcement.plantType }]),
    ),
    postTransaction(
      `${ctx.user.id}`,
      announcement.userId,
      announcement.price,
      'estrelinhas',
      ApiTransactionReason.BUY_FAIR,
    ),
  ]);

  ctx.makeMessage({
    components: [],
    embeds: [],
    content: `Você comporu esse item`,
  });
};

const displayFair = async (ctx: InteractionContext, page: number, user?: User) => {
  const annonucements = user
    ? await fairRepository.getUserProducts(user.id)
    : await Promise.all(
        (
          await fairRepository.getAnnouncementIds(
            page * MAX_ITEMS_PER_FAIR_PAGE,
            MAX_ITEMS_PER_FAIR_PAGE,
          )
        ).map((a) => fairRepository.getAnnouncement(a)),
      );

  if (annonucements.length === 0)
    return ctx.makeMessage({
      embeds: [],
      components: [],
      content: `Não há anúncios disponíveis no momento`,
    });

  const embed = createEmbed({
    author: {
      name: `Feirinha ${user ? `de ${getDisplayName(user)}` : ''}`,
      iconUrl: user ? getUserAvatar(user, { enableGif: true }) : undefined,
    },
    description: '',
    fields: [],
    footer: page ? { text: `Página ${page + 1}` } : undefined,
  });

  const selectMenu = createSelectMenu({
    customId: createCustomId(7, ctx.user.id, ctx.commandId, 'BUY'),
    options: [],
    minValues: 1,
    placeholder: 'Selecione o que você quer comprar',
  });

  annonucements.forEach((item, i) => {
    if (!item) return;

    embed.description += `\n- ${item.amount}x ${Plants[item.plantType].emoji} **${ctx.locale(
      `data:plants.${item.plantType}`,
    )}** por ${item.price} :star:${user ? '' : ` - ${mentionUser(item.userId)} (${i + 1})`}`;

    selectMenu.options.push({
      label: `${item.amount}x ${ctx.locale(`data:plants.${item.plantType}`)}${
        user ? '' : ` (${i + 1})`
      }`,
      value: item._id,
      description: `${item.price} ⭐`,
      emoji: { name: Plants[item.plantType].emoji },
    });
  });

  selectMenu.maxValues = selectMenu.options.length;

  const componentsToSend = [createActionRow([selectMenu])];

  if (!user) {
    const backButton = createButton({
      customId: createCustomId(7, ctx.user.id, ctx.commandId, 'PAGINATION', page - 1),
      label: ctx.locale('common:back'),
      style: ButtonStyles.Primary,
      disabled: page < 1,
    });

    const nextButton = createButton({
      customId: createCustomId(7, ctx.user.id, ctx.commandId, 'PAGINATION', page + 1),
      label: ctx.locale('common:next'),
      style: ButtonStyles.Primary,
      disabled: selectMenu.options.length < MAX_ITEMS_PER_FAIR_PAGE,
    });

    componentsToSend.push(createActionRow([backButton, nextButton]));
  }

  ctx.makeMessage({
    embeds: [embed],
    components: componentsToSend,
  });
};

const executeExploreFair = async (
  ctx: ChatInputInteractionContext,
  farmer: DatabaseFarmerSchema,
): Promise<void> => {
  const user = ctx.getOption<User>('vizinho', 'users', false);
  const item = ctx.getOption<string>('item', false, false);

  if (item) return executeBuyItem(ctx, farmer, item);

  return displayFair(ctx, 0, user);
};

export { executeExploreFair, listItemAutocomplete };
