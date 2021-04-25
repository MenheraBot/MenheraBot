const { MessageEmbed, MessageAttachment } = require('discord.js');
const Command = require('../../structures/command');
const { TrisalBuilder } = require('../../utils/Canvas');

module.exports = class TrisalCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'trisal',
      cooldown: 10,
      category: 'diversão',
      clientPermissions: ['MANAGE_MESSAGES', 'EMBED_LINKS'],
    });
  }

  async run({ message, args, authorData }, t) {
    if (authorData.trisal?.length === 0 && !args[1]) return message.menheraReply('error', t('commands:trisal.no-args'));

    if (authorData.trisal?.length > 0) {
      const marryTwo = await this.client.users.fetch(authorData.trisal[0]);
      const marryThree = await this.client.users.fetch(authorData.trisal[1]);

      if (!marryTwo || !marryThree) return message.menheraReply('error', t('commands:trisal.marry-not-found'));

      const userOneAvatar = message.author.displayAvatarUrl({ dynamic: true, size: 512 });
      const userTwoAvatar = marryTwo.displayAvatarUrl({ dynamic: true, size: 512 });
      const userThreeAvatar = marryThree.displayAvatarUrl({ dynamic: true, size: 512 });

      const image = await TrisalBuilder(userOneAvatar, userTwoAvatar, userThreeAvatar);
      const attachment = new MessageAttachment(image, 'trisal.png');

      const embed = new MessageEmbed()
        .attachFiles(attachment)
        .setTitle(t('commands:trisal.embed.title'))
        .setDescription(t('commands:trisal.embed.description'))
        .setImage('attachment://trisal.png');

      return message.channel.send(embed);
    }

    const [mencionado1, mencionado2] = message.mentions.users.keyArray();

    if (!mencionado1 || !mencionado2) return message.menheraReply('error', t('commands:trisal.no-mention'));
    if (mencionado1 === message.author || mencionado2 === message.author) return message.menheraReply('error', t('commands:trisal.self-mention'));
    if (mencionado1.bot || mencionado2.bot) return message.menheraReply('error', t('commands:trisal.bot-mention'));
    if (mencionado1 === mencionado2) return message.menheraReply('error', t('commands:trisal:same-mention'));

    const user1 = authorData;
    const user2 = await this.client.database.Users.findOne({ id: mencionado1.id });
    const user3 = await this.client.database.Users.findOne({ id: mencionado2.id });

    if (!user1 || !user2 || !user3) return message.menheraReply('error', t('commands:trisal.no-db'));

    if (user2.trisal?.length > 0 || user3.trisal?.length > 0) return message.menheraReply('error', t('commands:trisal.comedor-de-casadas'));

    const msg = await message.channel.send(`${t('commands:trisal.accept-message')} ${message.author}, ${mencionado1}, ${mencionado2}`);
    await msg.react('✅');

    const acceptableIds = [message.author.id, mencionado1.id, mencionado2.id];

    const filter = (reaction, usuario) => reaction.emoji.name === '✅' && acceptableIds.includes(usuario.id);

    const collector = msg.createReactionCollector(filter, { time: 14000 });

    const acceptedIds = [];

    collector.on('collect', async (reaction) => {
      if (!acceptedIds.includes(reaction.user.id)) acceptedIds.push(reaction.user.id);

      if (acceptedIds.length === 3) {
        user1.trisal = [mencionado1.id, mencionado2.id];
        user2.trisal = [message.author.id, mencionado2.id];
        user3.trisal = [message.author.id, mencionado1.id];
        await user1.save();
        await user2.save();
        await user3.save();

        message.menheraReply('success', t('commands:trisal.done'));
      }
    });

    setTimeout(() => {
      if (acceptedIds.length !== 3) message.menheraReply('error', t('commands:trisal.error'));
    }, 15000);
  }
};
