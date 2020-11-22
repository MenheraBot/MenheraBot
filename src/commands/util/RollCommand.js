const Command = require('../../structures/command');

module.exports = class RollCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'roll',
      cooldown: 5,
      category: 'util',
    });
  }

  async run({ message, user }, t) {
    if (parseInt(user.caçarTime) < Date.now()) return message.menheraReply('error', t('commands:roll.can-hunt'));

    if (user.rolls < 1) return message.menheraReply('error', t('commands:roll.poor'));

    user.rolls -= 1;
    user.caçarTime = '000000000000';
    user.save();
    message.menheraReply('success', t('commands:roll.success'));
  }
};
