import { IQuestsFile } from '@roleplay/Types';

const quests: { [key: number]: IQuestsFile } = {
  0: {
    description: 'Matar goblin da guilda',
    isDaily: false,
    minUserLevel: 1,
    objective: {
      amount: 2,
      perLevel: 0,
      type: 'kill_enemy',
      value: 0,
    },
    reward: {
      experience: 20,
      perLevel: {
        bronze: 1,
        gold: 0,
        silver: 0,
      },
      type: 'money',
      amount: {
        bronze: 3,
        gold: 0,
        silver: 0,
      },
    },
  },
  1: {
    description: 'Criar uma party',
    isDaily: true,
    minUserLevel: 1,
    objective: {
      amount: 1,
      perLevel: 0,
      type: 'enter_party',
      value: 2,
    },
    reward: {
      experience: 20,
      perLevel: {
        bronze: 1,
        gold: 0,
        silver: 0,
      },
      type: 'money',
      amount: {
        bronze: 3,
        gold: 0,
        silver: 0,
      },
    },
  },
};

export default quests;
