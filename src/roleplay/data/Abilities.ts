import { AbilitiesFile } from '../Types';

const Abilities: { [id: number]: AbilitiesFile } = {
  6666: {
    DevDesc: 'Raízes do Mundo [BETA]',
    cost: 30,
    costPerLevel: 20,
    parentId: 0,
    unlockCost: 0,
    effects: [
      {
        target: 'enemy',
        durationInTurns: -1,
        effectType: 'damage',
        element: 'NEUTRAL',
        effectValue: 60,
        effectValueByIntelligence: 40,
        effectValuePerLevel: 80,
        effectValueModifier: 'plain',
        effectValueRefflection: 'plain',
      },
      {
        target: 'self',
        durationInTurns: -1,
        effectType: 'heal',
        element: 'NATURE',
        effectValue: 20,
        effectValueByIntelligence: 0,
        effectValuePerLevel: 0,
        effectValueModifier: 'percentage',
        effectValueRefflection: 'maxLife',
      },
    ],
  },
  100: {
    DevDesc: 'Lamina Envenenada (assassino)',
    cost: 20,
    costPerLevel: 30,
    parentId: 0,
    unlockCost: 0,
    effects: [
      {
        durationInTurns: 3,
        effectType: 'poison',
        effectValue: 5,
        effectValueByIntelligence: 0,
        effectValueModifier: 'percentage',
        effectValuePerLevel: 0,
        effectValueRefflection: 'maxLife',
        element: 'NATURE',
        target: 'enemy',
      },
    ],
  },
  101: {
    DevDesc: 'Golpes Destemidos (assassino)',
    cost: 60,
    costPerLevel: 10,
    parentId: 100,
    unlockCost: 10,
    effects: [
      {
        durationInTurns: -1,
        effectType: 'damage',
        effectValue: 62,
        effectValueByIntelligence: 20,
        effectValuePerLevel: 78,
        effectValueModifier: 'plain',
        effectValueRefflection: 'plain',
        element: 'FIRE',
        target: 'enemy',
      },
    ],
  },
  102: {
    DevDesc: 'Atras de Você! (Assassino)',
    cost: 80,
    costPerLevel: 10,
    parentId: 101,
    unlockCost: 10,
    effects: [
      {
        durationInTurns: -1,
        effectType: 'damage',
        effectValue: 91,
        effectValueByIntelligence: 80,
        effectValueModifier: 'plain',
        effectValuePerLevel: 110,
        effectValueRefflection: 'plain',
        element: 'FIRE',
        target: 'enemy',
      },
      {
        durationInTurns: 3,
        effectType: 'agility_buff',
        effectValue: 25,
        effectValueByIntelligence: 0,
        effectValueModifier: 'plain',
        effectValuePerLevel: 20,
        effectValueRefflection: 'plain',
        element: 'AIR',
        target: 'self',
      },
    ],
  },
  103: {
    DevDesc: 'Golpe Desleal (assassino)',
    cost: 80,
    costPerLevel: 5,
    parentId: 102,
    unlockCost: 25,
    effects: [
      {
        durationInTurns: 1,
        effectType: 'armor_debuff',
        effectValue: 10,
        effectValueByIntelligence: 0,
        effectValueModifier: 'percentage',
        effectValuePerLevel: 0,
        effectValueRefflection: 'armor',
        element: 'NEUTRAL',
        target: 'enemy',
      },
      {
        durationInTurns: -1,
        effectType: 'damage',
        effectValue: 68,
        effectValueByIntelligence: 40,
        effectValueModifier: 'plain',
        effectValuePerLevel: 38,
        effectValueRefflection: 'plain',
        element: 'FIRE',
        target: 'enemy',
      },
    ],
  },
  104: {
    DevDesc: 'Frenesi (assassino)',
    cost: 80,
    costPerLevel: 10,
    effects: [
      {
        durationInTurns: -1,
        effectType: 'damage',
        effectValue: 90,
        effectValueByIntelligence: 80,
        effectValueModifier: 'plain',
        effectValuePerLevel: 60,
        effectValueRefflection: 'plain',
        element: 'FIRE',
        target: 'enemy',
      },
      {
        durationInTurns: 3,
        effectType: 'damage_buff',
        effectValue: 10,
        effectValueByIntelligence: 0,
        effectValueModifier: 'percentage',
        effectValuePerLevel: 0,
        effectValueRefflection: 'damage',
        element: 'LIGHT',
        target: 'self',
      },
    ],
    parentId: 101,
    unlockCost: 25,
  },
  200: {
    DevDesc: 'Benção Elemental (Mago)',
    cost: 50,
    costPerLevel: 5,
    effects: [
      {
        durationInTurns: -1,
        effectType: 'damage',
        effectValue: 40,
        effectValueByIntelligence: 80,
        effectValueModifier: 'plain',
        effectValuePerLevel: 70,
        effectValueRefflection: 'plain',
        element: 'WATER',
        target: 'enemy',
      },
      {
        durationInTurns: -1,
        effectType: 'heal',
        effectValue: 30,
        effectValueByIntelligence: 40,
        effectValueModifier: 'plain',
        effectValuePerLevel: 40,
        effectValueRefflection: 'plain',
        element: 'NATURE',
        target: 'self',
      },
    ],
    parentId: 0,
    unlockCost: 0,
  },
  201: {
    DevDesc: 'Raio de Luz Solar (Mago)',
    cost: 80,
    costPerLevel: 10,
    effects: [
      {
        durationInTurns: -1,
        effectType: 'damage',
        effectValue: 35,
        effectValueByIntelligence: 85,
        effectValueModifier: 'plain',
        effectValuePerLevel: 35,
        effectValueRefflection: 'plain',
        element: 'LIGHT',
        target: 'enemy',
      },
    ],
    parentId: 200,
    unlockCost: 10,
  },
  202: {
    DevDesc: 'Rosário (Mago)',
    cost: 80,
    costPerLevel: 10,
    effects: [
      {
        durationInTurns: -1,
        effectType: 'damage',
        effectValue: 35,
        effectValueByIntelligence: 90,
        effectValueModifier: 'plain',
        effectValuePerLevel: 75,
        effectValueRefflection: 'plain',
        element: 'LIGHT',
        target: 'enemy',
      },
      {
        durationInTurns: -1,
        effectType: 'heal',
        effectValue: 5,
        effectValueByIntelligence: 0,
        effectValueModifier: 'percentage',
        effectValuePerLevel: 0,
        effectValueRefflection: 'maxLife',
        element: 'LIGHT',
        target: 'self',
      },
    ],
    unlockCost: 25,
    parentId: 201,
  },
  203: {
    DevDesc: 'Ascenção Espiritual (mago)',
    cost: 80,
    costPerLevel: 10,
    effects: [
      {
        durationInTurns: -1,
        effectType: 'damage',
        effectValue: 35,
        effectValueByIntelligence: 80,
        effectValueModifier: 'plain',
        effectValuePerLevel: 50,
        effectValueRefflection: 'plain',
        element: 'WATER',
        target: 'enemy',
      },
      {
        durationInTurns: -1,
        effectType: 'heal',
        effectValue: 10,
        effectValueByIntelligence: 60,
        effectValueModifier: 'plain',
        effectValuePerLevel: 10,
        effectValueRefflection: 'plain',
        element: 'LIGHT',
        target: 'self',
      },
    ],
    parentId: 200,
    unlockCost: 10,
  },
  204: {
    DevDesc: 'Manipulação Éterea (Mago)',
    cost: 100,
    costPerLevel: 20,
    effects: [
      {
        durationInTurns: -1,
        effectType: 'damage',
        effectValue: 20,
        effectValueByIntelligence: 0,
        effectValueModifier: 'percentage',
        effectValuePerLevel: 3,
        effectValueRefflection: 'maxLife',
        element: 'DARK',
        target: 'enemy',
      },
    ],
    parentId: 203,
    unlockCost: 25,
  },
  300: {
    DevDesc: 'Castigo Eterno (Ilusionista)',
    cost: 25,
    costPerLevel: 10,
    effects: [
      {
        durationInTurns: 2,
        effectType: 'armor_debuff',
        effectValue: 17,
        effectValueByIntelligence: 20,
        effectValueModifier: 'plain',
        effectValuePerLevel: 2,
        effectValueRefflection: 'armor',
        element: 'DARK',
        target: 'enemy',
      },
      {
        durationInTurns: 2,
        effectType: 'damage',
        effectValue: 16,
        effectValueByIntelligence: 70,
        effectValueModifier: 'plain',
        effectValuePerLevel: 34,
        effectValueRefflection: 'plain',
        element: 'DARK',
        target: 'enemy',
      },
    ],
    parentId: 0,
    unlockCost: 0,
  },
  301: {
    DevDesc: 'Dama de Ferro (Ilusionista)',
    cost: 90,
    costPerLevel: 20,
    effects: [
      {
        durationInTurns: -1,
        effectType: 'damage',
        effectValue: 40,
        effectValueByIntelligence: 85,
        effectValueModifier: 'plain',
        effectValuePerLevel: 110,
        effectValueRefflection: 'plain',
        element: 'DARK',
        target: 'enemy',
      },
    ],
    parentId: 300,
    unlockCost: 10,
  },
  302: {
    DevDesc: 'Invocar Bahamut (Ilusionista)',
    cost: 130,
    costPerLevel: 30,
    effects: [
      {
        durationInTurns: -1,
        effectType: 'damage',
        effectValue: 120,
        effectValueByIntelligence: 100,
        effectValueModifier: 'plain',
        effectValuePerLevel: 130,
        effectValueRefflection: 'plain',
        element: 'DARK',
        target: 'enemy',
      },
    ],
    unlockCost: 25,
    parentId: 301,
  },
  303: {
    DevDesc: 'Distorção Mental (Ilusionista)',
    cost: 50,
    costPerLevel: 10,
    effects: [
      {
        durationInTurns: -1,
        effectType: 'damage',
        effectValue: 34,
        effectValueByIntelligence: 80,
        effectValueModifier: 'plain',
        effectValuePerLevel: 40,
        effectValueRefflection: 'plain',
        element: 'DARK',
        target: 'enemy',
      },
    ],
    unlockCost: 10,
    parentId: 300,
  },
  304: {
    DevDesc: 'Merlyer (Ilusionista)',
    cost: 110,
    costPerLevel: 25,
    effects: [
      {
        durationInTurns: -1,
        effectType: 'damage',
        effectValue: 130,
        effectValueByIntelligence: 95,
        effectValueModifier: 'plain',
        effectValuePerLevel: 160,
        effectValueRefflection: 'plain',
        element: 'DARK',
        target: 'enemy',
      },
    ],
    unlockCost: 25,
    parentId: 303,
  },
  400: {
    DevDesc: 'Avanço com Escudo (Paladino)',
    cost: 20,
    costPerLevel: 15,
    effects: [
      {
        durationInTurns: -1,
        effectType: 'damage',
        effectValue: 50,
        effectValueByIntelligence: 60,
        effectValueModifier: 'plain',
        effectValuePerLevel: 70,
        effectValueRefflection: 'plain',
        element: 'NEUTRAL',
        target: 'enemy',
      },
      {
        durationInTurns: -1,
        effectType: 'heal',
        effectValue: 40,
        effectValueByIntelligence: 50,
        effectValueModifier: 'plain',
        effectValuePerLevel: 70,
        effectValueRefflection: 'plain',
        element: 'LIGHT',
        target: 'self',
      },
      {
        durationInTurns: 3,
        effectType: 'armor_buff',
        effectValue: 7,
        effectValueByIntelligence: 0,
        effectValueModifier: 'percentage',
        effectValuePerLevel: 1,
        effectValueRefflection: 'armor',
        element: 'LIGHT',
        target: 'self',
      },
    ],
    parentId: 0,
    unlockCost: 0,
  },
  401: {
    DevDesc: 'Proteção Divina (Paladino)',
    cost: 20,
    costPerLevel: 15,
    effects: [
      {
        durationInTurns: -1,
        effectType: 'damage',
        effectValue: 60,
        effectValueByIntelligence: 70,
        effectValueModifier: 'plain',
        effectValuePerLevel: 90,
        effectValueRefflection: 'plain',
        element: 'WATER',
        target: 'enemy',
      },
      {
        durationInTurns: 3,
        effectType: 'armor_buff',
        effectValue: 25,
        effectValueByIntelligence: 20,
        effectValueModifier: 'plain',
        effectValuePerLevel: 20,
        effectValueRefflection: 'plain',
        element: 'LIGHT',
        target: 'self',
      },
    ],
    unlockCost: 10,
    parentId: 400,
  },
  402: {
    DevDesc: 'Valkyria dos Céus (Paladino)',
    cost: 45,
    costPerLevel: 20,
    effects: [
      {
        durationInTurns: -1,
        effectType: 'damage',
        effectValue: 120,
        effectValueByIntelligence: 70,
        effectValueModifier: 'plain',
        effectValuePerLevel: 150,
        effectValueRefflection: 'plain',
        element: 'FIRE',
        target: 'enemy',
      },
      {
        durationInTurns: -1,
        effectType: 'heal',
        effectValue: 50,
        effectValueByIntelligence: 80,
        effectValueModifier: 'plain',
        effectValuePerLevel: 60,
        effectValueRefflection: 'plain',
        element: 'LIGHT',
        target: 'enemy',
      },
    ],
    unlockCost: 25,
    parentId: 401,
  },
  403: {
    DevDesc: 'Santíssima Trindade (Paladino)',
    cost: 50,
    costPerLevel: 15,
    effects: [
      {
        durationInTurns: 3,
        effectType: 'agility_buff',
        effectValue: 26,
        effectValueByIntelligence: 20,
        effectValueModifier: 'plain',
        effectValuePerLevel: 10,
        effectValueRefflection: 'plain',
        element: 'LIGHT',
        target: 'self',
      },
      {
        durationInTurns: 3,
        effectType: 'armor_buff',
        effectValue: 10,
        effectValueByIntelligence: 30,
        effectValueModifier: 'percentage',
        effectValuePerLevel: 2,
        effectValueRefflection: 'armor',
        element: 'LIGHT',
        target: 'self',
      },
      {
        durationInTurns: 3,
        effectType: 'damage_buff',
        effectValue: 20,
        effectValueByIntelligence: 50,
        effectValueModifier: 'percentage',
        effectValuePerLevel: 4,
        effectValueRefflection: 'damage',
        element: 'LIGHT',
        target: 'self',
      },
    ],
    unlockCost: 10,
    parentId: 400,
  },
  404: {
    DevDesc: 'D.A.E.L. (Paladino) [dragão anciao elemental da luz]',
    cost: 65,
    costPerLevel: 20,
    effects: [
      {
        durationInTurns: -1,
        effectType: 'damage',
        effectValue: 100,
        effectValueByIntelligence: 70,
        effectValueModifier: 'plain',
        effectValuePerLevel: 100,
        effectValueRefflection: 'plain',
        element: 'FIRE',
        target: 'enemy',
      },
      {
        durationInTurns: -1,
        effectType: 'heal',
        effectValue: 100,
        effectValueByIntelligence: 40,
        effectValueModifier: 'plain',
        effectValuePerLevel: 150,
        effectValueRefflection: 'plain',
        element: 'LIGHT',
        target: 'self',
      },
    ],
    parentId: 403,
    unlockCost: 25,
  },
  500: {
    DevDesc: 'Festa dos Mortos Vivos (necromante)',
    cost: 20,
    costPerLevel: 15,
    effects: [
      {
        durationInTurns: -1,
        effectType: 'damage',
        effectValue: 70,
        effectValueByIntelligence: 90,
        effectValueModifier: 'plain',
        effectValuePerLevel: 100,
        effectValueRefflection: 'plain',
        element: 'FIRE',
        target: 'enemy',
      },
    ],
    parentId: 0,
    unlockCost: 0,
  },
  501: {
    DevDesc: 'Possessão Total (necromante)',
    cost: 40,
    costPerLevel: 15,
    effects: [
      {
        durationInTurns: 3,
        effectType: 'armor_debuff',
        effectValue: 20,
        effectValueByIntelligence: 0,
        effectValueModifier: 'percentage',
        effectValuePerLevel: 3,
        effectValueRefflection: 'armor',
        element: 'DARK',
        target: 'enemy',
      },
      {
        durationInTurns: 3,
        effectType: 'damage_debuff',
        effectValue: 20,
        effectValueByIntelligence: 0,
        effectValueModifier: 'percentage',
        effectValuePerLevel: 0,
        effectValueRefflection: 'damage',
        element: 'DARK',
        target: 'enemy',
      },
    ],
    parentId: 500,
    unlockCost: 10,
  },
  502: {
    DevDesc: 'Nekros Manteia (necromante)',
    cost: 80,
    costPerLevel: 20,
    effects: [
      {
        durationInTurns: -1,
        effectType: 'damage',
        effectValue: 80,
        effectValueByIntelligence: 120,
        effectValueModifier: 'plain',
        effectValuePerLevel: 110,
        effectValueRefflection: 'plain',
        element: 'DARK',
        target: 'enemy',
      },
    ],
    parentId: 501,
    unlockCost: 25,
  },
  503: {
    DevDesc: 'Transfusão Post Mortem',
    cost: 50,
    costPerLevel: 15,
    effects: [
      {
        durationInTurns: 3,
        effectType: 'agility_debuff',
        effectValue: 25,
        effectValueByIntelligence: 0,
        effectValueModifier: 'percentage',
        effectValuePerLevel: 3,
        effectValueRefflection: 'agility',
        element: 'DARK',
        target: 'enemy',
      },
      {
        durationInTurns: 3,
        effectType: 'agility_buff',
        effectValue: 25,
        effectValueByIntelligence: 0,
        effectValueModifier: 'percentage',
        effectValuePerLevel: 3,
        effectValueRefflection: 'agility',
        element: 'LIGHT',
        target: 'self',
      },
      {
        durationInTurns: -1,
        effectType: 'damage',
        effectValue: 10,
        effectValueByIntelligence: 0,
        effectValueModifier: 'percentage',
        effectValuePerLevel: 2,
        effectValueRefflection: 'maxLife',
        element: 'DARK',
        target: 'enemy',
      },
    ],
    parentId: 500,
    unlockCost: 10,
  },
  504: {
    DevDesc: 'Surge Luciferum',
    cost: 100,
    costPerLevel: 20,
    effects: [
      {
        durationInTurns: -1,
        effectType: 'damage',
        effectValue: 100,
        effectValueByIntelligence: 110,
        effectValueModifier: 'plain',
        effectValuePerLevel: 200,
        effectValueRefflection: 'plain',
        element: 'DARK',
        target: 'enemy',
      },
    ],
    parentId: 503,
    unlockCost: 25,
  },
  600: {
    DevDesc: 'Esfera Prismática (arquimago)',
    cost: 40,
    costPerLevel: 20,
    effects: [
      {
        durationInTurns: -1,
        effectType: 'damage',
        effectValue: 60,
        effectValueByIntelligence: 90,
        effectValueModifier: 'plain',
        effectValuePerLevel: 35,
        effectValueRefflection: 'plain',
        element: 'LIGHT',
        target: 'enemy',
      },
    ],
    parentId: 0,
    unlockCost: 0,
  },
  601: {
    DevDesc: 'Lança de Gelo (arquimago)',
    cost: 60,
    costPerLevel: 10,
    effects: [
      {
        durationInTurns: -1,
        effectType: 'damage',
        effectValue: 70,
        effectValueByIntelligence: 95,
        effectValueModifier: 'plain',
        effectValuePerLevel: 90,
        effectValueRefflection: 'plain',
        element: 'WATER',
        target: 'enemy',
      },
      {
        durationInTurns: 3,
        effectType: 'agility_debuff',
        effectValue: 20,
        effectValueByIntelligence: 0,
        effectValueModifier: 'percentage',
        effectValuePerLevel: 3,
        effectValueRefflection: 'agility',
        element: 'WATER',
        target: 'enemy',
      },
    ],
    parentId: 600,
    unlockCost: 10,
  },
  602: {
    DevDesc: 'Electrolyn (arquimago)',
    cost: 80,
    costPerLevel: 20,
    effects: [
      {
        durationInTurns: -1,
        effectType: 'damage',
        effectValue: 90,
        effectValueByIntelligence: 220,
        effectValueModifier: 'plain',
        effectValuePerLevel: 100,
        effectValueRefflection: 'plain',
        element: 'AIR',
        target: 'enemy',
      },
    ],
    parentId: 601,
    unlockCost: 25,
  },
  603: {
    DevDesc: 'Cápsula de Mytril (arquimago)',
    cost: 55,
    costPerLevel: 15,
    effects: [
      {
        durationInTurns: -1,
        effectType: 'damage',
        effectValue: 60,
        effectValueByIntelligence: 85,
        effectValueModifier: 'plain',
        effectValuePerLevel: 110,
        effectValueRefflection: 'plain',
        element: 'NATURE',
        target: 'enemy',
      },
      {
        durationInTurns: 2,
        effectType: 'armor_buff',
        effectValue: 30,
        effectValueByIntelligence: 30,
        effectValueModifier: 'plain',
        effectValuePerLevel: 40,
        effectValueRefflection: 'plain',
        element: 'LIGHT',
        target: 'self',
      },
    ],
    parentId: 600,
    unlockCost: 10,
  },
  604: {
    DevDesc: 'Linhas Ley de Boleham (arquimago)',
    cost: 120,
    costPerLevel: 20,
    effects: [
      {
        durationInTurns: -1,
        effectType: 'damage',
        effectValue: 200,
        effectValueByIntelligence: 130,
        effectValueModifier: 'plain',
        effectValuePerLevel: 110,
        effectValueRefflection: 'plain',
        element: 'NEUTRAL',
        target: 'enemy',
      },
    ],
    parentId: 603,
    unlockCost: 25,
  },
  700: {
    DevDesc: 'Espírito de Guerra (bárbaro)',
    cost: 40,
    costPerLevel: 30,
    effects: [
      {
        durationInTurns: 3,
        effectType: 'armor_buff',
        effectValue: 10,
        effectValueByIntelligence: 0,
        effectValueModifier: 'percentage',
        effectValuePerLevel: 5,
        effectValueRefflection: 'armor',
        element: 'NATURE',
        target: 'self',
      },
      {
        durationInTurns: 3,
        effectType: 'damage_buff',
        effectValue: 10,
        effectValueByIntelligence: 0,
        effectValueModifier: 'percentage',
        effectValuePerLevel: 5,
        effectValueRefflection: 'damage',
        element: 'NATURE',
        target: 'self',
      },
      {
        durationInTurns: 3,
        effectType: 'damage_debuff',
        effectValue: 5,
        effectValueByIntelligence: 0,
        effectValueModifier: 'percentage',
        effectValuePerLevel: 5,
        effectValueRefflection: 'damage',
        element: 'NATURE',
        target: 'enemy',
      },
    ],
    parentId: 0,
    unlockCost: 0,
  },
  701: {
    DevDesc: 'Fúria do Berserker (barbaro)',
    cost: 60,
    costPerLevel: 10,
    effects: [
      {
        durationInTurns: -1,
        effectType: 'damage',
        effectValue: 110,
        effectValueByIntelligence: 130,
        effectValueModifier: 'plain',
        effectValuePerLevel: 80,
        effectValueRefflection: 'plain',
        element: 'FIRE',
        target: 'enemy',
      },
    ],
    parentId: 700,
    unlockCost: 10,
  },
  702: {
    DevDesc: 'Morte Imparável',
    cost: 80,
    costPerLevel: 25,
    effects: [
      {
        durationInTurns: -1,
        effectType: 'damage',
        effectValue: 150,
        effectValueByIntelligence: 80,
        effectValueModifier: 'plain',
        effectValuePerLevel: 80,
        effectValueRefflection: 'plain',
        element: 'NEUTRAL',
        target: 'enemy',
      },
      {
        durationInTurns: -1,
        effectType: 'heal',
        effectValue: 10,
        effectValueByIntelligence: 40,
        effectValueModifier: 'percentage',
        effectValuePerLevel: 3,
        effectValueRefflection: 'maxLife',
        element: 'LIGHT',
        target: 'self',
      },
    ],
    parentId: 701,
    unlockCost: 25,
  },
  703: {
    DevDesc: 'Graal (barbaro)',
    cost: 40,
    costPerLevel: 10,
    effects: [
      {
        durationInTurns: 3,
        effectType: 'armor_buff',
        effectValue: 10,
        effectValueByIntelligence: 10,
        effectValueModifier: 'percentage',
        effectValuePerLevel: 3,
        effectValueRefflection: 'armor',
        element: 'AIR',
        target: 'self',
      },
      {
        durationInTurns: 3,
        effectType: 'agility_buff',
        effectValue: 10,
        effectValueByIntelligence: 10,
        effectValueModifier: 'percentage',
        effectValuePerLevel: 3,
        effectValueRefflection: 'agility',
        element: 'AIR',
        target: 'self',
      },
      {
        durationInTurns: 3,
        effectType: 'intelligence_buff',
        effectValue: 20,
        effectValueByIntelligence: 0,
        effectValueModifier: 'percentage',
        effectValuePerLevel: 5,
        effectValueRefflection: 'intelligence',
        element: 'AIR',
        target: 'self',
      },
    ],
    parentId: 700,
    unlockCost: 10,
  },
  704: {
    DevDesc: 'Guilhotina Humana',
    cost: 40,
    costPerLevel: 10,
    effects: [
      {
        durationInTurns: -1,
        effectType: 'damage',
        effectValue: 10,
        effectValueByIntelligence: 10,
        effectValueModifier: 'percentage',
        effectValuePerLevel: 2,
        effectValueRefflection: 'maxLife',
        element: 'FIRE',
        target: 'enemy',
      },
    ],
    parentId: 703,
    unlockCost: 25,
  },
  800: {
    DevDesc: 'HeadShot (arqueiro)',
    cost: 40,
    costPerLevel: 10,
    effects: [
      {
        durationInTurns: -1,
        effectType: 'damage',
        effectValue: 70,
        effectValueByIntelligence: 100,
        effectValueModifier: 'plain',
        effectValuePerLevel: 80,
        effectValueRefflection: 'plain',
        element: 'FIRE',
        target: 'enemy',
      },
    ],
    parentId: 0,
    unlockCost: 0,
  },
  801: {
    DevDesc: 'Rajada Metálica (arqueiro)',
    cost: 60,
    costPerLevel: 10,
    effects: [
      {
        durationInTurns: 2,
        effectType: 'damage',
        effectValue: 40,
        effectValueByIntelligence: 50,
        effectValueModifier: 'plain',
        effectValuePerLevel: 30,
        effectValueRefflection: 'plain',
        element: 'NEUTRAL',
        target: 'enemy',
      },
      {
        durationInTurns: 3,
        effectType: 'agility_buff',
        effectValue: 40,
        effectValueByIntelligence: 50,
        effectValueModifier: 'plain',
        effectValuePerLevel: 20,
        effectValueRefflection: 'plain',
        element: 'AIR',
        target: 'self',
      },
    ],
    parentId: 800,
    unlockCost: 10,
  },
  802: {
    DevDesc: 'Balestra (arqueiro)',
    cost: 80,
    costPerLevel: 24,
    effects: [
      {
        durationInTurns: -1,
        effectType: 'damage',
        effectValue: 130,
        effectValueByIntelligence: 150,
        effectValueModifier: 'plain',
        effectValuePerLevel: 220,
        effectValueRefflection: 'plain',
        element: 'FIRE',
        target: 'enemy',
      },
    ],
    parentId: 801,
    unlockCost: 25,
  },
  803: {
    DevDesc: 'Flechas Envenenadas (arqueiro)',
    cost: 40,
    costPerLevel: 10,
    effects: [
      {
        durationInTurns: 3,
        effectType: 'poison',
        effectValue: 2,
        effectValueByIntelligence: 3,
        effectValueModifier: 'percentage',
        effectValuePerLevel: 1,
        effectValueRefflection: 'maxLife',
        element: 'NATURE',
        target: 'enemy',
      },
    ],
    parentId: 800,
    unlockCost: 10,
  },
  804: {
    DevDesc: 'Esquiva Ágil (arqueiro)',
    cost: 60,
    costPerLevel: 15,
    effects: [
      {
        durationInTurns: 3,
        effectType: 'agility_buff',
        effectValue: 15,
        effectValueByIntelligence: 10,
        effectValueModifier: 'percentage',
        effectValuePerLevel: 5,
        effectValueRefflection: 'agility',
        element: 'AIR',
        target: 'self',
      },
      {
        durationInTurns: 3,
        effectType: 'agility_debuff',
        effectValue: 10,
        effectValueByIntelligence: 10,
        effectValueModifier: 'percentage',
        effectValuePerLevel: 5,
        effectValueRefflection: 'agility',
        element: 'AIR',
        target: 'enemy',
      },
    ],
    parentId: 803,
    unlockCost: 25,
  },
  900: {
    DevDesc: 'Contrato Demoníaco (feiticeiro)',
    cost: 40,
    costPerLevel: 15,
    effects: [
      {
        durationInTurns: 3,
        effectType: 'intelligence_buff',
        effectValue: 40,
        effectValueByIntelligence: 60,
        effectValueModifier: 'plain',
        effectValuePerLevel: 70,
        effectValueRefflection: 'plain',
        element: 'DARK',
        target: 'self',
      },
      {
        durationInTurns: 3,
        effectType: 'damage_buff',
        effectValue: 10,
        effectValueByIntelligence: 10,
        effectValueModifier: 'percentage',
        effectValuePerLevel: 5,
        effectValueRefflection: 'damage',
        element: 'DARK',
        target: 'self',
      },
    ],
    parentId: 0,
    unlockCost: 0,
  },
  901: {
    DevDesc: 'Fëanor (feiticeiro)',
    cost: 55,
    costPerLevel: 15,
    effects: [
      {
        durationInTurns: -1,
        effectType: 'damage',
        effectValue: 90,
        effectValueByIntelligence: 90,
        effectValueModifier: 'plain',
        effectValuePerLevel: 79,
        effectValueRefflection: 'plain',
        element: 'DARK',
        target: 'enemy',
      },
    ],
    parentId: 900,
    unlockCost: 10,
  },
  902: {
    DevDesc: 'Curva Gravitacional (feiticeiro)',
    cost: 90,
    costPerLevel: 20,
    effects: [
      {
        durationInTurns: -1,
        effectType: 'damage',
        effectValue: 130,
        effectValueByIntelligence: 180,
        effectValueModifier: 'plain',
        effectValuePerLevel: 100,
        effectValueRefflection: 'damage',
        element: 'DARK',
        target: 'enemy',
      },
    ],
    parentId: 901,
    unlockCost: 25,
  },
  903: {
    DevDesc: 'Contrato: Abezethibou (feiticeiro)',
    cost: 50,
    costPerLevel: 20,
    effects: [
      {
        durationInTurns: -1,
        effectType: 'agility_buff',
        effectValue: 20,
        effectValueByIntelligence: 10,
        effectValueModifier: 'percentage',
        effectValuePerLevel: 3,
        effectValueRefflection: 'agility',
        element: 'DARK',
        target: 'self',
      },
      {
        durationInTurns: -1,
        effectType: 'heal',
        effectValue: 90,
        effectValueByIntelligence: 70,
        effectValueModifier: 'plain',
        effectValuePerLevel: 120,
        effectValueRefflection: 'plain',
        element: 'DARK',
        target: 'self',
      },
      {
        durationInTurns: -1,
        effectType: 'damage',
        effectValue: 40,
        effectValueByIntelligence: 80,
        effectValueModifier: 'plain',
        effectValuePerLevel: 60,
        effectValueRefflection: 'damage',
        element: 'DARK',
        target: 'enemy',
      },
    ],
    parentId: 900,
    unlockCost: 10,
  },
  904: {
    DevDesc: 'Astaroth (feiticeiro)',
    cost: 100,
    costPerLevel: 25,
    effects: [
      {
        durationInTurns: -1,
        effectType: 'damage',
        effectValue: 180,
        effectValueByIntelligence: 190,
        effectValueModifier: 'plain',
        effectValuePerLevel: 110,
        effectValueRefflection: 'damage',
        element: 'DARK',
        target: 'enemy',
      },
    ],
    parentId: 903,
    unlockCost: 25,
  },
};

export default Abilities;
