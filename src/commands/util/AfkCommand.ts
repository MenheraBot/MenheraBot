import Command from '@structures/Command';
import CommandContext from '@structures/CommandContext';
import MenheraClient from 'MenheraClient';

export default class AfkCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'afk',
      cooldown: 5,
      category: 'util',
    });
  }

  async run(ctx: CommandContext): Promise<void> {
    const args = ctx.args.join(' ');
    const reason = args.length ? args.replace(/`/g, '') : 'AFK';

    if (!ctx.message.guild) return;

    await this.client.repositories.cacheRepository.updateAfk(ctx.message.author.id, {
      afk: true,
      afkReason: reason,
      afkGuild: ctx.message.guild.id,
    });

    if (ctx.message.channel.type === 'dm') return;
    const member = ctx.message.channel.guild.members.cache.get(ctx.message.author.id);

    if (member?.manageable) {
      const newNick = member?.nickname
        ? `[AFK] ${member?.nickname}`
        : `[AFK] ${member?.user.username}`;
      if (newNick.length <= 32) await member?.setNickname(newNick, 'AFK System');
    }
    await ctx.replyT('success', 'commands:afk.success');
  }
}
