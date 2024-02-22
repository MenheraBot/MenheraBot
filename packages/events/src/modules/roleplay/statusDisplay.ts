import { DiscordEmbedField } from 'discordeno/types';
import { BattleEffect, InBattleEnemy, InBattleUser } from './types';
import { GenericContext } from '../../types/menhera';
import { EMOJIS } from '../../structures/constants';

const getEffectsText = (ctx: GenericContext, effects: BattleEffect[]): string =>
  effects.length > 0
    ? `\n**${ctx.locale('roleplay:common.effects')}:**\n- ${effects
        .map((a) =>
          ctx.locale('commands:aventura.battle.effect', {
            type: ctx.locale(`roleplay:effects.${a.type}`),
            amount: a.value,
            turns: a.timesToApply,
            dagger: EMOJIS.sword,
          }),
        )
        .join('\n- ')}`
    : '';

const getUserStatusDisplay = (ctx: GenericContext, user: InBattleUser): string =>
  ctx.locale('commands:aventura.user-stats-display', {
    life: user.life,
    energy: user.energy,
    damage: user.damage,
    effects: getEffectsText(ctx, user.effects),
  });

const getEnemyStatusDisplay = (ctx: GenericContext, enemy: InBattleEnemy): string =>
  ctx.locale('commands:aventura.enemy-stats-display', {
    life: enemy.life,
    damage: enemy.damage,
    effects: getEffectsText(ctx, enemy.effects),
  });

const getStatusDisplayFields = (
  ctx: GenericContext,
  user: InBattleUser,
  enemy: InBattleEnemy,
): DiscordEmbedField[] => [
  {
    name: ctx.locale('commands:aventura.your-stats'),
    value: getUserStatusDisplay(ctx, user),
    inline: true,
  },
  {
    name: ctx.locale('commands:aventura.enemy-stats', {
      level: enemy.level,
      name: 'CREATE ENEMIES.JSON',
    }),
    value: getEnemyStatusDisplay(ctx, enemy),
    inline: true,
  },
];

export { getStatusDisplayFields, getUserStatusDisplay };
