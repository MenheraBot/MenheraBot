import Command from '@structures/Command';
import CommandContext from '@structures/CommandContext';
import MenheraClient from 'MenheraClient';
import { Message } from 'discord.js';

export default class SuccumbCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'sucumba',
      category: 'diversão',
    });
  }

  async run(ctx: CommandContext): Promise<Message> {
    const user = ctx.message.mentions.users.first() || ctx.args.join(' ');
    if (!user) return ctx.reply('error', 'n/a');
    return ctx.send(
      `${ctx.locale('commands:sucumba.start')} **${user}** ${ctx.locale('commands:sucumba.end')}`,
    );
  }
}
