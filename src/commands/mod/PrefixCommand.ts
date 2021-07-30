import CommandContext from '@structures/CommandContext';
import MenheraClient from 'MenheraClient';
import Command from '@structures/Command';
import { Message } from 'discord.js';

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

  async run(ctx: CommandContext): Promise<Message> {
    const [prefix] = ctx.args;
    if (!prefix) return ctx.replyT('error', 'commands:prefix.no-args');
    if (prefix.length > 3) return ctx.replyT('error', 'commands:prefix.invalid-input');

    await this.client.repositories.cacheRepository.updateGuildPrefix(
      ctx.message.guild?.id ?? '',
      prefix,
    );

    return ctx.replyT('success', 'commands:prefix.done', { prefix: ctx.data.server.prefix });
  }
}
