import mongoose from 'mongoose';
import Redis from 'ioredis';
import { Cmds, Commands, Guilds, Status, Users } from '@structures/DatabaseCollections';
import { IDatabaseRepositories } from '@utils/Types';
import CacheRepository from './repositories/CacheRepository';
import CmdRepository from './repositories/CmdsRepository';
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
import CommandsRepository from './repositories/CommandsRepository';

export default class Databases {
  public Cmds: typeof Cmds;

  public Commands: typeof Commands;

  public Guilds: typeof Guilds;

  public Status: typeof Status;

  public Users: typeof Users;

  public redisClient: Redis.Redis | null = null;

  private readonly userRepository: UserRepository;

  private readonly cmdRepository: CmdRepository;

  private readonly starRepository: StarRepository;

  private readonly mamarRepository: MamarRepository;

  private readonly guildRepository: GuildRepository;

  private readonly statusRepository: StatusRepository;

  private readonly badgeRepository: BadgeRepository;

  private readonly maintenanceRepository: MaintenanceRepository;

  private readonly cacheRepository: CacheRepository;

  private readonly huntRepository: HuntRepository;

  private readonly relationshipRepository: RelationshipRepository;

  private readonly blacklistRepository: BlacklistRepository;

  private readonly topRepository: TopRepository;

  private readonly commandsRepository: CommandsRepository;

  private readonly giveRepository: GiveRepository;

  constructor(public uri: string, withRedisCache: boolean) {
    this.Cmds = Cmds;
    this.Commands = Commands;
    this.Guilds = Guilds;
    this.Status = Status;
    this.Users = Users;

    if (withRedisCache) this.createRedisConnection();

    this.userRepository = new UserRepository(this.Users);
    this.cmdRepository = new CmdRepository(this.Cmds);
    this.starRepository = new StarRepository(this.Users);
    this.mamarRepository = new MamarRepository(this.userRepository);
    this.guildRepository = new GuildRepository(this.Guilds);
    this.cacheRepository = new CacheRepository(
      this.redisClient,
      this.guildRepository,
      this.cmdRepository,
      this.Users,
    );
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
    this.commandsRepository = new CommandsRepository(this.Commands);
  }

  get repositories(): IDatabaseRepositories {
    return {
      userRepository: this.userRepository,
      cmdRepository: this.cmdRepository,
      starRepository: this.starRepository,
      cacheRepository: this.cacheRepository,
      mamarRepository: this.mamarRepository,
      guildRepository: this.guildRepository,
      statusRepository: this.statusRepository,
      badgeRepository: this.badgeRepository,
      maintenanceRepository: this.maintenanceRepository,
      huntRepository: this.huntRepository,
      relationshipRepository: this.relationshipRepository,
      blacklistRepository: this.blacklistRepository,
      topRepository: this.topRepository,
      commandsRepository: this.commandsRepository,
      giveRepository: this.giveRepository,
    };
  }

  createRedisConnection(): void {
    try {
      this.redisClient = new Redis({ db: process.env.NODE_ENV === 'development' ? 1 : 0 });
      this.redisClient.once('connect', () => {
        console.log('[REDIS] Conected to redis database');
      });
    } catch (err) {
      console.log(`[REDIS] Error connecting to redis ${err}`);
      this.redisClient = null;
      throw err;
    }
  }

  createConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      mongoose.connect(this.uri, (err) => {
        if (err) {
          console.error(`(x) Error to connecting to database \n${err}`);

          return reject(err);
        }

        console.log('[DATABASE] Conectado com sucesso à database');
        return resolve();
      });
    });
  }
}
