import { Bot, DiscordUser, User, UserToggles } from 'discordeno';

const transformDiscordUserToUser = (bot: Bot, payload: DiscordUser): User => ({
  id: bot.utils.snowflakeToBigint(payload.id),
  username: payload.username,
  discriminator: payload.discriminator,
  // @ts-expect-error This dont exists yet!
  displayName: payload.displayName,
  avatar: payload.avatar ? bot.utils.iconHashToBigInt(payload.avatar) : undefined,
  publicFlags: payload.public_flags,
  toggles: new UserToggles(payload),
});

export { transformDiscordUserToUser };
