import { AbilitiesFile } from '../Types';

const Abilities: { [id: number]: AbilitiesFile } = {
  6666: {
    DevDesc: 'Raízes do Mundo [BETA]',
    cost: 30,
    damage: {
      base: 80,
      scale: 80,
    },
    heal: {
      base: 10,
      scale: 30,
    },
    parentId: 0,
    unlockCost: 0,
    boostPerLevel: {
      cost: 10,
      damage: 60,
      heal: 10,
    },
  },
  100: {
    DevDesc: 'Lamina Envenenada (assassino)',
    cost: 20,
    damage: {
      base: 40,
      scale: 80,
    },
    heal: {
      base: 0,
      scale: 0,
    },
    parentId: 0,
    unlockCost: 0,
    boostPerLevel: {
      cost: 5,
      damage: 60,
      heal: 0,
    },
  },
  101: {
    DevDesc: 'Golpes Destemidos (assassino)',
    cost: 60,
    damage: {
      base: 34,
      scale: 70,
    },
    heal: {
      base: 0,
      scale: 0,
    },
    parentId: 100,
    unlockCost: 20,
    boostPerLevel: {
      cost: 5,
      damage: 40,
      heal: 0,
    },
  },
  102: {
    DevDesc: 'Atras de Você! (Assassino)',
    cost: 80,
    damage: {
      base: 90,
      scale: 80,
    },
    heal: {
      base: 0,
      scale: 0,
    },
    parentId: 101,
    unlockCost: 20,
    boostPerLevel: {
      cost: 10,
      damage: 30,
      heal: 0,
    },
  },
  103: {
    DevDesc: 'Golpe Desleal (assassino)',
    cost: 80,
    damage: {
      base: 50,
      scale: 65,
    },
    heal: {
      base: 90,
      scale: 60,
    },
    parentId: 102,
    unlockCost: 60,
    boostPerLevel: {
      cost: 5,
      damage: 20,
      heal: 100,
    },
  },
  104: {
    DevDesc: 'Frenesi (assassino)',
    cost: 80,
    damage: {
      base: 90,
      scale: 80,
    },
    heal: {
      base: 0,
      scale: 0,
    },
    parentId: 101,
    unlockCost: 60,
    boostPerLevel: {
      cost: 10,
      damage: 60,
      heal: 0,
    },
  },
  200: {
    DevDesc: 'Benção Elemental (Mago)',
    cost: 50,
    damage: {
      base: 10,
      scale: 80,
    },
    heal: {
      base: 30,
      scale: 40,
    },
    parentId: 0,
    unlockCost: 0,
    boostPerLevel: {
      cost: 5,
      damage: 60,
      heal: 60,
    },
  },
  201: {
    DevDesc: 'Raio de Luz Solar (Mago)',
    cost: 80,
    damage: {
      base: 35,
      scale: 85,
    },
    heal: {
      base: 0,
      scale: 0,
    },
    parentId: 200,
    unlockCost: 20,
    boostPerLevel: {
      cost: 10,
      damage: 70,
      heal: 0,
    },
  },
  202: {
    DevDesc: 'Rosario (Mago)',
    cost: 80,
    damage: {
      base: 35,
      scale: 90,
    },
    heal: {
      base: 0,
      scale: 0,
    },
    unlockCost: 60,
    parentId: 201,
    boostPerLevel: {
      cost: 10,
      damage: 75,
      heal: 60,
    },
  },
  203: {
    DevDesc: 'Ascenção Espiritual (mago)',
    cost: 80,
    damage: {
      base: 35,
      scale: 80,
    },
    heal: {
      base: 10,
      scale: 60,
    },
    parentId: 200,
    unlockCost: 20,
    boostPerLevel: {
      cost: 10,
      damage: 50,
      heal: 10,
    },
  },
  204: {
    DevDesc: 'Manipulação Éterea (Mago)',
    cost: 100,
    damage: {
      base: 80,
      scale: 80,
    },
    heal: {
      base: 0,
      scale: 0,
    },
    parentId: 203,
    unlockCost: 60,
    boostPerLevel: {
      cost: 20,
      damage: 90,
      heal: 0,
    },
  },
  300: {
    DevDesc: 'Castigo Eterno (Ilusionista)',
    cost: 25,
    damage: {
      base: 16,
      scale: 70,
    },
    heal: {
      base: 0,
      scale: 0,
    },
    parentId: 0,
    unlockCost: 0,
    boostPerLevel: {
      cost: 10,
      damage: 34,
      heal: 0,
    },
  },
  301: {
    DevDesc: 'Dama de Ferro (Ilusionista)',
    cost: 90,
    damage: {
      base: 40,
      scale: 85,
    },
    heal: {
      base: 0,
      scale: 0,
    },
    parentId: 300,
    unlockCost: 20,
    boostPerLevel: {
      cost: 20,
      damage: 110,
      heal: 0,
    },
  },
  302: {
    DevDesc: 'Invocar Bahamut (Ilusionista)',
    cost: 130,
    damage: {
      base: 120,
      scale: 100,
    },
    heal: {
      base: 0,
      scale: 0,
    },
    unlockCost: 60,
    parentId: 301,
    boostPerLevel: {
      cost: 30,
      damage: 130,
      heal: 0,
    },
  },
  303: {
    DevDesc: 'Distorção Mental (Ilusionista)',
    cost: 50,
    damage: {
      base: 34,
      scale: 80,
    },
    heal: {
      base: 0,
      scale: 0,
    },
    unlockCost: 20,
    parentId: 300,
    boostPerLevel: {
      cost: 10,
      damage: 40,
      heal: 0,
    },
  },
  304: {
    DevDesc: 'Merlyer (Ilusionista)',
    cost: 110,
    damage: {
      base: 130,
      scale: 95,
    },
    heal: {
      base: 0,
      scale: 0,
    },
    unlockCost: 60,
    parentId: 303,
    boostPerLevel: {
      cost: 25,
      damage: 160,
      heal: 0,
    },
  },
  400: {
    DevDesc: 'Avanço com Escudo (Paladino)',
    cost: 20,
    damage: {
      base: 50,
      scale: 60,
    },
    heal: {
      base: 40,
      scale: 50,
    },
    parentId: 0,
    unlockCost: 0,
    boostPerLevel: {
      cost: 15,
      damage: 60,
      heal: 70,
    },
  },
  401: {
    DevDesc: 'Proteção Divina (Paladino)',
    cost: 20,
    damage: {
      base: 60,
      scale: 70,
    },
    heal: {
      base: 0,
      scale: 0,
    },
    unlockCost: 20,
    parentId: 400,
    boostPerLevel: {
      cost: 15,
      damage: 90,
      heal: 0,
    },
  },
  402: {
    DevDesc: 'Valkyria dos Céus (Paladino)',
    cost: 45,
    damage: {
      base: 120,
      scale: 70,
    },
    heal: {
      base: 50,
      scale: 80,
    },
    unlockCost: 60,
    parentId: 401,
    boostPerLevel: {
      cost: 20,
      damage: 150,
      heal: 60,
    },
  },
  403: {
    DevDesc: 'Santíssima Trindade (Paladino)',
    cost: 40,
    damage: {
      base: 50,
      scale: 120,
    },
    heal: {
      base: 0,
      scale: 0,
    },
    unlockCost: 20,
    parentId: 400,
    boostPerLevel: {
      cost: 10,
      damage: 60,
      heal: 0,
    },
  },
  404: {
    DevDesc: 'D.A.E.L. (Paladino) [dragão anciao elemental da luz]',
    cost: 65,
    damage: {
      base: 100,
      scale: 70,
    },
    heal: {
      base: 100,
      scale: 40,
    },
    parentId: 403,
    unlockCost: 60,
    boostPerLevel: {
      cost: 20,
      damage: 100,
      heal: 150,
    },
  },
};

export default Abilities;
