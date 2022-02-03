import { IReturnData } from '@utils/Types';
import {
  AbilitiesFile,
  ClassesFile,
  EnemiesFile,
  ItemFlag,
  ItemsFile,
  RacesFile,
  UserAbility,
} from '@roleplay/Types';
import Abilities from '@roleplay/data/Abilities';
import Items from '@roleplay/data/Items';
import { Classes, Enemies, Races } from '../data';

export const getClasses = (): IReturnData<ClassesFile>[] =>
  Object.entries(Classes).map((c) => ({ id: Number(c[0]), data: c[1] }));

export const getClassById = (classId: number): IReturnData<ClassesFile> =>
  Object.entries(Classes)
    .filter((c) => Number(c[0]) === classId)
    .map((c) => ({ id: Number(c[0]), data: c[1] }))[0];

export const getRaces = (): IReturnData<RacesFile>[] =>
  Object.entries(Races).map((c) => ({ id: Number(c[0]), data: c[1] }));

export const getRaceById = (raceId: number): IReturnData<RacesFile> =>
  Object.entries(Races)
    .filter((c) => Number(c[0]) === raceId)
    .map((c) => ({ id: Number(c[0]), data: c[1] }))[0];

export const getAbilityById = (abilityId: number): IReturnData<AbilitiesFile> =>
  Object.entries(Abilities)
    .filter((c) => Number(c[0]) === abilityId)
    .map((c) => ({ id: Number(c[0]), data: c[1] }))[0];

export const getAbilities = (): IReturnData<AbilitiesFile>[] =>
  Object.entries(Abilities).map((c) => ({ id: Number(c[0]), data: c[1] }));

export const getUserAvailableAbilities = (
  userAbilities: UserAbility[],
): IReturnData<AbilitiesFile>[] =>
  getAbilities().filter(
    (a) =>
      userAbilities.some((b) => b.id === a.data.parentId) &&
      userAbilities.every((b) => a.id !== b.id),
  );

export const getEnemies = (): IReturnData<EnemiesFile>[] =>
  Object.entries(Enemies).map((a) => ({ id: Number(a[0]), data: a[1] }));

export const getEnemyById = (enemyId: number): IReturnData<EnemiesFile> =>
  Object.entries(Enemies)
    .filter((c) => Number(c[0]) === enemyId)
    .map((c) => ({ id: Number(c[0]), data: c[1] }))[0];

export const getItemsByType = <T extends ItemsFile>(
  ItemType: ItemsFile['type'],
): IReturnData<T>[] =>
  Object.entries(Items)
    .filter((a) => a[1].type === ItemType)
    .map((a) => ({ id: Number(a[0]), data: a[1] })) as unknown as IReturnData<T>[];

export const getItemsByFlags = <T extends ItemsFile>(flags: ItemFlag[]): IReturnData<T>[] =>
  Object.entries(Items)
    .filter((c) => c[1].flags.every((a) => flags.includes(a)) && c[1].flags.length > 0)
    .map((c) => ({ id: Number(c[0]), data: c[1] })) as unknown as IReturnData<T>[];

export const getItemsByFlagsAndType = <T extends ItemsFile>(
  itemType: ItemsFile['type'],
  flags: ItemFlag[],
): IReturnData<T>[] =>
  Object.entries(Items)
    .filter(
      (c) =>
        c[1].flags.every((a) => flags.includes(a)) &&
        c[1].type === itemType &&
        c[1].flags.length > 0,
    )
    .map((c) => ({ id: Number(c[0]), data: c[1] })) as unknown as IReturnData<T>[];

export const getItemById = <T extends ItemsFile>(itemId: number): IReturnData<T> =>
  Object.entries(Items)
    .filter((c) => Number(c[0]) === itemId)
    .map((c) => ({ id: Number(c[0]), data: c[1] }))[0] as unknown as IReturnData<T>;
