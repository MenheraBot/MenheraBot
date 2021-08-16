import { IRacesFiles } from '../Types';

const races: { [key: number]: IRacesFiles } = {
  1: {
    name: 'elf',
    facility: {
      type: 'element',
      info: 'nature',
      value: 6,
      isPercentage: true,
    },
  },
  2: {
    name: 'goblin',
    facility: {
      type: 'loot',
      info: 'rare',
      value: 3,
      isPercentage: true,
    },
  },
  3: {
    name: 'human',
    facility: {
      type: 'element',
      info: 'fire',
      value: 6,
      isPercentage: true,
    },
  },
  4: {
    name: 'orc',
    facility: {
      type: 'armor',
      info: 'buff',
      value: 6,
      isPercentage: true,
    },
  },
  5: {
    name: 'chained',
    facility: {
      type: 'element',
      info: 'darkness',
      value: 6,
      isPercentage: true,
    },
  },
  6: {
    name: 'saint',
    facility: {
      type: 'element',
      info: 'light',
      value: 6,
      isPercentage: true,
    },
  },
};

export default races;
