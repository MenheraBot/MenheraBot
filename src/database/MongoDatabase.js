const mongoose = require('mongoose');
const MongoModals = require('../structures/DatabaseCollections');
const CmdRepository = require('./repositories/CmdsRepository');
const CommandRepository = require('./repositories/CommandRepository');
const RpgRepository = require('./repositories/RpgRepository');
const StarRepository = require('./repositories/StarRepository');
const UserRepository = require('./repositories/UserRepository');
const MamarRepository = require('./repositories/MamarRepository');
const GuildRepository = require('./repositories/GuildsRepository');
const StatusRepository = require('./repositories/StatusRepository');
const BadgeRepository = require('./repositories/BadgeRepository');
const MaintenanceRepository = require('./repositories/MaintenanceRepository');
const HuntRepository = require('./repositories/HuntRepository');
const RelationshipRepository = require('./repositories/RelationshipRepository');
const BlacklistRepository = require('./repositories/BlacklistRepository');
const TopRepository = require('./repositories/TopRepository');
const GiveRepository = require('./repositories/GiveRepository');

module.exports = class MongoDatabase {
  constructor(uri) {
    this.uri = uri;

    // TODO: add modal to the name for readability
    // para fazer isso tem que mudar todos os codigos que estão usando `database.(nome_sem_modal)` to repositories
    this.Cmds = MongoModals.Cmds;
    this.Commands = MongoModals.Commands;
    this.Guilds = MongoModals.Guilds;
    this.Status = MongoModals.Status;
    this.Rpg = MongoModals.Rpg;
    this.Users = MongoModals.Users;

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

  get repositories() {
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

  createConnection() {
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
};
