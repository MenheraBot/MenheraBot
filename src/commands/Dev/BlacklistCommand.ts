import CommandContext from '@structures/CommandContext';
import MenheraClient from 'MenheraClient';
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

  async run(ctx: CommandContext): Promise<void> {
    if (!ctx.args[1]) {
      await ctx.reply('error', 'só faltou o id né minha flor');
      return;
    }

    const user = await this.client.users.fetch(ctx.args[1]).catch();

    switch (ctx.args[0]) {
      case 'add': {
        if (!user) {
          await ctx.reply('error', 'user not found');
          return;
        }
        const reason = ctx.args.slice(2).join(' ') || 'Sem razão informada';

        await this.client.repositories.blacklistRepository.ban(ctx.args[1], reason);

        await ctx.reply('success', 'usuário banido de usar a Menhera!');
        return;
      }
      case 'remove': {
        if (!user) {
          await ctx.reply('error', 'user not found');
          return;
        }

        await this.client.repositories.blacklistRepository.unban(ctx.args[1]);

        await ctx.reply('success', 'usuário desbanido');
        return;
      }
      case 'find': {
        if (!user) {
          await ctx.reply('error', 'user not found');
          return;
        }
        const usr = await this.client.repositories.userRepository.find(ctx.args[1]);
        if (!usr) {
          await ctx.send('Nenhum user');
          return;
        }

        const msg = `== USER BANNED INFO ==\n\n• User :: ${user.tag} - (${user.id})\n• Banned :: ${usr.ban}\n• Reason :: ${usr.banReason}`;
        await ctx.message.channel.send(msg, { code: 'asciidoc' });
        return;
      }
      default:
        await ctx.reply(
          'error',
          'porra lux, n sabe nem usar o próprio bot? Opções: `add`, `remove`, `find`',
        );
    }
  }
}
