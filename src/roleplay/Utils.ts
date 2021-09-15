import BasicFunctions from './Functions/BasicFunctions';
import {
  IEnochiaShop,
  IInventoryItem,
  IItemFile,
  ILeveledItem,
  IMoney,
  IQuest,
  IQuestsFile,
  IReturnData,
  IRpgUserSchema,
  IUsableItem,
  TItemRarity,
  TItemType,
} from './Types';

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

const resolveDailyQuests = (
  userLevel: number,
  questsFile: IReturnData<IQuestsFile>[],
): IQuest[] => {
  const getQuestLevel = (level: number): number => Math.floor(level / 3) + 1;
  const availableQuests = questsFile.filter((a) => {
    if (!a.data.isDaily) return false;
    if (userLevel < a.data.minUserLevel) return false;
    if (a.data.maxUserLevel && userLevel > a.data.maxUserLevel) return false;
    return true;
  });

  const selectedQuests: IReturnData<IQuestsFile>[] = [];

  for (let i = 0; i < 3; i++) {
    const randomizedQuest = randomFromArray(availableQuests);
    if (
      typeof selectedQuests.find((a) => a.id === randomizedQuest.id) !== 'undefined' &&
      availableQuests.length > 3
    ) {
      i -= 1;
      // eslint-disable-next-line no-continue
      continue;
    }
    selectedQuests.push(randomizedQuest);
  }

  return selectedQuests.map((a) => {
    const toReturn = {
      id: a.id,
      level: getQuestLevel(userLevel),
      progress: 0,
      finished: false,
      claimed: false,
    };
    return toReturn;
  });
};

const resolveEnochiaMart = (
  userLevel: number,
  itemsFile: IReturnData<IItemFile<boolean>>[],
): IEnochiaShop => {
  const shopToReturn: IEnochiaShop = {
    armors: [],
    weapons: [],
    potions: [],
  };

  const getItemLevel = (level: number): number => Math.floor(level / 5) + 1;

  const getItemsByRarityAndType = (rarity: TItemRarity, type: TItemType) =>
    itemsFile.filter((a) => a.data.rarity === rarity && a.data.type === type);

  for (let i = 0; i < 3; i++) {
    const allArmors = getItemsByRarityAndType(calculateRarity(), 'armor');
    const selectedArmor = randomFromArray(allArmors);
    shopToReturn.armors.push({ id: selectedArmor.id, level: getItemLevel(userLevel) });
  }

  for (let i = 0; i < 3; i++) {
    const allWeapons = getItemsByRarityAndType(calculateRarity(), 'weapon');
    const selectedWeapon = randomFromArray(allWeapons);
    shopToReturn.weapons.push({ id: selectedWeapon.id, level: getItemLevel(userLevel) });
  }

  for (let i = 0; i < 3; i++) {
    const allPotions = getItemsByRarityAndType(calculateRarity(), 'potion');
    const selectedPotion = randomFromArray(allPotions);
    shopToReturn.potions.push({ id: selectedPotion.id, level: getItemLevel(userLevel) });
  }

  return shopToReturn;
};

const canBuy = (money: IMoney): boolean => {
  if (money.bronze < 0 || money.silver < 0 || money.gold < 0) return false;
  return true;
};

const usePotion = (
  user: IRpgUserSchema,
  potion: IUsableItem,
  itemData: ILeveledItem,
  maxLife: number,
  maxMana: number,
): [number, IInventoryItem[]] => {
  let newData = potion.helperType === 'heal' ? user.life : user.mana;

  if (potion.helperType === 'heal') {
    newData += potion.data.value + itemData.level * potion.data.perLevel;
    if (newData > maxLife) newData = maxLife;
  }

  if (potion.helperType === 'mana') {
    newData += potion.data.value + itemData.level * potion.data.perLevel;
    if (newData > maxMana) newData = maxMana;
  }

  const newInventory = BasicFunctions.mergeInventory(
    user.inventory,
    {
      id: itemData.id,
      level: itemData.level,
    },
    true,
  );

  return [newData, newInventory];
};

const parseEntry = <T>(entry: [string, T][]): IReturnData<T>[] =>
  entry.map((a) => ({ id: Number(a[0]), data: a[1] }));

export {
  canBuy,
  resolveCustomId,
  resolveEnochiaMart,
  randomFromArray,
  usePotion,
  resolveDailyQuests,
  parseEntry,
};
