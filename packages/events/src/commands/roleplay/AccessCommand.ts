import { ApplicationCommandOptionTypes } from 'discordeno/types';
import { createCommand } from '../../structures/command/createCommand';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';

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

    const embed = createEmbed({
      title: 'Ferreiro de Boleham',
      color: hexStringToNumber(ctx.authorData.selectedColor),
    });

    ctx.makeMessage({ embeds: [embed] });
  },
});

export default ChurchCommand;
