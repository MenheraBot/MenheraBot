import { DiscordInteraction } from '@discordeno/types';

const respondInteraction = (data: DiscordInteraction): string | void => {
  if ([2, 3, 5].includes(data.type))
    return '{"type":4,"data":{"flags": 64,"content":"A Menhera está reiniciando! Espere um pouco. \\n Menhera is rebooting! Wait one moment.","allowed_mentions":{"parse":[]}}}';
};

export { respondInteraction };
