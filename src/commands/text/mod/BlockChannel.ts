import CommandContext from '@structures/command/CommandContext';
import MenheraClient from 'MenheraClient';
import Command from '@structures/command/Command';

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

  async run(ctx: CommandContext): Promise<void> {
    if (ctx.data.server.blockedChannels.includes(ctx.message.channel.id)) {
      const index = ctx.data.server.blockedChannels.indexOf(ctx.message.channel.id);

      ctx.data.server.blockedChannels.splice(index, 1);
      await this.client.repositories.cacheRepository.updateGuild(
        ctx.message.guild?.id as string,
        ctx.data.server,
      );
      await ctx.replyT('success', 'commands:blockchannel.unblock');
      return;
    }
    ctx.data.server.blockedChannels.push(ctx.message.channel.id);
    await this.client.repositories.cacheRepository.updateGuild(
      ctx.message.guild?.id as string,
      ctx.data.server,
    );
    await ctx.replyT('success', 'commands:blockchannel.block', {
      prefix: ctx.data.server.prefix,
    });
  }
}
