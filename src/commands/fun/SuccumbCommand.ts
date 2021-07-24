import Command from '@structures/Command';
import CommandContext from '@structures/CommandContext';
import MenheraClient from 'MenheraClient';

export default class SuccumbCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'sucumba',
      category: 'diversão',
    });
  }

  async run(ctx: CommandContext) {
    const user = ctx.message.mentions.users.first() || ctx.args.join(' ');
    if (!user) return ctx.reply('error', 'n/a');
    ctx.send(
      `${ctx.locale('commands:sucumba.start')} **${user}** ${ctx.locale('commands:sucumba.end')}`,
    );
  }
}
