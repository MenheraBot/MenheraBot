import { EMOJIS } from '../../structures/constants.js';
import {
  DatabaseFarmerSchema,
  QuantitativeItem,
  QuantitativePlant,
  QuantitativeSeed,
} from '../../types/database.js';
import {
  INITIAL_LIMIT_FOR_SILO,
  Plants,
  QUALITY_PRICE_MULTIPLIER,
  SILO_LIMIT_INCREASE_BY_LEVEL,
} from './constants.js';
import { AvailablePlants, PlantQuality } from './types.js';

type QuantitativePlantItem = QuantitativePlant | QuantitativeSeed;

const getQuality = (plantItem: Pick<QuantitativePlantItem, 'quality'>) =>
  plantItem.quality ?? PlantQuality.Normal;

const getQualityEmoji = (quality: PlantQuality) =>
  ({
    [PlantQuality.Best]: EMOJIS.best_quality,
    [PlantQuality.Normal]: EMOJIS.normal_quality,
    [PlantQuality.Worst]: EMOJIS.worst_quality,
  })[quality];

const checkNeededPlants = (need: QuantitativePlantItem[], has: QuantitativePlantItem[]): boolean =>
  need.every((needed) =>
    has.some((user) => {
      const userHas = 'weight' in user ? user.weight : user.amount;
      const userNeed = 'weight' in needed ? needed.weight : needed.amount;

      const isPlantEqual = filterPlant(user)(needed);

      return isPlantEqual && userHas >= userNeed;
    }),
  );

const addItems = (user: QuantitativeItem[], toAdd: QuantitativeItem[]): QuantitativeItem[] =>
  toAdd.reduce<QuantitativeItem[]>((p, c) => {
    const fromUser = p.find((a) => a.id === c.id);

    if (!fromUser) {
      p.push(c);
      return p;
    }

    fromUser.amount = fromUser.amount <= 0 ? c.amount : fromUser.amount + c.amount;

    return p;
  }, user);

const removeItems = (user: QuantitativeItem[], toRemove: QuantitativeItem[]): QuantitativeItem[] =>
  user.reduce<QuantitativeItem[]>((p, c) => {
    const remove = toRemove.find((a) => a.id === c.id);

    if (!remove) {
      p.push(c);
      return p;
    }

    const newAmount = c.amount - remove.amount;

    if (newAmount > 0)
      p.push({
        id: c.id,
        amount: newAmount,
      });

    return p;
  }, []);

const addPlants = <T extends QuantitativePlantItem>(user: T[], toAdd: T[]): T[] =>
  toAdd.reduce<T[]>((p, c) => {
    const fromUser = p.find(filterPlant(c));

    if (!fromUser) {
      p.push(c);
      return p;
    }

    const userHas = 'weight' in fromUser ? fromUser.weight : fromUser.amount;
    const amountToAdd = 'weight' in c ? c.weight : c.amount;

    if ('weight' in fromUser) fromUser.weight = userHas <= 0 ? amountToAdd : userHas + amountToAdd;
    else fromUser.amount = userHas <= 0 ? amountToAdd : userHas + amountToAdd;

    return p;
  }, user);

const removePlants = <T extends QuantitativePlantItem>(user: T[], toRemove: T[]): T[] =>
  user.reduce<T[]>((p, c) => {
    const remove = toRemove.find(filterPlant(c));

    if (!remove) {
      p.push(c);
      return p;
    }

    const removeAmount = 'weight' in remove ? remove.weight : remove.amount;
    const currentAmount = 'weight' in c ? c.weight : c.amount;

    const newAmount = currentAmount - removeAmount;

    if (newAmount > 0)
      (p as QuantitativeSeed[]).push({
        plant: c.plant,
        quality: getQuality(c),
        [('weight' in c ? 'weight' : 'amount') as 'amount']: newAmount,
      });

    return p;
  }, []);

interface SiloLimits {
  limit: number;
  used: number;
}

const getSiloLimits = (user: DatabaseFarmerSchema): SiloLimits => {
  const countQuantitative = (items: (QuantitativePlantItem | QuantitativeItem)[]): number =>
    items.reduce(
      (p, c) =>
        p +
        ((c as QuantitativeSeed)[('weight' in c ? 'weight' : 'amount') as 'amount'] > 0
          ? (c as QuantitativeSeed)[('weight' in c ? 'weight' : 'amount') as 'amount']
          : 0),
      0,
    );

  const used = parseFloat(
    (
      countQuantitative(user.silo) +
      countQuantitative(user.seeds) +
      countQuantitative(user.items)
    ).toFixed(1),
  );

  const limit = parseFloat(
    (INITIAL_LIMIT_FOR_SILO + SILO_LIMIT_INCREASE_BY_LEVEL * user.siloUpgrades).toFixed(1),
  );

  return { used, limit };
};

type PlantRecord = Record<AvailablePlants, QuantitativePlant[]>;

const groupPlantsByType = (plants: QuantitativePlant[]): PlantRecord =>
  plants.reduce<PlantRecord>((p, c, i) => {
    if (c.weight <= 0) return p;

    if (!p[c.plant]) p[c.plant] = [];

    p[c.plant].push(c);

    p[c.plant].sort((a, b) => getQuality(b) - getQuality(a));

    return p;
  }, {} as PlantRecord);

const filterPlantsByQuality = (
  plants: QuantitativePlant[],
): Record<PlantQuality, QuantitativePlant[]> =>
  plants.reduce<Record<PlantQuality, QuantitativePlant[]>>(
    (p, c) => {
      p[getQuality(c)].push(c);

      return p;
    },
    { [PlantQuality.Normal]: [], [PlantQuality.Best]: [], [PlantQuality.Worst]: [] },
  );

const filterPlant =
  <T extends boolean = false>(
    data: Pick<QuantitativePlant, 'plant' | 'quality'>,
    checkWeight?: T,
  ) =>
  (plant: QuantitativePlantItem) =>
    plant.plant === data.plant &&
    getQuality(data) === getQuality(plant) &&
    (!checkWeight || ('weight' in plant ? plant.weight : plant.amount) > 0);

const isMatePlant = (plant: AvailablePlants) => plant === AvailablePlants.Mate;

const getPlantPrice = (plant: Pick<QuantitativePlant, 'plant' | 'quality'>) => {
  const plantQuality = getQuality(plant);

  const qualityPriceBonus = {
    [PlantQuality.Best]: QUALITY_PRICE_MULTIPLIER,
    [PlantQuality.Normal]: 0,
    [PlantQuality.Worst]: -QUALITY_PRICE_MULTIPLIER,
  }[plantQuality];

  const plantData = Plants[plant.plant];
  const plantSellValue = plantData.sellValue;

  return Math.floor(plantSellValue + plantSellValue * qualityPriceBonus);
};

const groupPlantsWeight = (plants: QuantitativePlant[]): [QuantitativePlant[], number] => {
  const summedWeights = plants.reduce<Record<string, number>>((p, c) => {
    const quality = getQuality(c);
    const key = `${c.plant}|${quality}` as const;

    if (p[key]) p[key] += c.weight;
    else p[key] = c.weight;

    return p;
  }, {});

  let totalWeight = 0;

  const parsed = Object.entries(summedWeights).map<QuantitativePlant>(
    ([plantQuality, stringedWeight]) => {
      const [plant, quality] = plantQuality.split('|');

      const weight = parseFloat(stringedWeight.toFixed(1));

      totalWeight += weight;

      return {
        plant: Number(plant),
        quality: Number(quality),
        weight,
      };
    },
  );

  return [parsed, parseFloat(totalWeight.toFixed(1))];
};

export {
  checkNeededPlants,
  isMatePlant,
  removePlants,
  groupPlantsWeight,
  addPlants,
  getQualityEmoji,
  getSiloLimits,
  getPlantPrice,
  removeItems,
  addItems,
  filterPlant,
  filterPlantsByQuality,
  groupPlantsByType,
  getQuality,
};
