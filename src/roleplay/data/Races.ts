import { RacesFile } from '../Types';

const Races: { [id: number]: RacesFile } = {
  1: {
    name: 'elf',
    facilities: [
      {
        facility: 'baseIntelligence',
        boostPerLevel: 6,
      },
      {
        facility: 'maxMana',
        boostPerLevel: 15,
      },
    ],
  },
  2: {
    name: 'human',
    facilities: [
      {
        facility: 'baseDamage',
        boostPerLevel: 5,
      },
    ],
  },
  3: {
    name: 'orc',
    facilities: [
      {
        boostPerLevel: 4,
        facility: 'baseArmor',
      },
      {
        boostPerLevel: 4,
        facility: 'maxLife',
      },
    ],
  },
  4: {
    name: 'half-demon',
    facilities: [
      {
        boostPerLevel: 4,
        facility: 'baseIntelligence',
      },
      {
        boostPerLevel: 3,
        facility: 'baseDamage',
      },
    ],
  },
  5: {
    name: 'demi-human',
    facilities: [
      {
        boostPerLevel: 3,
        facility: 'baseDamage',
      },
      {
        boostPerLevel: 3,
        facility: 'baseArmor',
      },
    ],
  },
  6: {
    name: 'fear',
    facilities: [
      {
        boostPerLevel: 5,
        facility: 'baseArmor',
      },
      {
        boostPerLevel: 6,
        facility: 'maxLife',
      },
    ],
  },
};

export default Races;
