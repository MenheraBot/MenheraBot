import mongoose from 'mongoose';
import { Cmds, Commands, Guilds, Rpg, Status, Users } from '@structures/DatabaseCollections';
import CmdRepository from './repositories/CmdsRepository';
import CommandRepository from './repositories/CommandRepository';
import RpgRepository from './repositories/RpgRepository';
import StarRepository from './repositories/StarRepository';
import UserRepository from './repositories/UserRepository';
import MamarRepository from './repositories/MamarRepository';
import GuildRepository from './repositories/GuildsRepository';
import StatusRepository from './repositories/StatusRepository';
import BadgeRepository from './repositories/BadgeRepository';
import MaintenanceRepository from './repositories/MaintenanceRepository';
import HuntRepository from './repositories/HuntRepository';
import RelationshipRepository from './repositories/RelationshipRepository';
import BlacklistRepository from './repositories/BlacklistRepository';
import TopRepository from './repositories/TopRepository';
import GiveRepository from './repositories/GiveRepository';

export default class MongoDatabase {
  public Cmds: typeof Cmds;

  public Commands: typeof Commands;

  public Guilds: typeof Guilds;

  public Status: typeof Status;

  public Rpg: typeof Rpg;

  public Users: typeof Users;

  private readonly userRepository: UserRepository;

  private readonly commandRepository: CommandRepository;

  private readonly cmdRepository: CmdRepository;

  private readonly starRepository: StarRepository;

  private readonly rpgRepository: RpgRepository;

  private readonly mamarRepository: MamarRepository;

  private readonly guildRepository: GuildRepository;

  private readonly statusRepository: StatusRepository;

  private readonly badgeRepository: BadgeRepository;

  private readonly maintenanceRepository: MaintenanceRepository;

  private readonly huntRepository: HuntRepository;

  private readonly relationshipRepository: RelationshipRepository;

  private readonly blacklistRepository: BlacklistRepository;

  private readonly topRepository: TopRepository;

  private readonly giveRepository: GiveRepository;

  constructor(public uri: string) {
    // TODO: add modal to the name for readability
    // para fazer isso tem que mudar todos os codigos que estão usando `database.(nome_sem_modal)` to repositories
    this.Cmds = Cmds;
    this.Commands = Commands;
    this.Guilds = Guilds;
    this.Status = Status;
    this.Rpg = Rpg;
    this.Users = Users;

    this.userRepository = new UserRepository(this.Users);
    this.commandRepository = new CommandRepository(this.Commands);
    this.cmdRepository = new CmdRepository(this.Cmds);
    this.starRepository = new StarRepository(this.Users);
    this.rpgRepository = new RpgRepository(this.Rpg);
    this.mamarRepository = new MamarRepository(this.userRepository);
    this.guildRepository = new GuildRepository(this.Guilds);
    this.statusRepository = new StatusRepository(this.Status);
    this.badgeRepository = new BadgeRepository(this.userRepository);
    this.maintenanceRepository = new MaintenanceRepository(
      this.cmdRepository,
      this.statusRepository,
    );
    this.huntRepository = new HuntRepository(this.Users);
    this.relationshipRepository = new RelationshipRepository(this.userRepository);
    this.blacklistRepository = new BlacklistRepository(this.userRepository);
    this.topRepository = new TopRepository(this.Users);
    this.giveRepository = new GiveRepository(this.Users);
  }

  get repositories(): {
    userRepository: UserRepository;
    commandRepository: CommandRepository;
    cmdRepository: CmdRepository;
    starRepository: StarRepository;
    rpgRepository: RpgRepository;
    mamarRepository: MamarRepository;
    guildRepository: GuildRepository;
    statusRepository: StatusRepository;
    badgeRepository: BadgeRepository;
    maintenanceRepository: MaintenanceRepository;
    huntRepository: HuntRepository;
    relationshipRepository: RelationshipRepository;
    blacklistRepository: BlacklistRepository;
    topRepository: TopRepository;
    giveRepository: GiveRepository;
  } {
    return {
      userRepository: this.userRepository,
      commandRepository: this.commandRepository,
      cmdRepository: this.cmdRepository,
      starRepository: this.starRepository,
      rpgRepository: this.rpgRepository,
      mamarRepository: this.mamarRepository,
      guildRepository: this.guildRepository,
      statusRepository: this.statusRepository,
      badgeRepository: this.badgeRepository,
      maintenanceRepository: this.maintenanceRepository,
      huntRepository: this.huntRepository,
      relationshipRepository: this.relationshipRepository,
      blacklistRepository: this.blacklistRepository,
      topRepository: this.topRepository,
      giveRepository: this.giveRepository,
    };
  }

  createConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      mongoose.connect(
        this.uri,
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          useCreateIndex: true,
        },
        (err) => {
          if (err) {
            console.error(`(x) Error to connecting to database \n${err}`);

            return reject(err);
          }

          console.log('[DATABASE] Conectado com sucesso à database');
          return resolve();
        },
      );
    });
  }
}
