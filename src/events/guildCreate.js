module.exports = class GuildCreate {
  constructor(client) {
    this.client = client
  }
  async run(guild) {
    let server = await this.client.database.Guilds.findOne({ id: guild.id })
    if (!server) {
      server = new this.client.database.Guilds({
        id: guild.id
      })
      server.save()
    }
    this.client.guilds.cache.get('717061688460967988').channels.cache.get('717061688729534628').send(`<:apaixonada:727975782034440252> | Fui adicionada ao servidor **${guild}**`);
  }
}