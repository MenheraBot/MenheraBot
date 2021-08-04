import { IFamiliarFile } from '@utils/Types';

const familiars: IFamiliarFile = {
  1: {
    id: 1,
    boost: {
      name: 'boost_armor',
      type: 'armor',
      level_boost: 4,
      value: 10,
    },
    image: 'https://i.imgur.com/dizXBGy.png',
  },
  2: {
    id: 2,
    boost: {
      name: 'boost_damage',
      type: 'damage',
      level_boost: 7,
      value: 13,
    },
    image: 'https://i.imgur.com/4uKTjW1.png',
  },
  3: {
    id: 3,
    boost: {
      name: 'boost_ap',
      type: 'abilityPower',
      level_boost: 0.2,
      value: 1,
    },
    image: 'https://i.imgur.com/Fgmr0Ru.png',
  },
};

export default familiars;
