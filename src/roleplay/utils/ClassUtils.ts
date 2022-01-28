import { IReturnData } from '@utils/Types';
import { AbilitiesFile, ClassesFile, RacesFile, UserAbility } from '@roleplay/Types';
import Abilities from '@roleplay/data/Abilities';
import { Classes, Races } from '../data';

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
  getAbilities().filter((a) => userAbilities.some((b) => b.id === a.data.parentId));
