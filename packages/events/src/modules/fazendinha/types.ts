export enum PlantTypes {
  Mate,
}

export interface PlantedField {
  harvestAt: number;
  isPlanted: true;
  plantType: PlantTypes;
}

export interface EmptyField {
  isPlanted: false;
}

export type Plantation = PlantedField | EmptyField;
