import CommandContext from '@structures/command/CommandContext';
import MenheraClient from 'MenheraClient';
import Command from '@structures/command/Command';

export default class PrefixCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'prefix',
      aliases: ['prefixo'],
      cooldown: 10,
      userPermissions: ['MANAGE_CHANNELS'],
      category: 'moderação',
    });
  }

  async run(ctx: CommandContext): Promise<void> {
    const [prefix] = ctx.args;
    if (!prefix) {
      await ctx.replyT('error', 'commands:prefix.no-args');
      return;
    }
    if (prefix.length > 3) {
      await ctx.replyT('error', 'commands:prefix.invalid-input');
      return;
    }

    ctx.data.server.prefix = prefix;
    await this.client.repositories.cacheRepository.updateGuild(
      ctx.message.guild?.id as string,
      ctx.data.server,
    );

    await ctx.replyT('success', 'commands:prefix.done', { prefix: ctx.data.server.prefix });
  }
}
