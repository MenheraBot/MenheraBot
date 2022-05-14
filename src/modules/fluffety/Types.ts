export enum FluffetyActionIdentifier {
  Nothing = 0,
  Sleeping = 1,
  Running = 2,
}

export interface FluffetyRelationshipSchema {
  leftOwner: string;
  rightOwner: string;
  leftName: string;
  rightName: string;
  relationshipExperience: number;
  relationshipLevel: number;
}
