import Command from '@structures/command/Command';
import MenheraClient from 'MenheraClient';
import CommandContext from '@structures/command/CommandContext';

export default class StatusCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'status',
      aliases: ['stats'],
      cooldown: 7,
      category: 'rpg',
      clientPermissions: ['EMBED_LINKS', 'ATTACH_FILES'],
    });
  }

  async run(ctx: CommandContext): Promise<void> {
    console.log(ctx.data.user.votos);
  }
}
