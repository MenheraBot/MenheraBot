import type { Schema } from 'mongoose';

export enum FluffetyActionIdentifier {
  Nothing = 0,
  Sleeping = 1,
  Running = 2,
}

export interface FluffetyRelationshipSchema {
  leftOwner: string;
  rightOwner: string;
  leftFluffety: Schema.Types.ObjectId;
  rightFluffety: Schema.Types.ObjectId;
  relationshipExperience: number;
  relationshipLevel: number;
}
