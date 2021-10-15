import {
  AsAnUsableItem,
  IAbilityResolved,
  IArmor,
  IBattleEntityEffect,
  IBattleMob,
  IBattleUser,
  IInventoryItem,
  ILeveledItem,
  IMobsFile,
  IQuest,
  IResolvedArmor,
  IResolvedBattleInventory,
  IResolvedQuest,
  IResolvedWeapon,
  IRpgUserSchema,
  TBattleEntity,
  TBattleUsableItemType,
} from '@roleplay/Types';
import { randomFromArray } from '@roleplay/Utils';
import { TFunction } from 'i18next';
import MenheraClient from 'MenheraClient';

export default class BattleFunctions {
  constructor(private client: MenheraClient) {}

  getRandomMob(
    userLevel: number,
    mobLocation: number,
    maxMobs: number,
    fromBuilding: boolean,
  ): (IMobsFile & { level: number; id: number })[] {
    const availableMobs = this.client.boleham.Mobs.filter(
      (a) =>
        a.data.minUserLevel <= userLevel &&
        a.data.isLocationBuilding === fromBuilding &&
        a.data.availableLocations.includes(mobLocation),
    );

    const choosenMob = randomFromArray(availableMobs);
    const mobsToReturn = Math.floor(Math.random() * maxMobs) + 1;

    const calculatedMobLevel = Math.floor(userLevel / 4) * 10 + Math.floor(Math.random() * 10);
    const level = calculatedMobLevel === 0 ? 1 : calculatedMobLevel;

    return Array<IMobsFile>(mobsToReturn)
      .fill(choosenMob.data, 0, mobsToReturn)
      .map((a) => ({ ...a, level, id: choosenMob.id }));
  }

  prepareMobForBattle(
    mobs: (IMobsFile & { level: number; id: number })[],
    locale: TFunction,
  ): IBattleMob[] {
    return mobs.map((mob) => {
      const life = mob.baseLife + mob.perLevel.baseLife * mob.level;
      const armor = mob.baseArmor + mob.perLevel.baseArmor * mob.level;
      const damage = mob.baseDamage + mob.perLevel.baseDamage * mob.level;
      const attackSkill = mob.baseSkill + mob.perLevel.baseSkill * mob.level;
      const attacks = this.client.boleham.Functions.getMobAttacks(mob.availableAttacks);

      return {
        life,
        armor,
        damage,
        attackSkill,
        attacks,
        effects: [],
        isUser: false,
        name: locale(`mobs:mobs.${mob.id}.name`),
      };
    });
  }

  async prepareUserForBattle(user: IRpgUserSchema): Promise<IBattleUser> {
    const { life, mana, tiredness, lucky, attackSkill, abilitySkill } = user;

    let weapon: IBattleUser['weapon'] = null;

    const abilities: IAbilityResolved[] = user.abilities.map((a) => {
      const abilityData = this.client.boleham.Functions.getAbilityById(a.id);
      return {
        id: a.id,
        cost: abilityData.cost,
        element: abilityData.element,
        turnsCooldown: abilityData.turnsCooldown,
        randomChoice: abilityData.randomChoice ?? false,
        effects: abilityData.effects,
        level: a.level,
        inCooldown: 0,
      };
    });

    if (user.equiped.weapon) weapon = this.resolveWeapon(user.equiped.weapon);

    const equiped = this.resolveArmor(user.equiped?.armor);

    const armor = this.getUserArmor(user.classId, user.level, equiped, weapon);

    const damage = this.getUserDamage(user.classId, user.level, equiped, weapon);

    const { afinity } = this.client.boleham.Functions.getClassDataById(user.classId);

    const inventory = this.getUserBattleInventory(user.inventory);

    const quests = this.resolveQuests(
      user?.quests?.active,
      await this.client.repositories.rpgRepository.getUserDailyQuests(
        user.id,
        user.level,
        this.client.boleham.Quests,
      ),
    );

    return {
      id: user.id,
      life,
      mana,
      tiredness,
      lucky,
      armor,
      damage,
      inventory,
      afinity,
      weapon,
      attackSkill,
      abilitySkill,
      abilities,
      isUser: true,
      effects: [],
      quests,
    };
  }

  resolveQuests(active: IQuest | undefined, daily: IQuest[] | null): IResolvedQuest[] {
    const quests: IResolvedQuest[] = [];
    if (active) {
      const { id, progress, finished, level } = active;
      if (!finished) {
        const questData = this.client.boleham.Functions.getQuestById(id);
        const objective = {
          type: questData.objective.type,
          value: questData.objective.value + questData.objective.perLevel * level,
        };
        quests.push({
          id,
          progress,
          objective,
        });
      }
    }

    if (daily) {
      daily.forEach((a) => {
        const { id, progress, finished, level } = a;
        if (finished) return;
        const questData = this.client.boleham.Functions.getQuestById(id);
        const objective = {
          type: questData.objective.type,
          value: questData.objective.value + questData.objective.perLevel * level,
        };
        quests.push({
          id,
          progress,
          objective,
        });
      });
    }

    return quests;
  }

  resolveWeapon(weapon: ILeveledItem): IResolvedWeapon {
    const weaponData = this.client.boleham.Functions.getItemById<AsAnUsableItem>(weapon.id);
    return {
      effect: weaponData.effects,
      damage: weaponData.data.value + weaponData.data.perLevel * weapon.level,
    };
  }

  resolveArmor(armor: IArmor): IResolvedArmor {
    const resolved: IResolvedArmor = {};

    if (armor?.boots) {
      const bootData = this.client.boleham.Functions.getItemById<AsAnUsableItem>(armor.boots.id);

      resolved.boots = {
        armor: bootData.data.value + bootData.data.perLevel * armor.boots.level,
        effect: bootData.effects,
      };
    }

    if (armor?.chest) {
      const chestData = this.client.boleham.Functions.getItemById<AsAnUsableItem>(armor.chest.id);

      resolved.chest = {
        armor: chestData.data.value + chestData.data.perLevel * armor.chest.level,
        effect: chestData.effects,
      };
    }

    if (armor?.pants) {
      const pantsData = this.client.boleham.Functions.getItemById<AsAnUsableItem>(armor.pants.id);

      resolved.pants = {
        armor: pantsData.data.value + pantsData.data.perLevel * armor.pants.level,
        effect: pantsData.effects,
      };
    }

    if (armor?.head) {
      const headData = this.client.boleham.Functions.getItemById<AsAnUsableItem>(armor.head.id);

      resolved.head = {
        armor: headData.data.value + headData.data.perLevel * armor.head.level,
        effect: headData.effects,
      };
    }

    return resolved;
  }

  getUserMaxLife(
    classId: number,
    level: number,
    armor: IResolvedArmor,
    weapon?: IResolvedWeapon | null,
  ): number {
    const classData = this.client.boleham.Functions.getClassDataById(classId);

    let maxLife = classData.baseLife + classData.baseAttributesPerLevel.maxLife * level;

    if (weapon && weapon.effect.some((a) => a.type === 'life_buff')) {
      maxLife += weapon.effect.reduce((p, c) => {
        if (c.type !== 'life_buff' || c.target !== 'self') return p;
        return p + c.value;
      }, 0);
    }

    if (armor?.boots && armor.boots.effect.some((a) => a.type === 'life_buff')) {
      maxLife += armor.boots.effect.reduce((p, c) => {
        if (c.type !== 'life_buff' || c.target !== 'self') return p;
        return p + c.value;
      }, 0);
    }

    if (armor?.pants && armor.pants.effect.some((a) => a.type === 'life_buff')) {
      maxLife += armor.pants.effect.reduce((p, c) => {
        if (c.type !== 'life_buff' || c.target !== 'self') return p;
        return p + c.value;
      }, 0);
    }

    if (armor?.chest && armor.chest.effect.some((a) => a.type === 'life_buff')) {
      maxLife += armor.chest.effect.reduce((p, c) => {
        if (c.type !== 'life_buff' || c.target !== 'self') return p;
        return p + c.value;
      }, 0);
    }

    if (armor?.head && armor.head.effect.some((a) => a.type === 'life_buff')) {
      maxLife += armor.head.effect.reduce((p, c) => {
        if (c.type !== 'life_buff' || c.target !== 'self') return p;
        return p + c.value;
      }, 0);
    }

    return maxLife;
  }

  getUserMaxMana(
    classId: number,
    level: number,
    armor: IResolvedArmor,
    weapon?: IResolvedWeapon | null,
  ): number {
    const classData = this.client.boleham.Functions.getClassDataById(classId);

    let maxMana = classData.baseMana + classData.baseAttributesPerLevel.maxMana * level;

    if (weapon && weapon.effect.some((a) => a.type === 'mana_buff')) {
      maxMana += weapon.effect.reduce((p, c) => {
        if (c.type !== 'mana_buff' || c.target !== 'self') return p;
        return p + c.value;
      }, 0);
    }

    if (armor?.boots && armor.boots.effect.some((a) => a.type === 'mana_buff')) {
      maxMana += armor.boots.effect.reduce((p, c) => {
        if (c.type !== 'mana_buff' || c.target !== 'self') return p;
        return p + c.value;
      }, 0);
    }

    if (armor?.pants && armor.pants.effect.some((a) => a.type === 'mana_buff')) {
      maxMana += armor.pants.effect.reduce((p, c) => {
        if (c.type !== 'mana_buff' || c.target !== 'self') return p;
        return p + c.value;
      }, 0);
    }

    if (armor?.chest && armor.chest.effect.some((a) => a.type === 'mana_buff')) {
      maxMana += armor.chest.effect.reduce((p, c) => {
        if (c.type !== 'mana_buff' || c.target !== 'self') return p;
        return p + c.value;
      }, 0);
    }

    if (armor?.head && armor.head.effect.some((a) => a.type === 'mana_buff')) {
      maxMana += armor.head.effect.reduce((p, c) => {
        if (c.type !== 'mana_buff' || c.target !== 'self') return p;
        return p + c.value;
      }, 0);
    }

    return maxMana;
  }

  getUserBattleInventory(inventory: IInventoryItem[]): IResolvedBattleInventory[] {
    const acceptableItems = ['potion'];

    return inventory.reduce((p: IResolvedBattleInventory[], c) => {
      const foundItem = this.client.boleham.Functions.getItemById<AsAnUsableItem>(c.id);
      if (acceptableItems.includes(foundItem.type)) {
        p.push({
          id: c.id,
          level: c.level ?? 0,
          data: foundItem.data,
          effects: foundItem.effects,
          type: foundItem.type as TBattleUsableItemType,
          amount: c.amount,
        });

        return p;
      }
      return p;
    }, []);
  }

  getUserDamage(
    classId: number,
    level: number,
    armor: IResolvedArmor,
    weapon?: IResolvedWeapon | null,
  ): number {
    const classData = this.client.boleham.Functions.getClassDataById(classId);

    let damage = classData.baseDamage + classData.baseAttributesPerLevel.baseDamage * level;

    if (weapon) damage += weapon.damage;

    if (armor?.boots && armor.boots.effect.some((a) => a.type === 'damage_buff')) {
      damage += armor.boots.effect.reduce((p, c) => {
        if (c.target !== 'self' || c.type !== 'damage_buff') return p;
        return p + c.value;
      }, 0);
    }

    if (armor?.chest && armor.chest.effect.some((a) => a.type === 'damage_buff')) {
      damage += armor.chest.effect.reduce((p, c) => {
        if (c.target !== 'self' || c.type !== 'damage_buff') return p;
        return p + c.value;
      }, 0);
    }

    if (armor?.head && armor.head.effect.some((a) => a.type === 'damage_buff')) {
      damage += armor.head.effect.reduce((p, c) => {
        if (c.target !== 'self' || c.type !== 'damage_buff') return p;
        return p + c.value;
      }, 0);
    }

    if (armor?.pants && armor.pants.effect.some((a) => a.type === 'damage_buff')) {
      damage += armor.pants.effect.reduce((p, c) => {
        if (c.target !== 'self' || c.type !== 'damage_buff') return p;
        return p + c.value;
      }, 0);
    }

    return damage;
  }

  getUserArmor(
    classId: number,
    level: number,
    armor: IResolvedArmor,
    weapon?: IResolvedWeapon | null,
  ): number {
    const classData = this.client.boleham.Functions.getClassDataById(classId);

    let userArmor = classData.baseArmor + classData.baseAttributesPerLevel.baseArmor * level;

    if (weapon && weapon.effect.some((a) => a.type === 'armor_buff')) {
      userArmor += weapon.effect.reduce((p, c) => {
        if (c.target !== 'self' || c.type !== 'armor_buff') return p;
        return p + c.value;
      }, 0);
    }

    if (armor?.boots) {
      userArmor += armor.boots.armor;
      if (armor.boots.effect.some((a) => a.type === 'armor_buff')) {
        userArmor += armor.boots.effect.reduce((p, c) => {
          if (c.target !== 'self' || c.type !== 'armor_buff') return p;
          return p + c.value;
        }, 0);
      }
    }

    if (armor?.chest) {
      userArmor += armor.chest.armor;
      if (armor.chest.effect.some((a) => a.type === 'armor_buff')) {
        userArmor += armor.chest.effect.reduce((p, c) => {
          if (c.target !== 'self' || c.type !== 'armor_buff') return p;
          return p + c.value;
        }, 0);
      }
    }

    if (armor?.head) {
      userArmor += armor.head.armor;
      if (armor.head.effect.some((a) => a.type === 'armor_buff')) {
        userArmor += armor.head.effect.reduce((p, c) => {
          if (c.target !== 'self' || c.type !== 'armor_buff') return p;
          return p + c.value;
        }, 0);
      }
    }

    if (armor?.pants) {
      userArmor += armor.pants.armor;
      if (armor.pants.effect.some((a) => a.type === 'armor_buff')) {
        userArmor += armor.pants.effect.reduce((p, c) => {
          if (c.target !== 'self' || c.type !== 'armor_buff') return p;
          return p + c.value;
        }, 0);
      }
    }

    return userArmor;
  }

  static CalculateAttackDamage(
    attackDamage: number,
    attackSkill: number,
    tiredness: number,
    effects: IBattleEntityEffect[],
  ): number {
    let baseDamage = attackDamage + attackDamage * (attackSkill / 100);

    if (effects.some((a) => a.type === 'damage_buff')) {
      effects.forEach((a) => {
        if (a.type !== 'damage_buff') return;

        baseDamage = a.isValuePercentage
          ? baseDamage + baseDamage * (a.value / 100)
          : baseDamage + a.value;
      });
    }

    const totalDamage = (tiredness / 100) * (0.7 * baseDamage) + attackDamage * 0.3;
    return totalDamage;
  }

  static CalculateTotalArmor(user: TBattleEntity): number {
    let totalArmor = user.armor;

    user.effects.forEach((effect) => {
      switch (effect.type) {
        case 'armor_buff':
          totalArmor = effect.isValuePercentage
            ? totalArmor + totalArmor * (effect.value / 100)
            : totalArmor + effect.value;
          break;
        case 'degradation':
          totalArmor = effect.isValuePercentage
            ? totalArmor - totalArmor * (effect.value / 100)
            : totalArmor - effect.value;
      }
    });

    return totalArmor;
  }

  static CalculateAttackEffectiveness(
    attackDamage: number,
    attacker: TBattleEntity,
    defender: TBattleEntity,
  ): number {
    const totalArmor = BattleFunctions.CalculateTotalArmor(defender);

    let totalDamage =
      attackDamage * (totalArmor >= 0 ? 100 / (100 + totalArmor) : 2 - 100 / (100 - totalArmor));

    attacker.effects.forEach((e) => {
      switch (e.type) {
        case 'blind':
          totalDamage -= totalDamage * (e.value / 100);
          break;
        case 'confusion': {
          const randomized = Math.floor(Math.random() * 100);
          totalDamage -= totalDamage - e.value / randomized;
          break;
        }
      }
    });

    return totalDamage;
  }
}
