/* eslint-disable no-restricted-syntax */
import PtAbilities from '../src/locales/pt-BR/abilities.json';
import EnAbilities from '../src/locales/en-US/abilities.json';

import PtPermissions from '../src/locales/pt-BR/permissions.json';
import EnPermissions from '../src/locales/en-US/permissions.json';

import PtItems from '../src/locales/pt-BR/items.json';
import UsItems from '../src/locales/en-US/items.json';

import PtEnemies from '../src/locales/pt-BR/enemies.json';
import UsEnemies from '../src/locales/en-US/enemies.json';

describe('Check if all locales files are ok', () => {
  test('see if enemies files are ok', () => {
    const portuguese = Object.entries(PtEnemies);
    const english = Object.entries(UsEnemies);

    let allIdsOk = true;
    let hasNameAndDescPT = true;
    let hasNameAndDescEN = true;

    portuguese.forEach((a) => {
      if (!english.some((b) => b[0] === a[0])) allIdsOk = false;

      if (!('name' in a[1])) hasNameAndDescPT = false;
    });

    english.forEach((a) => {
      if (!('name' in a[1])) hasNameAndDescEN = false;
    });

    expect(hasNameAndDescEN).toBe(true);
    expect(hasNameAndDescPT).toBe(true);
    expect(allIdsOk).toBe(true);
  });

  test('see if items files are ok', () => {
    const portuguese = Object.entries(PtItems);
    const english = Object.entries(UsItems);

    let allIdsOk = true;
    let hasNameAndDescPT = true;
    let hasNameAndDescEN = true;

    portuguese.forEach((a) => {
      if (!english.some((b) => b[0] === a[0])) allIdsOk = false;

      if (!('name' in a[1])) hasNameAndDescPT = false;
    });

    english.forEach((a) => {
      if (!('name' in a[1])) hasNameAndDescEN = false;
    });

    expect(hasNameAndDescEN).toBe(true);
    expect(hasNameAndDescPT).toBe(true);
    expect(allIdsOk).toBe(true);
  });

  test('see if abilities files are ok', () => {
    const portuguese = Object.entries(PtAbilities);
    const english = Object.entries(EnAbilities);

    let allIdsOk = true;
    let hasNameAndDescPT = true;
    let hasNameAndDescEN = true;

    portuguese.forEach((a) => {
      if (!english.some((b) => b[0] === a[0])) allIdsOk = false;

      if (!('name' in a[1]) || !('description' in a[1])) hasNameAndDescPT = false;
    });
    english.forEach((a) => {
      if (!('name' in a[1]) || !('description' in a[1])) hasNameAndDescEN = false;
    });

    expect(hasNameAndDescEN).toBe(true);
    expect(hasNameAndDescPT).toBe(true);
    expect(allIdsOk).toBe(true);
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
