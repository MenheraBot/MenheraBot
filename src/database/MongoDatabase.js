const mongoose = require('mongoose');
const MongoModals = require('../structures/DatabaseCollections');
const CmdRepository = require('./repositories/CmdsRepository');
const CommandRepository = require('./repositories/CommandRepository');
const RpgRepository = require('./repositories/RpgRepository');
const StarRepository = require('./repositories/StarRepository');
const UserRepository = require('./repositories/UserRepository');
const MamarRepository = require('./repositories/MamarRepository');

module.exports = class MongoDatabase {
  constructor(uri) {
    this.uri = uri;

    // TODO: add modal to the name for readability
    // para fazer isso tem que mudar todos os codigos que estão usando `database.(nome_sem_modal)` to repositories
    this.Cmds = MongoModals.Cmds;
    this.Commands = MongoModals.Commands;
    this.Guilds = MongoModals.Guilds;
    this.Status = MongoModals.Status;
    this.Reminders = MongoModals.Reminders;
    this.Rpg = MongoModals.Rpg;
    this.Users = MongoModals.Users;
    this.Warns = MongoModals.Warns;

    this.userRepository = new UserRepository(this.Users);
    this.commandRepository = new CommandRepository(this.Commands);
    this.cmdRepository = new CmdRepository(this.Cmds);
    this.starRepository = new StarRepository(this.Users);
    this.rpgRepository = new RpgRepository(this.Rpg);
    this.mamarRepository = new MamarRepository(this.userRepository);
  }

  get repositories() {
    return {
      userRepository: this.userRepository,
      commandRepository: this.commandRepository,
      cmdRepository: this.cmdRepository,
      starRepository: this.starRepository,
      rpgRepository: this.rpgRepository,
      mamarRepository: this.mamarRepository,
    };
  }

  createConnection() {
    return new Promise((resolve, reject) => {
      mongoose.connect(this.uri, {
        useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true,
      }, (err) => {
        if (err) {
          console.error(`(x) Error to connecting to database \n${err}`);

          return reject(err);
        }

        console.log('[DATABASE] Conectado com sucesso à database');
        return resolve();
      });
    });
  }
};
