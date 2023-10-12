export enum AvailablePlants {
  Mate,
  Rice,
  Sunflower,
  Mushroom,
}

export interface PlantedField {
  plantedAt: number;
  isPlanted: true;
  plantType: AvailablePlants;
}

export interface EmptyField {
  isPlanted: false;
}

export type PlantationState = 'EMPTY' | 'GROWING' | 'MATURE' | 'ROTTEN';

export type Plantation = PlantedField | EmptyField;

export interface PlantsFile {
  minutesToHarvest: number;
  minutesToRot: number;
  emoji: string;
  sellValue: number;
}
