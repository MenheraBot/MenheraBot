const Command = require('../../structures/command');

module.exports = class BlackilistCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'blacklist',
      aliases: ['bl'],
      description: 'Bane um usuário de usar a Menehra OwO',
      devsOnly: true,
      category: 'Dev',
    });
  }

  async run(ctx) {
    if (!ctx.args[1]) return ctx.reply('error', 'só faltou o id né minha flor');

    const user = await this.client.users.fetch(ctx.args[1]).catch();

    switch (ctx.args[0]) {
      case 'add': {
        if (!user || user === null) return ctx.reply('error', 'user not found');
        const reason = ctx.args.slice(2).join(' ') || 'Sem razão informada';

        this.client.repositories.blacklistRepository.ban(ctx.args[1], reason);

        ctx.reply('success', 'usuário banido de usar a Menhera!');
        break;
      }
      case 'remove': {
        if (!user || user === null) return ctx.reply('error', 'user not found');

        this.client.repositories.blacklistRepository.unban(ctx.args[1]);

        ctx.reply('success', 'usuário desbanido');
        break;
      }
      case 'find': {
        if (!user || user === null) return ctx.reply('error', 'user not found');
        const usr = await this.client.repositories.userRepository.find(ctx.args[1]);
        const msg = `== USER BANNED INFO ==\n\n• User :: ${user.tag} - (${user.id})\n• Banned :: ${usr.ban}\n• Reason :: ${usr.banReason}`;
        ctx.message.channel.send(msg, { code: 'asciidoc' });
        break;
      }
      default:
        ctx.reply('error', 'porra lux, n sabe nem usar o próprio bot? Opções: `add`, `remove`, `find`');
    }
  }
};
