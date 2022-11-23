import { Bot, DiscordUser, User } from 'discordeno';

const transfromUserToDiscordUser = (bot: Bot, payload: User): DiscordUser => ({
  id: bot.utils.bigintToSnowflake(payload.id),
  username: payload.username,
  discriminator: payload.discriminator,
  avatar: payload.avatar ? bot.utils.iconBigintToHash(payload.avatar) : null,
  public_flags: payload.publicFlags,
  bot: payload.toggles.bot,
});

export { transfromUserToDiscordUser };
