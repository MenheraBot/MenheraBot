import ptItemsLocalizations from '../../../locales/pt-BR/items.json';
import enItemsLocalizations from '../../../locales/en-US/items.json';
import itemsFile from './Items';

describe('Check if all items has localizations', () => {
  const keys = Object.keys(itemsFile).sort();

  it('should be true', () => {
    expect(keys).toEqual(Object.keys(enItemsLocalizations).sort());
  });

  it('should be true', () => {
    expect(keys).toEqual(Object.keys(ptItemsLocalizations).sort());
  });
});

export {};
