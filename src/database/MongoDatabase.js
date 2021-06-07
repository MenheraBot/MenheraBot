const mongoose = require('mongoose');
const { UsersModal, CommandsModal, RpgModal } = require('../structures/DatabaseConnection');
const CommandRepository = require('./repositories/CommandRepository');
const RpgRepository = require('./repositories/RpgRepository');
const StarRepository = require('./repositories/StarRepository');
const UserRepository = require('./repositories/UserRepository');

module.exports = class MongoDatabase {
  constructor(uri) {
    this.uri = uri;

    this.repositories = {
      userRepository: new UserRepository(UsersModal),
      commandRepository: new CommandRepository(CommandsModal),
      starRepository: new StarRepository(UsersModal),
      rpgRepository: new RpgRepository(RpgModal),
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
