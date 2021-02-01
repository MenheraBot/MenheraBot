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
      .setDescription(`**As famílias foram removidas**

      • Certamente as famílias eram desbalanceadas, e elas não fluiram como eu pensei que seria! Então, removi elas!
      Para as pessoas que gastaram dinheiro nos depósitos: kk dinheiro no lixo

      • Novidades futuras:
        Para substituir as famílias, o mundo de Boleham será ampliado para não ter somente Dungeons, mas também, ter trabalhos, famílias próprias, e casas!
      (é o que eu pretendo fazer, se conseguir keke)`);

    message.channel.send(message.author, embed);
  }
};
