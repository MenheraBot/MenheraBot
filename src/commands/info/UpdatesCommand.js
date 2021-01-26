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
      .setDescription(`**Níveis da Dungeon**

      • Agora você deve escolher para qual nível da **DUNGEON** (não conta para boss) você quer ir

      Os níveis recomendados são:

      1 - A partir do lvl **0**
      2 - A partir do lvl **4**
      3 - A partir do lvl **9**
      4 - A partir do lvl **13**
      5 - A partir do lvl **30**

      Exemplo de como ir pra dungeon: \`m!dungeon 2\``);

    message.channel.send(message.author, embed);
  }
};
