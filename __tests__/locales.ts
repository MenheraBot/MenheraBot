import PtAbilities from '../src/locales/pt-BR/abilities.json';
import EnAbilities from '../src/locales/en-US/abilities.json';

import PtPermissions from '../src/locales/pt-BR/permissions.json';
import EnPermissions from '../src/locales/en-US/permissions.json';

describe('Check if all locales files are ok', () => {
  test('see if abilities files are ok', () => {
    const portuguese = Object.entries(PtAbilities);
    const english = Object.entries(EnAbilities);

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

    expect(hasNameAndDescEN).toBe(true);
    expect(hasNameAndDescPT).toBe(true);
    expect(allPt).toContainEqual(allEn);
  });

  test('permissions file are ok', () => {
    const portuguese = Object.keys(PtPermissions);
    const english = Object.keys(EnPermissions);

    let isEqual = true;

    if (portuguese.length === english.length) {
      for (let i = 0; i < portuguese.length; i++)
        if (!english.some((a) => a === portuguese[i])) isEqual = false;
    } else isEqual = false;

    expect(isEqual).toBe(true);
  });
});

export {};
