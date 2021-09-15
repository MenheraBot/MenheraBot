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
  IReturnData,
} from '../Types';

export default class BasicFunctions {
  constructor(private client: MenheraClient) {}

  getClassDataById(classId: number): IClassesFile {
    return this.client.boleham.Classes.filter((cls) => cls.id === classId)[0].data;
  }

  getRaceDataById(raceId: number): IRacesFiles {
    return this.client.boleham.Races.filter((cls) => cls.id === raceId)[0].data;
  }

  getDataToRegister(userID: string, classID: number, raceID: number): IBasicData {
    const selectedClass = this.getClassDataById(classID);

    const firstAbility = this.client.boleham.Abilities.filter((a) => a.id === 100 * classID + 1)[0];

    return {
      id: userID,
      classId: classID,
      raceId: raceID,
      abilities: [{ id: firstAbility.id, level: 1, xp: 0 }],
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

  getAbilityById(id: number): IAbilitiesFile {
    return this.client.boleham.Abilities.filter((a) => a.id === id)[0].data;
  }

  getAllBuildingsFromLocationId(locationId: number): IReturnData<IBuildingFile>[] {
    return this.client.boleham.Buildings.filter((a) => a.data.locationId === locationId);
  }

  getBuildingById(id: number): IBuildingFile {
    return this.client.boleham.Buildings.filter((a) => a.id === id)[0].data;
  }

  getQuestById(id: number): IQuestsFile {
    return this.client.boleham.Quests.filter((a) => a.id === id)[0].data;
  }

  getItemById<T extends boolean>(id: number | string): IItemFile<T>;

  getItemById(id: number): IUsableItem | IUnusableItem {
    return this.client.boleham.Items.filter((a) => a.id === id)[0].data;
  }

  getMobAttacks(mobAttacks: number[]): IMobAttacksFile[] {
    return mobAttacks.map((a) => this.client.boleham.MobsAttack.filter((b) => b.id === a)[0].data);
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
