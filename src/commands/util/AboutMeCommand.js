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

  async run({ message, args }, t) {
    const nota = args.join(' ');
    if (!nota) return message.menheraReply('error', t('commands:aboutme.no-args'));
    if (nota.length > 200) return message.menheraReply('error', t('commands:aboutme.args-limit'));

    this.client.database.Users.updateOne({ ìd: message.author.id }, { $set: { nota } });

    message.menheraReply('success', t('commands:aboutme.success'));
  }
};
