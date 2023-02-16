/* eslint-disable no-continue */
import { BICHO_ANIMALS, didUserWin } from './finishBets';
import { BichoBetType } from './types';

describe('Bicho didUserWin function', () => {
  // 'vaca', 'águia', 'veado', 'leão', 'galo'
  const mockedResults = [
    [8, 9, 9, 9],
    [0, 8, 0, 7],
    [6, 8, 9, 5],
    [9, 1, 6, 3],
    [0, 3, 5, 0],
  ];

  const testWin = (option: string, bet: BichoBetType): boolean =>
    didUserWin(mockedResults, option, bet);

  test('check all possibilities of winning by numbers', () => {
    let truthyResults = 0;

    for (let i = 0; i < 10000; i++) {
      if (i < 10) {
        const result = testWin(`${i}`, 'unity');
        if (result) truthyResults += 1;
        continue;
      }

      if (i < 100) {
        const result = testWin(`${i}`, 'ten');
        if (result) truthyResults += 1;
        continue;
      }

      if (i < 1000) {
        const result = testWin(`${i}`, 'hundred');
        if (result) truthyResults += 1;
        continue;
      }

      if (i < 10000) {
        const result = testWin(`${i}`, 'thousand');
        if (result) truthyResults += 1;
      }
    }

    // To that results, 17 is the correct answer
    expect(truthyResults).toBe(17);
  });

  test('check if the animal selection is ok', () => {
    const totalResults: boolean[] = [];

    BICHO_ANIMALS.forEach((animal) => {
      totalResults.push(testWin(animal, 'animal'));
    });

    expect(totalResults.filter((a) => a === true).length).toBe(5);
  });

  test('check if the sequence selection is ok', () => {
    const totalResults = [
      testWin('avestruz | águia', 'sequence'),
      testWin('vaca | veado', 'sequence'),
      testWin('águia | vaca', 'sequence'),
      testWin('veado | leão', 'sequence'),
      testWin('veado | leão', 'sequence'),
      testWin('galo | vaca', 'sequence'),
    ];

    expect(totalResults).toEqual([false, true, false, true, true, false]);
  });

  test('check if the corner selection is ok', () => {
    const totalResults = [
      testWin('vaca | águia | veado | leão | galo', 'corner'),
      testWin('veado | águia | leão | galo | vaca', 'corner'),
      testWin('borboleta | vaca | burro | veado | galo', 'corner'),
      testWin('vaca | vaca | vaca | vaca | vaca', 'corner'),
    ];

    expect(totalResults).toEqual([true, true, false, false]);
  });
});

export {};
