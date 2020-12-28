const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');
const { version } = require('../../../package.json');

module.exports = class UpdatesCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'updates',
      aliases: ['update'],
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
      category: 'info',
    });
  }

  async run({ message }, t) {
    const owner = await this.client.users.fetch(this.client.config.owner[0]);

    const embed = new MessageEmbed()
      .setTitle(`${t('commands:updates.title')} ${version}`)
      .setColor('#a7e74f')
      .setFooter(`${this.client.user.username} ${t('commands:updates.footer')} ${owner.tag}`, owner.displayAvatarURL({ format: 'png', dynamic: true }))
      .setDescription(`**Novos Multiplicadores do Caça-Níquel**

      Os números a esquerda são a quantidade, e a direita, o multiplicador do valor apostado

       **2** :banana:  = 1.2x
       **3** :banana: = 5x

      **2** :cherries:  = 1.4x
      **3** :cherries: = 7x

      **2** :tangerine: = 1.7x
      **3** :tangerine: =  10x

      **2** :grapes: = 2x
      **3** :grapes: = 13x

      **2** :moneybag: = 2.5x
      **3** :moneybag: = 17x

      **2** :seven: = 3x
      **3** :seven: = 20x
`);

    message.channel.send(message.author, embed);
  }
};
