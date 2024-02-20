import {
  ApplicationCommandOptionTypes,
  BigString,
  ButtonComponent,
  ButtonStyles,
} from 'discordeno/types';
import { createCommand } from '../../structures/command/createCommand';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import roleplayRepository from '../../database/repositories/roleplayRepository';
import { getItem } from '../../modules/roleplay/data/items';
import { InteractionContext } from '../../types/menhera';
import { createActionRow, createButton, createCustomId } from '../../utils/discord/componentUtils';

const availableLocales = ['SELL', 'BUY'] as const;

type Pages = (typeof availableLocales)[number];

const createBlacksmithNaviagtionButtons = (
  ctx: InteractionContext,
  current: Pages,
  selectedColor: string,
  userId: BigString,
): [ButtonComponent] =>
  availableLocales.map((a) =>
    createButton({
      label: a,
      style: ButtonStyles.Primary,
      disabled: a === current,
      customId: createCustomId(0, ctx.user.id, ctx.commandId, userId, a, selectedColor),
    }),
  ) as [ButtonComponent];

const ChurchCommand = createCommand({
  path: '',
  name: 'acessar',
  nameLocalizations: { 'en-US': 'access' },
  description: '「RPG」・Recupere sua vitalidade e fortaleça sua fé',
  descriptionLocalizations: {
    'en-US': '「RPG」・Recover your vitality and strengthen your faith',
  },
  options: [
    {
      type: ApplicationCommandOptionTypes.SubCommand,
      name: 'ferreiro',
      description: '「RPG」・Acessa o ferreiro de sua localização atual',
      nameLocalizations: {
        'en-US': 'blacksmith',
      },
      descriptionLocalizations: {
        'en-US': '「RPG」・Access the blacksmith from your current location',
      },
    },
  ],
  category: 'roleplay',
  authorDataFields: ['selectedColor'],
  execute: async (ctx, finishCommand) => {
    finishCommand();

    const character = await roleplayRepository.getCharacter(ctx.user.id);

    const embed = createEmbed({
      title: 'Ferreiro de Boleham',
      color: hexStringToNumber(ctx.authorData.selectedColor),
      description: character.inventory
        .map((a) => `-  **${a.amount}x** - ${getItem(a.id).$devName}`)
        .join('\n'),
    });

    const buttons = createBlacksmithNaviagtionButtons(
      ctx,
      'SELL',
      ctx.authorData.selectedColor,
      ctx.user.id,
    );

    ctx.makeMessage({ embeds: [embed], components: [createActionRow(buttons)] });
  },
});

export default ChurchCommand;
