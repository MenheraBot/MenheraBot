import mongoose from 'mongoose';
import Redis from 'ioredis';
import { Cmds, Guilds, Users, Themes, Credits } from '@structures/DatabaseCollections';
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
import CoinflipRepository from './repositories/CoinflipRepository';
import ShopRepository from './repositories/ShopRepository';
import ThemeRepository from './repositories/ThemeRepository';
import CreditsRepository from './repositories/CreditsRepository';

export default class Databases {
  public redisClient: Redis.Redis | null = null;

  public readonly Cmds: typeof Cmds;

  public readonly Guilds: typeof Guilds;

  public readonly Users: typeof Users;

  public readonly Themes: typeof Themes;

  public readonly Credits: typeof Credits;

  private readonly userRepository: UserRepository;

  private readonly cmdRepository: CmdRepository;

  private readonly starRepository: StarRepository;

  private readonly mamarRepository: MamarRepository;

  private readonly guildRepository: GuildRepository;

  private readonly badgeRepository: BadgeRepository;

  private readonly maintenanceRepository: MaintenanceRepository;

  private readonly cacheRepository: CacheRepository;

  private readonly coinflipRepository: CoinflipRepository;

  private readonly huntRepository: HuntRepository;

  private readonly relationshipRepository: RelationshipRepository;

  private readonly blacklistRepository: BlacklistRepository;

  private readonly topRepository: TopRepository;

  private readonly giveRepository: GiveRepository;

  private readonly shopRepository: ShopRepository;

  private readonly themeRepository: ThemeRepository;

  private readonly creditsRepository: CreditsRepository;

  constructor(public uri: string, withRedisCache: boolean) {
    this.Cmds = Cmds;
    this.Guilds = Guilds;
    this.Users = Users;
    this.Themes = Themes;
    this.Credits = Credits;

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
    this.coinflipRepository = new CoinflipRepository(this.starRepository);
    this.badgeRepository = new BadgeRepository(this.userRepository);
    this.maintenanceRepository = new MaintenanceRepository(this.cmdRepository);
    this.huntRepository = new HuntRepository(this.Users);
    this.relationshipRepository = new RelationshipRepository(this.userRepository);
    this.blacklistRepository = new BlacklistRepository(this.userRepository, this.redisClient);
    this.topRepository = new TopRepository(this.Users);
    this.giveRepository = new GiveRepository(this.Users);
    this.themeRepository = new ThemeRepository(this.Themes, this.redisClient);
    this.creditsRepository = new CreditsRepository(this.Credits, this.redisClient);
    this.shopRepository = new ShopRepository(
      this.Users,
      this.themeRepository,
      this.creditsRepository,
    );
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
      huntRepository: this.huntRepository,
      relationshipRepository: this.relationshipRepository,
      blacklistRepository: this.blacklistRepository,
      topRepository: this.topRepository,
      giveRepository: this.giveRepository,
      coinflipRepository: this.coinflipRepository,
      shopRepository: this.shopRepository,
      themeRepository: this.themeRepository,
      creditsRepository: this.creditsRepository,
    };
  }

  createRedisConnection(): void {
    try {
      this.redisClient = new Redis({ db: process.env.NODE_ENV === 'development' ? 1 : 0 });

      this.redisClient.once('connect', () => {
        console.log('[REDIS] Connected to redis database');
      });

      this.redisClient.on('end', () => {
        this.redisClient = null;
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
