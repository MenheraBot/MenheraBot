import { Options, SnowflakeUtil, Channel } from 'discord.js-light';
import { resolve } from 'node:path';
import MenheraClient from './MenheraClient';

const channelFilter = (channel: Channel) =>
  !channel.isText() ||
  !channel.lastMessageId ||
  SnowflakeUtil.deconstruct(channel.lastMessageId).timestamp < Date.now() - 3600000;

const client = new MenheraClient(
  {
    makeCache: Options.cacheWithLimits({
      GuildManager: Infinity,
      RoleManager: Infinity,
      PermissionOverwriteManager: Infinity,
      ChannelManager: {
        maxSize: 0,
        sweepFilter: () => channelFilter,
        sweepInterval: 3600,
      },
      GuildChannelManager: {
        maxSize: 0,
        sweepFilter: () => channelFilter,
        sweepInterval: 3600,
      },
      ApplicationCommandManager: 0,
      BaseGuildEmojiManager: 0,
      GuildBanManager: 0,
      GuildInviteManager: 0,
      GuildMemberManager: 0,
      GuildStickerManager: 0,
      MessageManager: 0,
      PresenceManager: 0,
      ReactionManager: 0,
      ReactionUserManager: 0,
      StageInstanceManager: 0,
      ThreadManager: 0,
      ThreadMemberManager: 0,
      UserManager: 0,
      VoiceStateManager: 0,
    }),
    failIfNotExists: false,
    intents: ['GUILDS'],
  },
  {
    interactionsDirectory: resolve(__dirname, 'commands'),
    eventsDirectory: resolve(__dirname, 'events'),
  },
);

(async () => {
  await client.init();

  client
    .login(
      process.env.NODE_ENV === 'development'
        ? (process.env.DEV_BOT_TOKEN as string)
        : (process.env.BOT_TOKEN as string),
    )
    .then(() => console.log('[INDEX] Logged in'))
    .catch((e) => console.log(`[FATALERROR] Failure connecting to Discord! ${e.message}!`));
})();
