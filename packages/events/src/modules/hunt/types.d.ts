export type DatabaseHuntingTypes =
  | 'demons'
  | 'giants'
  | 'angels'
  | 'archangels'
  | 'demigods'
  | 'gods';

export type ApiHuntingTypes = 'demon' | 'giant' | 'angel' | 'archangel' | 'demigod' | 'god';

export interface HuntProbabiltyProps {
  amount: number;
  probability: number;
}

export interface HuntProbability {
  demons: HuntProbabiltyProps[];
  giants: HuntProbabiltyProps[];
  angels: HuntProbabiltyProps[];
  archangels: HuntProbabiltyProps[];
  demigods: HuntProbabiltyProps[];
  gods: HuntProbabiltyProps[];
}

export type HuntProbabilities = { [K in DatabaseHuntingTypes]: HuntProbabiltyProps[] };

export interface HuntMagicItem {
  id: number;
}

export type HuntItemRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythical' | 'divine';

export interface HuntCooldownBoostItem {
  type: 'HUNT_COOLDOWN_REDUCTION';
  huntType: DatabaseHuntingTypes;
  huntCooldown: number;
  dropChance: number;
  rarity: HuntItemRarity;
}

export interface HuntProbablyBoostItem {
  type: 'HUNT_PROBABILITY_BOOST';
  huntType: DatabaseHuntingTypes;
  probabilities: HuntProbabiltyProps[];
  cost: number;
}

export type MagicItemsFile = HuntProbablyBoostItem | HuntCooldownBoostItem;

export interface StaticItemData<Item> {
  id: number;
  data: Item;
}
