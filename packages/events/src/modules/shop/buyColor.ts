import { InteractionResponseTypes, TextStyles } from 'discordeno/types';
import { extractFields } from '../../utils/discord/modalUtils';
import shopRepository from '../../database/repositories/shopRepository';
import { bot } from '../../index';
import { SelectMenuInteraction } from '../../types/interaction';
import {
  collectModalResponse,
  collectResponseComponentInteraction,
} from '../../utils/discord/collectorUtils';
import ChatInputInteractionContext from '../../structures/command/ChatInputInteractionContext';
import { EMOJIS } from '../../structures/constants';
import {
  createActionRow,
  createSelectMenu,
  createTextInput,
  disableComponents,
  generateCustomId,
} from '../../utils/discord/componentUtils';
import { colorPrices } from './constants';

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
    customId: generateCustomId('SELECT', ctx.interaction.id),
    minValues: 1,
    maxValues: 1,
    options: availableColors.reduce<Array<{ label: string; description: string; value: string }>>(
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

  const selected = await collectResponseComponentInteraction<SelectMenuInteraction>(
    ctx.channelId,
    ctx.author.id,
    `${ctx.interaction.id}`,
    15_000,
    false,
  );

  if (!selected) {
    ctx.makeMessage({
      components: [createActionRow(disableComponents(ctx.locale('common:timesup'), [selector]))],
    });

    return finishCommand();
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const chosenColor = availableColors.find(
    (a) => a.cor === selected.data.values[0].replace('7 - ', ''),
  )!;

  if (ctx.authorData.estrelinhas < chosenColor.price) {
    bot.helpers.sendInteractionResponse(ctx.interaction.id, ctx.interaction.token, {
      type: InteractionResponseTypes.DeferredUpdateMessage,
    });

    ctx.makeMessage({
      components: [],
      content: ctx.prettyResponse('error', 'commands:loja.buy_colors.poor'),
    });

    return finishCommand();
  }

  if (chosenColor.cor.startsWith('#')) {
    bot.helpers.sendInteractionResponse(selected.id, selected.token, {
      type: InteractionResponseTypes.DeferredUpdateMessage,
    });

    await shopRepository.executeBuyColor(ctx.author.id, chosenColor.price, {
      nome: chosenColor.nome,
      cor: chosenColor.cor,
    });

    ctx.makeMessage({
      components: [],
      content: ctx.prettyResponse('success', 'commands:loja.buy_colors.buy-success', {
        name: chosenColor.nome,
        price: chosenColor.price,
        stars: ctx.authorData.estrelinhas - chosenColor.price,
      }),
    });

    return finishCommand();
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

  bot.helpers.sendInteractionResponse(selected.id, selected.token, {
    type: InteractionResponseTypes.Modal,
    data: {
      title: ctx.locale('commands:loja.buy_colors.title'),
      customId: generateCustomId('MODAL', ctx.interaction.id),
      components: [createActionRow([hexInput]), createActionRow([nameInput])],
    },
  });

  ctx.makeMessage({ content: ctx.prettyResponse('time', 'common:waiting-form'), components: [] });

  const response = await collectModalResponse(`${ctx.interaction.id}`, 35_000);

  if (!response) {
    ctx.makeMessage({
      content: ctx.prettyResponse('error', 'common:form-timesup'),
      components: [],
      embeds: [],
    });

    return finishCommand();
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const hexColor = extractFields(response).find((a) => a.customId === 'HEX')!.value;
  const colorName =
    extractFields(response).find((a) => a.customId === 'NAME')?.value ??
    ctx.locale('commands:loja.buy_colors.no-name', {
      number: ctx.authorData.colors.length,
    });

  if (
    ctx.authorData.colors.some(
      (a) => `${a.cor}`.replace('#', '') === hexColor.replace('#', '') || a.nome === colorName,
    )
  ) {
    ctx.makeMessage({
      content: ctx.prettyResponse('yellow_circle', 'commands:loja.buy_colors.has-color'),
      components: [],
    });

    return finishCommand();
  }

  const isHexColor = (hex: string) => hex.length === 6 && !Number.isNaN(Number(`0x${hex}`));

  if (!isHexColor(hexColor.replace('#', ''))) {
    ctx.makeMessage({
      content: ctx.prettyResponse('error', 'commands:loja.buy_colors.invalid-color'),
      components: [],
    });
    return finishCommand();
  }

  const colorDataToUserProfile = {
    nome: colorName,
    cor: `#${hexColor.replace('#', '')}` as const,
  };

  ctx.makeMessage({
    content: ctx.prettyResponse('success', 'commands:loja.buy_colors.yc-confirm', {
      color: hexColor,
      price: chosenColor.price,
      stars: ctx.authorData.estrelinhas - chosenColor.price,
    }),
    components: [],
  });

  shopRepository.executeBuyColor(ctx.author.id, chosenColor.price, colorDataToUserProfile);

  finishCommand();
};

export { buyColor };
