import { IMobsFile } from '@roleplay/Types';
import { randomFromArray } from '@roleplay/Utils';
import MenheraClient from 'MenheraClient';

export default class BattleFunctions {
  constructor(private client: MenheraClient) {}

  getRandomMob(
    userLevel: number,
    userLocation: number,
    maxMobs: number,
    fromBuilding: boolean,
  ): IMobsFile[] {
    const availableMobs = this.client.boleham.Mobs.filter(
      (a) =>
        a[1].minUserLevel <= userLevel &&
        a[1].isLocationBuilding === fromBuilding &&
        a[1].availableLocations.includes(userLocation),
    );

    const choosenMob = randomFromArray(availableMobs)[1];
    const mobsToReturn = Math.floor(Math.random() * maxMobs) + 1;
    return Array<IMobsFile>().fill(choosenMob, 0, mobsToReturn);
  }
}
