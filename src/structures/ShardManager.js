module.exports = class ShardManager {
    constructor(client) {
        this.client = client
    }

    async getFromCollection(collection, id) {
        const data = await this.client.shard.broadcastEval(`this.${collection}.cache.get('${id}')`).then(a => a.filter(b => b))
        return data[0]
    }
    async getSizeCollection(collection) {
        const info = await this.client.shard.fetchClientValues(`${collection}.cache.size`)
        let i = info.reduce((prev, val) => prev + val)
        return i
    }

    getAllSizeObject(collection) {
        return this.getSizeCollection(collection)
    }

    getEmojis(id) {
        return this.getFromCollection('emojis', id)
    }

    getUsers(id) {
        return this.getFromCollection('users', id)
    }

    getGuilds(id) {
        return this.getFromCollection('guilds', id)
    }

    getChannels(id) {
        return this.getFromCollection('channels', id)
    }

    killShard(id) {
        return this.client.shard.broadcastEval(`if (this.shard.id === ${id}) { this.destroy() }`)
    }
}