import { BigString, DiscordEmbed, Embed } from '@discordeno/bot';
import { bot } from '../../index.js';

const createEmbed = (data: Embed): DiscordEmbed => bot.transformers.reverse.embed(bot, data);

const hexStringToNumber = (color: string): number => parseInt(color.replace(/^#/, ''), 16);

const createErrorEmbed = (
  err: Error,
  commandName: string,
  userId: BigString,
  guildId: BigString,
) => {
  const errorMessage = err.stack
    ? err.stack.length > 3800
      ? `${err.stack.slice(0, 3800)}...`
      : err.stack
    : '???';

  return createEmbed({
    color: 0xfd0000,
    title: `${process.env.NODE_ENV === 'development' ? '[DEV]' : ''} Ocorreu um erro ao executar o comando  ${commandName}`,
    description: `\`\`\`js\n${errorMessage}\`\`\``,
    fields: [
      {
        name: '<:atencao:759603958418767922> | Quem Usou',
        value: `UserId: \`${userId}\` \nServerId: \`${guildId}\``,
      },
    ],
  });
};

export { createEmbed, hexStringToNumber, createErrorEmbed };
