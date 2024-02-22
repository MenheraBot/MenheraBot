/* eslint-disable no-continue */
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
import {
  calculateTravelDistance,
  calculateTravelTime,
  getInTravelMapButtons,
} from '../../modules/roleplay/mapUtils';
import { millisToSeconds, minutesToMillis } from '../../utils/miscUtils';
import { EMOJIS } from '../../structures/constants';

const numberToEmoji = {
  0: ':zero:',
  1: ':one:',
  2: ':two:',
  3: ':three:',
  4: ':four:',
  5: ':five:',
  6: ':six:',
  7: ':seven:',
  8: ':eight:',
  9: ':nine:',
};

const confirmTravel = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [x, y] = ctx.sentData;

  const character = await roleplayRepository.getCharacter(ctx.user.id);

  const newLocation: Location = [Number(x), Number(y)];
  const distanceToTravel = calculateTravelDistance(character.location, newLocation);
  const finishTravelAt =
    Date.now() + minutesToMillis(MINUTES_TO_TRAVEL_ONE_BLOCK) * distanceToTravel;

  const confirmButton = createButton({
    label: ctx.locale('commands:viajar.start-travel'),
    style: ButtonStyles.Success,
    customId: createCustomId(1, ctx.user.id, ctx.commandId, x, y),
  });

  ctx.makeMessage({
    components: [createActionRow([confirmButton])],
    embeds: [],
    content: ctx.locale('commands:viajar.confirm-message', {
      x,
      y,
      unix: millisToSeconds(finishTravelAt),
      cost: distanceToTravel * 10,
      emoji: EMOJIS.zap,
    }),
  });
};

const executeStartTravel = async (ctx: ComponentInteractionContext): Promise<void> => {
  const isUserInBattle = await battleRepository.isUserInBattle(ctx.user.id);

  if (isUserInBattle)
    return ctx.makeMessage({
      content: ctx.prettyResponse('chick', 'commands:viajar.in-battle'),
      components: [],
      embeds: [],
    });

  const [x, y] = ctx.sentData;

  const character = await roleplayRepository.getCharacter(ctx.user.id);

  if (`${x}${y}` === `${character.location[0]}${character.location[1]}`)
    return ctx.makeMessage({
      components: [],
      embeds: [],
      content: ctx.prettyResponse('error', 'commands:viajar.already-there'),
    });

  if (character.currentAction.type !== Action.NONE)
    return ctx.makeMessage({
      components: [],
      embeds: [],
      content: ctx.prettyResponse('error', 'commands:viajar.other-action'),
    });

  const newLocation: Location = [Number(x), Number(y)];
  const distanceToTravel = calculateTravelDistance(character.location, newLocation);
  const energyCost = distanceToTravel * 10;

  if (energyCost > character.energy)
    return ctx.makeMessage({
      content: ctx.prettyResponse('error', 'commands:viajar.too-tired', {
        x: newLocation[0],
        y: newLocation[1],
        cost: energyCost,
        amount: character.energy,
        emoji: EMOJIS.zap,
      }),
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
    content: ctx.prettyResponse('success', 'commands:viajar.start-travelling', {
      x,
      y,
      unix: Date.now() + minutesToMillis(MINUTES_TO_TRAVEL_ONE_BLOCK) * distanceToTravel,
    }),
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
      title: ctx.prettyResponse('map', 'commands:viajar.embed-title'),
      color: hexStringToNumber(ctx.authorData.selectedColor),
      description: `${ctx.prettyResponse('pin', 'roleplay:common.location')}: ${
        character.location
      }`,
      fields: [
        {
          name: ctx.locale('commands:viajar.enemy-density'),
          value: locations.map((a) => a.map((b) => numberToEmoji[b as 1]).join('  ')).join('\n'),
        },
      ],
    });

    const action = character.currentAction;
    let colorfy = false;
    let map: ButtonStyles[][] = [];

    if (action.type === Action.TRAVEL) {
      const finishAt = action.startAt + calculateTravelTime(action.from, action.to);

      embed.fields?.push({
        name: ctx.locale('commands:viajar.travelling'),
        value: ctx.locale('commands:viajar.in-travel', {
          x: action.to[0],
          y: action.to[1],
          unix: millisToSeconds(finishAt),
        }),
      });

      colorfy = true;
      map = getInTravelMapButtons(action.startAt, action.from, action.to, character.location);
    }

    const blockTravel = character.currentAction.type !== Action.NONE;

    const buttons = Array.from({ length: TOTAL_MAP_SIZE[0] }).map((_, i) =>
      createActionRow(
        Array.from({ length: TOTAL_MAP_SIZE[1] }).map((__, j) =>
          createButton({
            label: `${i}:${j}`,
            style: colorfy ? map[i][j] : ButtonStyles.Primary,
            disabled:
              blockTravel ||
              isUserInBattle ||
              `${i}${j}` === `${character.location[0]}${character.location[1]}`,
            customId: createCustomId(0, ctx.user.id, ctx.commandId, i, j),
          }),
        ) as [ButtonComponent],
      ),
    );

    (buttons[character.location[0]].components[character.location[1]] as ButtonComponent).style =
      ButtonStyles.Success;

    ctx.makeMessage({ embeds: [embed], components: buttons });
  },
});

export default TravelCommand;
