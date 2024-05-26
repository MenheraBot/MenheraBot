import { ProbabilityAmount } from '../../types/menhera';

export type DatabaseHuntingTypes =
  | 'demons'
  | 'giants'
  | 'angels'
  | 'archangels'
  | 'demigods'
  | 'gods';

export type ApiHuntingTypes = 'demon' | 'giant' | 'angel' | 'archangel' | 'demigod' | 'god';

export interface HuntProbability {
  demons: ProbabilityAmount[];
  giants: ProbabilityAmount[];
  angels: ProbabilityAmount[];
  archangels: ProbabilityAmount[];
  demigods: ProbabilityAmount[];
  gods: ProbabilityAmount[];
}

export type HuntProbabilities = { [K in DatabaseHuntingTypes]: ProbabilityAmount[] };

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
  probabilities: ProbabilityAmount[];
  cost: number;
}

export type MagicItemsFile = HuntProbablyBoostItem | HuntCooldownBoostItem;

export interface StaticItemData<Item> {
  id: number;
  data: Item;
}
