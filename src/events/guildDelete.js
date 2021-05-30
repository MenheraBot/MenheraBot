module.exports = class GuildDelete {
  constructor(client) {
    this.client = client;
  }

  async run(guild) {
    if (!guild || !guild.id) return;
    this.client.database.Guilds.findOneAndDelete({ id: guild.id }, () => {
      // console.log(`[EVENT] Deleted Guild: ${guild.id}`);
    });

    const webhook = await this.client.fetchWebhook(this.client.config.guild_webhook_id, this.client.config.guild_webhook_token);

    webhook.send(`<:menhera_cry:744041825140211732> | Fui removida do servidor **${guild}**`);
  }
};
