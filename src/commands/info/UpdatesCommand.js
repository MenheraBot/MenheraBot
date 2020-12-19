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
      .setDescription(`**COINFLIP**

      O coinflip agora salva seus dados!!!

      • O comando \`m!coinflip\` agora salva quantas partidas você ja ganhou, perdeu, quando dinheiro ganhou e perdeu também!
      • No futuro vou criar mais um top para os maiores lucros e prejuízos do coinflip!
      • O comando \`m!coinflipstatus\` mostra os seus status do coinflip!

      Começe a apostar, é divertido !

      `);

    message.channel.send(message.author, embed);
  }
};
