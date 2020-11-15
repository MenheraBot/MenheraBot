const Command = require('../../structures/command');

module.exports = class BlackilistCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'blacklist',
      description: 'Bane um usuário de usar a Menehra OwO',
      devsOnly: true,
      category: 'Dev',
    });
  }

  async run({ message, args, server }, t) {
    if (!args[1]) return message.menheraReply('error', 'só faltou o id né minha flor');

    const user = await this.client.database.Users.findOne({ id: args[1] });

    const user2 = await this.client.users.fetch(args[1]).catch();

    switch (args[0]) {
      case 'add':
        if (!user || user === null) return message.menheraReply('error', 'user not found');
        let reason = args.slice(2).join(' ');
        if (!reason) reason = 'Sem razão informada';
        user.ban = true;
        user.banReason = reason;
        user.save();

        message.menheraReply('success', 'usuário banido de usar a Menhera!');
        break;
      case 'remove':
        if (!user || user === null) return message.menheraReply('error', 'user not found');
        user.ban = false;
        user.banReason = null;
        user.save();

        message.menheraReply('success', 'usuário desbanido');
        break;
      case 'find':
        if (!user || user === null) return message.menheraReply('error', 'user not found');
        const msg = `== USER BANNED INFO ==\n\n• User :: ${user2.tag} - (${user2.id})\n• Banned :: ${user.ban}\n• Reason :: ${user.banReason}`;
        message.channel.send(msg, { code: 'asciidoc' });
        break;
      default:
        message.menheraReply('error', 'porra lux, n sabe nem usar o próprio bot? Opções: `add`, `remove`, `find`');
    }
  }
};
