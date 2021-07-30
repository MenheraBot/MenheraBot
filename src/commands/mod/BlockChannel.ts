import CommandContext from '@structures/CommandContext';
import MenheraClient from 'MenheraClient';
import Command from '@structures/Command';
import { Message } from 'discord.js';

export default class BlockChannelCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'blockchannel',
      aliases: ['bloquearcanal'],
      cooldown: 10,
      userPermissions: ['MANAGE_CHANNELS'],
      category: 'moderação',
    });
  }

  async run(ctx: CommandContext): Promise<Message | void> {
    if (!ctx.message.guild) return;
    if (ctx.data.server.blockedChannels.includes(ctx.message.channel.id)) {
      await this.client.repositories.cacheRepository.removeBlockedChannel(
        ctx.message.guild.id,
        ctx.message.channel.id,
      );
      return ctx.replyT('success', 'commands:blockchannel.unblock');
    }
    await this.client.repositories.cacheRepository.addBlockedChannel(
      ctx.message.guild.id,
      ctx.message.channel.id,
    );
    return ctx.replyT('success', 'commands:blockchannel.block', {
      prefix: ctx.data.server.prefix,
    });
  }
}
