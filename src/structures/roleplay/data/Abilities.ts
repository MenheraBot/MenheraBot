import { IAbilitiesFile } from '../Types';

const Abilities: { [key: number]: IAbilitiesFile } = {
  101: {
    cost: 5,
    turnsCooldown: 6,
    element: 'darkness',
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
  102: {
    cost: 16,
    turnsCooldown: 3,
    element: 'darkness',
    effects: [
      {
        target: 'enemies',
        type: 'attack',
        amount: 'ALL',
        value: 11,
      },
    ],
  },
  103: {
    cost: 20,
    turnsCooldown: 3,
    element: 'darkness',
    effects: [
      {
        target: 'enemies',
        type: 'attack',
        amount: 1,
        value: 16,
      },
    ],
  },
  104: {
    cost: 30,
    turnsCooldown: 8,
    element: 'fire',
    effects: [
      {
        target: 'self',
        type: 'speed',
        turns: 2,
        value: 20,
        isValuePercentage: true,
      },
    ],
  },
  201: {
    cost: 12,
    turnsCooldown: 3,
    element: 'nature',
    effects: [
      {
        target: 'enemies',
        type: 'attack',
        amount: 'ALL',
        value: 4,
      },
      {
        target: 'enemies',
        type: 'poison',
        amount: 'ALL',
        turns: 2,
        value: 2,
      },
      {
        target: 'enemies',
        type: 'slow',
        amount: 'ALL',
        turns: 2,
        value: 9,
        isValuePercentage: true,
      },
    ],
  },
  202: {
    cost: 20,
    element: 'nature',
    turnsCooldown: 8,
    effects: [
      {
        target: 'self',
        type: 'speed',
        turns: 4,
        value: 23,
        isValuePercentage: true,
      },
    ],
  },
  203: {
    cost: 22,
    element: 'nature',
    turnsCooldown: 6,
    effects: [
      {
        target: 'enemies',
        amount: 1,
        type: 'armor_penetration',
        value: 30,
        isValuePercentage: true,
      },
      {
        target: 'enemies',
        amount: 1,
        type: 'attack',
        value: 14,
      },
    ],
  },
  204: {
    cost: 20,
    element: 'prisma',
    turnsCooldown: 6,
    randomChoice: true,
    effects: [
      {
        target: 'enemies',
        type: 'blind',
        amount: 1,
        turns: 3,
      },
      {
        target: 'enemies',
        type: 'blind',
        amount: 'ALL',
        turns: 2,
      },
      {
        target: 'enemies',
        type: 'attack',
        amount: 3,
        value: 13,
      },
      {
        target: 'enemies',
        type: 'poison',
        amount: 1,
        turns: 3,
        value: 7,
      },
      {
        target: 'enemies',
        type: 'slow',
        amount: 'ALL',
        turns: 2,
        value: 30,
        isValuePercentage: true,
      },
    ],
  },
  301: {
    cost: 12,
    turnsCooldown: 4,
    element: 'darkness',
    effects: [
      {
        target: 'enemies',
        type: 'vampirism',
        amount: 'ALL',
        value: 4,
      },
    ],
  },
  302: {
    cost: 24,
    turnsCooldown: 8,
    element: 'darkness',
    effects: [
      {
        target: 'enemies',
        type: 'slow',
        amount: 1,
        turns: 1,
      },
      {
        target: 'enemies',
        type: 'degradation',
        amount: 1,
        value: 2,
        turns: 5,
        isValuePercentage: true,
      },
    ],
  },
  303: {
    cost: 15,
    element: 'gravity',
    turnsCooldown: 5,
    effects: [
      {
        target: 'enemies',
        type: 'slow',
        turns: 2,
        value: 4,
        amount: 'ALL',
        isValuePercentage: true,
      },
    ],
  },
  304: {
    cost: 10,
    element: 'fire',
    turnsCooldown: 5,
    effects: [
      {
        target: 'enemies',
        type: 'attack',
        amount: 1,
        value: 23,
      },
    ],
  },
  401: {
    cost: 9,
    element: 'light',
    turnsCooldown: 5,
    effects: [
      {
        target: 'self',
        type: 'life_buff',
        isValuePercentage: true,
        turns: 50,
        value: 8,
      },
    ],
  },
  402: {
    cost: 13,
    element: 'light',
    turnsCooldown: 3,
    effects: [
      {
        target: 'enemies',
        amount: 2,
        type: 'attack',
        value: 16,
      },
    ],
  },
  403: {
    cost: 25,
    element: 'nature',
    turnsCooldown: 6,
    effects: [
      {
        target: 'self',
        type: 'armor_buff',
        turns: 2,
        isValuePercentage: true,
        value: 4,
      },
    ],
  },
  404: {
    cost: 20,
    element: 'prisma',
    turnsCooldown: 6,
    randomChoice: true,
    effects: [
      {
        target: 'allies',
        type: 'armor_buff',
        amount: 'ALL',
        isValuePercentage: true,
        turns: 5,
        value: 3,
      },
    ],
  },
  501: {
    cost: 9,
    element: 'darkness',
    turnsCooldown: 3,
    effects: [
      {
        target: 'enemies',
        type: 'confusion',
        amount: 1,
        turns: 2,
      },
      {
        target: 'enemies',
        type: 'attack',
        amount: 1,
        value: 6,
      },
    ],
  },
  502: {
    cost: 15,
    element: 'darkness',
    turnsCooldown: 5,
    effects: [
      {
        target: 'enemies',
        type: 'degradation',
        turns: 4,
        amount: 'ALL',
        value: 3,
        isValuePercentage: true,
      },
    ],
  },
  503: {
    cost: 22,
    element: 'fire',
    turnsCooldown: 5,
    effects: [
      {
        target: 'enemies',
        type: 'attack',
        amount: 2,
        value: 15,
      },
    ],
  },
  504: {
    cost: 15,
    element: 'gravity',
    turnsCooldown: 3,
    effects: [
      {
        target: 'enemies',
        amount: 1,
        type: 'slow',
        value: 7,
        isValuePercentage: true,
      },
    ],
  },
  601: {
    cost: 10,
    element: 'light',
    turnsCooldown: 4,
    effects: [
      {
        target: 'enemies',
        type: 'attack',
        amount: 1,
        value: 7,
      },
    ],
  },
  602: {
    cost: 15,
    element: 'light',
    turnsCooldown: 6,
    effects: [
      {
        target: 'allies',
        type: 'heal',
        amount: 'ALL',
        value: 30,
        isValuePercentage: true,
      },
    ],
  },
  603: {
    cost: 20,
    element: 'light',
    turnsCooldown: 6,
    effects: [
      {
        target: 'allies',
        type: 'armor_buff',
        amount: 'ALL',
        turns: 3,
        value: 7,
        isValuePercentage: true,
      },
    ],
  },
  604: {
    cost: 8,
    element: 'nature',
    turnsCooldown: 3,
    effects: [
      {
        target: 'enemies',
        type: 'attack',
        amount: 1,
        value: 20,
      },
    ],
  },
};

export default Abilities;
