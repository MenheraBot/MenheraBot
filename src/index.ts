import { Options } from 'discord.js-light';
import { resolve } from 'path';
import MenheraClient from './MenheraClient';

const client = new MenheraClient(
  {
    makeCache: Options.cacheWithLimits({
      ApplicationCommandManager: 0, // guild.commands
      BaseGuildEmojiManager: 0, // guild.emojis
      ChannelManager: 0, // client.channels
      GuildChannelManager: 0, // guild.channels
      GuildBanManager: 0, // guild.bans
      GuildInviteManager: 0, // guild.invites
      GuildManager: Infinity, // client.guilds
      GuildMemberManager: 0, // guild.members
      GuildStickerManager: 0, // guild.stickers
      MessageManager: 0, // channel.messages
      PermissionOverwriteManager: 0, // channel.permissionOverwrites
      PresenceManager: 0, // guild.presences
      ReactionManager: 0, // message.reactions
      ReactionUserManager: 0, // reaction.users
      RoleManager: 0, // guild.roles
      StageInstanceManager: 0, // guild.stageInstances
      ThreadManager: 0, // channel.threads
      ThreadMemberManager: 0, // threadchannel.members
      UserManager: 0, // client.users
      VoiceStateManager: 0, // guild.voiceStates
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
