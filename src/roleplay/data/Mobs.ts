import { IMobsFile } from '@roleplay/Types';

const mobs: { [key: number]: IMobsFile } = {
  1: {
    description: 'Pequeno goblin para começar a aventura',
    availableLocations: [2],
    baseArmor: 1,
    baseDamage: 1,
    baseLife: 20,
    baseSkill: 2,
    baseSpeed: 10,
    perLevel: {
      baseArmor: 1,
      baseDamage: 1,
      baseLife: 3,
      baseSkill: 1,
      baseSpeed: 2,
    },
    availableAttacks: [0],
    isLocationBuilding: true,
    minUserLevel: 1,
  },
};

export default mobs;
