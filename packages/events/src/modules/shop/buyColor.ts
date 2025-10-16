import { TextStyles } from 'discordeno/types';
import shopRepository from '../../database/repositories/shopRepository.js';
import userRepository from '../../database/repositories/userRepository.js';
import ChatInputInteractionContext from '../../structures/command/ChatInputInteractionContext.js';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext.js';
import { EMOJIS } from '../../structures/constants.js';
import { ModalInteraction } from '../../types/interaction.js';
import {
  createActionRow,
  createCustomId,
  createSelectMenu,
  createTextInput,
} from '../../utils/discord/componentUtils.js';
import { extractFields } from '../../utils/discord/modalUtils.js';
import { colorPrices } from './constants.js';
import { debugError } from '../../utils/debugError.js';
import commandRepository from '../../database/repositories/commandRepository.js';

const executeBuyColorSelectComponent = async (ctx: ComponentInteractionContext): Promise<void> => {
  const availableColors = [
    {
      cor: '#6308c0' as const,
      price: colorPrices.purple,
      nome: `**${ctx.locale('commands:loja.colors.purple')}**`,
    },
    {
      cor: '#df0509' as const,
      price: colorPrices.red,
      nome: `**${ctx.locale('commands:loja.colors.red')}**`,
    },
    {
      cor: '#55e0f7' as const,
      price: colorPrices.cian,
      nome: `**${ctx.locale('commands:loja.colors.cian')}**`,
    },
    {
      cor: '#03fd1c' as const,
      price: colorPrices.green,
      nome: `**${ctx.locale('commands:loja.colors.green')}**`,
    },
    {
      cor: '#fd03c9' as const,
      price: colorPrices.pink,
      nome: `**${ctx.locale('commands:loja.colors.pink')}**`,
    },
    {
      cor: '#e2ff08' as const,
      price: colorPrices.yellow,
      nome: `**${ctx.locale('commands:loja.colors.yellow')}**`,
    },
    {
      cor: ctx.locale('commands:loja.colors.your_choice').replace('7 - ', '') as '#2',
      price: colorPrices.your_choice,
      nome: `**${ctx.locale('commands:loja.colors.your_choice')}**`,
    },
  ];

  const [selectedInteraction, chosenColorCode] = ctx.sentData;
  const authorData = await userRepository.ensureFindUser(ctx.user.id);

  if (selectedInteraction === 'SELECT') {
    const chosenColor = availableColors.find(
      (a) => a.cor === ctx.interaction.data.values?.[0].replace('7 - ', ''),
    );

    if (!chosenColor) {
      debugError(
        new Error(`A cor selecionada não existe. Selecao: ${ctx.interaction.data.values?.[0]}`),
      );

      const commandInfo = await commandRepository.getCommandInfo('menhera');

      ctx.makeMessage({
        components: [],
        embeds: [],
        content: ctx.prettyResponse('bug', 'common:general-failure', {
          commandId: commandInfo?._id,
        }),
      });

      return;
    }

    if (authorData.estrelinhas < chosenColor.price) {
      ctx.makeMessage({
        components: [],
        content: ctx.prettyResponse('error', 'commands:loja.buy_colors.poor'),
      });

      return;
    }

    if (chosenColor.cor.startsWith('#')) {
      ctx.makeMessage({
        components: [],
        content: ctx.prettyResponse('success', 'commands:loja.buy_colors.buy-success', {
          name: chosenColor.nome,
          price: chosenColor.price,
          stars: authorData.estrelinhas - chosenColor.price,
        }),
      });

      await shopRepository.executeBuyColor(ctx.user.id, chosenColor.price, {
        nome: chosenColor.nome,
        cor: chosenColor.cor,
      });

      return;
    }

    const hexInput = createTextInput({
      customId: 'HEX',
      minLength: 6,
      maxLength: 7,
      placeholder: '#F62B1C',
      label: ctx.locale('commands:loja.buy_colors.hex_input'),
      required: true,
      style: TextStyles.Short,
    });

    const nameInput = createTextInput({
      customId: 'NAME',
      minLength: 2,
      maxLength: 20,
      placeholder: ctx.locale('commands:loja.buy_colors.name_placeholder'),
      label: ctx.locale('commands:loja.buy_colors.name_input'),
      required: false,
      style: TextStyles.Short,
    });

    await ctx.respondWithModal({
      customId: createCustomId(0, ctx.user.id, ctx.originalInteractionId, 'MODAL', chosenColor.cor),
      title: ctx.locale('commands:loja.buy_colors.title'),
      components: [createActionRow([hexInput]), createActionRow([nameInput])],
    });
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const hexColor = extractFields(ctx.interaction as ModalInteraction).find(
    (a) => a.customId === 'HEX',
  )!.value;

  const colorName =
    extractFields(ctx.interaction as ModalInteraction).find((a) => a.customId === 'NAME')?.value ??
    ctx.locale('commands:loja.buy_colors.no-name', {
      number: authorData.colors.length,
    });

  if (colorName.length < 2)
    return ctx.makeMessage({
      content: ctx.prettyResponse('error', 'commands:loja.buy_colors.min-color-name'),
      components: [],
    });

  if (
    authorData.colors.some(
      (a) => `${a.cor}`.replace('#', '') === hexColor.replace('#', '') || a.nome === colorName,
    )
  ) {
    ctx.makeMessage({
      content: ctx.prettyResponse('yellow_circle', 'commands:loja.buy_colors.has-color'),
      components: [],
    });

    return;
  }

  const isHexColor = (hex: string) => hex.length === 6 && !Number.isNaN(Number(`0x${hex}`));

  if (!isHexColor(hexColor.replace('#', ''))) {
    ctx.makeMessage({
      content: ctx.prettyResponse('error', 'commands:loja.buy_colors.invalid-color'),
      components: [],
    });
    return;
  }

  const colorDataToUserProfile = {
    nome: colorName,
    cor: `#${hexColor.replace('#', '')}` as const,
  };

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const chosenColor = availableColors.find((a) => a.cor === chosenColorCode.replace('7 - ', ''))!;

  ctx.makeMessage({
    content: ctx.prettyResponse('success', 'commands:loja.buy_colors.yc-confirm', {
      color: hexColor,
      price: chosenColor.price,
      stars: authorData.estrelinhas - chosenColor.price,
    }),
    components: [],
  });

  await shopRepository.executeBuyColor(ctx.user.id, chosenColor.price, colorDataToUserProfile);
};

const buyColor = async (
  ctx: ChatInputInteractionContext,
  finishCommand: (args?: unknown) => void,
): Promise<void> => {
  const availableColors = [
    {
      cor: '#6308c0' as const,
      price: colorPrices.purple,
      nome: `**${ctx.locale('commands:loja.colors.purple')}**`,
    },
    {
      cor: '#df0509' as const,
      price: colorPrices.red,
      nome: `**${ctx.locale('commands:loja.colors.red')}**`,
    },
    {
      cor: '#55e0f7' as const,
      price: colorPrices.cian,
      nome: `**${ctx.locale('commands:loja.colors.cian')}**`,
    },
    {
      cor: '#03fd1c' as const,
      price: colorPrices.green,
      nome: `**${ctx.locale('commands:loja.colors.green')}**`,
    },
    {
      cor: '#fd03c9' as const,
      price: colorPrices.pink,
      nome: `**${ctx.locale('commands:loja.colors.pink')}**`,
    },
    {
      cor: '#e2ff08' as const,
      price: colorPrices.yellow,
      nome: `**${ctx.locale('commands:loja.colors.yellow')}**`,
    },
    {
      cor: ctx.locale('commands:loja.colors.your_choice').replace('7 - ', '') as '#2',
      price: colorPrices.your_choice,
      nome: `**${ctx.locale('commands:loja.colors.your_choice')}**`,
    },
  ];

  const selector = createSelectMenu({
    customId: createCustomId(0, ctx.author.id, ctx.originalInteractionId, 'SELECT'),
    minValues: 1,
    maxValues: 1,
    options: availableColors.reduce<{ label: string; description: string; value: string }[]>(
      (p, c) => {
        if (ctx.authorData.colors.some((a) => a.cor === c.cor)) return p;

        p.push({
          label: c.nome.replaceAll('**', ''),
          description: `${c.cor} | ${c.price} ${EMOJIS.estrelinhas}`,
          value: c.cor,
        });
        return p;
      },
      [],
    ),
  });

  ctx.makeMessage({
    content: ctx.prettyResponse('question', 'commands:loja.buy_colors.buy-text'),
    components: [createActionRow([selector])],
  });

  finishCommand();
};

export { buyColor, executeBuyColorSelectComponent };
