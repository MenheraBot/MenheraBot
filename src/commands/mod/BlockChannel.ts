import CommandContext from '@structures/CommandContext';
import MenheraClient from 'MenheraClient';
import Command from '@structures/Command';

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

  async run(ctx: CommandContext) {
    if (ctx.data.server.blockedChannels.includes(ctx.message.channel.id)) {
      const index = ctx.data.server.blockedChannels.indexOf(ctx.message.channel.id);
      if (index > -1) {
        ctx.data.server.blockedChannels.splice(index, 1);
        ctx.replyT('success', 'commands:blockchannel.unblock');
      }
    } else {
      ctx.data.server.blockedChannels.push(ctx.message.channel.id);
      ctx.replyT('success', 'commands:blockchannel.block', { prefix: ctx.data.server.prefix });
    }

    ctx.data.server.save();
  }
}
