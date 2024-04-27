import { getNextPlayableSeat, getPreviousPlayableSeat } from '../turnManager';
import { PokerMatch, PokerPlayer } from '../types';

export const mockGame = (): PokerMatch => ({
  communityCards: [0, 0, 0, 0, 0],
  type: 'LOCAL',
  dealerSeat: 0,
  embedColor: 0,
  lastAction: {
    action: 'CHECK',
    playerSeat: 0,
    pot: 0,
  },
  language: '',
  winnerSeat: [],
  lastPlayerSeat: 0,
  initialChips: 0,
  masterId: '',
  matchId: '',
  interactionToken: '',
  players: [],
  pot: 0,
  seatToPlay: 0,
  blind: 0,
  raises: 0,
  worthGame: false,
  inMatch: true,
  stage: 'preflop',
});

export const mockPlayer = (seatId: number, folded = false): PokerPlayer => ({
  avatar: '',
  backgroundTheme: 'blue',
  cards: [0, 0],
  cardTheme: 'death',
  chips: 1,
  folded,
  id: '',
  willExit: false,
  name: '',
  pot: 0,
  seatId,
});

describe('Tests related to getting the previous player to play seat', () => {
  test('Every player is playing', () => {
    const game = mockGame();
    game.players = [mockPlayer(0), mockPlayer(1), mockPlayer(2)];

    expect(getPreviousPlayableSeat(game, 0)).toBe(2);
    expect(getPreviousPlayableSeat(game, 1)).toBe(0);
    expect(getPreviousPlayableSeat(game, 2)).toBe(1);
    expect(getPreviousPlayableSeat(game, 3)).toBe(2);
    expect(getPreviousPlayableSeat(game, 4)).toBe(2);
    expect(getPreviousPlayableSeat(game, 5)).toBe(2);
    expect(getPreviousPlayableSeat(game, 6)).toBe(2);
    expect(getPreviousPlayableSeat(game, 7)).toBe(2);
    expect(getPreviousPlayableSeat(game, 8)).toBe(2);
  });

  test('Some players folded', () => {
    const game = mockGame();
    game.players = [
      mockPlayer(0, true),
      mockPlayer(1),
      mockPlayer(2, true),
      mockPlayer(3),
      mockPlayer(4, true),
    ];

    expect(getPreviousPlayableSeat(game, 0)).toBe(3);
    expect(getPreviousPlayableSeat(game, 1)).toBe(3);
    expect(getPreviousPlayableSeat(game, 2)).toBe(1);
    expect(getPreviousPlayableSeat(game, 3)).toBe(1);
    expect(getPreviousPlayableSeat(game, 4)).toBe(3);
    expect(getPreviousPlayableSeat(game, 5)).toBe(3);
    expect(getPreviousPlayableSeat(game, 6)).toBe(3);
    expect(getPreviousPlayableSeat(game, 7)).toBe(3);
    expect(getPreviousPlayableSeat(game, 8)).toBe(3);
  });

  test('Some players all in', () => {
    const game = mockGame();
    game.players = [
      mockPlayer(0, true),
      mockPlayer(1),
      mockPlayer(2, true),
      mockPlayer(3),
      mockPlayer(4),
      mockPlayer(6),
      mockPlayer(7, true),
    ];

    game.players[1].chips = 0;
    game.players[4].chips = 0;

    expect(getPreviousPlayableSeat(game, 0)).toBe(6);
    expect(getPreviousPlayableSeat(game, 1)).toBe(6);
    expect(getPreviousPlayableSeat(game, 2)).toBe(6);
    expect(getPreviousPlayableSeat(game, 3)).toBe(6);
    expect(getPreviousPlayableSeat(game, 4)).toBe(3);
    expect(getPreviousPlayableSeat(game, 5)).toBe(3);
    expect(getPreviousPlayableSeat(game, 6)).toBe(3);
    expect(getPreviousPlayableSeat(game, 7)).toBe(6);
    expect(getPreviousPlayableSeat(game, 8)).toBe(6);
  });

  test('Some seats are missing', () => {
    const game = mockGame();
    game.players = [mockPlayer(2), mockPlayer(4), mockPlayer(8)];

    expect(getPreviousPlayableSeat(game, 0)).toBe(8);
    expect(getPreviousPlayableSeat(game, 1)).toBe(8);
    expect(getPreviousPlayableSeat(game, 2)).toBe(8);
    expect(getPreviousPlayableSeat(game, 3)).toBe(2);
    expect(getPreviousPlayableSeat(game, 4)).toBe(2);
    expect(getPreviousPlayableSeat(game, 5)).toBe(4);
    expect(getPreviousPlayableSeat(game, 6)).toBe(4);
    expect(getPreviousPlayableSeat(game, 7)).toBe(4);
    expect(getPreviousPlayableSeat(game, 8)).toBe(4);
  });
});

describe('Tests related to getting the next player to play seat', () => {
  test('Every player is playing', () => {
    const game = mockGame();
    game.players = [mockPlayer(0), mockPlayer(1), mockPlayer(2), mockPlayer(3)];

    expect(getNextPlayableSeat(game, 0)).toBe(1);
    expect(getNextPlayableSeat(game, 1)).toBe(2);
    expect(getNextPlayableSeat(game, 2)).toBe(3);
    expect(getNextPlayableSeat(game, 3)).toBe(0);
    expect(getNextPlayableSeat(game, 4)).toBe(0);
    expect(getNextPlayableSeat(game, 5)).toBe(0);
    expect(getNextPlayableSeat(game, 6)).toBe(0);
    expect(getNextPlayableSeat(game, 7)).toBe(0);
    expect(getNextPlayableSeat(game, 8)).toBe(0);
  });

  test('Some players folded', () => {
    const game = mockGame();
    game.players = [
      mockPlayer(0, true),
      mockPlayer(1),
      mockPlayer(2, true),
      mockPlayer(5),
      mockPlayer(7, true),
    ];

    expect(getNextPlayableSeat(game, 0)).toBe(1);
    expect(getNextPlayableSeat(game, 1)).toBe(5);
    expect(getNextPlayableSeat(game, 2)).toBe(5);
    expect(getNextPlayableSeat(game, 3)).toBe(5);
    expect(getNextPlayableSeat(game, 4)).toBe(5);
    expect(getNextPlayableSeat(game, 5)).toBe(1);
    expect(getNextPlayableSeat(game, 6)).toBe(1);
    expect(getNextPlayableSeat(game, 7)).toBe(1);
    expect(getNextPlayableSeat(game, 8)).toBe(1);
  });

  test('Some players all in', () => {
    const game = mockGame();
    game.players = [
      mockPlayer(0, true),
      mockPlayer(1),
      mockPlayer(2, true),
      mockPlayer(3),
      mockPlayer(4),
      mockPlayer(6),
      mockPlayer(7, true),
    ];

    game.players[1].chips = 0;
    game.players[4].chips = 0;

    expect(getNextPlayableSeat(game, 0)).toBe(3);
    expect(getNextPlayableSeat(game, 1)).toBe(3);
    expect(getNextPlayableSeat(game, 2)).toBe(3);
    expect(getNextPlayableSeat(game, 3)).toBe(6);
    expect(getNextPlayableSeat(game, 4)).toBe(6);
    expect(getNextPlayableSeat(game, 5)).toBe(6);
    expect(getNextPlayableSeat(game, 6)).toBe(3);
    expect(getNextPlayableSeat(game, 7)).toBe(3);
    expect(getNextPlayableSeat(game, 8)).toBe(3);
  });

  test('Some seats are missing', () => {
    const game = mockGame();
    game.players = [mockPlayer(2), mockPlayer(4), mockPlayer(8)];

    expect(getNextPlayableSeat(game, 0)).toBe(2);
    expect(getNextPlayableSeat(game, 1)).toBe(2);
    expect(getNextPlayableSeat(game, 2)).toBe(4);
    expect(getNextPlayableSeat(game, 3)).toBe(4);
    expect(getNextPlayableSeat(game, 4)).toBe(8);
    expect(getNextPlayableSeat(game, 5)).toBe(8);
    expect(getNextPlayableSeat(game, 6)).toBe(8);
    expect(getNextPlayableSeat(game, 7)).toBe(8);
    expect(getNextPlayableSeat(game, 8)).toBe(2);
  });
});
