export interface RoleplayUserSchema {
  id: string;
  classId: number;
  life: number;
  mana: number;
  abilityPower: number;
  level: number;
  experience: number;
  abilities: Array<unknown>;
  uniquePower: unknown;
  inventory: Array<unknown>;
  money: number;
  adventureCooldown: number;
  weapon: unknown;
  protection: unknown;
  backpack: unknown;
}
