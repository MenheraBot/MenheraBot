import Command from '@structures/command/Command';
import CommandContext from '@structures/command/CommandContext';
import MenheraClient from 'MenheraClient';

export default class JobCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'job',
      aliases: ['trabalho'],
      cooldown: 10,
      clientPermissions: ['EMBED_LINKS'],
      category: 'rpg',
    });
  }

  async run(ctx: CommandContext): Promise<void> {
    console.log(ctx.data.user.votos);
  }
}
