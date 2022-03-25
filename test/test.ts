import pt from '../src/locales/pt-BR/abilities.json';
import en from '../src/locales/en-US/abilities.json';

describe('Check if abilities locales files are ok', () => {
  const portuguese = Object.entries(pt);
  const english = Object.entries(en);

  const allPt: string[] = [];
  const allEn: string[] = [];

  let hasNameAndDescPT = true;
  let hasNameAndDescEN = true;

  portuguese.forEach((a) => {
    allPt.push(a[0]);

    if (!('name' in a[1]) || !('description' in a[1])) hasNameAndDescPT = false;
  });
  english.forEach((a) => {
    allEn.push(a[0]);
    if (!('name' in a[1]) || !('description' in a[1])) hasNameAndDescEN = false;
  });

  test('it has to be true', () => expect(hasNameAndDescEN).toBe(true));
  test('it has to be true', () => expect(hasNameAndDescPT).toBe(true));

  test('arrays have to be the same', () => expect(allPt).toContainEqual(allEn));
});

export {};
