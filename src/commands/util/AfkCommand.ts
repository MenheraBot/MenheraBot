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

  async run(ctx: CommandContext) {
    const args = ctx.args.join(' ');
    const reason = args.length ? args.replace(/`/g, '') : 'AFK';

    await ctx.client.database.Users.updateOne(
      { id: ctx.message.author.id },
      { afk: true, afkReason: reason, afkGuild: ctx.message.guild.id },
    );

    if (ctx.message.channel.type === 'dm') return;
    const member = ctx.message.channel.guild.members.cache.get(ctx.message.author.id);

    ctx.replyT('success', 'commands:afk.success');
    if (member.manageable) {
      const newNick = member.nickname
        ? `[AFK] ${member.nickname}`
        : `[AFK] ${member.user.username}`;
      if (newNick.length <= 32) member.setNickname(newNick, 'AFK System');
    }
  }
}
