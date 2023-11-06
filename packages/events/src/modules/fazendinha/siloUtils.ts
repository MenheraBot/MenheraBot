import { QuantitativePlant } from '../../types/database';

const checkNeededItems = (need: QuantitativePlant[], has: QuantitativePlant[]): boolean =>
  need.every((needed) =>
    has.some((user) => user.plant === needed.plant && user.amount >= needed.amount),
  );

const removeItems = (
  user: QuantitativePlant[],
  toRemove: QuantitativePlant[],
): QuantitativePlant[] => {
  const final: QuantitativePlant[] = [];

  toRemove.forEach((item) => {
    const fromUser = user.find((a) => a.plant === item.plant);

    if (!fromUser) return;

    fromUser.amount -= item.amount;

    if (fromUser.amount > 0) final.push(fromUser);
  });

  return final;
};

export { checkNeededItems, removeItems };
