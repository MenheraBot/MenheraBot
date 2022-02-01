import { AbilitiesFile } from '../Types';

const Abilities: { [id: number]: AbilitiesFile } = {
  100: {
    DevDesc: 'Lamina Envenenada (assassino)',
    cost: 0,
    damage: {
      base: 20,
      scale: 50,
    },
    heal: {
      base: 0,
      scale: 0,
    },
    parentId: 0,
    unlockCost: 0,
    boostPerLevel: {
      cost: 5,
      damage: 30,
      heal: 0,
    },
  },
  101: {
    DevDesc: 'Golpes Destemidos (assassino)',
    cost: 60,
    damage: {
      base: 18,
      scale: 50,
    },
    heal: {
      base: 0,
      scale: 0,
    },
    parentId: 1,
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
      base: 17,
      scale: 50,
    },
    heal: {
      base: 0,
      scale: 0,
    },
    parentId: 1,
    unlockCost: 20,
    boostPerLevel: {
      cost: 10,
      damage: 50,
      heal: 0,
    },
  },
  103: {
    DevDesc: 'Golpe Desleal (assassino)',
    cost: 80,
    damage: {
      base: 17,
      scale: 50,
    },
    heal: {
      base: 130,
      scale: 60,
    },
    parentId: 3,
    unlockCost: 60,
    boostPerLevel: {
      cost: 5,
      damage: 20,
      heal: 200,
    },
  },
  104: {
    DevDesc: 'Frenesi (assassino)',
    cost: 80,
    damage: {
      base: 15,
      scale: 0,
    },
    heal: {
      base: 0,
      scale: 0,
    },
    parentId: 2,
    unlockCost: 60,
    boostPerLevel: {
      cost: 10,
      damage: 60,
      heal: 0,
    },
  },
  200: {
    DevDesc: 'Benção Elemental (mago branco)',
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
    DevDesc: 'Raio de Luz Solar (mago branco)',
    cost: 80,
    damage: {
      base: 35,
      scale: 85,
    },
    heal: {
      base: 0,
      scale: 0,
    },
    parentId: 6,
    unlockCost: 20,
    boostPerLevel: {
      cost: 10,
      damage: 70,
      heal: 0,
    },
  },
  202: {
    DevDesc: 'Rosario (mago branco)',
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
    parentId: 7,
    boostPerLevel: {
      cost: 10,
      damage: 75,
      heal: 60,
    },
  },
  203: {
    DevDesc: 'Ascenção Espiritual (mago branco)',
    cost: 80,
    damage: {
      base: 35,
      scale: 80,
    },
    heal: {
      base: 10,
      scale: 60,
    },
    parentId: 6,
    unlockCost: 20,
    boostPerLevel: {
      cost: 10,
      damage: 50,
      heal: 10,
    },
  },
  204: {
    DevDesc: 'Manipulação Éterea (mago branco)',
    cost: 100,
    damage: {
      base: 80,
      scale: 80,
    },
    heal: {
      base: 0,
      scale: 0,
    },
    parentId: 9,
    unlockCost: 60,
    boostPerLevel: {
      cost: 20,
      damage: 90,
      heal: 0,
    },
  },
  300: {
    DevDesc: 'Castigo Eterno (Contratados)',
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
    DevDesc: 'Dama de Ferro (contratados)',
    cost: 90,
    damage: {
      base: 40,
      scale: 85,
    },
    heal: {
      base: 0,
      scale: 0,
    },
    parentId: 11,
    unlockCost: 20,
    boostPerLevel: {
      cost: 20,
      damage: 110,
      heal: 0,
    },
  },
  302: {
    DevDesc: 'Invocar Bahamut (contratados)',
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
    parentId: 12,
    boostPerLevel: {
      cost: 30,
      damage: 130,
      heal: 0,
    },
  },
  303: {
    DevDesc: 'Caça Voraz (contratados)',
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
    parentId: 11,
    boostPerLevel: {
      cost: 10,
      damage: 40,
      heal: 0,
    },
  },
  304: {
    DevDesc: 'Perseguição Incontrolável (contratados)',
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
    parentId: 14,
    boostPerLevel: {
      cost: 25,
      damage: 160,
      heal: 0,
    },
  },
  400: {
    DevDesc: 'Avanço com Escudo (tanks)',
    cost: 20,
    damage: {
      base: 10,
      scale: 60,
    },
    heal: {
      base: 60,
      scale: 80,
    },
    parentId: 0,
    unlockCost: 0,
    boostPerLevel: {
      cost: 50,
      damage: 60,
      heal: 160,
    },
  },
  401: {
    DevDesc: 'Estande de Defesa (tanks)',
    cost: 60,
    damage: {
      base: 60,
      scale: 50,
    },
    heal: {
      base: 0,
      scale: 0,
    },
    unlockCost: 20,
    parentId: 16,
    boostPerLevel: {
      cost: 20,
      damage: 67,
      heal: 0,
    },
  },
  402: {
    DevDesc: 'Parede de Aço (tank)',
    cost: 80,
    damage: {
      base: 120,
      scale: 40,
    },
    heal: {
      base: 50,
      scale: 80,
    },
    unlockCost: 60,
    parentId: 17,
    boostPerLevel: {
      cost: 30,
      damage: 130,
      heal: 50,
    },
  },
  403: {
    DevDesc: 'Proteção Corporal (tank)',
    cost: 60,
    damage: {
      base: 12,
      scale: 120,
    },
    heal: {
      base: 0,
      scale: 0,
    },
    unlockCost: 20,
    parentId: 16,
    boostPerLevel: {
      cost: 10,
      damage: 40,
      heal: 0,
    },
  },
  404: {
    DevDesc: 'Nada Passará! (ank)',
    cost: 80,
    damage: {
      base: 100,
      scale: 50,
    },
    heal: {
      base: 150,
      scale: 40,
    },
    parentId: 19,
    unlockCost: 60,
    boostPerLevel: {
      cost: 30,
      damage: 100,
      heal: 150,
    },
  },
};

export default Abilities;
