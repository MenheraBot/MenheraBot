const Command = require('../../structures/command');

module.exports = class RpgResetCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'reset',
      aliases: ['resetar'],
      cooldown: 5,
      category: 'rpg',
    });
  }

  async run({ message, server }, t) {
    const user = await this.client.database.Rpg.findById(message.author.id);
    if (!user) return message.menheraReply('error', t('commands:reset.non-aventure'));
    if (user.level < 4) return message.menheraReply('error', t('commands:reset.low-level'));

    message.menheraReply('warn', t('commands:reset.confirm'));

    const filter = (m) => m.author.id === message.author.id;
    const collector = message.channel.createMessageCollector(filter, { max: 1, time: 30000, errors: ['time'] });

    collector.on('collect', async (m) => {
      if (m.content.toLowerCase() === 'sim' || m.content.toLowerCase() === 'yes') {
        if (user.hasFamily) {
          const familia = await this.client.database.Familias.findById(user.familyName);
          familia.members.splice(familia.members.indexOf(message.author.id.toString()), 1);
          familia.save();
        }
        this.client.database.Rpg.findByIdAndDelete(message.author.id).then(message.menheraReply('success', t('commands:reset.success', { prefix: server.prefix })));
      } else message.menheraReply('error', t('commands:reset.cancel'));
    });
  }
};
