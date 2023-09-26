import { getNextPlayableSeat, getPreviousPlayableSeat } from '../handleGameAction';
import { PokerMatch, PokerPlayer } from '../types';

export const mockGame = (): PokerMatch => ({
  communityCards: [0, 0, 0, 0, 0],
  dealerSeat: 0,
  embedColor: 0,
  lastAction: {
    action: 'CHECK',
    playerSeat: 0,
    pot: 0,
  },
  winnerSeat: 10,
  lastPlayerSeat: 0,
  masterId: '',
  matchId: '',
  players: [],
  pot: 0,
  seatToPlay: 0,
  blind: 0,
  raises: 0,
  stage: 'preflop',
});

export const mockPlayer = (seatId: number, folded = false): PokerPlayer => ({
  avatar: '',
  backgroundTheme: 'blue',
  cards: [0, 0],
  cardTheme: 'death',
  chips: 0,
  folded,
  id: '',
  name: '',
  pot: 0,
  seatId,
});

describe('Tests related to getting the previous player to play seat', () => {
  describe('Every player is playing', () => {
    const game = mockGame();
    game.players = [mockPlayer(0), mockPlayer(1), mockPlayer(2)];

    it('Should return the third player', () => {
      const nextSeat = getPreviousPlayableSeat(game, 0);

      expect(nextSeat).toBe(2);
    });

    it('Should return the first player', () => {
      const nextSeat = getPreviousPlayableSeat(game, 1);

      expect(nextSeat).toBe(0);
    });

    it('Should return the second player', () => {
      const nextSeat = getPreviousPlayableSeat(game, 2);

      expect(nextSeat).toBe(1);
    });

    it('Should return the third player', () => {
      const nextSeat = getPreviousPlayableSeat(game, 5);

      expect(nextSeat).toBe(2);
    });
  });

  describe('Some players folded', () => {
    const game = mockGame();
    game.players = [
      mockPlayer(0, true),
      mockPlayer(1),
      mockPlayer(2, true),
      mockPlayer(3),
      mockPlayer(4, true),
    ];

    it('Should return the seat 3', () => {
      const nextSeat = getPreviousPlayableSeat(game, 0);

      expect(nextSeat).toBe(3);
    });

    it('Should return the seat 3', () => {
      const nextSeat = getPreviousPlayableSeat(game, 1);

      expect(nextSeat).toBe(3);
    });

    it('Should return the seat 1', () => {
      const nextSeat = getPreviousPlayableSeat(game, 2);

      expect(nextSeat).toBe(1);
    });

    it('Should return the seat 1', () => {
      const nextSeat = getPreviousPlayableSeat(game, 3);

      expect(nextSeat).toBe(1);
    });

    it('Should return the seat 3', () => {
      const nextSeat = getPreviousPlayableSeat(game, 4);

      expect(nextSeat).toBe(3);
    });

    it('Should return the seat 3', () => {
      const nextSeat = getPreviousPlayableSeat(game, 5);

      expect(nextSeat).toBe(3);
    });
  });

  describe('Some seats are missing', () => {
    const game = mockGame();
    game.players = [mockPlayer(2), mockPlayer(4), mockPlayer(8, true)];

    it('Should return the seat 4', () => {
      const nextSeat = getPreviousPlayableSeat(game, 0);

      expect(nextSeat).toBe(4);
    });

    it('Should return the seat 4', () => {
      const nextSeat = getPreviousPlayableSeat(game, 2);

      expect(nextSeat).toBe(4);
    });

    it('Should return the seat 2', () => {
      const nextSeat = getPreviousPlayableSeat(game, 3);

      expect(nextSeat).toBe(2);
    });

    it('Should return the seat 4', () => {
      const nextSeat = getPreviousPlayableSeat(game, 9);

      expect(nextSeat).toBe(4);
    });
  });
});

describe('Tests related to getting the next player to play seat', () => {
  describe('Every player is playing', () => {
    const game = mockGame();
    game.players = [mockPlayer(0), mockPlayer(1), mockPlayer(2), mockPlayer(7)];

    it('Should return the second player', () => {
      const nextSeat = getNextPlayableSeat(game, 0);

      expect(nextSeat).toBe(1);
    });

    it('Should return the third player', () => {
      const nextSeat = getNextPlayableSeat(game, 1);

      expect(nextSeat).toBe(2);
    });

    it('Should return the first player', () => {
      const nextSeat = getNextPlayableSeat(game, 2);

      expect(nextSeat).toBe(7);
    });

    it('Should return the first player', () => {
      const nextSeat = getNextPlayableSeat(game, 7);

      expect(nextSeat).toBe(0);
    });
  });

  describe('Some players folded', () => {
    const game = mockGame();
    game.players = [
      mockPlayer(0, true),
      mockPlayer(1),
      mockPlayer(2, true),
      mockPlayer(5),
      mockPlayer(7, true),
    ];

    it('Should return the second player', () => {
      const nextSeat = getNextPlayableSeat(game, 0);

      expect(nextSeat).toBe(1);
    });

    it('Should return the third player', () => {
      const nextSeat = getNextPlayableSeat(game, 1);

      expect(nextSeat).toBe(5);
    });

    it('Should return the third player', () => {
      const nextSeat = getNextPlayableSeat(game, 2);

      expect(nextSeat).toBe(5);
    });

    it('Should return the second player', () => {
      const nextSeat = getNextPlayableSeat(game, 5);

      expect(nextSeat).toBe(1);
    });

    it('Should return the second player', () => {
      const nextSeat = getNextPlayableSeat(game, 4);

      expect(nextSeat).toBe(5);
    });

    it('Should return the second player', () => {
      const nextSeat = getNextPlayableSeat(game, 9);

      expect(nextSeat).toBe(1);
    });
  });

  describe('Some seats are missing', () => {
    const game = mockGame();
    game.players = [mockPlayer(2), mockPlayer(4), mockPlayer(8, true)];

    it('Should return the seat 2', () => {
      const nextSeat = getNextPlayableSeat(game, 0);

      expect(nextSeat).toBe(2);
    });

    it('Should return the seat 4', () => {
      const nextSeat = getNextPlayableSeat(game, 2);

      expect(nextSeat).toBe(4);
    });

    it('Should return the seat 4', () => {
      const nextSeat = getNextPlayableSeat(game, 3);

      expect(nextSeat).toBe(4);
    });

    it('Should return the seat 2', () => {
      const nextSeat = getNextPlayableSeat(game, 4);

      expect(nextSeat).toBe(2);
    });
  });
});
