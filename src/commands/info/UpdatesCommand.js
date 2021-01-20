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
      .setDescription(`**Sistema de Batalhas**

      O sistema de PvP está aqui!

      • Batalhe com um amigo em uma batalha amistosa usando m!pvp, ou em uma batalha valendo :gem:

      • Batalhas amistosas não alteram seus status, e ambos os jogadores iniciam com vida e mana cheia

      • Batalhas Competitivas são criadas com \`m!pvp <@user> [aposta]\`, e diferente da amigável, está você batalha com seus status atuais. Quem morrer nesta batalha, descansará no hotel por 2 horas!

      **Bug Fixes**

      • O comando 'caçar' mostra as opções traduzidas caso use a Menhera em inglês`);

    message.channel.send(message.author, embed);
  }
};
