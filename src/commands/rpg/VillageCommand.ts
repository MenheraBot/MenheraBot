import Command from '@structures/Command';
import 'moment-duration-format';
import MenheraClient from 'MenheraClient';
import CommandContext from '@structures/CommandContext';

export default class VillageCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'village',
      aliases: ['vila'],
      cooldown: 5,
      category: 'rpg',
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: CommandContext): Promise<void> {
    console.log(ctx.data.user.votos);
  }
}
