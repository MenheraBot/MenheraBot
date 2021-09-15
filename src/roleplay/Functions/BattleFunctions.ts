import { IBattleMob, IMobsFile } from '@roleplay/Types';
import { randomFromArray } from '@roleplay/Utils';
import MenheraClient from 'MenheraClient';

export default class BattleFunctions {
  constructor(private client: MenheraClient) {}

  getRandomMob(
    userLevel: number,
    userLocation: number,
    maxMobs: number,
    fromBuilding: boolean,
  ): (IMobsFile & { level: number })[] {
    const availableMobs = this.client.boleham.Mobs.filter(
      (a) =>
        a[1].minUserLevel <= userLevel &&
        a[1].isLocationBuilding === fromBuilding &&
        a[1].availableLocations.includes(userLocation),
    );

    const choosenMob = randomFromArray(availableMobs)[1];
    const mobsToReturn = Math.floor(Math.random() * maxMobs) + 1;

    const calculatedMobLevel = Math.floor(userLevel / 4) * 10 + Math.floor(Math.random() * 10);
    const level = calculatedMobLevel === 0 ? 1 : calculatedMobLevel;

    return Array<IMobsFile>(mobsToReturn)
      .fill(choosenMob, 0, mobsToReturn)
      .map((a) => ({ ...a, level }));
  }

  prepareMobForBattle(mobs: (IMobsFile & { level: number })[]): IBattleMob[] {
    return mobs.map((mob) => {
      const life = mob.baseLife + mob.perLevel.baseLife * mob.level;
      const speed = mob.baseSpeed + mob.perLevel.baseSpeed * mob.level;
      const armor = mob.baseArmor + mob.perLevel.baseArmor * mob.level;
      const damage = mob.baseDamage + mob.perLevel.baseDamage * mob.level;
      const attackSkill = mob.baseSkill + mob.perLevel.baseSkill * mob.level;
      const attacks = this.client.boleham.Functions.getMobAttacks(mob.availableAttacks);

      return { life, speed, armor, damage, attackSkill, attacks, effects: [] };
    });
  }
}
