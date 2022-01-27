import { IReturnData } from '@utils/Types';
import { ClassesFile, RacesFile } from '@roleplay/Types';
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
