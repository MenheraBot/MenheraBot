import farmerRepository from '../../database/repositories/farmerRepository';
import { daysToMillis } from '../../utils/miscUtils';
import { SeasonData, Seasons } from './types';

export const SEASONAL_HARVEST_DEBUFF = 35 / 100;
export const SEASONAL_HARVEST_BUFF = 25 / 100;
export const SEASONAL_ROT_DEBUFF = 50 / 100;

const MIN_DAYS = 3;
const MAX_DAYS = 8;

const SeasonsOrder: { [Season in Seasons]: Seasons } = {
  autumn: 'winter',
  winter: 'spring',
  spring: 'summer',
  summer: 'autumn',
};

const getNextSeason = (lastSeason: Seasons): [Seasons, number] => {
  const randomDays = Math.floor(Math.random() * (MAX_DAYS - MIN_DAYS + 1) + MIN_DAYS);

  return [SeasonsOrder[lastSeason], randomDays];
};

const getCurrentSeason = async (): Promise<Seasons> => {
  const currentSeason = await farmerRepository.getCurrentSeason();

  if (currentSeason) return currentSeason;

  const seasonalInfo = await getSeasonalInfo();

  return seasonalInfo.currentSeason;
};

const getSeasonalInfo = async (): Promise<SeasonData> => {
  const seasonalData = await farmerRepository.getSeasonalInfo();

  if (!seasonalData || seasonalData.endsAt <= Date.now()) {
    const [nextSeason, daysToExpire] = getNextSeason(seasonalData?.currentSeason ?? 'summer');
    const timeToExpire = Date.now() + daysToMillis(daysToExpire);

    await farmerRepository.updateSeason(nextSeason, timeToExpire);
    return { currentSeason: nextSeason, endsAt: timeToExpire };
  }

  return seasonalData;
};

export { getCurrentSeason, getSeasonalInfo };
