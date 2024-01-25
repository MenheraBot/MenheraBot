import { ButtonComponent, ButtonStyles } from 'discordeno/types';
import { createCommand } from '../../structures/command/createCommand';
import roleplayRepository from '../../database/repositories/roleplayRepository';
import { MessageFlags } from '../../utils/discord/messageUtils';
import battleRepository from '../../database/repositories/battleRepository';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { getCompleteWorld } from '../../modules/roleplay/worldEnemiesManager';
import { createActionRow, createButton, createCustomId } from '../../utils/discord/componentUtils';
import { TOTAL_MAP_SIZE } from '../../modules/roleplay/constants';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';

const executeStartTravel = async (ctx: ComponentInteractionContext): Promise<void> => {
  const isUserInBattle = await battleRepository.isUserInBattle(ctx.user.id);

  if (isUserInBattle)
    return ctx.makeMessage({
      content: `Não é possível viajar enquanto você está em batalha.`,
      components: [],
      embeds: [],
      flags: MessageFlags.EPHEMERAL,
    });

  const [x, y] = ctx.sentData;

  const character = await roleplayRepository.getCharacter(ctx.user.id);

  if (`${x}${y}` === `${character.location[0]}${character.location[1]}`)
    return ctx.respondInteraction({
      content: `Não é possível viajar para ${x}:${y}. Tu já está aí.`,
      flags: MessageFlags.EPHEMERAL,
    });

  await roleplayRepository.updateCharacter(ctx.user.id, { location: [Number(x), Number(y)] });

  ctx.makeMessage({
    content: `Tu tá partindo em uma viagem para ${x}:${y}`,
    components: [],
    embeds: [],
  });
};

const TravelCommand = createCommand({
  path: '',
  name: 'viajar',
  nameLocalizations: { 'en-US': 'travel' },
  description: '「RPG」・Viaja para outro lugar do mundo',
  descriptionLocalizations: {
    'en-US': '「RPG」・Travel around the world',
  },
  category: 'roleplay',
  commandRelatedExecutions: [executeStartTravel],
  authorDataFields: ['selectedColor'],
  execute: async (ctx, finishCommand) => {
    finishCommand();

    const isUserInBattle = await battleRepository.isUserInBattle(ctx.user.id);

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

    const buttons = Array.from({ length: TOTAL_MAP_SIZE[0] }).map((_, i) =>
      createActionRow(
        Array.from({ length: TOTAL_MAP_SIZE[1] }).map((__, j) =>
          createButton({
            label: `${i}:${j}`,
            style: ButtonStyles.Primary,
            disabled:
              isUserInBattle || `${i}${j}` === `${character.location[0]}${character.location[1]}`,
            customId: createCustomId(0, ctx.user.id, ctx.commandId, i, j),
          }),
        ) as [ButtonComponent],
      ),
    );

    ctx.makeMessage({ embeds: [embed], components: buttons });
  },
});

export default TravelCommand;
