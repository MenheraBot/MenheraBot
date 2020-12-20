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
      .setDescription(`**Caça-Níqueis**

      Bem-Vindo ao Caça-Níqueis da Menhera!

      • Aposte no caça-níquel, e consiga até 100x mais do que apostado!

      • Use \`m!slot <valor>\` para apostar no caça níquel da Menhera. Lembrando que a aposta deve ser maior de **5000** :star:

      • Os retornos para vitórias máximas são:

      :banana: - 5x o apostado
      :cherries: - 9x o apostado
      :tangerine: - 17x o apostado
      :grapes: - 24x o apostado
      :moneybag: - 34x o apostado
      :seven: - 100x o apostado

      • Caso você aposte, e perca, você perde 1.5x do que apostou!`);

    message.channel.send(message.author, embed);
  }
};
