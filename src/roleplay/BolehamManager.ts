import MenheraClient from 'MenheraClient';
import BasicFunctions from '@roleplay/Functions/BasicFunctions';
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
  IMobAttacksFile,
  IMobsFile,
  IQuestsFile,
  IRacesFiles,
  IReturnData,
} from '@roleplay/Types';
import BattleFunctions from '@roleplay/Functions/BattleFunctions';
import quests from './data/Quests';
import mobs from './data/Mobs';
import attacks from './data/MobAttacks';
import { parseEntry } from './Utils';

export default class BolehamManager {
  private classesFile: typeof classes;

  private racesFile: typeof races;

  private abilitiesFile: typeof abilities;

  private ecosystemFile: typeof ecosystem;

  private buildingFile: typeof buildings;

  private questsFile: typeof quests;

  private itemsFile: typeof items;

  private mobsFile: typeof mobs;

  private attackFile: typeof attacks;

  public Functions: BasicFunctions;

  public Battle: BattleFunctions;

  constructor(client: MenheraClient) {
    this.classesFile = classes;
    this.racesFile = races;
    this.abilitiesFile = abilities;
    this.buildingFile = buildings;
    this.itemsFile = items;
    this.questsFile = quests;
    this.ecosystemFile = ecosystem;
    this.mobsFile = mobs;
    this.attackFile = attacks;
    this.Functions = new BasicFunctions(client);
    this.Battle = new BattleFunctions(client);
  }

  get Classes(): IReturnData<IClassesFile>[] {
    return parseEntry(Object.entries(this.classesFile));
  }

  get Races(): IReturnData<IRacesFiles>[] {
    return parseEntry(Object.entries(this.racesFile));
  }

  get Abilities(): IReturnData<IAbilitiesFile>[] {
    return parseEntry(Object.entries(this.abilitiesFile));
  }

  get Experiences(): { [key: number]: number } {
    return this.ecosystemFile.MaxXpPerLevel;
  }

  get Buildings(): IReturnData<IBuildingFile>[] {
    return parseEntry(Object.entries(this.buildingFile));
  }

  get Quests(): IReturnData<IQuestsFile>[] {
    return parseEntry(Object.entries(this.questsFile));
  }

  get Items(): IReturnData<IItemFile<boolean>>[] {
    return parseEntry(Object.entries(this.itemsFile));
  }

  get Mobs(): IReturnData<IMobsFile>[] {
    return parseEntry(Object.entries(this.mobsFile));
  }

  get MobsAttack(): IReturnData<IMobAttacksFile>[] {
    return parseEntry(Object.entries(this.attackFile));
  }
}
