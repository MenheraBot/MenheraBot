import { EnemiesFile } from '@roleplay/Types';

const Enemies: { [id: number]: EnemiesFile } = {
  1: {
    dungeonLevels: [1],
    baseDamage: 43,
    baseLife: 100,
    baseArmor: 4,
    perLevel: {
      baseDamage: 8,
      baseLife: 30,
      baseArmor: 3,
      experience: 10,
    },
    experience: 10,
    loots: [
      [
        { id: 1, level: 2 },
        { id: 1, level: 2 },
        { id: 1, level: 3 },
        { id: 2, level: 2 },
      ],
    ],
    attacks: [{ id: 1, baseDamage: 20, perLevelDamage: 5 }],
  },
};

export default Enemies;
