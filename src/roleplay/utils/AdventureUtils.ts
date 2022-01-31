import { ReadyToBattleEnemy, RoleplayUserSchema } from '@roleplay/Types';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { moreThanAnHour, RandomFromArray } from '@utils/Util';
import { EmbedFieldData } from 'discord.js-light';
import moment from 'moment';
import { getEnemies } from './DataUtils';

export const canGoToDungeon = (
  user: RoleplayUserSchema,
  ctx: InteractionCommandContext,
): { canGo: boolean; reason: EmbedFieldData[] } => {
  let canGo = true;
  const reason: EmbedFieldData[] = [];

  user.cooldowns.forEach((cd) => {
    if (cd.until > Date.now()) {
      canGo = false;
      reason.push({
        name: ctx.locale(`roleplay:cooldowns.${cd.reason as 'death'}`),
        value: ctx.locale(`roleplay:cooldowns.${cd.reason as 'death'}-description`, {
          time: moment.utc(cd.until).format(moreThanAnHour(cd.until) ? 'HH:mm:ss' : 'mm:ss'),
          subtime: ctx.locale(`common:${moreThanAnHour(cd.until) ? 'hours' : 'minutes'}`),
        }),
      });
    }
  });

  return { canGo, reason };
};

export const getDungeonEnemy = (dungeonLevel: number, userLevel: number): ReadyToBattleEnemy => {
  const availableEnemies = getEnemies().filter((a) => a.data.dungeonLevels.includes(dungeonLevel));

  const enemy = RandomFromArray(availableEnemies);

  const enemyLevel = userLevel * (Math.floor(Math.random() * 10) + 1);

  const enemyData: ReadyToBattleEnemy = {
    id: enemy.id,
    life: enemy.data.baseLife + enemy.data.perLevel.baseLife * enemyLevel,
    armor: enemy.data.baseArmor + enemy.data.perLevel.baseArmor * enemyLevel,
    damage: enemy.data.baseDamage + enemy.data.perLevel.baseDamage * enemyLevel,
    attacks: enemy.data.attacks.map((b) => ({
      id: b.id,
      damage: b.baseDamage + b.perLevelDamage * enemyLevel,
    })),
    experience: enemy.data.experience + enemy.data.perLevel.experience * enemyLevel,
    level: enemyLevel,
    loots: enemy.data.loots,
  };

  return enemyData;
};
