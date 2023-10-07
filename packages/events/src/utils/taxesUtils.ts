export type TaxedGameLimts = {
  MIN_LIMIT: number;
  MAX_LIMIT: number;
  MIN_TAX: number;
  MAX_TAX: number;
};

const getProfitTaxes = (
  profit: number,
  { MIN_LIMIT, MAX_LIMIT, MIN_TAX, MAX_TAX }: TaxedGameLimts,
): number => {
  if (profit <= MIN_LIMIT) return MIN_TAX;
  if (profit >= MAX_LIMIT) return MAX_TAX;

  const slope = (MAX_TAX - MIN_TAX) / (MAX_LIMIT - MIN_LIMIT);
  const intercept = MIN_TAX - slope * MIN_LIMIT;
  return slope * profit + intercept;
};

const getTaxedProfit = (profit: number, gameTaxes: TaxedGameLimts): number => {
  const taxes = getProfitTaxes(profit, gameTaxes);
  return Math.floor(profit - profit * taxes);
};

export { getProfitTaxes, getTaxedProfit };
