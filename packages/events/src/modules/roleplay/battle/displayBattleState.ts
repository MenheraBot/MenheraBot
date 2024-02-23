/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Embed } from 'discordeno/transformers';
import {
  createActionRow,
  createCustomId,
  createSelectMenu,
} from '../../../utils/discord/componentUtils';
import { createEmbed } from '../../../utils/discord/embedUtils';
import { millisToSeconds } from '../../../utils/miscUtils';
import { getStatusDisplayFields } from '../statusDisplay';
import { Ability, BattleTimerActionType, InBattleUser, PlayerVsEnviroment } from '../types';
import { getUserAvatar } from '../../../utils/discord/userUtils';
import cacheRepository from '../../../database/repositories/cacheRepository';
import { GenericContext } from '../../../types/menhera';
import { SECONDS_TO_CHOICE_ACTION_IN_BATTLE } from '../constants';
import { getAbility } from '../data/abilities';
import battleRepository from '../../../database/repositories/battleRepository';
import { checkDeath, keepNumbersPositive, lootEnemy } from './battleUtils';
import { DatabaseCharacterSchema } from '../../../types/database';
import { finishAdventure } from '../adventureManager';
import { startBattleTimer } from './battleTimers';
import { getKillQuery } from './killUser';
import roleplayRepository from '../../../database/repositories/roleplayRepository';

interface Choice {
  id: number;
  name: string;
  energyCost: number;
  effects: Ability['effects'];
}

const getAvailableChoices = (ctx: GenericContext, user: InBattleUser): Choice[] => [
  {
    id: 0,
    name: ctx.locale(`abilities:0.name`),
    energyCost: getAbility(0).energyCost,
    effects: [{ applyTo: 'enemy', type: 'damage', value: user.damage }],
  },
  ...user.abilitites.map((ab) => {
    const ability = getAbility(ab.id);

    return {
      id: ab.id,
      name: ctx.locale(`abilities:${ab.id}.name`),
      energyCost: ability.energyCost,
      effects: ability.effects,
    };
  }),
];

const displayBattleControlMessage = async (
  ctx: GenericContext,
  adventure: PlayerVsEnviroment,
): Promise<void> => {
  const user = await cacheRepository.getDiscordUser(adventure.user.id, true);

  if (!user) throw new Error(`Unable to fetch discord user for ID ${adventure.user.id}`);

  const statusEmbed = createEmbed({
    title: ctx.locale('commands:aventura.battle.title'),
    description: ctx.locale('commands:aventura.battle.kill'),
    thumbnail: {
      url: getUserAvatar(user, {
        enableGif: true,
      }),
    },
    fields: getStatusDisplayFields(ctx, adventure.user, adventure.enemy),
  });

  const choices = getAvailableChoices(ctx, adventure.user);

  const choicesEmbed = createEmbed({
    title: ctx.locale('commands:aventura.battle.actions'),
    description: ctx.locale('commands:aventura.battle.timeout', {
      unix: millisToSeconds(Date.now()) + SECONDS_TO_CHOICE_ACTION_IN_BATTLE,
    }),
    fields: choices.map((a) => ({
      name: a.name,
      value: ctx.locale('commands:aventura.battle.energy-cost', {
        cost: a.energyCost,
      }),
      inline: true,
    })),
  });

  ctx.makeMessage({
    embeds: [statusEmbed, choicesEmbed],
    content: '',
    components: [
      createActionRow([
        createSelectMenu({
          customId: createCustomId(0, adventure.user.id, ctx.commandId, 'USE_SKILL', adventure.id),
          options: choices.map((a) => ({ label: a.name, value: `${a.id}` })),
        }),
      ]),
    ],
  });

  startBattleTimer(`battle_timeout:${adventure.id}`, {
    battleId: adventure.id,
    executeAt: Date.now() + SECONDS_TO_CHOICE_ACTION_IN_BATTLE * 1000,
    type: BattleTimerActionType.TIMEOUT_CHOICE,
  });
};

const updateBattleMessage = async (
  ctx: GenericContext,
  adventure: PlayerVsEnviroment,
): Promise<void> => {
  keepNumbersPositive(adventure.user);
  keepNumbersPositive(adventure.enemy);

  const endReasons: Embed[] = [];

  if (checkDeath(adventure.enemy)) {
    const droppedItem = lootEnemy(adventure);

    const embed = createEmbed({
      title: ctx.prettyResponse('wink', 'commands:aventura.battle.enemy-dead'),
      description: ctx.locale('commands:aventura.battle.kill-message', {
        name: ctx.locale(`enemies:${adventure.enemy.id}.name`),
        level: adventure.enemy.level,
        amount: droppedItem.amount,
        itemName: ctx.locale(`items:${droppedItem.id}.name`),
      }),
    });

    endReasons.push(embed);
  }

  let extraQuery: Partial<DatabaseCharacterSchema> = {};

  if (checkDeath(adventure.user)) {
    const character = await roleplayRepository.getCharacter(adventure.user.id);

    extraQuery = getKillQuery(character);

    const embed = createEmbed({
      title: ctx.locale('commands:aventura.battle.you-dead'),
      description: ctx.locale('commands:aventura.battle.dead-description'),
    });

    endReasons.push(embed);
  }

  if (endReasons.length > 0) return finishAdventure(ctx, adventure, endReasons, extraQuery);

  await battleRepository.setAdventure(adventure);

  displayBattleControlMessage(ctx, adventure);
};

export { displayBattleControlMessage, updateBattleMessage };
