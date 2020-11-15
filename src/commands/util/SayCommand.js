const Command = require('../../structures/command');

module.exports = class SayCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'say',
      cooldown: 5,
      userPermissions: ['MANAGE_MESSAGES'],
      clientPermissions: ['MANAGE_MESSAGES'],
      category: 'util',
      usage: '<texto>',
    });
  }

  async run({ message, args }, t) {
    const sayMessage = args.join(' ');
    if (!sayMessage) return message.menheraReply('error', t('commands:say.no-args'));
    message.delete({ timeout: 10 }).catch();
    message.channel.send(`${sayMessage}\n\n📢 | ${message.author}`);
  }
};
