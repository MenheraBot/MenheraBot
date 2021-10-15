/* eslint-disable no-nested-ternary */
import { COLORS, emojis } from '@structures/MenheraConstants';
import { MessageEmbed } from 'discord.js-light';
import { TFunction } from 'i18next';
import BasicFunctions from './Functions/BasicFunctions';
import {
  IAbilityResolved,
  IBattleUser,
  IEnochiaShop,
  IInventoryItem,
  IItemFile,
  ILeveledItem,
  IMoney,
  IQuest,
  IQuestsFile,
  IResolvedAbilityEffect,
  IResolvedBattleInventory,
  IReturnData,
  IRpgUserSchema,
  IUsableItem,
  TItemRarity,
  IInventoryAttack,
  TItemType,
  TBattleEntity,
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

const createBaseBattleEmbed = (locale: TFunction, entities: string[]): MessageEmbed =>
  new MessageEmbed()
    .setTitle(`${emojis.sword} | ${locale('common:battle')}`)
    .setColor(COLORS.Colorless)
    .setDescription(locale('common:battle_desc', { user: entities[0], enemy: entities[1] }));

const resolveEffects = (user: IBattleUser, ability: IAbilityResolved): IResolvedAbilityEffect[] => {
  if (ability.randomChoice) {
    const selected = randomFromArray(ability.effects);
    return [
      {
        isValuePercentage: selected.isValuePercentage ?? false,
        target: selected.target,
        cumulative: selected.cumulative ?? false,
        turns: selected.turns ?? 0,
        type: selected.type,
        value: selected.value ? selected.value * ability.level : 0,
      },
    ];
  }

  return ability.effects.map((a) => ({
    isValuePercentage: a.isValuePercentage ?? false,
    target: a.target,
    turns: a.turns ?? 0,
    type: a.type,
    cumulative: a.cumulative ?? false,
    value: a.value
      ? a.isValuePercentage
        ? a.value
        : a.value * ability.level +
          (ability.element === user.afinity ? a.value * ability.level * 0.1 : 0)
      : 0,
  }));
};

const resolveItemUsage = (item: IResolvedBattleInventory): IInventoryAttack => {
  switch (item.type) {
    case 'potion': {
      return {
        type: 'inventory',
        effects: item.effects.map((a) => ({
          target: a.target,
          type: a.type,
          cumulative: a.cumulative,
          value: a.value + item.data.perLevel * item.level,
        })),
      };
    }
  }
};

const isDead = (entity: TBattleEntity): boolean => entity.life <= 0;

const negate = (value: number): number => value * -1;

const calculateValue = (toEffect: number, isValuePercentage: boolean, value: number): number =>
  isValuePercentage ? toEffect + toEffect * (value / 100) : toEffect + value;

export {
  canBuy,
  resolveCustomId,
  resolveEnochiaMart,
  randomFromArray,
  usePotion,
  resolveDailyQuests,
  isDead,
  parseEntry,
  resolveItemUsage,
  resolveEffects,
  calculateValue,
  negate,
  createBaseBattleEmbed,
};
