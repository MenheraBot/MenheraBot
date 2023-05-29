import { DISCORDENO_VERSION } from 'discordeno';
import { DiscordInteraction } from 'discordeno/types';
import { request } from 'node:https';

const respondInteraction = (data: DiscordInteraction): void => {
  if ([2, 3, 5].includes(data.type)) {
    try {
      request({
        hostname: 'discord.com',
        port: 443,
        path: `/api/v10/interactions/${data.id}/${data.token}/callback`,
        method: 'POST',
        headers: {
          'user-agent': `DiscordBot (https://github.com/discordeno/discordeno, v${DISCORDENO_VERSION})`,
          authorization: '',
          'Content-Type': 'application/json',
        },
      }).end(
        '{"type":4,"data":{"flags": 64,"content":"A Menhera está reiniciando! Espere um pouco. \\n Menhera is rebooting! Wait one moment.","allowed_mentions":{"parse":[]}}}',
      );
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[HTTP] Error while sending maintenance message: ', err);
    }
  }
};

export { respondInteraction };
