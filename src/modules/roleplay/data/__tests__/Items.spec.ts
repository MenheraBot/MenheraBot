import ptItemsLocalizations from '../../../../locales/pt-BR/items.json';
import enItemsLocalizations from '../../../../locales/en-US/items.json';
import itemsFile from '../Items';
import equipmentFiles from '../Equipments';

describe('Check if all items has localizations', () => {
  const keys = Object.keys(itemsFile).concat(Object.keys(equipmentFiles)).sort();

  it('arrays should be equal', () => {
    expect(keys).toEqual(Object.keys(enItemsLocalizations).sort());
  });

  it('arrays should be equal', () => {
    expect(keys).toEqual(Object.keys(ptItemsLocalizations).sort());
  });
});

export {};
