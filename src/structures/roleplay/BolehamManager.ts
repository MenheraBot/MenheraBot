import MenheraClient from 'MenheraClient';
import BasicFunctions from '@roleplay/BasicFunctions';
import abilities from '@roleplay/data/Abilities';
import buildings from '@roleplay/data/Buildings';
import classes from '@roleplay/data/Classes';
import ecosystem from '@roleplay/data/Ecosystem';
import items from '@roleplay/data/Items';
import races from '@roleplay/data/Races';
import {
  IAbilitiesFile,
  IBuildingFile,
  IClassesFile,
  IItemFile,
  IQuestsFile,
  IRacesFiles,
} from '@roleplay/Types';
import quests from './data/Quests';

export default class BolehamManager {
  private classesFile: typeof classes;

  private racesFile: typeof races;

  private abilitiesFile: typeof abilities;

  private ecosystemFile: typeof ecosystem;

  private buildingFile: typeof buildings;

  private questsFile: typeof quests;

  private itemsFile: typeof items;

  public Functions: BasicFunctions;

  constructor(client: MenheraClient) {
    this.classesFile = classes;
    this.racesFile = races;
    this.abilitiesFile = abilities;
    this.buildingFile = buildings;
    this.itemsFile = items;
    this.questsFile = quests;
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

  get Quests(): [string, IQuestsFile][] {
    return Object.entries(this.questsFile);
  }

  get Items(): [string, IItemFile<boolean>][] {
    return Object.entries(this.itemsFile);
  }
}
