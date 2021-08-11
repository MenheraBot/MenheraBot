import CommandContext from '@structures/command/CommandContext';
import MenheraClient from 'MenheraClient';
import Command from '@structures/command/Command';

export default class LanguageCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'language',
      aliases: ['linguagem', 'lang'],
      cooldown: 15,
      userPermissions: ['MANAGE_GUILD'],
      clientPermissions: ['EMBED_LINKS', 'ADD_REACTIONS', 'MANAGE_MESSAGES'],
      category: 'moderação',
    });
  }

  async run(ctx: CommandContext): Promise<void> {
    await ctx.replyT('question', 'commands:language.question');

    if (!ctx.message.guild) return;
    switch (r.emoji.name) {
      case '🇧🇷':
        ctx.data.server.lang = 'pt-BR';
        await this.client.repositories.cacheRepository.updateGuild(
          ctx.message.guild.id,
          ctx.data.server,
        );
        await msg.delete();
        await ctx.message.channel.send(':map: | Agora eu irei falar em ~~brasileiro~~ português');
        break;
      case '🇺🇸':
        ctx.data.server.lang = 'en-US';
        await this.client.repositories.cacheRepository.updateGuild(
          ctx.message.guild.id,
          ctx.data.server,
        );
        await msg.delete();
        await ctx.message.channel.send(":map: | Now I'll talk in english");
        break;
    }
  }
}
