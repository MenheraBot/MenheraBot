const { ShardingManager } = require('discord.js');
const path = require('path');

const { connect } = require('mongoose');
const config = require('./config.json');

async function connectMongo() {
  console.log('[DATABASE] Start connecting with the database');
  await connect(config.uri, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    .then(() => console.log('[DATABASE] Conectado com sucesso à database'))
    .catch((err) => { console.log(`[DATABASE] Error to connecting to database \n${err}`); });
}

async function startApp() {
  console.log('[APP] Iniciating application...');
  await connectMongo();

  const shards = new ShardingManager(path.resolve(__dirname, 'dist', 'index.js'), {
    respawn: true,
    totalShards: 4,
  });

  shards.on('shardCreate', (shard) => {
    console.warn(`[SHARDING MANAGER] Launching shard ${shard.id}`);
  });

  shards.spawn().then(() => console.log('[SHARDING MANAGER] All shards has been spawned'));
}

startApp();
