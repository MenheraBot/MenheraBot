import CommandContext from '@structures/CommandContext';
import MenheraClient from 'MenheraClient';
import Command from '@structures/Command';
import { Message } from 'discord.js';

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

  async run(ctx: CommandContext): Promise<Message> {
    if (!ctx.args[0]) return ctx.replyT('error', 'commands:blockcommand.no-args');

    const cmd =
      this.client.commands.get(ctx.args[0]) ||
      this.client.commands.get(this.client.aliases.get(ctx.args[0]) as string);

    if (!cmd) return ctx.replyT('error', 'commands:blockcommand.no-cmd');

    if (cmd.config.devsOnly) return ctx.replyT('error', 'commands:blockcommand.dev-cmd');

    if (cmd.config.name === this.config.name)
      return ctx.replyT('error', 'commands:blockcommand.foda');

    if (ctx.data.server.disabledCommands?.includes(cmd.config.name)) {
      await this.client.repositories.cacheRepository.enableCommandInGuild(
        ctx.message.guild?.id ?? '',
        cmd.config.name,
      );
      return ctx.replyT('success', 'commands:blockcommand.unblock', { cmd: cmd.config.name });
    }

    await this.client.repositories.cacheRepository.disableCommandInGuild(
      ctx.message.guild?.id ?? '',
      cmd.config.name,
    );
    return ctx.replyT('success', 'commands:blockcommand.block', { cmd: cmd.config.name });
  }
}
