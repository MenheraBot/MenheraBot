import { IAbilitiesFile } from 'roleplay/Types';

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
        target: 'enemy',
        type: 'attack',
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
        target: 'enemy',
        type: 'attack',
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
        turns: 2,
        type: 'heal',
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
        value: 4,
      },
      {
        target: 'enemies',
        type: 'poison',
        turns: 2,
        value: 2,
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
        type: 'attack',
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
        target: 'enemy',
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
        target: 'enemy',
        type: 'blind',
        turns: 3,
      },
      {
        target: 'enemies',
        type: 'blind',
        turns: 2,
      },
      {
        target: 'enemies',
        type: 'attack',
        value: 13,
      },
      {
        target: 'enemy',
        type: 'poison',
        turns: 3,
        value: 7,
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
        target: 'enemy',
        type: 'degradation',
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
        type: 'blind',
        turns: 2,
        value: 12,
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
        target: 'enemy',
        type: 'attack',
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
        turns: 100,
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
    element: 'nature',
    turnsCooldown: 6,
    randomChoice: true,
    effects: [
      {
        target: 'allies',
        type: 'armor_buff',
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
        target: 'enemy',
        type: 'confusion',
        turns: 2,
      },
      {
        target: 'enemy',
        type: 'attack',
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
        target: 'enemy',
        type: 'confusion',
        value: 50,
        turns: 5,
      },
    ],
  },
  601: {
    cost: 10,
    element: 'light',
    turnsCooldown: 4,
    effects: [
      {
        target: 'enemy',
        type: 'attack',
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
        target: 'enemy',
        type: 'attack',
        value: 20,
      },
    ],
  },
};

export default Abilities;
