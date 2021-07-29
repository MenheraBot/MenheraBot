import Command from '@structures/Command';
import CommandContext from '@structures/CommandContext';
import MenheraClient from 'MenheraClient';
import { Message } from 'discord.js';

export default class StarManagerCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'managestar',
      aliases: ['ms'],
      devsOnly: true,
      category: 'Dev',
    });
  }

  async run(ctx: CommandContext): Promise<Message> {
    const [id, option, value] = ctx.args;

    if (!value)
      return ctx.reply('error', 'Use `m!managestar <userId> <add | remove | set> <valor>`');

    switch (option.toLowerCase()) {
      case 'add':
        await this.client.repositories.starRepository.add(id, parseInt(value));
        break;
      case 'remove':
        await this.client.repositories.starRepository.remove(id, parseInt(value));
        break;
      case 'set':
        await this.client.repositories.starRepository.set(id, parseInt(value));
        break;
      default:
        return ctx.reply('error', 'Use `m!managestar <userId> <add | remove | set> <valor>`');
    }

    return ctx.reply('success', `Estrelinhas de ${id} alteradas com sucesso :star:`);
  }
}
