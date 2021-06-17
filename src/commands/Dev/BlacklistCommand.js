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

    const user = await this.client.database.Users.findOne({ id: ctx.args[1] });

    const user2 = await this.client.users.fetch(ctx.args[1]).catch();

    switch (ctx.args[0]) {
      case 'add': {
        if (!user || user === null) return ctx.reply('error', 'user not found');
        const reason = ctx.args.slice(2).join(' ') || 'Sem razão informada';
        user.ban = true;
        user.banReason = reason;
        user.save();

        ctx.reply('success', 'usuário banido de usar a Menhera!');
        break;
      }
      case 'remove': {
        if (!user || user === null) return ctx.reply('error', 'user not found');
        user.ban = false;
        user.banReason = null;
        user.save();

        ctx.reply('success', 'usuário desbanido');
        break;
      }
      case 'find': {
        if (!user || user === null) return ctx.reply('error', 'user not found');
        const msg = `== USER BANNED INFO ==\n\n• User :: ${user2.tag} - (${user2.id})\n• Banned :: ${user.ban}\n• Reason :: ${user.banReason}`;
        ctx.message.channel.send(msg, { code: 'asciidoc' });
        break;
      }
      default:
        ctx.reply('error', 'porra lux, n sabe nem usar o próprio bot? Opções: `add`, `remove`, `find`');
    }
  }
};
