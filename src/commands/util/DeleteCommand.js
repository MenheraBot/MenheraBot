const Command = require('../../structures/command');

module.exports = class DeleteCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'delete',
      aliases: ['deletar'],
      cooldown: 30,
      category: 'util',
      clientPermissions: ['ADD_REACTIONS', 'MANAGE_MESSAGES'],
    });
  }

  async run({ message }, t) {
    message.menheraReply('warn', t('commands:delete.confirm')).then(async (msg) => {
      msg.react('✅').catch();
      msg.react('❌').catch();

      const filter = (reaction, usuario) => reaction.emoji.name === '✅' && usuario.id === message.author.id;
      const filter1 = (reação, user) => reação.emoji.name === '❌' && user.id === message.author.id;

      const ncoletor = msg.createReactionCollector(filter1, { max: 1, time: 5000 });
      const coletor = msg.createReactionCollector(filter, { max: 1, time: 5000 });

      ncoletor.on('collect', () => {
        msg.reactions.removeAll().catch();
        message.menheraReply('success', t('commands:delete.negated'));
      });

      coletor.on('collect', () => {
        msg.reactions.removeAll().catch();

        this.client.database.Users.findOneAndDelete({
          id: message.author.id,
        }, (err) => {
          if (err) console.log(err);
          message.menheraReply('success', t('commands:delete.acepted'));
        });
      });
      setTimeout(() => {
        msg.delete().catch();
      }, 5050);
    });
  }
};
