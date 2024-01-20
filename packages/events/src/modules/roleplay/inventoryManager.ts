import { InventoryItem } from './types';

const addItems = (currentInventory: InventoryItem[], toAdd: InventoryItem[]): InventoryItem[] =>
  toAdd.reduce<InventoryItem[]>((p, c) => {
    const fromUser = p.find((a) => a.id === c.id && a.level === c.level);

    if (!fromUser) {
      p.push(c);
      return p;
    }

    fromUser.amount = fromUser.amount <= 0 ? c.amount : fromUser.amount + c.amount;

    return p;
  }, currentInventory);

export default { addItems };
