import { HuntMagicItems } from '../hunt/magicItems';
import { HuntProbablyBoostItem } from '../hunt/types';
import ChatInputInteractionContext from '../../structures/command/ChatInputInteractionContext';
import { COLORS } from '../../structures/constants';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { getUserAvatar } from '../../utils/discord/userUtils';
import { colorPrices, huntValues } from './constants';

const buyInfo = async (
  ctx: ChatInputInteractionContext,
  finishCommand: () => void,
): Promise<void> => {
  const type = ctx.getOption('tipo', false, true);

  if (type === 'colors') {
    const availableColors = [
      {
        cor: '#6308c0',
        price: colorPrices.purple,
        nome: `**${ctx.locale('commands:loja.colors.purple')}**`,
      },
      {
        cor: '#df0509',
        price: colorPrices.red,
        nome: `**${ctx.locale('commands:loja.colors.red')}**`,
      },
      {
        cor: '#55e0f7',
        price: colorPrices.cian,
        nome: `**${ctx.locale('commands:loja.colors.cian')}**`,
      },
      {
        cor: '#03fd1c',
        price: colorPrices.green,
        nome: `**${ctx.locale('commands:loja.colors.green')}**`,
      },
      {
        cor: '#fd03c9',
        price: colorPrices.pink,
        nome: `**${ctx.locale('commands:loja.colors.pink')}**`,
      },
      {
        cor: '#e2ff08',
        price: colorPrices.yellow,
        nome: `**${ctx.locale('commands:loja.colors.yellow')}**`,
      },
      {
        cor: 'SUA ESCOLHA',
        price: colorPrices.your_choice,
        nome: `**${ctx.locale('commands:loja.colors.your_choice')}**`,
      },
    ];

    const dataCores = {
      title: ctx.locale('commands:loja.dataCores_fields.title'),
      color: hexStringToNumber('#6cbe50'),
      thumbnail: {
        url: 'https://i.imgur.com/t94XkgG.png',
      },
      fields: [
        {
          name: ctx.locale('commands:loja.dataCores_fields.field_name'),
          value: availableColors
            .map(
              (c) =>
                `${c.nome} | ${ctx.locale('commands:loja.dataCores_fields.color_code')} \`${
                  c.cor
                }\` | ${ctx.locale('commands:loja.dataCores_fields.price')} **${c.price}**⭐`,
            )
            .join('\n'),
          inline: false,
        },
      ],
    };

    ctx.makeMessage({ embeds: [dataCores] });
    return finishCommand();
  }

  if (type === 'rolls') {
    const dataRolls = {
      title: ctx.locale('commands:loja.dataRolls_fields.title'),
      color: hexStringToNumber('#b66642'),
      thumbnail: {
        url: 'https://i.imgur.com/t94XkgG.png',
      },
      fields: [
        {
          name: ctx.locale('commands:loja.dataRolls_fields.fields.name'),
          value: ctx.locale('commands:loja.dataRolls_fields.fields.value', {
            price: huntValues.roll,
          }),
          inline: false,
        },
      ],
    };
    ctx.makeMessage({ embeds: [dataRolls] });
    return finishCommand();
  }

  if (type === 'items') {
    const itemsEmbed = createEmbed({
      title: ctx.locale('commands:loja.dataItems.title'),
      color: COLORS.Pinkie,
      thumbnail: { url: getUserAvatar(ctx.author, { enableGif: true }) },
      fields: [],
    });

    for (let i = 1; i <= 6; i++) {
      itemsEmbed.fields?.push({
        name: ctx.locale(`data:magic-items.${i as 1}.name`),
        value: ctx.locale('commands:loja.dataItems.description', {
          description: ctx.locale(`data:magic-items.${i as 1}.description`),
          cost: (HuntMagicItems[i] as HuntProbablyBoostItem).cost,
        }),
        inline: true,
      });
    }

    ctx.makeMessage({ embeds: [itemsEmbed] });
    finishCommand();
  }
};

export { buyInfo };
