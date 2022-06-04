import { EquipmentItem } from '@roleplay/Types';

/*
  100, 101, 102 - Reservados pros 3 iniciais
  1000 - Backpacks
  2000 - Armas
  3000 - Armaduras
*/

const Equipments: { [id: number]: EquipmentItem } = {
  100: {
    type: 'backpack',
    availableLocations: [0],
    levels: {
      1: {
        cost: 0,
        items: [],
        value: 10,
      },
      2: {
        cost: 60,
        items: [],
        value: 15,
      },
    },
  },
  101: {
    type: 'protection',
    availableLocations: [0],
    levels: {
      1: {
        cost: 0,
        items: [],
        value: 10,
      },
      2: {
        cost: 60,
        items: [],
        value: 15,
      },
    },
  },
  102: {
    type: 'weapon',
    availableLocations: [0],
    levels: {
      1: {
        cost: 0,
        items: [],
        value: 10,
      },
      2: {
        cost: 60,
        items: [],
        value: 20,
      },
    },
  },
  1000: {
    type: 'backpack',
    availableLocations: [0],
    levels: {
      1: {
        cost: 100,
        items: [4, 4, 4, 1, 1, 1],
        value: 20,
      },
      2: {
        cost: 60,
        items: [4, 4, 1],
        value: 30,
      },
    },
  },
};

export default Equipments;
