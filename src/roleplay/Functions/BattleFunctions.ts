import { IMobsFile } from '@roleplay/Types';
import MenheraClient from 'MenheraClient';

export default class BattleFunctions {
  constructor(private client: MenheraClient) {}

  getRandomMob(userLevel: number, userLocation: number, maxMobs: number): IMobsFile[] {
    const mobs = this.client.boleham.Mobs.filter((a) => a[1].minUserLevel <= userLevel);
    return mobs.map((a) => a[1]);
  }
}
