import ptEnemiesLocalizations from '../../../locales/pt-BR/enemies.json';
import enEnemiesLocalizations from '../../../locales/en-US/enemies.json';
import enemiesFile from './Enemies';

describe('Check if all enemies has localizations', () => {
  const keys = Object.keys(enemiesFile).sort();

  it('arrays should be equal', () => {
    expect(keys).toEqual(Object.keys(ptEnemiesLocalizations).sort());
  });

  it('arrays should be equal', () => {
    expect(keys).toEqual(Object.keys(enEnemiesLocalizations).sort());
  });
});

export {};
