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
      .setDescription(`**O futuro está aqui!**

      FINALMENTEEEE!! FINALMENTE ISSO CHEGOU!!!

      • O comando \`m!perfil\` é agora uma imagem!
         O perfil ainda está incompleto, mas já está sendo lançado para testes!
         No futuro haverá badges de perfil, disponíveis por eventos, compra, e até mesmo usar a Menhera!

      • Bug fix:
         Comando \`m!ship\` corrigido!
      `);

    message.channel.send(message.author, embed);
  }
};
