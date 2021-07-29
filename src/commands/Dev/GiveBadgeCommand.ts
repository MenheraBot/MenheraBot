import CommandContext from '@structures/CommandContext';
import MenheraClient from 'MenheraClient';
import Command from '@structures/Command';
import { Message } from 'discord.js';

export default class GiveBadgeCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'gb',
      devsOnly: true,
      category: 'Dev',
    });
  }

  async run(ctx: CommandContext): Promise<Message> {
    const badgeId = parseInt(ctx.args[1]);

    if (!badgeId) return ctx.reply('error', 'Cade o id da badge?');

    await this.client.repositories.badgeRepository.addBadge(ctx.args[0], badgeId);

    return ctx.send('Concluido');
  }
}
