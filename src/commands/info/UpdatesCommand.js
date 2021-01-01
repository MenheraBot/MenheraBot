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
      .setDescription(`**Novas Recompensas de Votos**

      As recompensas por votar na Menhera foram alteradas! Agora também é possível resetar o tempo de ida pra dungeon com \`m!roll rpg\` Estas são as novas recompensas:

      **Rolls base** = **1**
      **Dinheiro base** = Entre **1200** e **5600**
      **Roll da Dungeon base** = **1**
      **Pedras Preciosas base** =  Entre **500** e **2600**

       ___MULTIPLICADORES___:

      •  Caso seu voto seja múltiplo de 20, todos os prêmios acima são multiplicados por **4**
      • Caso seja fim de semana, todos os prêmios acima são multiplicados por **2**

      Você pode votar na Menhera a cada 12 horas! Use \`m!votar\` para receber o link da DiscordBotList!`);

    message.channel.send(message.author, embed);
  }
};
