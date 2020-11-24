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
      .setDescription(`**Buffs no mundo de Boleham**

      • Espadachim: 
          Habilidade 'Golpe Duplo' dano de \`14\` para \`24\`
          Habilidade 'Combate Tático' dano de \`35\` para \`48\`
          Habilidade 'Excalibur' dano de \`55\` para \`72\`
          Habilidade 'Kenjutsu' dano de \`90\` para \`100\` 
          Habilidade 'Golpe das 7 lâminas' dano de \`130\` para \`132\`
      
      • Clérigo
          Habilidade 'Cura' dano de \`0\` para \`2\`
          Habilidade 'Raio de Luz Solar' dano de \`20\` para \`30\`
          Habilidade 'Rosário' dano de \`40\` para \`50\`
          Habilidade 'Ascenção Espiritual' dano de \`46\` para \`66\`
          Habilidade 'Manipulação Éterea' dano de \`62\` para\`86\`
      
      • Assassino
          Habilidade 'Assassino em Série' custo de \`35\` para \`25\``);

    message.channel.send(message.author, embed);
  }
};
