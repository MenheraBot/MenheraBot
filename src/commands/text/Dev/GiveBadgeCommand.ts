import CommandContext from '@structures/command/CommandContext';
import MenheraClient from 'MenheraClient';
import Command from '@structures/command/Command';

export default class GiveBadgeCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'gb',
      devsOnly: true,
      category: 'Dev',
    });
  }

  async run(ctx: CommandContext): Promise<void> {
    const badgeId = parseInt(ctx.args[1]);

    if (!badgeId) {
      await ctx.reply('error', 'Cade o id da badge?');
      return;
    }

    await this.client.repositories.badgeRepository.addBadge(ctx.args[0], badgeId);

    await ctx.send('Concluido');
  }
}
