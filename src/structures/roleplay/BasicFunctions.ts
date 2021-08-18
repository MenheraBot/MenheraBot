import MenheraClient from 'MenheraClient';
import { IBasicData } from './Types';

export default class BasicFunctions {
  constructor(private client: MenheraClient) {}

  getDataToRegister(userID: string, classID: string, raceID: string): IBasicData {
    const selectedClass = this.client.boleham.Classes.filter((a) => a[0] === classID)[0][1];

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
}
