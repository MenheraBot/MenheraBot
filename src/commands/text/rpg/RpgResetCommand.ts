import Command from '@structures/command/Command';
import CommandContext from '@structures/command/CommandContext';
import MenheraClient from 'MenheraClient';

export default class RpgResetCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'reset',
      aliases: ['resetar'],
      cooldown: 5,
      category: 'rpg',
    });
  }

  async run(ctx: CommandContext): Promise<void> {
    console.log(ctx.data.user.votos);
  }
}
