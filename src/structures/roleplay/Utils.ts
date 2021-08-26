import { IEnochiaShop, IItemFile, IMoney, TItemRarity, TItemType } from './Types';

const randomFromArray = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

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
    const allArmors = getItemsByRarityAndType(calculateRarity(), 'armor');
    const selectedArmor = randomFromArray(allArmors);
    shopToReturn.armors.push({ id: Number(selectedArmor[0]), level: getItemLevel(userLevel) });
  }

  for (let i = 0; i < 3; i++) {
    const allWeapons = getItemsByRarityAndType(calculateRarity(), 'weapon');
    const selectedWeapon = randomFromArray(allWeapons);
    shopToReturn.weapons.push({ id: Number(selectedWeapon[0]), level: getItemLevel(userLevel) });
  }

  for (let i = 0; i < 3; i++) {
    const allPotions = getItemsByRarityAndType(calculateRarity(), 'potion');
    const selectedPotion = randomFromArray(allPotions);
    shopToReturn.potions.push({ id: Number(selectedPotion[0]), level: getItemLevel(userLevel) });
  }

  return shopToReturn;
};

const canBuy = (money: IMoney): boolean => {
  if (money.bronze < 0 || money.silver < 0 || money.gold < 0) return false;
  return true;
};

export { canBuy, resolveCustomId, resolveEnochiaMart, randomFromArray };
