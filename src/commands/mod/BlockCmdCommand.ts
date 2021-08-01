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

  async run(ctx: CommandContext): Promise<void> {
    if (!ctx.args[0]) {
      await ctx.replyT('error', 'commands:blockcommand.no-args');
      return;
    }

    const cmd =
      this.client.commands.get(ctx.args[0]) ||
      this.client.commands.get(this.client.aliases.get(ctx.args[0]) as string);

    if (!cmd) {
      await ctx.replyT('error', 'commands:blockcommand.no-cmd');
      return;
    }

    if (cmd.config.devsOnly) {
      await ctx.replyT('error', 'commands:blockcommand.dev-cmd');
      return;
    }

    if (cmd.config.name === this.config.name) {
      await ctx.replyT('error', 'commands:blockcommand.foda');
      return;
    }

    if (ctx.data.server.disabledCommands?.includes(cmd.config.name)) {
      const index = ctx.data.server.disabledCommands.indexOf(cmd.config.name);

      ctx.data.server.disabledCommands.splice(index, 1);
      await ctx.data.server.save();
      await ctx.replyT('success', 'commands:blockcommand.unblock', { cmd: cmd.config.name });
      return;
    }
    ctx.data.server.disabledCommands.push(cmd.config.name);
    await ctx.data.server.save();
    await ctx.replyT('success', 'commands:blockcommand.block', { cmd: cmd.config.name });
  }
}
