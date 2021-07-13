module.exports = class GuildDelete {
  constructor(client) {
    this.client = client;
  }

  async run(guild) {
    if (!guild || !guild.id || !guild.name) return;

    this.client.repositories.guildRepository.delete(guild.id);

    const webhook = await this.client.fetchWebhook(
      process.env.GUILDS_HOOK_ID,
      process.env.GUILDS_HOOK_TOKEN,
    );

    webhook.send(`<:menhera_cry:744041825140211732> | Fui removida do servidor **${guild.name}**`);
  }
};
