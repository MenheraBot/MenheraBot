import MenheraClient from 'MenheraClient';
import BasicFunctions from './BasicFunctions';
import abilities from './data/Abilities';
import buildings from './data/Buildings';
import classes from './data/Classes';
import ecosystem from './data/Ecosystem';
import items from './data/Items';
import races from './data/Races';
import { IAbilitiesFile, IBuildingFile, IClassesFile, IItemFile, IRacesFiles } from './Types';

export default class BolehamManager {
  public classesFile: typeof classes;

  public racesFile: typeof races;

  public abilitiesFile: typeof abilities;

  public ecosystemFile: typeof ecosystem;

  public buildingFile: typeof buildings;

  public itemsFile: typeof items;

  public Functions: BasicFunctions;

  constructor(client: MenheraClient) {
    this.classesFile = classes;
    this.racesFile = races;
    this.abilitiesFile = abilities;
    this.buildingFile = buildings;
    this.itemsFile = items;
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

  get Buildings(): [string, IBuildingFile][] {
    return Object.entries(this.buildingFile);
  }

  get Items(): [string, IItemFile][] {
    return Object.entries(this.itemsFile);
  }
}
