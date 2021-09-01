import BasicFunctions from './BasicFunctions';
import {
  IEnochiaShop,
  IInventoryItem,
  IItemFile,
  ILeveledItem,
  IMoney,
  IQuest,
  IQuestsFile,
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

const resolveDailyQuests = (userLevel: number, questsFile: [string, IQuestsFile][]): IQuest[] => {
  const getQuestLevel = (level: number): number => Math.floor(level / 3) + 1;
  const availableQuests = questsFile.filter((a) => {
    if (!a[1].isDaily) return false;
    if (userLevel < a[1].minUserLevel) return false;
    if (a[1].maxUserLevel && userLevel > a[1].maxUserLevel) return false;
    return true;
  });

  const selectedQuests: [string, IQuestsFile][] = [];

  for (let i = 0; i < 3; i++) {
    const randomizedQuest = randomFromArray(availableQuests);
    if (
      typeof selectedQuests.find((a) => a[0] === randomizedQuest[0]) !== 'undefined' &&
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
      id: Number(a[0]),
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
  itemsFile: [string, IItemFile<boolean>][],
): IEnochiaShop => {
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

const usePotion = (
  user: IRpgUserSchema,
  potion: IUsableItem,
  itemData: ILeveledItem,
): [number, IInventoryItem[]] => {
  let newData = potion.helperType === 'heal' ? user.life : user.mana;

  if (potion.helperType === 'heal') {
    newData += potion.data.value + itemData.level * potion.data.perLevel;
    if (newData > user.maxLife) newData = user.maxLife;
  }

  if (potion.helperType === 'mana') {
    newData += potion.data.value + itemData.level * potion.data.perLevel;
    if (newData > user.maxMana) newData = user.maxMana;
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

export {
  canBuy,
  resolveCustomId,
  resolveEnochiaMart,
  randomFromArray,
  usePotion,
  resolveDailyQuests,
};
