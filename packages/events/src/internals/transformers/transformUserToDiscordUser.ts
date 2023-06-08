import { Bot, DiscordUser, User } from 'discordeno';

const transfromUserToDiscordUser = (bot: Bot, payload: User): DiscordUser => ({
  id: bot.utils.bigintToSnowflake(payload.id),
  username: payload.username,
  discriminator: payload.discriminator,
  // @ts-expect-error This dont exists yet!
  global_name: payload.displayName,
  avatar: payload.avatar ? bot.utils.iconBigintToHash(payload.avatar) : null,
  public_flags: payload.publicFlags,
  bot: payload.toggles.bot,
});

export { transfromUserToDiscordUser };
