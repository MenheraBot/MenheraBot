const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');

module.exports = class HumorCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'humor',
      category: 'diversão',
      clientPermissions: ['MANAGE_MESSAGES', 'EMBED_LINKS'],
    });
  }

  async run({ message }, t) {
    if (message.deletable) message.delete();

    const list = [
      'https://i.imgur.com/2sI0NNt.jpg',
      'https://i.imgur.com/tynr1at.jpg',
      'https://i.imgur.com/9XDF9fp.jpg',
      'https://i.imgur.com/WZFzbD6.jpg',
      'https://i.imgur.com/kNfVk6P.png',
      'https://i.imgur.com/lfF79Z3.png',
      'https://i.imgur.com/K8c5P6Y.png',
      'https://i.imgur.com/dddehsM.png',
    ];

    const rand = list[Math.floor(Math.random() * list.length)];

    const embed = new MessageEmbed()
      .setImage(rand)
      .setTitle(`${message.author.username} ${t('commands:humor.phrase')}`);

    message.channel.send(embed);
  }
};
