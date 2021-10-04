import { IClassesFile } from 'roleplay/Types';

const classes: { [key: number]: IClassesFile } = {
  1: {
    name: 'Assassin',
    baseAttributesPerLevel: {
      maxLife: 30,
      maxMana: 5,
      baseArmor: 3,
      baseDamage: 5,
      attackSkill: 4,
      abilitySkill: 2,
    },
    afinity: 'darkness',
    baseArmor: 3,
    baseDamage: 12,
    attackSkill: 50,
    baseLife: 100,
    baseMana: 10,
    abilitySkill: 13,
    availableWeapons: ['crossbow', 'dagger', 'knife', 'gladius'],
    availableArmors: ['light'],
  },
  2: {
    name: 'Hunter',
    afinity: 'nature',
    baseAttributesPerLevel: {
      maxLife: 40,
      maxMana: 5,
      baseArmor: 4,
      baseDamage: 5,
      attackSkill: 3,
      abilitySkill: 5,
    },
    baseArmor: 4,
    baseDamage: 9,
    attackSkill: 38,
    abilitySkill: 25,
    baseLife: 100,
    baseMana: 20,
    availableWeapons: ['bow', 'crossbow', 'gladius'],
    availableArmors: ['light', 'medium'],
  },
  3: {
    name: 'Reaper',
    afinity: 'darkness',
    baseAttributesPerLevel: {
      maxLife: 60,
      maxMana: 8,
      baseArmor: 3,
      baseDamage: 6,
      abilitySkill: 3,
      attackSkill: 3,
    },
    baseArmor: 2,
    baseDamage: 10,
    attackSkill: 30,
    abilitySkill: 33,
    baseLife: 100,
    baseMana: 10,
    availableWeapons: ['sickle', 'mace', 'chain', 'grimoire'],
    availableArmors: ['light'],
  },
  4: {
    name: 'Warrior',
    afinity: 'fire',
    baseAttributesPerLevel: {
      maxLife: 60,
      maxMana: 6,
      baseArmor: 5,
      baseDamage: 2,
      abilitySkill: 3,
      attackSkill: 2,
    },
    baseArmor: 9,
    baseDamage: 7,
    attackSkill: 35,
    abilitySkill: 21,
    baseLife: 130,
    baseMana: 10,
    availableWeapons: ['axe', 'sword', 'shield', 'mace'],
    availableArmors: ['light', 'medium', 'heavy'],
  },
  5: {
    name: 'Illusionist',
    afinity: 'gravity',
    baseAttributesPerLevel: {
      maxLife: 40,
      maxMana: 13,
      baseArmor: 3,
      baseDamage: 2,
      abilitySkill: 6,
      attackSkill: 2,
    },
    baseArmor: 3,
    baseDamage: 6,
    attackSkill: 16,
    baseLife: 100,
    baseMana: 10,
    abilitySkill: 50,
    availableWeapons: ['grimoire'],
    availableArmors: ['light'],
  },
  6: {
    name: 'Paladin',
    afinity: 'light',
    baseAttributesPerLevel: {
      maxLife: 50,
      maxMana: 6,
      baseArmor: 5,
      baseDamage: 3,
      abilitySkill: 4,
      attackSkill: 3,
    },
    baseArmor: 12,
    baseDamage: 5,
    attackSkill: 40,
    baseLife: 130,
    baseMana: 10,
    abilitySkill: 30,
    availableWeapons: ['shield', 'axe', 'mace'],
    availableArmors: ['light', 'medium', 'heavy'],
  },
};

export default classes;
