import { getProfitTaxes, getTaxedProfit } from '../../utils/taxesUtils';
import { ROULETTE_LIMITS } from './constants';

const getRouletteProfitTaxes = (profit: number): number => getProfitTaxes(profit, ROULETTE_LIMITS);
const getRouletteTaxedProfit = (profit: number): number => getTaxedProfit(profit, ROULETTE_LIMITS);

export { getRouletteTaxedProfit, getRouletteProfitTaxes };
