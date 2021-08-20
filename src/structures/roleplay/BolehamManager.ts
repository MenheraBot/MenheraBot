import MenheraClient from 'MenheraClient';
import BasicFunctions from './BasicFunctions';
import abilities from './data/Abilities';
import classes from './data/Classes';
import ecosystem from './data/Ecosystem';
import races from './data/Races';
import { IAbilitiesFile, IClassesFile, IRacesFiles } from './Types';

export default class BolehamManager {
  public classesFile: typeof classes;

  public racesFile: typeof races;

  public abilitiesFile: typeof abilities;

  public ecosystemFile: typeof ecosystem;

  public Functions: BasicFunctions;

  constructor(client: MenheraClient) {
    this.classesFile = classes;
    this.racesFile = races;
    this.abilitiesFile = abilities;
    this.ecosystemFile = ecosystem;
    this.Functions = new BasicFunctions(client);
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

  get Experiences(): { [key: number]: number } {
    return this.ecosystemFile.MaxXpPerLevel;
  }
}
