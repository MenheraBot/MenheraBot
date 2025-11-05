import { findBestMatch } from 'string-similarity';
import { ButtonStyles } from '@discordeno/bot';
import { getOptionFromInteraction } from '../../structures/command/getCommandOption.js';
import { InteractionContext } from '../../types/menhera.js';
import fairRepository from '../../database/repositories/fairRepository.js';
import { DatabaseFarmerSchema } from '../../types/database.js';
import { addPlants, getSiloLimits } from './siloUtils.js';
import userRepository from '../../database/repositories/userRepository.js';
import starsRepository from '../../database/repositories/starsRepository.js';
import farmerRepository from '../../database/repositories/farmerRepository.js';
import { postTransaction } from '../../utils/apiRequests/statistics.js';
import { ApiTransactionReason } from '../../types/api.js';
import { respondWithChoices } from '../../utils/discord/interactionRequests.js';
import {
  createActionRow,
  createButton,
  createCustomId,
  createSelectMenu,
  resolveSeparatedStrings,
} from '../../utils/discord/componentUtils.js';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils.js';
import { getDisplayName, getUserAvatar, mentionUser } from '../../utils/discord/userUtils.js';
import { MAX_ITEMS_PER_FAIR_PAGE, Plants } from './constants.js';
import ChatInputInteractionContext from '../../structures/command/ChatInputInteractionContext.js';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext.js';
import { SelectMenuInteraction } from '../../types/interaction.js';
import { localizedResources } from '../../utils/miscUtils.js';
import notificationRepository from '../../database/repositories/notificationRepository.js';
import cacheRepository from '../../database/repositories/cacheRepository.js';
import { Interaction, User } from '../../types/discordeno.js';

const listItemAutocomplete = async (interaction: Interaction): Promise<void | null> => {
  const input = getOptionFromInteraction<string>(interaction, 'item', false) ?? '';

  const availableItems = await fairRepository.getAnnoucementNames(
    interaction.locale === 'en-US' ? 'en-US' : 'pt-BR',
  );

  if (availableItems.length === 0) {
    const noItems = localizedResources('commands:fazendinha.feira.comprar.no-announcements');

    return respondWithChoices(interaction, [
      { name: noItems['pt-BR'], value: 'NONE', nameLocalizations: noItems },
    ]);
  }

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
    return ctx.makeMessage({
      components: [],
      embeds: [],
      content: ctx.prettyResponse('error', 'commands:fazendinha.admin.feirinha.dont-exists'),
    });

  const announcement = await fairRepository.getAnnouncement(item);

  if (!announcement)
    return ctx.makeMessage({
      components: [],
      embeds: [],
      content: ctx.prettyResponse('error', 'commands:fazendinha.admin.feirinha.dont-exists'),
    });

  if (announcement.userId === `${ctx.user.id}`)
    return ctx.makeMessage({
      components: [],
      embeds: [],
      content: ctx.prettyResponse('error', 'commands:fazendinha.feira.comprar.cant-buy-your-items'),
    });

  const userLimits = getSiloLimits(farmer);

  if (userLimits.used + announcement.weight > userLimits.limit)
    return ctx.makeMessage({
      components: [],
      embeds: [],
      content: ctx.prettyResponse('error', 'commands:fazendinha.feira.comprar.silo-limit'),
    });

  const user = await userRepository.ensureFindUser(ctx.user.id);

  if (user.estrelinhas < announcement.price)
    return ctx.makeMessage({
      components: [],
      embeds: [],
      content: ctx.prettyResponse('error', 'commands:fazendinha.feira.comprar.not-enough-stars'),
    });

  await Promise.all([
    starsRepository.addStars(announcement.userId, announcement.price),
    starsRepository.removeStars(ctx.user.id, announcement.price),
    fairRepository.deleteAnnouncement(announcement._id),
    farmerRepository.updateSilo(
      ctx.user.id,
      addPlants(farmer.silo, [{ weight: announcement.weight, plant: announcement.plantType }]),
    ),
    postTransaction(
      `${ctx.user.id}`,
      announcement.userId,
      announcement.price,
      'estrelinhas',
      ApiTransactionReason.BUY_FAIR,
    ),
    notificationRepository.createNotification(
      announcement.userId,
      'commands:notificações.notifications.user-bought-announcement',
      {
        emoji: Plants[announcement.plantType].emoji,
        weight: announcement.weight,
        username: ctx.user.username,
        stars: announcement.price,
      },
    ),
  ]);

  ctx.makeMessage({
    components: [],
    embeds: [],
    content: ctx.prettyResponse('success', 'commands:fazendinha.feira.comprar.success', {
      author: mentionUser(ctx.user.id),
    }),
  });
};

const displayFair = async (
  ctx: InteractionContext,
  page: number,
  embedColor: string,
  user?: User,
) => {
  const totalAnnouncements = await fairRepository.getTotalAnnouncements();

  const itemsToPick =
    page === 0 ? MAX_ITEMS_PER_FAIR_PAGE : totalAnnouncements - page * MAX_ITEMS_PER_FAIR_PAGE;

  const announcements = user
    ? await fairRepository.getUserProducts(user.id)
    : await Promise.all(
        (
          await fairRepository.getAnnouncementIds(
            page * MAX_ITEMS_PER_FAIR_PAGE,
            itemsToPick > MAX_ITEMS_PER_FAIR_PAGE ? MAX_ITEMS_PER_FAIR_PAGE : itemsToPick,
          )
        ).map((a) => fairRepository.getAnnouncement(a)),
      );

  if (announcements.length === 0)
    return ctx.makeMessage({
      embeds: [],
      components: [],
      content: ctx.prettyResponse('error', 'commands:fazendinha.feira.comprar.no-announcements'),
    });

  const embed = createEmbed({
    author: {
      name: ctx.locale(`commands:fazendinha.feira.comprar.${user ? 'user-fair' : 'fair'}`, {
        user: user ? getDisplayName(user) : undefined,
      }),
      iconUrl: user ? getUserAvatar(user, { enableGif: true }) : undefined,
    },
    color: hexStringToNumber(embedColor),
    description: '',
    fields: [],
    footer: page ? { text: ctx.locale('common:page', { page: page + 1 }) } : undefined,
  });

  const selectMenu = createSelectMenu({
    customId: createCustomId(7, ctx.user.id, ctx.originalInteractionId, 'BUY', embedColor),
    options: [],
    minValues: 1,
    maxValues: 1,
    placeholder: ctx.locale('commands:fazendinha.feira.comprar.select-item'),
  });

  await new Promise((r) => {
    let done = 0;

    const finishPromise = () => {
      done += 1;
      if (done >= announcements.length) return r(done);
    };

    announcements.forEach(async (item, i) => {
      if (!item) return finishPromise();

      const userName = user
        ? ''
        : ` ${
            (await cacheRepository.getDiscordUser(item.userId, false))?.username ??
            mentionUser(item.userId)
          }`;

      embed.description += `${ctx.locale('commands:fazendinha.feira.comprar.description', {
        amount: item.weight,
        emoji: Plants[item.plantType].emoji,
        plant: ctx.locale(`data:plants.${item.plantType}`),
        price: item.price,
      })}${
        !user
          ? ctx.locale('commands:fazendinha.feira.comprar.user-info', {
              user: userName,
              index: i + 1,
            })
          : ''
      }`;

      selectMenu.options.push({
        label: `${item.weight} Kg ${ctx.locale(`data:plants.${item.plantType}`)}${
          user ? '' : ` (${i + 1})`
        }`,
        value: `${item._id}`,
        description: `${item.price} ⭐`,
        emoji: { name: Plants[item.plantType].emoji },
      });

      finishPromise();
    });
  });

  const componentsToSend = [createActionRow([selectMenu])];

  if (!user) {
    const backButton = createButton({
      customId: createCustomId(
        7,
        ctx.user.id,
        ctx.originalInteractionId,
        'PAGINATION',
        embedColor,
        page - 1,
      ),
      label: ctx.locale('common:back'),
      style: ButtonStyles.Primary,
      disabled: page < 1,
    });

    const nextButton = createButton({
      customId: createCustomId(
        7,
        ctx.user.id,
        ctx.originalInteractionId,
        'PAGINATION',
        embedColor,
        page + 1,
      ),
      label: ctx.locale('common:next'),
      style: ButtonStyles.Primary,
      disabled: page * MAX_ITEMS_PER_FAIR_PAGE + announcements.length >= totalAnnouncements,
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

  return displayFair(ctx, 0, ctx.authorData.selectedColor, user);
};

const executeButtonAction = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [action, embedColor, page] = ctx.sentData;

  if (action === 'PAGINATION') return displayFair(ctx, Number(page), embedColor);

  return executeBuyItem(
    ctx,
    await farmerRepository.getFarmer(ctx.user.id),
    (ctx.interaction as SelectMenuInteraction).data.values[0],
  );
};

export { executeExploreFair, listItemAutocomplete, executeButtonAction };
