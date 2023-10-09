export enum AvailablePlants {
  Mate,
}

export type PlantState = 'GROWING' | 'MATURE' | 'ROTTEN';

export interface PlantedField {
  plantedAt: number;
  isPlanted: true;
  plantType: AvailablePlants;
}

export interface EmptyField {
  isPlanted: false;
}

export type Plantation = PlantedField | EmptyField;

export interface PlantsFile {
  minutesToHarvest: number;
  minutesToRot: number;
}
