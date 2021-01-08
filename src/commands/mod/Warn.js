const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');

module.exports = class WarnCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'warn',
      aliases: ['avisar'],
      cooldown: 5,
      userPermissions: ['KICK_MEMBERS'],
      clientPermissions: ['EMBED_LINKS'],
      category: 'moderação',
    });
  }

  async run({ message, args }, t) {
    if (!args[0]) return message.menheraReply('error', t('commands:warn.no-mention'));

    let user;
    try {
      user = await this.client.users.fetch(args[0].replace(/[<@!>]/g, ''));
    } catch {
      return message.menheraReply('error', t('commands:warn.no-mention'));
    }

    if (!user) return message.menheraReply('error', t('commands:warn.no-mention'));
    if (user.bot) return message.menheraReply('error', t('commands:warn.bot'));
    if (user.id === message.author.id) return message.menheraReply('error', t('commands:warn.self-mention'));

    if (!message.guild.members.cache.get(user.id)) return message.menheraReply('error', t('commands:warn.invalid-member'));

    let reason = args.slice(1).join(' ');
    if (!reason) reason = t('commands:warn.default_reason');

    const data1 = new Date();

    const dia = data1.getDate();
    const mes = data1.getMonth();
    const ano4 = data1.getFullYear();
    const hora = data1.getHours();
    const min = data1.getMinutes();
    const seg = data1.getSeconds();
    const strData = `${dia}/${mes + 1}/${ano4}`;
    const strHora = `${hora}:${min}:${seg}`;
    const data = `${strData} às ${strHora}`;

    const list = [
      'https://i.imgur.com/GWFaksV.jpg',
      'https://i.imgur.com/RWcPEZp.jpg',
      'https://i.imgur.com/HQA1w2P.jpg',
      'https://i.imgur.com/ockkEoX.jpg',
      'https://i.imgur.com/YW2cuG2.jpg',
      'https://i.imgur.com/QX0IU4B.png',
      'https://i.imgur.com/B6d7BHd.jpg',
      'https://i.imgur.com/MFcF93z.jpg',
      'https://i.imgur.com/IJomzjE.jpg',
      'https://i.imgur.com/SsBmqcN.jpg',
      'https://i.imgur.com/i3EW4He.png',
      'https://i.imgur.com/lJt5lYS.png',
      'https://i.imgur.com/X0BTT0I.png',
      'https://i.imgur.com/vebRVyD.png',
    ];

    const rand = list[Math.floor(Math.random() * list.length)];

    const embed = new MessageEmbed()
      .setTitle(t('commands:warn.embed_title'))
      .setDescription(`${message.author} ${t('commands:warn.embed_description')} ${user}`)
      .setImage(rand);

    this.client.database.Warns.findOne({
      id: user.id,
      guildId: message.guild.id,
    }, (err) => {
      if (err) console.log(err);

      const addUser = new this.client.database.Warns({
        userId: user.id,
        warnerId: message.author.id,
        guildId: message.guild.id,
        reason,
        data,
      });
      addUser.save().then(message.channel.send(embed)).catch((error) => console.log(error));
    });
  }
};
