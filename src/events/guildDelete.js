module.exports = class GuildDelete {
  constructor(client) {
    this.client = client;
  }

  async run(guild) {
    this.client.database.Guilds.findOneAndDelete({ id: guild.id }, () => {
      console.log(`[EVENT] Deleted Guild: ${guild.id}`);
    });

    this.client.guilds.cache.get('717061688460967988').channels.cache.get('717061688729534628').send(`<:menhera_cry:744041825140211732> | Fui removida do servidor **${guild}**`);
  }
};
