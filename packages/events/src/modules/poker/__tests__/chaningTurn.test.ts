import { updatePlayerTurn } from '../turnManager.js'
import { mockGame, mockPlayer } from './playerSeats.test.js';

describe('Related to updating the turn to play', () => {
  const game = mockGame();
  game.players = [mockPlayer(0), mockPlayer(1), mockPlayer(2, true), mockPlayer(3)];

  it('should just change the next seat to play', () => {
    game.stage = 'flop';
    game.lastPlayerSeat = 3;
    game.lastAction = {
      action: 'ALLIN',
      playerSeat: 0,
      pot: 1,
    };

    updatePlayerTurn(game);

    expect(game.seatToPlay).toBe(1);
    expect(game.stage).toBe('flop');
    expect(game.lastPlayerSeat).toBe(3);
  });

  it('should change the game stage if the last player played without betting', () => {
    game.stage = 'flop';
    game.dealerSeat = 0;
    game.lastPlayerSeat = 3;
    game.lastAction = {
      action: 'CHECK',
      playerSeat: 3,
      pot: 0,
    };

    updatePlayerTurn(game);

    expect(game.seatToPlay).toBe(1);
    expect(game.stage).toBe('turn');
    expect(game.lastPlayerSeat).toBe(0);
  });

  it('should continue the round if the last player betted', () => {
    game.stage = 'flop';
    game.dealerSeat = 0;
    game.lastPlayerSeat = 3;
    game.lastAction = {
      action: 'RAISE',
      playerSeat: 3,
      pot: 1,
    };

    updatePlayerTurn(game);

    expect(game.seatToPlay).toBe(0);
    expect(game.stage).toBe('flop');
    expect(game.lastPlayerSeat).toBe(3);
  });
});
