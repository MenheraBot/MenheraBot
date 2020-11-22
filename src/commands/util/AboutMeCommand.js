const Command = require('../../structures/command');

module.exports = class AboutMeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'aboutme',
      aliases: ['sobremim'],
      cooldown: 10,
      category: 'util',
    });
  }

  async run({ message, args, user }, t) {
    const nota = args.join(' ');
    if (!nota) return message.menheraReply('error', t('commands:aboutme.no-args'));
    if (nota.length > 200) return message.menheraReply('error', t('commands:aboutme.args-limit'));

    user.nota = nota;
    user.save();

    message.menheraReply('success', t('commands:aboutme.success'));
  }
};
