import { DiscordEmbedField } from 'discordeno/types';
import { InBattleEnemy, InBattleUser } from './types';
import { GenericContext } from '../../types/menhera';

const getUserStatusDisplay = (ctx: GenericContext, user: InBattleUser): string =>
  ctx.locale('commands:aventura.user-stats-display', {
    life: user.life,
    energy: user.energy,
    damage: user.damage,
  });

const getEnemyStatusDisplay = (ctx: GenericContext, enemy: InBattleEnemy): string =>
  ctx.locale('commands:aventura.enemy-stats-display', {
    life: enemy.life,
    damage: enemy.damage,
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
