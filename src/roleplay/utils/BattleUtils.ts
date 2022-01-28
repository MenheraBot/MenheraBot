import { RoleplayUserSchema } from '@roleplay/Types';

export const a = 'a';

export const getUserDamage = (user: RoleplayUserSchema): number => user.damage + user.weapon.damage;
