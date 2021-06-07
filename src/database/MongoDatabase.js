const mongoose = require('mongoose');
const { Users, Commands, Rpg } = require('../structures/DatabaseCollections');
const CommandRepository = require('./repositories/CommandRepository');
const RpgRepository = require('./repositories/RpgRepository');
const StarRepository = require('./repositories/StarRepository');
const UserRepository = require('./repositories/UserRepository');

module.exports = class MongoDatabase {
  constructor(uri) {
    this.uri = uri;

    this.repositories = {
      userRepository: new UserRepository(Users),
      commandRepository: new CommandRepository(Commands),
      starRepository: new StarRepository(Users),
      rpgRepository: new RpgRepository(Rpg),
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
