import { IRacesFiles } from 'roleplay/Types';

const races: { [key: number]: IRacesFiles } = {
  1: {
    name: 'elf',
    facility: {
      type: 'element',
      info: 'nature',
      value: 6,
    },
  },
  2: {
    name: 'goblin',
    facility: {
      type: 'loot',
      info: 'rare',
      value: 3,
    },
  },
  3: {
    name: 'human',
    facility: {
      type: 'element',
      info: 'fire',
      value: 6,
    },
  },
  4: {
    name: 'orc',
    facility: {
      type: 'armor',
      info: 'buff',
      value: 6,
    },
  },
  5: {
    name: 'chained',
    facility: {
      type: 'element',
      info: 'darkness',
      value: 6,
    },
  },
  6: {
    name: 'saint',
    facility: {
      type: 'element',
      info: 'light',
      value: 6,
    },
  },
};

export default races;
