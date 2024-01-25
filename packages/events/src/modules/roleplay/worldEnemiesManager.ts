import roleplayRepository from '../../database/repositories/roleplayRepository';
import { DatabaseCharacterSchema } from '../../types/database';
import { randomFromArray } from '../../utils/miscUtils';
import { RESURGE_DEFAULT_AMOUNT, TOTAL_MAP_SIZE } from './constants';
import { Enemy } from './types';

const getCurrentAvailableEnemy = async (
  location: DatabaseCharacterSchema['location'],
): Promise<Enemy | null> => {
  const availableEnemies = await roleplayRepository.getEnemiesInArea(location);

  if (availableEnemies.length === 0) return null;

  return randomFromArray(availableEnemies);
};

const getCompleteWorld = async (): Promise<number[][]> => {
  const currentEnemies = await roleplayRepository.getAllEnemyAreas();
  let updateRedis = false;

  const finalMap: number[][] = [];
  const toUpdate: Record<string, number> = {};

  for (let i = 0; i < TOTAL_MAP_SIZE[0]; i++) {
    finalMap.push([]);

    for (let j = 0; j < TOTAL_MAP_SIZE[1]; j++) {
      const areaName = `${i}:${j}`;
      let enemies = currentEnemies[areaName];
      const resurgeCooldown = currentEnemies[`r:${areaName}`];

      if (!enemies && (!resurgeCooldown || Date.now() >= resurgeCooldown)) {
        enemies = RESURGE_DEFAULT_AMOUNT;
        updateRedis = true;
      }

      const finalEnemyCount = Math.max(0, enemies ?? 0);

      finalMap[i].push(finalEnemyCount);
      toUpdate[`r:${areaName}`] = resurgeCooldown ?? 0;
      toUpdate[areaName] = finalEnemyCount;
    }
  }

  if (updateRedis) await roleplayRepository.updateEnemyAreas(toUpdate);

  return finalMap;
};

export { getCurrentAvailableEnemy, getCompleteWorld };
