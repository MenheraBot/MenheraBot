import MenheraClient from 'MenheraClient';

import Command from '@structures/Command';

import CommandContext from '@structures/CommandContext';

export default class AbilityInfoCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'infohabilidade',
      aliases: ['ih', 'abilityinfo'],
      cooldown: 10,
      clientPermissions: ['EMBED_LINKS'],
      category: 'rpg',
    });
  }

  async run(ctx: CommandContext): Promise<void> {
    console.log(ctx.data.user.votos);
  }
}
