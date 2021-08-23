import MenheraClient from 'MenheraClient';
import {
  IAbilitiesFile,
  IBasicData,
  IBuildingFile,
  IClassesFile,
  IItemFile,
  IMoney,
  IRacesFiles,
} from './Types';

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

  getItemById(id: number | string): IItemFile {
    return this.client.boleham.Items.filter((a) => a[0] === `${id}`)[0][1];
  }

  static mergeCoins(baseCoins: IMoney, toMerge: IMoney): IMoney {
    baseCoins.bronze += toMerge.bronze;
    baseCoins.silver += toMerge.silver;
    baseCoins.gold += toMerge.gold;
    return baseCoins;
  }
}
