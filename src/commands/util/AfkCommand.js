const Command = require('../../structures/command');

module.exports = class AfkCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'afk',
      cooldown: 5,
      category: 'util',
    });
  }

  async run({ message, args, authorData: selfData }, t) {
    const authorData = selfData ?? new this.client.database.Users({ id: message.author.id });
    authorData.afk = true;
    authorData.afkReason = args.length ? args.join(' ') : 'AFK';
    authorData.save();

    message.menheraReply('success', t('commands:afk.success'));
  }
};
