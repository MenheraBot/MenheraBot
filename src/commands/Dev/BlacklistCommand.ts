import CommandContext from '@structures/CommandContext';
import MenheraClient from 'MenheraClient';
import { Message } from 'discord.js';
import Command from '../../structures/Command';

export default class BlackilistCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'blacklist',
      aliases: ['bl'],
      devsOnly: true,
      category: 'Dev',
    });
  }

  async run(ctx: CommandContext): Promise<Message> {
    if (!ctx.args[1]) return ctx.reply('error', 'só faltou o id né minha flor');

    const user = await this.client.users.fetch(ctx.args[1]).catch();

    switch (ctx.args[0]) {
      case 'add': {
        if (!user) return ctx.reply('error', 'user not found');
        const reason = ctx.args.slice(2).join(' ') || 'Sem razão informada';

        await this.client.repositories.blacklistRepository.ban(ctx.args[1], reason);

        return ctx.reply('success', 'usuário banido de usar a Menhera!');
      }
      case 'remove': {
        if (!user) return ctx.reply('error', 'user not found');

        await this.client.repositories.blacklistRepository.unban(ctx.args[1]);

        return ctx.reply('success', 'usuário desbanido');
      }
      case 'find': {
        if (!user) return ctx.reply('error', 'user not found');
        const usr = await this.client.repositories.userRepository.find(ctx.args[1]);
        if (!usr) return ctx.send('Nenhum user');
        const msg = `== USER BANNED INFO ==\n\n• User :: ${user.tag} - (${user.id})\n• Banned :: ${usr.ban}\n• Reason :: ${usr.banReason}`;
        return ctx.message.channel.send(msg, { code: 'asciidoc' });
      }
      default:
        return ctx.reply(
          'error',
          'porra lux, n sabe nem usar o próprio bot? Opções: `add`, `remove`, `find`',
        );
    }
  }
}
