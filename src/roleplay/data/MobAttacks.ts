import { IMobAttacksFile } from '@roleplay/Types';

const attacks: { [key: number]: IMobAttacksFile } = {
  0: {
    description: 'O bicho da um ataque com uma faquinha',
    element: 'fire',
    effects: [
      {
        type: 'attack',
        value: 3,
      },
    ],
  },
};

export default attacks;
