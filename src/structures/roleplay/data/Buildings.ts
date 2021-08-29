import { IBuildingFile } from '@roleplay/Types';
import MartExecutable from '../buildings/MartExecutable';

const buildings: { [key: number]: IBuildingFile } = {
  0: {
    name: 'mart',
    locationId: 0,
    execute: MartExecutable,
  },
};

export default buildings;
