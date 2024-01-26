import { ButtonComponent, ButtonStyles } from 'discordeno/types';
import { createCommand } from '../../structures/command/createCommand';
import roleplayRepository from '../../database/repositories/roleplayRepository';
import battleRepository from '../../database/repositories/battleRepository';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { getCompleteWorld } from '../../modules/roleplay/worldEnemiesManager';
import { createActionRow, createButton, createCustomId } from '../../utils/discord/componentUtils';
import { MINUTES_TO_TRAVEL_ONE_BLOCK, TOTAL_MAP_SIZE } from '../../modules/roleplay/constants';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import { Action, Location } from '../../modules/roleplay/types';
import { calculateTravelDistance, calculateTravelTime } from '../../modules/roleplay/mapUtils';
import { millisToSeconds } from '../../utils/miscUtils';

const confirmTravel = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [x, y] = ctx.sentData;

  const character = await roleplayRepository.getCharacter(ctx.user.id);

  const newLocation: Location = [Number(x), Number(y)];
  const distanceToTravel = calculateTravelDistance(character.location, newLocation);
  const finishTravelAt = Date.now() + 1000 * 60 * MINUTES_TO_TRAVEL_ONE_BLOCK * distanceToTravel;

  const confirmButton = createButton({
    label: 'Iniciar viagem',
    style: ButtonStyles.Success,
    customId: createCustomId(1, ctx.user.id, ctx.commandId, x, y),
  });

  ctx.makeMessage({
    components: [createActionRow([confirmButton])],
    embeds: [],
    content: `Tu tem certeza de que quer iniciar uma viagem para **${x}:${y}**?\nEssa viagem custará ${
      distanceToTravel * 10
    } de energia.\nTu vai chegar no teu destino final <t:${millisToSeconds(
      finishTravelAt,
    )}:R> (<t:${millisToSeconds(finishTravelAt)}>)`,
  });
};

const executeStartTravel = async (ctx: ComponentInteractionContext): Promise<void> => {
  const isUserInBattle = await battleRepository.isUserInBattle(ctx.user.id);

  if (isUserInBattle)
    return ctx.makeMessage({
      content: `Não é possível viajar enquanto você está em batalha.`,
      components: [],
      embeds: [],
    });

  const [x, y] = ctx.sentData;

  const character = await roleplayRepository.getCharacter(ctx.user.id);

  if (`${x}${y}` === `${character.location[0]}${character.location[1]}`)
    return ctx.makeMessage({
      components: [],
      embeds: [],
      content: `Não é possível viajar para ${x}:${y}. Tu já está aí.`,
    });

  if (character.currentAction.type !== Action.NONE)
    return ctx.makeMessage({
      components: [],
      embeds: [],
      content: `Você não pode viajar no momento, pois está fazendo outra coisa`,
    });

  const newLocation: Location = [Number(x), Number(y)];
  const distanceToTravel = calculateTravelDistance(character.location, newLocation);
  const energyCost = distanceToTravel * 10;

  if (energyCost > character.energy)
    return ctx.makeMessage({
      content: `Para viajar até ${newLocation} você precisa de **${energyCost}** :zap: energia! Você apenas possui **${character.energy} :zap:**`,
      components: [],
      embeds: [],
    });

  await roleplayRepository.updateCharacter(ctx.user.id, {
    location: newLocation,
    energy: character.energy - energyCost,
    currentAction: {
      startAt: Date.now(),
      from: character.location,
      to: newLocation,
      type: Action.TRAVEL,
    },
  });

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
  commandRelatedExecutions: [confirmTravel, executeStartTravel],
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

    if (character.currentAction.type === Action.TRAVEL) {
      const finishAt =
        character.currentAction.startAt +
        calculateTravelTime(character.currentAction.from, character.currentAction.to);

      embed.fields?.push({
        name: 'Viajando',
        value: `Tu ta em uma viajem para ${
          character.currentAction.to
        }.\nTu vai chegar no teu destino <t:${millisToSeconds(finishAt)}:R>`,
      });
    }

    const buttons = Array.from({ length: TOTAL_MAP_SIZE[0] }).map((_, i) =>
      createActionRow(
        Array.from({ length: TOTAL_MAP_SIZE[1] }).map((__, j) =>
          createButton({
            label: `${i}:${j}`,
            style: ButtonStyles.Primary,
            disabled:
              isUserInBattle ||
              (embed.fields?.length ?? 0) > 1 ||
              `${i}${j}` === `${character.location[0]}${character.location[1]}`,
            customId: createCustomId(0, ctx.user.id, ctx.commandId, i, j),
          }),
        ) as [ButtonComponent],
      ),
    );

    ctx.makeMessage({ embeds: [embed], components: buttons });
  },
});

export default TravelCommand;
