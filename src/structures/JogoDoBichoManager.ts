/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { BichoBetType, BichoWinner, JogoDoBichoGame } from '@utils/Types';
import { MayNotExists } from '@utils/Util';
import MenheraClient from 'MenheraClient';
import { BICHO_BET_MULTIPLIER, JOGO_DO_BICHO } from './Constants';

const GAME_DURATION = 1000 * 60; // * 60 * 5;

const getResults = (): number[] => {
  const results = [];

  for (let i = 0; i < 4; i++) results.push(Math.floor(Math.random() * 10));

  return results;
};

export default class JogoDoBixoManager {
  private ongoingGame!: JogoDoBichoGame;

  public gameLoop!: NodeJS.Timer;

  private clientInstance: MenheraClient;

  public lastGame?: JogoDoBichoGame;

  constructor(client: MenheraClient) {
    this.clientInstance = client;

    if (this.clientInstance.shard!.ids[0] === 0) {
      this.ongoingGame = {
        dueDate: Date.now() + GAME_DURATION,
        bets: [],
        results: [],
        biggestProfit: 0,
      };
      this.gameLoop = setInterval(() => {
        this.finishGame();
      }, GAME_DURATION);
    }
  }

  static makeWinners(game: JogoDoBichoGame): BichoWinner[] {
    const betType = (option: string): BichoBetType => {
      if (/^(?=.*\d)[\d ]+$/.test(option)) {
        const withoutBlank = option.replace(/\s/g, '');
        if (withoutBlank.length === 4) return 'thousand';
        if (withoutBlank.length === 3) return 'hundred';
        if (withoutBlank.length === 2) return 'ten';
        return 'unity';
      }

      const selectedAnimals = option.split(' | ');

      if (selectedAnimals.length === 5) return 'corner';
      if (selectedAnimals.length === 2) return 'sequence';
      return 'animal';
    };

    const didUserWin = (option: string, bet: BichoBetType): boolean => {
      switch (bet) {
        case 'unity':
          return game.results.some((a) => `${a[3]}` === option);
        case 'ten':
          return game.results.some((a) => `${a[2]}${a[3]}` === option);
        case 'hundred':
          return game.results.some((a) => `${a[1]}${a[2]}${a[3]}` === option);
        case 'thousand':
          return game.results.some((a) => `${a[0]}${a[1]}${a[2]}${a[3]}` === option);
        case 'animal': {
          const animals = game.results.map((a) => {
            const ten = Number(`${a[2]}${a[3]}`);
            return JOGO_DO_BICHO[Math.floor(ten / 4)];
          });
          return animals.some((a) => a === option);
        }

        case 'corner': {
          const animals = game.results.map((a) => {
            const ten = Number(`${a[2]}${a[3]}`);
            return JOGO_DO_BICHO[Math.floor(ten / 4)];
          });
          const userChoices = option.split(' | ');
          return animals.every((a) => userChoices.includes(a));
        }
        case 'sequence': {
          const animals = game.results.map(
            (a) => JOGO_DO_BICHO[Math.floor(Number(`${a[2]}${a[3]}`) / 4)],
          );
          const user = option.split(' | ');
          const hasTwoAnimals = animals.every((a) => user.includes(a));
          if (!hasTwoAnimals) return false;

          const firstIndex = animals.indexOf(user[0]);
          const secondIndex = animals.indexOf(user[1]);

          return firstIndex < secondIndex;
        }
      }
    };

    return game.bets.map<BichoWinner>((player) => ({
      didWin: didUserWin(player.option, betType(player.option)),
      id: player.id,
      value: player.bet * BICHO_BET_MULTIPLIER[betType(player.option)],
    }));
  }

  finishGame(): void {
    if (this.clientInstance.shard!.ids[0] === 0) {
      const results = [getResults(), getResults(), getResults(), getResults(), getResults()];

      this.ongoingGame.results = results;
      this.lastGame = this.ongoingGame;
      this.ongoingGame = {
        dueDate: Date.now() + GAME_DURATION,
        bets: [],
        results: [],
        biggestProfit: 0,
      };

      const winners = JogoDoBixoManager.makeWinners(this.lastGame);
      winners
        .filter((a) => a.didWin)
        .forEach((a) => {
          this.clientInstance.repositories.starRepository.add(a.id, a.value);
          if (this.lastGame && a.value > this.lastGame?.biggestProfit)
            this.lastGame.biggestProfit = a.value;
        });
    } else {
      this.clientInstance.shard!.broadcastEval(
        // @ts-expect-error Client n é coiso
        (c: MenheraClient) => {
          c.jogoDoBichoManager.finishGame();
        },
        { shard: 0 },
      );
    }
  }

  async canRegister(userId: string): Promise<boolean> {
    if (this.clientInstance.shard!.ids[0] === 0) {
      if (this.ongoingGame.dueDate < Date.now()) return false;
      if (this.ongoingGame.bets.some((plr) => plr.id === userId)) return false;
      return true;
    }
    return this.clientInstance.shard!.broadcastEval(
      // @ts-expect-error Client n é coiso
      (c: MenheraClient) => c.jogoDoBichoManager.canRegister(userId),
      { shard: 0 },
    );
  }

  addBet(userId: string, bet: number, option: string): void {
    if (this.clientInstance.shard!.ids[0] === 0) {
      this.ongoingGame.bets.push({ id: userId, bet, option });
    } else {
      this.clientInstance.shard!.broadcastEval(
        // @ts-expect-error Client n é coiso
        (c: MenheraClient) => {
          c.jogoDoBichoManager.addBet(userId, bet, option);
        },
        { shard: 0 },
      );
    }
  }

  async lastGameStatus(): Promise<MayNotExists<JogoDoBichoGame>> {
    if (this.clientInstance.shard!.ids[0] === 0) {
      return this.lastGame;
    }
    return this.clientInstance.shard!.broadcastEval(
      // @ts-expect-error Client n é coiso
      (c: MenheraClient) => c.jogoDoBichoManager.lastGame,
      { shard: 0 },
    );
  }

  async currentGameStatus(): Promise<JogoDoBichoGame> {
    if (this.clientInstance.shard!.ids[0] === 0) {
      return this.ongoingGame;
    }
    return this.clientInstance.shard!.broadcastEval(
      // @ts-expect-error Client n é coiso
      (c: MenheraClient) => c.jogoDoBichoManager.ongoingGame,
      { shard: 0 },
    );
  }

  stopGameLoop(): void {
    if (this.clientInstance.shard!.ids[0] === 0) {
      clearInterval(this.gameLoop);

      this.ongoingGame.bets.forEach((a) => {
        this.clientInstance.repositories.starRepository.add(a.id, a.bet);
      });

      this.ongoingGame = {
        dueDate: 0,
        bets: [],
        results: [],
        biggestProfit: 0,
      };
    } else {
      this.clientInstance.shard!.broadcastEval(
        // @ts-expect-error Client n é coiso
        (c: MenheraClient) => {
          c.jogoDoBichoManager.stopGameLoop();
        },
        { shard: 0 },
      );
    }
  }

  restartGameLoop(): void {
    if (this.clientInstance.shard!.ids[0] === 0) {
      this.ongoingGame = {
        dueDate: Date.now() + GAME_DURATION,
        bets: [],
        results: [],
        biggestProfit: 0,
      };
      this.gameLoop = setInterval(() => {
        this.finishGame();
      }, GAME_DURATION);
    } else {
      this.clientInstance.shard!.broadcastEval(
        // @ts-expect-error Client n é coiso
        (c: MenheraClient) => {
          c.jogoDoBichoManager.restartGameLoop();
        },
        { shard: 0 },
      );
    }
  }
}
