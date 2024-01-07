import { DiscordEmbedField } from 'discordeno/types';
import { InBattleEnemy, InBattleUser } from './types';

const getUserStatusDisplay = (user: InBattleUser): string =>
  `:heart: **Vida**: ${user.life}\n:dagger: **Dano**: ${user.damage}`;

const getEnemyStatusDisplay = (enemy: InBattleEnemy): string =>
  `:heart: **Vida**: ${enemy.life}\n:dagger: **Dano**: ${enemy.damage}`;

const getStatusDisplayFields = (user: InBattleUser, enemy: InBattleEnemy): DiscordEmbedField[] => [
  {
    name: 'Seus Status',
    value: getUserStatusDisplay(user),
    inline: true,
  },
  {
    name: `Status de ${enemy.$devName} Lvl. ${enemy.level}`,
    value: getEnemyStatusDisplay(enemy),
    inline: true,
  },
];

export { getStatusDisplayFields };
