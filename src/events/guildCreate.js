module.exports = class GuildCreate {
  constructor(client) {
    this.client = client
    this.region = {
      "brazil": "pt-BR",
      "eu-central": "en-US",
      "eu-west": "en-US",
      "hongkong": "en-US",
      "japan": "en-US",
      "russia": "en-US",
      "singapore": "en-US",
      "southafrica": "en-US",
      "sydney": "en-US",
      "us-central": "en-US",
      "us-east": "en-US",
      "us-south": "en-US",
      "us-west": "en-US",
  }
  }
  async run(guild) {
    let server = await this.client.database.Guilds.findOne({id: guild.id})
        if (!server) {
            server = new this.client.database.Guilds({
                _id: guild.id,
                lang: this.region[guild.region]
            })
            server.lang = this.region[guild.region]
            server.save()
    }
    this.client.guilds.cache.get('717061688460967988').channels.cache.get('717061688729534628').send(`<:apaixonada:727975782034440252> | Fui adicionada ao servidor **${guild}**`);
  }
}