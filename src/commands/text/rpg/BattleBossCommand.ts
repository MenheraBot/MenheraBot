import Command from '@structures/command/Command';
import MenheraClient from 'MenheraClient';
import CommandContext from '@structures/command/CommandContext';

export default class BattleBoss extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'boss',
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
      category: 'rpg',
    });
  }

  async run(ctx: CommandContext): Promise<void> {
    console.log(ctx.data.user.votos);
  }
}
