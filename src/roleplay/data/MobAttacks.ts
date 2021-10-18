import { IMobAttacksFile } from '@roleplay/Types';

const attacks: { [key: number]: IMobAttacksFile } = {
  0: {
    id: 0,
    description: 'O bicho da um ataque com uma faquinha',
    element: 'fire',
    effects: [
      {
        type: 'attack',
        value: 3,
        target: 'enemy',
      },
    ],
  },
};

export default attacks;
