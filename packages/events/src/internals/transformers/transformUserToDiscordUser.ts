import { Bot, DiscordUser, User } from 'discordeno';

const transfromUserToDiscordUser = (bot: Bot, payload: User): DiscordUser => ({
  id: bot.utils.bigintToSnowflake(payload.id),
  username: payload.username,
  discriminator: payload.discriminator,
  avatar: payload.avatar ? bot.utils.iconBigintToHash(payload.avatar) : null,
  locale: payload.locale,
  email: payload.email ?? undefined,
  flags: payload.flags,
  premium_type: payload.premiumType,
  public_flags: payload.publicFlags,
  bot: payload.toggles.bot,
  system: payload.toggles.system,
  mfa_enabled: payload.toggles.mfaEnabled,
  verified: payload.toggles.verified,
});

export { transfromUserToDiscordUser };
