module.exports = class GuildCreate {
  constructor(client) {
    this.client = client;
    this.region = {
      brazil: 'pt-BR',
      europe: 'en-US',
      'eu-central': 'en-US',
      'eu-west': 'en-US',
      hongkong: 'en-US',
      japan: 'en-US',
      russia: 'en-US',
      singapore: 'en-US',
      southafrica: 'en-US',
      sydney: 'en-US',
      'us-central': 'en-US',
      'us-east': 'en-US',
      'us-south': 'en-US',
      'us-west': 'en-US',
    };
  }

  async run(guild) {
    let server = await this.client.database.Guilds.findOne({ id: guild.id });
    if (!server) {
      server = new this.client.database.Guilds({
        id: guild.id,
        lang: this.region[guild.region],
      });
      server.lang = this.region[guild.region];
      server.save();
    }
    const webhook = await this.client.fetchWebhook(process.env.GUILDS_HOOK_ID, process.env.GUILDS_HOOK_ID);

    webhook.send(`<:MenheraWink:767210250637279252> | Fui adicionada do servidor **${guild}**`);
  }
};
