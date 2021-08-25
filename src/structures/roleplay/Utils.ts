import { IEnochiaShop, IItemFile, TItemRarity, TItemType } from './Types';

const resolveCustomId = (customId: string): string =>
  customId
    .replace(/^[\s\d]+/, '')
    .replace('|', '')
    .trim();

const calculateRarity = (): TItemRarity => {
  const random = Math.random() * 100;
  if (random <= 0.1) return 'ascendant';
  if (random <= 0.6) return 'legendary';
  if (random <= 3) return 'mythical';
  if (random <= 20) return 'rare';
  return 'common';
};

const resolveEnochiaMart = (userLevel: number, itemsFile: [string, IItemFile][]): IEnochiaShop => {
  const shopToReturn: IEnochiaShop = {
    armors: [],
    weapons: [],
    potions: [],
  };

  const getItemLevel = (level: number): number => Math.floor(level / 5) + 1;

  const getItemsByRarityAndType = (rarity: TItemRarity, type: TItemType) =>
    itemsFile.filter((a) => a[1].rarity === rarity && a[1].type === type);

  for (let i = 0; i < 3; i++) {
    const selectedArmor = getItemsByRarityAndType(calculateRarity(), 'armor');
    shopToReturn.armors.push({ id: Number(selectedArmor[0]), level: getItemLevel(userLevel) });
  }

  for (let i = 0; i < 3; i++) {
    const selectedWeapon = getItemsByRarityAndType(calculateRarity(), 'weapon');
    shopToReturn.armors.push({ id: Number(selectedWeapon[0]), level: getItemLevel(userLevel) });
  }

  for (let i = 0; i < 3; i++) {
    const selectedPotion = getItemsByRarityAndType(calculateRarity(), 'potion');
    shopToReturn.armors.push({ id: Number(selectedPotion[0]), level: getItemLevel(userLevel) });
  }

  return shopToReturn;
};

export { resolveCustomId, resolveEnochiaMart };
