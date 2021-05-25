import * as mongoose from 'mongoose';

export default class MongoDatabase {
  constructor(public uri: string) {
    this.uri = uri;
  }

  createConnection(): Promise<void> {
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
}
