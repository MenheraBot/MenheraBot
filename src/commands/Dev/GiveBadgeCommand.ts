import CommandContext from '@structures/CommandContext';
import MenheraClient from 'MenheraClient';
import Command from '@structures/Command';

export default class GiveBadgeCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'gb',
      description: 'Lansa uma badge pra um usuario',
      devsOnly: true,
      category: 'Dev',
    });
  }

  async run(ctx: CommandContext) {
    const badgeId = parseInt(ctx.args[1]);

    if (!badgeId) return ctx.reply('error', 'Cade o id da badge?');

    this.client.repositories.badgeRepository.addBadge(ctx.args[0], badgeId);

    ctx.send('Concluido');
  }
}
