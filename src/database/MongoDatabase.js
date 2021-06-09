const mongoose = require('mongoose');
const MongoModals = require('../structures/DatabaseCollections');
const CmdRepository = require('./repositories/CmdsRepository');
const CommandRepository = require('./repositories/CommandRepository');
const RpgRepository = require('./repositories/RpgRepository');
const StarRepository = require('./repositories/StarRepository');
const UserRepository = require('./repositories/UserRepository');

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

    this.repositories = {
      userRepository: new UserRepository(this.Users),
      commandRepository: new CommandRepository(this.Commands),
      cmdRepository: new CmdRepository(this.Cmds),
      starRepository: new StarRepository(this.Users),
      rpgRepository: new RpgRepository(this.Rpg),
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
