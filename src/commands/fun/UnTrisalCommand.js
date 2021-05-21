const Command = require('../../structures/command');

module.exports = class UnTrisalCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'untrisal',
      cooldown: 10,
      category: 'diversão',
    });
  }

  async run({ message }, t) {
    const authorData = await this.client.database.Users.findOne({ id: message.author.id });
    if (authorData.trisal?.length === 0) return message.menheraReply('error', t('commands:untrisal.error'));

    const msg = await message.channel.send(t('commands:untrisal.sure'));
    await msg.react('✅');

    const filter = (reaction, usuario) => reaction.emoji.name === '✅' && usuario.id === message.author.id;

    const collector = msg.createReactionCollector(filter, { max: 1, time: 14000 });

    const id1 = authorData.trisal[0];
    const id2 = authorData.trisal[1];

    collector.on('collect', async () => {
      this.client.database.Users.updateOne({ id: message.author.id }, { $set: { trisal: [] } });
      this.client.database.Users.updateOne({ id: id1 }, { $set: { trisal: [] } });
      this.client.database.Users.updateOne({ id: id2 }, { $set: { trisal: [] } });
      await message.menheraReply('success', t('commands:untrisal.done'));
    });
  }
};
