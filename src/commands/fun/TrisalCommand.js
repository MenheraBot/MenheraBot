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
    // eslint-disable-next-line no-param-reassign
    if (!authorData) authorData = await this.client.database.Users.findOne({ id: message.author.id });
    if (!authorData) return message.menheraReply('error', t('commands:trisal.no-owner'));
    if (authorData.trisal?.length === 0 && !args[1]) return message.menheraReply('error', t('commands:trisal.no-args'));

    if (authorData.trisal?.length > 0) {
      const marryTwo = await this.client.users.fetch(authorData.trisal[0]);
      const marryThree = await this.client.users.fetch(authorData.trisal[1]);

      if (!marryTwo || !marryThree) return message.menheraReply('error', t('commands:trisal.marry-not-found'));

      const userOneAvatar = message.author.displayAvatarURL({ dynamic: false, size: 256, format: 'png' });
      const userTwoAvatar = marryTwo.displayAvatarURL({ dynamic: false, size: 256, format: 'png' });
      const userThreeAvatar = marryThree.displayAvatarURL({ dynamic: false, size: 256, format: 'png' });

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
    if (mencionado1 === message.author.id || mencionado2 === message.author.id) return message.menheraReply('error', t('commands:trisal.self-mention'));
    if (mencionado1.bot || mencionado2.bot) return message.menheraReply('error', t('commands:trisal.bot-mention'));
    if (mencionado1 === mencionado2) return message.menheraReply('error', t('commands:trisal:same-mention'));

    const user1 = authorData;
    const user2 = await this.client.database.Users.findOne({ id: mencionado1 });
    const user3 = await this.client.database.Users.findOne({ id: mencionado2 });

    if (!user1 || !user2 || !user3) return message.menheraReply('error', t('commands:trisal.no-db'));

    if (user2.trisal?.length > 0 || user3.trisal?.length > 0) return message.menheraReply('error', t('commands:trisal.comedor-de-casadas'));

    const messageMention1 = await this.client.users.fetch(mencionado1);
    const messageMention2 = await this.client.users.fetch(mencionado2);

    const msg = await message.channel.send(`${t('commands:trisal.accept-message')} ${message.author}, ${messageMention1}, ${messageMention2}`);
    await msg.react('✅');

    const acceptableIds = [message.author.id, mencionado1, mencionado2];

    const filter = (reaction, usuario) => reaction.emoji.name === '✅' && acceptableIds.includes(usuario.id);

    const collector = msg.createReactionCollector(filter, { time: 14000 });

    const acceptedIds = [];

    collector.on('collect', async (reaction, user) => {
      if (!acceptedIds.includes(user.id)) acceptedIds.push(user.id);

      if (acceptedIds.length === 3) {
        user1.trisal = [mencionado1, mencionado2];
        user2.trisal = [message.author.id, mencionado2];
        user3.trisal = [message.author.id, mencionado1];
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
