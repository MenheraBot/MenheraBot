import MenheraClient from 'MenheraClient';

export default class ShardManager {
  constructor(public client: MenheraClient) {
    this.client = client;
  }

  async getFromCollection(collection: string, id: number) {
    const data = await this.client.shard
      .broadcastEval(`this.${collection}.cache.get('${id}')`)
      .then((a) => a.filter((b) => b));
    return data[0];
  }

  async getSizeCollection(collection: string) {
    const info = await this.client.shard.fetchClientValues(`${collection}.cache.size`);
    const i = info.reduce((prev, val) => prev + val);
    return i;
  }

  getAllSizeObject(collection: string) {
    return this.getSizeCollection(collection);
  }

  getEmojis(id: number) {
    return this.getFromCollection('emojis', id);
  }

  getUsers(id: number) {
    return this.getFromCollection('users', id);
  }

  getGuilds(id: number) {
    return this.getFromCollection('guilds', id);
  }

  getChannels(id: number) {
    return this.getFromCollection('channels', id);
  }

  killShard(id: number) {
    return this.client.shard.broadcastEval(`if (this.shard.id === ${id}) { this.destroy() }`);
  }
}
