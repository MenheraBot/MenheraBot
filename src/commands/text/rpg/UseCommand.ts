import Command from '@structures/Command';
import MenheraClient from 'MenheraClient';
import CommandContext from '@structures/CommandContext';

export default class UseCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'use',
      aliases: ['usar'],
      category: 'rpg',
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: CommandContext): Promise<void> {
    console.log(ctx.data.user.votos);
  }
}
