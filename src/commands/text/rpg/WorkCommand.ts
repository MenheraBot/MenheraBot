import Command from '@structures/command/Command';
import MenheraClient from 'MenheraClient';
import CommandContext from '@structures/command/CommandContext';

export default class WorkCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'work',
      aliases: ['trabalhar'],
      category: 'rpg',
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: CommandContext): Promise<void> {
    console.log(ctx.data.user.votos);
  }
}
