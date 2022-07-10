/* eslint-disable no-restricted-syntax */
import PtAbilities from '../src/locales/pt-BR/abilities.json';
import EnAbilities from '../src/locales/en-US/abilities.json';

import PtPermissions from '../src/locales/pt-BR/permissions.json';
import EnPermissions from '../src/locales/en-US/permissions.json';

import PtCommands from '../src/locales/pt-BR/commands.json';
import EnCommands from '../src/locales/en-US/commands.json';

describe('Check if all locales files are ok', () => {
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

  test('English commands shoud be equal to Portuguese commands', () => {
    const portuguese: string[] = [];
    const english: string[] = [];

    const dontKnow = (parent: string, child: string | unknown, lang: 'pt' | 'en'): void => {
      if (typeof child === 'string') {
        if (parent.endsWith('uncensored')) return;
        if (lang === 'pt') portuguese.push(`${parent}`);
        else english.push(`${parent}`);
        return;
      }

      // @ts-expect-error UwU
      const entries = Object.entries(child);

      entries.forEach((b) => dontKnow(`${parent}:${b[0]}`, b[1], lang));
    };

    Object.entries(PtCommands).forEach((a) => dontKnow(a[0], a[1], 'pt'));
    Object.entries(EnCommands).forEach((a) => dontKnow(a[0], a[1], 'en'));

    const afterCheck = english.filter((a) => !portuguese.includes(a));

    expect(afterCheck).toStrictEqual([]);
  });
});

export {};
