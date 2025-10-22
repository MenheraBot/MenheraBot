import ComponentInteractionContext from '../../../structures/command/ComponentInteractionContext.js';
import { noop } from '../../../utils/miscUtils.js';
import { getAvailableActions } from '../playerControl.js';
import { mockGame, mockPlayer } from './playerSeats.test.js';

describe('Checking the user options', () => {
  const game = mockGame();
  game.seatToPlay = 0;
  game.players = [mockPlayer(0)];
  const ctxMock = {
    originalInteractionId: '',
    locale: noop,
  } as unknown as ComponentInteractionContext;

  test('The current pot is bigger than user chips', () => {
    game.players[0].chips = 1;
    game.lastAction = {
      action: 'ALLIN',
      playerSeat: 1,
      pot: 100,
    };

    const { options } = getAvailableActions(ctxMock, game);

    expect(options).toHaveLength(2);
    expect(options[0].value).toBe('FOLD');
    expect(options[1].value).toBe('ALLIN|1');
  });
});
