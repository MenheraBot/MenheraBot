const Command = require('../../structures/command');

module.exports = class UnTrisalCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'untrisal',
      cooldown: 10,
      category: 'diversão',
    });
  }

  async run({ message, authorData }, t) {
    if (authorData.trisal?.length === 0) return message.menheraReply('error', t('commands:untrisal.error'));

    const msg = await message.channel.send(t('commands:untrisal.sure'));
    await msg.react('✅');

    const filter = (reaction, usuario) => reaction.emoji.name === '✅' && usuario.id === message.author.id;

    const collector = msg.createReactionCollector(filter, { max: 1, time: 14000 });

    collector.on('collect', async () => {
      const user1 = await this.client.database.Users.findOne({ id: authorData.trisal[0] });
      const user2 = await this.client.database.Users.findOne({ id: authorData.trisal[1] });

      authorData.trisal = [];
      await authorData.save();

      if (user1) {
        user1.trisal = [];
        await user1.save();
      }

      if (user2) {
        user2.trisal = [];
        await user2.save();
      }
      await message.menheraReply('success', t('commands:untrisal.done'));
    });
  }
};
