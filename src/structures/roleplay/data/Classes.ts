import { IClassesFile } from '../Types';

const classes: { [key: number]: IClassesFile } = {
  1: {
    name: 'Assassin',
    baseAttributesPerLevel: {
      maxLife: 30,
      maxMana: 10,
      speed: 10,
      baseArmor: 3,
      baseDamage: 5,
      attackSkill: 4,
      abilityPower: 2,
    },
    availableWeapons: ['crossbow', 'dagger', 'knife', 'gladius'],
    availableArmors: ['light'],
  },
  2: {
    name: 'Hunter',
    baseAttributesPerLevel: {
      maxLife: 40,
      maxMana: 10,
      speed: 4,
      baseArmor: 4,
      baseDamage: 5,
      attackSkill: 3,
      abilityPower: 5,
    },
    availableWeapons: ['bow', 'crossbow', 'gladius'],
    availableArmors: ['light', 'medium'],
  },
  3: {
    name: 'Reaper',
    baseAttributesPerLevel: {
      maxLife: 60,
      maxMana: 12,
      speed: 6,
      baseArmor: 3,
      baseDamage: 6,
      abilityPower: 3,
      attackSkill: 3,
    },
    availableWeapons: ['sickle', 'mace', 'chain', 'grimoire'],
    availableArmors: ['light'],
  },
  4: {
    name: 'Warrior',
    baseAttributesPerLevel: {
      maxLife: 60,
      maxMana: 10,
      speed: 5,
      baseArmor: 5,
      baseDamage: 2,
      abilityPower: 3,
      attackSkill: 2,
    },
    availableWeapons: ['axe', 'sword', 'shield', 'mace'],
    availableArmors: ['light', 'medium', 'heavy'],
  },
  5: {
    name: 'Illusionist',
    baseAttributesPerLevel: {
      maxLife: 40,
      maxMana: 13,
      speed: 9,
      baseArmor: 3,
      baseDamage: 2,
      abilityPower: 6,
      attackSkill: 2,
    },
    availableWeapons: ['grimoire'],
    availableArmors: ['light'],
  },
  6: {
    name: 'Paladin',
    baseAttributesPerLevel: {
      maxLife: 50,
      maxMana: 13,
      speed: 7,
      baseArmor: 5,
      baseDamage: 3,
      abilityPower: 4,
      attackSkill: 3,
    },
    availableWeapons: ['shield', 'axe', 'mace'],
    availableArmors: ['light', 'medium', 'heavy'],
  },
};

export default classes;
