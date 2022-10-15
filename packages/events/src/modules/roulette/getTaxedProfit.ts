const MINIMUM_PROFIT = 50000;
const MIN_TAX = 9.8 / 100;
const MAX_TAX = 25.7 / 100;

const getProfitTaxes = (profit: number): number => (profit < MINIMUM_PROFIT ? MIN_TAX : MAX_TAX);

const getTaxedProfit = (profit: number): number => {
  const taxes = getProfitTaxes(profit);
  return Math.floor(profit - profit * taxes);
};

export { getTaxedProfit, getProfitTaxes };
