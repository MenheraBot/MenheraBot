import { InventoryItem } from './types';

const addItems = (currentInventory: InventoryItem[], toAdd: InventoryItem[]): InventoryItem[] =>
  toAdd.reduce<InventoryItem[]>((p, c) => {
    const fromUser = p.find((a) => a.id === c.id);

    if (!fromUser) {
      p.push(c);
      return p;
    }

    fromUser.amount = fromUser.amount <= 0 ? c.amount : fromUser.amount + c.amount;

    return p;
  }, currentInventory);

const userHasAllItems = (
  currentInventory: InventoryItem[],
  neededItems: InventoryItem[],
): boolean =>
  neededItems.every((needed) =>
    currentInventory.some((item) => item.id === needed.id && item.amount >= needed.amount),
  );

const removeItems = (
  currentInventory: InventoryItem[],
  toRemove: InventoryItem[],
): InventoryItem[] =>
  currentInventory.reduce<InventoryItem[]>((p, c) => {
    const remove = toRemove.find((a) => a.id === c.id);

    if (!remove) {
      p.push(c);
      return p;
    }

    const newAmount = c.amount - remove.amount;

    if (newAmount > 0) p.push({ id: c.id, amount: newAmount });

    return p;
  }, []);

export default { addItems, userHasAllItems, removeItems };
