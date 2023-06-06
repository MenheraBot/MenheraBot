import { Attachment } from 'discordeno/transformers';
import {
  ActionRow,
  ButtonComponent,
  ButtonStyles,
  SelectMenuComponent,
  TextStyles,
} from 'discordeno/types';
import { bot } from '../..';
import cacheRepository from '../../database/repositories/cacheRepository';
import commandRepository from '../../database/repositories/commandRepository';
import profileImagesRepository from '../../database/repositories/profileImagesRepository';
import shopRepository from '../../database/repositories/shopRepository';
import starsRepository from '../../database/repositories/starsRepository';
import userRepository from '../../database/repositories/userRepository';
import userThemesRepository from '../../database/repositories/userThemesRepository';
import { getProfileImageUrl } from '../../structures/cdnManager';
import ChatInputInteractionContext from '../../structures/command/ChatInputInteractionContext';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import { COLORS } from '../../structures/constants';
import { ModalInteraction, SelectMenuInteraction } from '../../types/interaction';
import {
  createActionRow,
  createButton,
  createCustomId,
  createSelectMenu,
  createTextInput,
} from '../../utils/discord/componentUtils';
import { createEmbed } from '../../utils/discord/embedUtils';
import { MessageFlags } from '../../utils/discord/messageUtils';
import { extractFields } from '../../utils/discord/modalUtils';
import { getEnviroments } from '../../utils/getEnviroments';
import { customImagePrice } from './constants';

const { IMAGE_APPROVAL_CHANNEL_ID } = getEnviroments(['IMAGE_APPROVAL_CHANNEL_ID']);

const executeBuyImagesSelectComponent = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [type, stringPreview, stringImage] = ctx.sentData;

  const toPreview = stringPreview === 'true';
  const hasImage = stringImage === 'true';

  if (type === 'MODAL') {
    const imageName =
      extractFields(ctx.interaction as ModalInteraction).find((a) => a.customId === 'NAME')
        ?.value ?? 'Nenhum nome informado';

    await bot.helpers.sendMessage(BigInt(IMAGE_APPROVAL_CHANNEL_ID), {
      content: `Nome para a imagem de **${ctx.user.id}** (${ctx.user.username})\n\n\`${imageName}\``,
    });

    ctx.ack();

    return;
  }

  if (type === 'PREVIEW') {
    const messageComponents = ctx.interaction.message?.components as ActionRow[];

    (messageComponents[1].components[0] as ButtonComponent).customId = createCustomId(
      3,
      ctx.user.id,
      ctx.commandId,
      'PREVIEW',
      !toPreview,
      hasImage,
    );

    (messageComponents[1].components[0] as ButtonComponent).style = toPreview
      ? ButtonStyles.Danger
      : ButtonStyles.Success;

    (messageComponents[0].components[0] as SelectMenuComponent).customId = createCustomId(
      3,
      ctx.user.id,
      ctx.commandId,
      'SELECT',
      toPreview,
      hasImage,
    );

    ctx.makeMessage({
      components: messageComponents,
    });

    return;
  }

  const selectedImage = Number((ctx.interaction as SelectMenuInteraction).data.values[0]);

  if (toPreview) {
    if (selectedImage === -1)
      return ctx.respondInteraction({
        flags: MessageFlags.EPHEMERAL,
        content: ctx.prettyResponse('error', 'commands:loja.buy_images.no-preview-for-custom'),
      });

    return ctx.respondInteraction({
      flags: MessageFlags.EPHEMERAL,
      embeds: [
        createEmbed({
          title: ctx.locale('commands:loja.buy_images.preview-title', {
            name: await profileImagesRepository.getImageName(selectedImage),
          }),
          image: { url: getProfileImageUrl(selectedImage) },
          color: COLORS.Aqua,
        }),
      ],
    });
  }

  if (selectedImage !== -1) {
    const imageData = await profileImagesRepository.getImageInfo(selectedImage);

    if (!imageData)
      return ctx.makeMessage({
        components: [],
        content: ctx.prettyResponse('error', 'commands:loja.buy_images.no-image'),
      });

    const userData = await userRepository.ensureFindUser(ctx.user.id);

    if (imageData.price > userData.estrelinhas)
      return ctx.makeMessage({
        components: [],
        content: ctx.prettyResponse('error', 'commands:loja.buy_images.poor'),
      });

    const userThemes = await userThemesRepository.findEnsuredUserThemes(ctx.user.id);

    if (userThemes.profileImages.some((a) => a.id === selectedImage))
      return ctx.makeMessage({
        components: [],
        content: ctx.prettyResponse('error', 'commands:loja.buy_images.already-has'),
      });

    await shopRepository.executeBuyImage(ctx.user.id, selectedImage, imageData.price);

    const commandInfo = await commandRepository.getCommandInfo('personalizar');

    ctx.makeMessage({
      components: [],
      content: ctx.prettyResponse('success', 'commands:loja.buy_images.buy-success', {
        command: `</personalizar imagem:${commandInfo?.discordId}>`,
        name: imageData.name,
      }),
    });

    return;
  }

  if (!hasImage)
    return ctx.makeMessage({
      components: [],
      content: ctx.prettyResponse('error', 'commands:loja.buy_images.custom-selected-no-image'),
    });

  const attachment = await cacheRepository.getCustomImageAttachment(
    ctx.interaction.message?.interaction?.id ?? '',
  );

  if (!attachment)
    return ctx.makeMessage({
      components: [],
      content: ctx.prettyResponse('error', 'commands:loja.buy_images.no-attachment'),
    });

  if (attachment.contentType && attachment.contentType !== 'image/png')
    return ctx.makeMessage({
      components: [],
      content: ctx.prettyResponse('error', 'commands:loja.buy_images.content-type', {
        accept: 'PNG',
      }),
    });

  if (
    (attachment.width && attachment.width !== 1080) ||
    (attachment.height && attachment.height !== 720)
  )
    return ctx.makeMessage({
      components: [],
      content: ctx.prettyResponse('error', 'commands:loja.buy_images.size-err'),
    });

  const userData = await userRepository.ensureFindUser(ctx.user.id);

  if (customImagePrice > userData.estrelinhas)
    return ctx.makeMessage({
      components: [],
      content: ctx.prettyResponse('error', 'commands:loja.buy_images.poor'),
    });

  await starsRepository.removeStars(ctx.user.id, customImagePrice);

  const nameInput = createTextInput({
    customId: 'NAME',
    minLength: 3,
    maxLength: 20,
    placeholder: ctx.locale('commands:loja.buy_images.name_placeholder'),
    label: ctx.locale('commands:loja.buy_images.name_input'),
    required: false,
    style: TextStyles.Short,
  });

  await ctx.respondWithModal({
    title: ctx.locale('commands:loja.buy_images.modal-title'),
    customId: createCustomId(3, ctx.user.id, ctx.commandId, 'MODAL'),
    components: [createActionRow([nameInput])],
  });

  await ctx.makeMessage({
    components: [],
    content: ctx.prettyResponse('success', 'commands:loja.buy_images.custom-buy-waiting-approval'),
  });

  await bot.helpers.sendMessage(BigInt(IMAGE_APPROVAL_CHANNEL_ID), {
    content: `# Nova imagem para Approval\n\n**Uploader**: ${ctx.user.id} (${ctx.user.username})\n**Preço Pago**: ${customImagePrice}\n\n**URL**: \`${attachment.url} | ${attachment.proxyUrl}\`\n${attachment.url}`,
  });
};

// TODO(ySnoopyDogy): In the future, move this to website
const buyImages = async (
  ctx: ChatInputInteractionContext,
  finishCommand: (args?: unknown) => void,
): Promise<void> => {
  const alreadyBoughtImages = await userThemesRepository.findEnsuredUserThemes(ctx.author.id);

  const availableImages = await profileImagesRepository.getAvailableToBuyImages(
    alreadyBoughtImages.profileImages.map((a) => a.id),
  );

  const sentImage = ctx.getOption<Attachment>('sua_imagem', 'attachments');

  availableImages.push({
    id: -1,
    name: ctx.locale('commands:loja.buy_images.custom'),
    price: customImagePrice,
  });

  const previewButton = createButton({
    label: ctx.locale('commands:loja.buy_themes.preview-mode'),
    style: ButtonStyles.Success,
    customId: createCustomId(
      3,
      ctx.author.id,
      ctx.commandId,
      'PREVIEW',
      true,
      typeof sentImage !== 'undefined',
    ),
  });

  const selector = createSelectMenu({
    customId: createCustomId(
      3,
      ctx.author.id,
      ctx.commandId,
      'SELECT',
      false,
      typeof sentImage !== 'undefined',
    ),
    minValues: 1,
    maxValues: 1,
    options: availableImages.map((a) => ({
      label: a.name,
      value: `${a.id}`,
      description: ctx.locale('commands:loja.buy_images.price', { price: a.price }),
    })),
  });

  finishCommand();

  if (!sentImage)
    return ctx.makeMessage({
      content: ctx.prettyResponse('wink', 'commands:loja.buy_images.buy-text'),
      components: [createActionRow([selector]), createActionRow([previewButton])],
    });

  await cacheRepository.addCustomImageAttachment(ctx.interaction.id, sentImage);

  ctx.makeMessage({
    content: ctx.prettyResponse('wink', 'commands:loja.buy_images.buy-text-with-custom', {
      time: 10,
      option: ctx.locale('commands:loja.buy_images.custom'),
    }),
    components: [createActionRow([selector]), createActionRow([previewButton])],
  });
};

export { buyImages, executeBuyImagesSelectComponent };
