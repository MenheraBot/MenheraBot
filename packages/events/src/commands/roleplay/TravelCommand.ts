import { createCommand } from '../../structures/command/createCommand';
import roleplayRepository from '../../database/repositories/roleplayRepository';
import { MessageFlags } from '../../utils/discord/messageUtils';
import battleRepository from '../../database/repositories/battleRepository';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { getCompleteWorld } from '../../modules/roleplay/worldEnemiesManager';

const CharacterCommand = createCommand({
  path: '',
  name: 'viajar',
  nameLocalizations: { 'en-US': 'travel' },
  description: '「RPG」・Viaja para outro lugar do mundo',
  descriptionLocalizations: {
    'en-US': '「RPG」・Travel around the world',
  },
  category: 'roleplay',
  authorDataFields: ['selectedColor'],
  execute: async (ctx, finishCommand) => {
    finishCommand();

    const isUserInBattle = await battleRepository.isUserInBattle(ctx.user.id);

    if (isUserInBattle)
      return ctx.makeMessage({
        content: `Não é possível viajar enquanto você está em batalha.`,
        flags: MessageFlags.EPHEMERAL,
      });

    const character = await roleplayRepository.getCharacter(ctx.user.id);

    const locations = await getCompleteWorld();

    const embed = createEmbed({
      title: '🗺️ | Mapa de Boleham',
      color: hexStringToNumber(ctx.authorData.selectedColor),
      description: `📍 | Sua localização: ${character.location}`,
      fields: [
        {
          name: 'Densidade de inimigos',
          value: locations.map((a) => a.join(', ')).join('\n'),
        },
      ],
    });

    ctx.makeMessage({ embeds: [embed] });
  },
});

export default CharacterCommand;
