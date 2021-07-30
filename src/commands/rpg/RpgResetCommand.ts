import Command from '@structures/Command';
import CommandContext from '@structures/CommandContext';
import { Message } from 'discord.js';
import MenheraClient from 'MenheraClient';

export default class RpgResetCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'reset',
      aliases: ['resetar'],
      cooldown: 5,
      category: 'rpg',
    });
  }

  async run(ctx: CommandContext): Promise<Message | void> {
    const user = await this.client.repositories.rpgRepository.find(ctx.message.author.id);
    if (!user) return ctx.replyT('error', 'commands:reset.non-aventure');
    if (user.level < 4) return ctx.replyT('error', 'commands:reset.low-level');

    await ctx.replyT('warn', 'commands:reset.confirm');

    const filter = (m: Message) => m.author.id === ctx.message.author.id;
    const collector = ctx.message.channel.createMessageCollector(filter, {
      max: 1,
      time: 30000,
    });

    collector.on('collect', async (m) => {
      if (m.content.toLowerCase() === 'sim' || m.content.toLowerCase() === 'yes') {
        await this.client.repositories.rpgRepository.delete(ctx.message.author.id);
        return ctx.replyT('success', 'commands:reset.success', { prefix: ctx.data.server.prefix });
      }
      return ctx.replyT('error', 'commands:reset.cancel');
    });
  }
}
