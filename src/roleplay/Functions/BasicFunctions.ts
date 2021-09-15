/* eslint-disable no-param-reassign */
import MenheraClient from 'MenheraClient';
import { Document } from 'mongoose';
import {
  IAbilitiesFile,
  IBasicData,
  IBuildingFile,
  IClassesFile,
  IInventoryItem,
  IItemFile,
  ILeveledItem,
  IMoney,
  IRacesFiles,
  IUnusableItem,
  IUsableItem,
  AsAnUsableItem,
  IQuestsFile,
  IUpdatedUserInfo,
  IRpgUserSchema,
  IMobAttacksFile,
} from '../Types';

export default class BasicFunctions {
  constructor(private client: MenheraClient) {}

  getClassDataById(classId: number | string): IClassesFile {
    return this.client.boleham.Classes.filter((cls) => cls[0] === `${classId}`)[0][1];
  }

  getRaceDataById(raceId: number | string): IRacesFiles {
    return this.client.boleham.Races.filter((cls) => cls[0] === `${raceId}`)[0][1];
  }

  getDataToRegister(userID: string, classID: string, raceID: string): IBasicData {
    const selectedClass = this.getClassDataById(classID);

    const firstAbility = this.client.boleham.Abilities.filter(
      (a) => a[0] === `${100 * Number(classID) + 1}`,
    )[0];

    return {
      id: userID,
      classId: Number(classID),
      raceId: Number(raceID),
      abilities: [{ id: Number(firstAbility[0]), level: 1, xp: 0 }],
      baseArmor: selectedClass.baseArmor,
      baseDamage: selectedClass.baseDamage,
      attackSkill: selectedClass.attackSkill,
      abilitySkill: selectedClass.abilitySkill,
      speed: selectedClass.speed,
      equiped: { armor: {}, backpack: { id: 0, level: 1 } },
    };
  }

  getMaxXpForLevel(level: number): number {
    return this.client.boleham.Experiences[level];
  }

  getAbilityById(id: number | string): IAbilitiesFile {
    return this.client.boleham.Abilities.filter((a) => a[0] === `${id}`)[0][1];
  }

  getAllBuildingsFromLocationId(locationId: number): [string, IBuildingFile][] {
    return this.client.boleham.Buildings.filter((a) => a[1].locationId === locationId);
  }

  getBuildingById(id: number | string): IBuildingFile {
    return this.client.boleham.Buildings.filter((a) => a[0] === `${id}`)[0][1];
  }

  getQuestById(id: number | string): IQuestsFile {
    return this.client.boleham.Quests.filter((a) => a[0] === `${id}`)[0][1];
  }

  getItemById<T extends boolean>(id: number | string): IItemFile<T>;

  getItemById(id: number | string): IUsableItem | IUnusableItem {
    return this.client.boleham.Items.filter((a) => a[0] === `${id}`)[0][1];
  }

  getMobAttacks(mobAttacks: number[]): IMobAttacksFile[] {
    return mobAttacks.map(
      (a) => this.client.boleham.MobsAttack.filter((b) => b[0] === `${a}`)[0][1],
    );
  }

  checkUserUp(user: IRpgUserSchema | (IRpgUserSchema & Document)): {
    updatedUser: IUpdatedUserInfo;
    didUp: boolean;
  } {
    let didUp = false;
    if (user.xp >= this.client.boleham.Experiences[user.level]) {
      user.level += 1;
      user.xp = 0;
      didUp = true;
    }

    return { updatedUser: { level: user.level, xp: user.xp }, didUp };
  }

  getBackPackLimit(backpack: ILeveledItem): number {
    const backpackInfo = this.getItemById<AsAnUsableItem>(backpack.id);
    return backpackInfo.data.value + backpackInfo.data.perLevel * backpack.level;
  }

  static mergeInventory(
    inventory: IInventoryItem[],
    toMerge: ILeveledItem,
    remove?: boolean,
  ): IInventoryItem[] {
    if (remove) {
      const found =
        toMerge.level !== 0
          ? inventory.findIndex((a) => a.id === toMerge.id && a.level === toMerge.level)
          : inventory.findIndex((a) => a.id === toMerge.id);
      if (found !== -1) inventory[found].amount -= 1;
      if (inventory[found].amount <= 0) inventory.splice(found, 1);
      return inventory;
    }

    const found =
      toMerge.level !== 0
        ? inventory.findIndex((a) => a.id === toMerge.id && a.level === toMerge.level)
        : inventory.findIndex((a) => a.id === toMerge.id);
    if (found !== -1) {
      inventory[found].amount += 1;
      return inventory;
    }

    if (toMerge.id === 0) inventory.push({ id: Number(toMerge.id), amount: 1 });
    else inventory.push({ id: Number(toMerge.id), amount: 1, level: Number(toMerge.level) });
    return inventory;
  }

  static mergeCoins(baseCoins: IMoney, toMerge: IMoney, negated?: boolean): IMoney {
    if (negated) {
      baseCoins.bronze -= toMerge.bronze;
      baseCoins.silver -= toMerge.silver;
      baseCoins.gold -= toMerge.gold;
    } else {
      baseCoins.bronze += toMerge.bronze;
      baseCoins.silver += toMerge.silver;
      baseCoins.gold += toMerge.gold;
    }
    return baseCoins;
  }
}
