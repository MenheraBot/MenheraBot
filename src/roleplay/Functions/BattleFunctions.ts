import {
  AsAnUsableItem,
  IAbilityResolved,
  IBattleMob,
  IBattleUser,
  IMobsFile,
  IRpgUserSchema,
  TEffectType,
} from '@roleplay/Types';
import { randomFromArray } from '@roleplay/Utils';
import MenheraClient from 'MenheraClient';

export default class BattleFunctions {
  constructor(private client: MenheraClient) {}

  getRandomMob(
    userLevel: number,
    mobLocation: number,
    maxMobs: number,
    fromBuilding: boolean,
  ): (IMobsFile & { level: number })[] {
    const availableMobs = this.client.boleham.Mobs.filter(
      (a) =>
        a.data.minUserLevel <= userLevel &&
        a.data.isLocationBuilding === fromBuilding &&
        a.data.availableLocations.includes(mobLocation),
    );

    const choosenMob = randomFromArray(availableMobs).data;
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

  prepareUserForBattle(user: IRpgUserSchema): IBattleUser {
    const userClassData = this.client.boleham.Functions.getClassDataById(user.classId);
    const { life, mana, tiredness, speed, lucky, attackSkill, abilitySkill } = user;
    let armor = user.baseArmor + userClassData.baseAttributesPerLevel.baseArmor * user.level;
    const damage = user.baseDamage + userClassData.baseAttributesPerLevel.baseDamage * user.level;
    let weapon: IBattleUser['weapon'] = null;
    const abilities: IAbilityResolved[] = user.abilities.map((a) => {
      const abilityData = this.client.boleham.Functions.getAbilityById(a.id);
      return {
        cost: abilityData.cost,
        element: abilityData.element,
        turnsCooldown: abilityData.turnsCooldown,
        randomChoice: abilityData.randomChoice ?? false,
        effects: abilityData.effects,
        level: a.level,
      };
    });

    if (user.equiped.weapon) {
      const weaponData = this.client.boleham.Functions.getItemById<AsAnUsableItem>(
        user.equiped.weapon.id,
      );
      weapon = {
        effect: weaponData.helperType as TEffectType,
        damage: weaponData.data.value + weaponData.data.perLevel * user.equiped.weapon.level,
      };
    }

    const equiped = user.equiped.armor;

    if (equiped.boots) {
      const bootData = this.client.boleham.Functions.getItemById<AsAnUsableItem>(equiped.boots.id);

      armor += bootData.data.value + bootData.data.perLevel * equiped.boots.level;
    }

    if (equiped.chest) {
      const chestData = this.client.boleham.Functions.getItemById<AsAnUsableItem>(equiped.chest.id);

      armor += chestData.data.value + chestData.data.perLevel * equiped.chest.level;
    }

    if (equiped.head) {
      const headData = this.client.boleham.Functions.getItemById<AsAnUsableItem>(equiped.head.id);

      armor += headData.data.value + headData.data.perLevel * equiped.head.level;
    }

    if (equiped.pants) {
      const pantsData = this.client.boleham.Functions.getItemById<AsAnUsableItem>(equiped.pants.id);

      armor += pantsData.data.value + pantsData.data.perLevel * equiped.pants.level;
    }

    return {
      life,
      mana,
      tiredness,
      speed,
      lucky,
      armor,
      damage,
      weapon,
      attackSkill,
      abilitySkill,
      abilities,
    };
  }
}
