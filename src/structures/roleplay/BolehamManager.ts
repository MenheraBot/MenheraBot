import MenheraClient from 'MenheraClient';
import BasicFunctions from './BasicFunctions';
import abilities from './data/Abilities';
import classes from './data/Classes';
import races from './data/Races';
import { IAbilitiesFile, IClassesFile, IRacesFiles } from './Types';

export default class BolehamManager {
  public classesFile: typeof classes;

  public racesFile: typeof races;

  public abilitiesFile: typeof abilities;

  public basicFunction: BasicFunctions;

  constructor(client: MenheraClient) {
    this.classesFile = classes;
    this.racesFile = races;
    this.abilitiesFile = abilities;
    this.basicFunction = new BasicFunctions(client);
  }

  get Classes(): [string, IClassesFile][] {
    return Object.entries(this.classesFile);
  }

  get Races(): [string, IRacesFiles][] {
    return Object.entries(this.racesFile);
  }

  get Abilities(): [string, IAbilitiesFile][] {
    return Object.entries(this.abilitiesFile);
  }
}
