import { ButtonStyles, MessageFlags, TextStyles } from '@discordeno/bot';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext.js';
import userRepository from '../../database/repositories/userRepository.js';
import { hexStringToNumber } from '../../utils/discord/embedUtils.js';
import { getDisplayName } from '../../utils/discord/userUtils.js';
import fairRepository from '../../database/repositories/fairRepository.js';
import {
  MAXIMUM_PRICE_TO_SELL_IN_FAIR,
  MINIMUM_PRICE_TO_SELL_IN_FAIR,
  Plants,
} from './constants.js';
import {
  createButton,
  createContainer,
  createCustomId,
  createLabel,
  createSection,
  createSeparator,
  createTextDisplay,
  createTextInput,
} from '../../utils/discord/componentUtils.js';
import { InteractionContext } from '../../types/menhera.js';
import { DatabaseFeirinhaSchema, DatabaseUserSchema } from '../../types/database.js';
import { getPlantPrice, getQuality, getQualityEmoji } from './siloUtils.js';
import { ModalInteraction } from '../../types/interaction.js';
import { extractLayoutFields } from '../../utils/discord/modalUtils.js';
import { setComponentsV2Flag } from '../../utils/discord/messageUtils.js';
import i18next from 'i18next';

const handleModal = async (
  ctx: ComponentInteractionContext<ModalInteraction>,
  products: DatabaseFeirinhaSchema[],
  announcementId: string,
) => {
  const input = extractLayoutFields(ctx.interaction)[0].value ?? '';

  const announcement = products.find((a) => `${a._id}` === announcementId);

  if (!announcement) return executeAdministrateFair(ctx, 'EDIT_POST');

  const parsed = parseInt(input);

  const plantQuality = getQuality({ quality: announcement.plantQuality });

  const plantPrice = getPlantPrice({
    plant: announcement.plantType,
    quality: plantQuality,
  });

  const basePrice = Math.floor(plantPrice * announcement.weight);
  const minimumPrice = Math.floor(basePrice * MINIMUM_PRICE_TO_SELL_IN_FAIR);
  const maximumPrice = Math.floor(basePrice * MAXIMUM_PRICE_TO_SELL_IN_FAIR);

  if (Number.isNaN(parsed) || parsed < minimumPrice || parsed > maximumPrice)
    return ctx.respondInteraction({
      flags: setComponentsV2Flag(MessageFlags.Ephemeral),
      components: [
        createTextDisplay(
          ctx.prettyResponse('error', 'commands:fazendinha.admin.feirinha.price-range', {
            min: minimumPrice,
            max: maximumPrice,
          }),
        ),
      ],
    });

  const nameBr = `[${ctx.user.username}] ${getQualityEmoji(plantQuality)} ${announcement.weight} Kg ${i18next.getFixedT(
    'pt-BR',
  )(`data:plants.${announcement.plantType}`)} ${parsed}⭐`;

  const nameUs = `[${ctx.user.username}] ${getQualityEmoji(plantQuality)} ${announcement.weight} Kg ${i18next.getFixedT(
    'en-US',
  )(`data:plants.${announcement.plantType}`)} ${parsed}⭐`;

  await fairRepository.updateAnnouncementPrice(`${announcement._id}`, parsed, nameBr, nameUs);

  await executeAdministrateFair(ctx, 'EDIT_POST');

  await ctx.followUp({
    flags: setComponentsV2Flag(MessageFlags.Ephemeral),
    components: [
      createTextDisplay(
        ctx.prettyResponse('success', 'commands:fazendinha.admin.feirinha.edit-success'),
      ),
    ],
  });
};

const handleDissmissShop = async (ctx: ComponentInteractionContext): Promise<void> => {
  const products = await fairRepository.getUserProducts(ctx.user.id);

  const [action, itemId] = ctx.sentData;

  if (action === 'MODAL')
    return handleModal(ctx as ComponentInteractionContext<ModalInteraction>, products, itemId);

  if (itemId === '-1') return executeAdministrateFair(ctx, action as 'DELETE_POST');

  const announcement = products.find((a) => itemId === `${a._id}`);

  if (!announcement) return executeAdministrateFair(ctx, action as 'EDIT_POST');

  if (action === 'EDIT_POST') {
    const plantQuality = getQuality({ quality: announcement.plantQuality });

    const plantPrice = getPlantPrice({
      plant: announcement.plantType,
      quality: plantQuality,
    });

    const basePrice = Math.floor(plantPrice * announcement.weight);
    const minimumPrice = Math.floor(basePrice * MINIMUM_PRICE_TO_SELL_IN_FAIR);
    const maximumPrice = Math.floor(basePrice * MAXIMUM_PRICE_TO_SELL_IN_FAIR);

    const choiceText = ctx.locale('commands:fazendinha.feira.select-between', {
      min: minimumPrice,
      max: maximumPrice,
    });

    return ctx.respondWithModal({
      title: ctx.locale('commands:fazendinha.admin.feirinha.new-price'),
      customId: createCustomId(
        6,
        ctx.user.id,
        ctx.originalInteractionId,
        'MODAL',
        `${announcement._id}`,
      ),
      components: [
        createLabel({
          label: ctx.locale('commands:fazendinha.admin.feirinha.editing-price', {
            product: `${getQualityEmoji(plantQuality)} ${announcement.weight} Kg ${ctx.locale(
              `data:plants.${announcement.plantType}`,
            )}`,
          }),
          description: choiceText,
          component: createTextInput({
            customId: itemId,
            style: TextStyles.Short,
            minLength: `${minimumPrice}`.length,
            maxLength: `${maximumPrice}`.length,
            required: true,
            value: `${announcement.price}`,
          }),
        }),
      ],
    });
  }

  if (action === 'DELETE_POST') {
    if (typeof announcement === 'undefined')
      return ctx.makeLayoutMessage({
        components: [
          createTextDisplay(
            ctx.prettyResponse('error', 'commands:fazendinha.admin.feirinha.dont-exists'),
          ),
        ],
      });

    await fairRepository.deleteAnnouncement(announcement._id);

    return executeAdministrateFair(ctx, action);
  }
};

const executeAdministrateFair = async (
  ctx: InteractionContext,
  action: 'EDIT_POST' | 'DELETE_POST',
  authorData?: DatabaseUserSchema,
): Promise<void> => {
  const fromUser = await fairRepository.getUserProducts(ctx.user.id);

  const userData = authorData ?? (await userRepository.ensureFindUser(ctx.user.id));

  const container = createContainer({
    accentColor: hexStringToNumber(userData.selectedColor),
    components: [
      createSection({
        components: [
          createTextDisplay(
            `## ${ctx.locale('commands:fazendinha.feira.comprar.user-fair', { user: getDisplayName(ctx.user) })}`,
          ),
        ],
        accessory: createButton({
          style: ButtonStyles.Primary,
          disabled: fromUser.length === 0,
          customId: createCustomId(
            6,
            ctx.user.id,
            ctx.originalInteractionId,
            action === 'DELETE_POST' ? 'EDIT_POST' : 'DELETE_POST',
            -1,
          ),
          label: ctx.locale(
            `commands:fazendinha.admin.feirinha.${action === 'DELETE_POST' ? 'edit' : 'remove'}-announcements`,
          ),
        }),
      }),
    ],
  });

  const goBackContainer = createContainer({
    components: [
      createSection({
        accessory: createButton({
          label: ctx.locale('commands:fazendinha.admin.silo.goto-fields'),
          style: ButtonStyles.Primary,
          customId: createCustomId(5, ctx.user.id, ctx.originalInteractionId, 'ADMIN_FIELDS'),
        }),
        components: [
          createTextDisplay(
            `## ${ctx.locale('commands:fazendinha.admin.silo.goto-fields')}\n${ctx.locale('commands:fazendinha.admin.silo.manage-fields')}`,
          ),
        ],
      }),
    ],
  });

  if (fromUser.length === 0) {
    container.components.push(
      createTextDisplay(ctx.locale('commands:fazendinha.admin.feirinha.no-items-in-user-fair')),
    );

    return ctx.makeLayoutMessage({ components: [goBackContainer, container] });
  }

  fromUser.forEach((item) => {
    container.components.push(
      createSeparator(),
      createSection({
        accessory: createButton({
          label: ctx.locale(
            `commands:fazendinha.admin.feirinha.${action === 'DELETE_POST' ? 'remove' : 'edit'}-announcement`,
          ),
          style: action === 'DELETE_POST' ? ButtonStyles.Danger : ButtonStyles.Primary,
          customId: createCustomId(
            6,
            ctx.user.id,
            ctx.originalInteractionId,
            action,
            `${item._id}`,
          ),
        }),
        components: [
          createTextDisplay(`### ${item[`name_${ctx.interactionLocale}`]}`),
          createTextDisplay(
            `- ${item.price} :star:\n- ${Plants[item.plantType].emoji} ${item.weight} kg`,
          ),
        ],
      }),
    );
  });

  ctx.makeLayoutMessage({ components: [goBackContainer, container] });
};

export { executeAdministrateFair, handleDissmissShop };
