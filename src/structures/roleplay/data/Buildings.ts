import { IBuildingFile } from '@roleplay/Types';
import GuildExecutable from '../buildings/GuildExecutable';
import MartExecutable from '../buildings/MartExecutable';

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
};

export default buildings;
