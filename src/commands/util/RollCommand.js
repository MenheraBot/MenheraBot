const Command = require('../../structures/command');

module.exports = class RollCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'roll',
      cooldown: 5,
      category: 'util',
    });
  }

  async run({ message, authorData: selfData }, t) {
    const authorData = selfData ?? new this.client.database.Users({ id: message.author.id });
    if (parseInt(authorData.caçarTime) < Date.now()) return message.menheraReply('error', t('commands:roll.can-hunt'));

    if (authorData.rolls < 1) return message.menheraReply('error', t('commands:roll.poor'));

    authorData.rolls -= 1;
    authorData.caçarTime = '000000000000';
    authorData.save();
    message.menheraReply('success', t('commands:roll.success'));
  }
};
