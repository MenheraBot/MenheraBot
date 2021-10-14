import mongoose from 'mongoose';
import Redis from 'ioredis';
import { Cmds, Guilds, Users, Rpg, Homes } from '@structures/DatabaseCollections';
import { IDatabaseRepositories } from '@utils/Types';
import CacheRepository from './repositories/CacheRepository';
import CmdRepository from './repositories/CmdsRepository';
import StarRepository from './repositories/StarRepository';
import UserRepository from './repositories/UserRepository';
import MamarRepository from './repositories/MamarRepository';
import GuildRepository from './repositories/GuildsRepository';
import BadgeRepository from './repositories/BadgeRepository';
import MaintenanceRepository from './repositories/MaintenanceRepository';
import HuntRepository from './repositories/HuntRepository';
import RelationshipRepository from './repositories/RelationshipRepository';
import BlacklistRepository from './repositories/BlacklistRepository';
import TopRepository from './repositories/TopRepository';
import GiveRepository from './repositories/GiveRepository';
import RpgRepository from './repositories/RpgRepository';
import HomeRepository from './repositories/HomeRepository';

export default class Databases {
  public Cmds: typeof Cmds;

  public Guilds: typeof Guilds;

  public Users: typeof Users;

  public Rpg: typeof Rpg;

  public Homes: typeof Homes;

  private redisClient: Redis.Redis | null = null;

  private readonly userRepository: UserRepository;

  private readonly cmdRepository: CmdRepository;

  private readonly starRepository: StarRepository;

  private readonly mamarRepository: MamarRepository;

  private readonly guildRepository: GuildRepository;

  private readonly badgeRepository: BadgeRepository;

  private readonly maintenanceRepository: MaintenanceRepository;

  private readonly cacheRepository: CacheRepository;

  private readonly rpgRepository: RpgRepository;

  private readonly huntRepository: HuntRepository;

  private readonly relationshipRepository: RelationshipRepository;

  private readonly blacklistRepository: BlacklistRepository;

  private readonly topRepository: TopRepository;

  private readonly giveRepository: GiveRepository;

  private readonly homeRepository: HomeRepository;

  constructor(public uri: string, withRedisCache: boolean) {
    this.Cmds = Cmds;
    this.Guilds = Guilds;
    this.Users = Users;
    this.Rpg = Rpg;
    this.Homes = Homes;

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
    );
    this.badgeRepository = new BadgeRepository(this.userRepository);
    this.rpgRepository = new RpgRepository(this.Rpg, this.redisClient);
    this.maintenanceRepository = new MaintenanceRepository(this.cmdRepository);
    this.maintenanceRepository = new MaintenanceRepository(this.cmdRepository);
    this.huntRepository = new HuntRepository(this.Users);
    this.relationshipRepository = new RelationshipRepository(this.userRepository);
    this.blacklistRepository = new BlacklistRepository(this.userRepository, this.redisClient);
    this.topRepository = new TopRepository(this.Users);
    this.homeRepository = new HomeRepository(this.Homes);
    this.giveRepository = new GiveRepository(this.Users);
  }

  get repositories(): IDatabaseRepositories {
    return {
      userRepository: this.userRepository,
      cmdRepository: this.cmdRepository,
      starRepository: this.starRepository,
      cacheRepository: this.cacheRepository,
      mamarRepository: this.mamarRepository,
      guildRepository: this.guildRepository,
      badgeRepository: this.badgeRepository,
      maintenanceRepository: this.maintenanceRepository,
      rpgRepository: this.rpgRepository,
      huntRepository: this.huntRepository,
      relationshipRepository: this.relationshipRepository,
      blacklistRepository: this.blacklistRepository,
      topRepository: this.topRepository,
      giveRepository: this.giveRepository,
      homeRepository: this.homeRepository,
    };
  }

  createRedisConnection(): void {
    try {
      this.redisClient = new Redis({ db: process.env.NODE_ENV === 'development' ? 1 : 0 });
      this.redisClient.once('connect', () => {
        console.log('[REDIS] Connected to redis database');
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
