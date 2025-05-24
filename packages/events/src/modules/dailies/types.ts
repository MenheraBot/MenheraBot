import { InteractionContext } from '../../types/menhera';
import { AwardValues } from './dailies';

/* eslint-disable camelcase */
type DailyTypes =
  | 'use_command'
  | 'win_bet'
  | 'just_bet'
  | 'win_stars_in_bets'
  | 'announce_product'
  | 'success_on_hunt'
  | 'use_action_commands'
  | 'harvest_plants'
  | 'finish_delivery';

export interface Daily {
  type: DailyTypes;
  amountLimits: [number, number];
  specifications?: string[];
  specificationDisplay?: (ctx: InteractionContext, specification: string) => string;
}

export type Award<Helper extends number | string> = {
  type: AwardValues;
  value: number;
  helper?: Helper;
};

export type DatabaseDaily = {
  id: number;
  need: number;
  has: number;
  redeemed: boolean;
  changed?: true;
  specification?: string;
  awards: [Award<number | string>, Award<number | string>, Award<number | string>];
};
