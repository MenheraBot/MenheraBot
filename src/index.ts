import { Options } from 'discord.js';
import { resolve } from 'path';
import MenheraClient from './MenheraClient';

const client = new MenheraClient(
  {
    makeCache: Options.cacheWithLimits({
      MessageManager: 50,
      PresenceManager: 0,
      StageInstanceManager: 0,
      UserManager: 100,
      VoiceStateManager: 0,
      BaseGuildEmojiManager: 0,
      GuildBanManager: 0,
      GuildInviteManager: 0,
      GuildStickerManager: 0,
      ReactionManager: 0,
      ReactionUserManager: 0,
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
