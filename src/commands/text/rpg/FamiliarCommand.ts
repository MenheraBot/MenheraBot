import Command from '@structures/Command';

import MenheraClient from 'MenheraClient';
import CommandContext from '@structures/CommandContext';

export default class FamiliarCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'familiar',
      aliases: ['pet'],
      category: 'rpg',
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: CommandContext): Promise<void> {
    console.log(ctx.data.user.votos);
  }
}
