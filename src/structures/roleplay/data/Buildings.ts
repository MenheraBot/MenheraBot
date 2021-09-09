import { IBuildingFile } from '@roleplay/Types';
import GuildExecutable from '../buildings/GuildExecutable';
import MartExecutable from '../buildings/MartExecutable';
import TrainingCampExecutable from '../buildings/TrainingCampExecutable';

const buildings: { [key: number]: IBuildingFile } = {
  0: {
    name: 'mart',
    locationId: 0,
    minLevel: 1,
    execute: MartExecutable,
  },
  1: {
    name: 'guild',
    locationId: 0,
    minLevel: 1,
    execute: GuildExecutable,
  },
  2: {
    name: 'trainingCamp',
    locationId: 0,
    minLevel: 1,
    execute: TrainingCampExecutable,
  },
};

export default buildings;
