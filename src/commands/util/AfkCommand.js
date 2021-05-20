const Command = require('../../structures/command');

module.exports = class AfkCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'afk',
      cooldown: 5,
      category: 'util',
    });
  }

  async run({ message, args }, t) {
    const reason = args.join(' ');
    const afkReason = args.length ? reason.replace(/`/g, '') : 'AFK';

    this.client.database.Users.updateOne({ ìd: message.author.id }, { $set: { afk: true, afkReason } });

    message.menheraReply('success', t('commands:afk.success'));
  }
};
