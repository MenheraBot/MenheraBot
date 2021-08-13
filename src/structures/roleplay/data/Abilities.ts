import { IAbilitiesFile } from '../Types';

const Abilities: { [key: number]: IAbilitiesFile } = {
  1: {
    classId: 1,
    cost: 5,
    turnsCooldown: 4,
    effects: [
      {
        target: 'self',
        turns: 1,
        type: 'invisibility',
      },
      {
        target: 'enemies',
        type: 'attack',
        amount: 1,
        value: 7,
      },
    ],
  },
  2: {
    classId: 1,
    cost: 16,
    turnsCooldown: 2,
    effects: [
      {
        target: 'enemies',
        type: 'attack',
        amount: 'ALL',
        value: 11,
      },
    ],
  },
  3: {
    classId: 1,
    cost: 20,
    turnsCooldown: 3,
    effects: [
      {
        target: 'enemies',
        type: 'attack',
        amount: 1,
        value: 16,
      },
    ],
  },
};

export default Abilities;
