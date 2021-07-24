import CommandContext from '@structures/CommandContext';
import MenheraClient from 'MenheraClient';
import Command from '@structures/Command';

export default class BlockCmdCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'blockcommand',
      aliases: ['blockcmd', 'blockearcomando'],
      cooldown: 10,
      userPermissions: ['MANAGE_GUILD'],
      category: 'moderação',
    });
  }

  async run(ctx: CommandContext) {
    if (!ctx.args[0]) return ctx.replyT('error', 'commands:blockcommand.no-args');

    const cmd =
      this.client.commands.get(ctx.args[0]) ||
      this.client.commands.get(this.client.aliases.get(ctx.args[0]));

    if (!cmd) return ctx.replyT('error', 'commands:blockcommand.no-cmd');

    if (cmd.config.devsOnly) return ctx.replyT('error', 'commands:blockcommand.dev-cmd');

    if (cmd.config.name === this.config.name)
      return ctx.replyT('error', 'commands:blockcommand.foda');

    if (ctx.data.server.disabledCommands?.includes(cmd.config.name)) {
      const index = ctx.data.server.disabledCommands.indexOf(cmd.config.name);
      if (index > -1) {
        ctx.data.server.disabledCommands.splice(index, 1);
        ctx.replyT('success', 'commands:blockcommand.unblock', { cmd: cmd.config.name });
      }
    } else {
      ctx.data.server.disabledCommands.push(cmd.config.name);
      ctx.replyT('success', 'commands:blockcommand.block', { cmd: cmd.config.name });
    }

    await ctx.data.server.save();
  }
}
