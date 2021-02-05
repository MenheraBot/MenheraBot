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
      .setDescription(`**Trabalhos**

      • O RPG agora possui trabalhos! Escolha um trabalho com \`m!job\` e vá trabalhar com \`m!work\`.
      • Usar o \`m!job\` sem argumentos mostrará todos os trabalhos para escolher (Por enquanto só tem 2 por que quero ver se ta tudo 100%, vou lançar mais com o tempo).
      • Use \`m!job [id do trabalho]\` para entrar nesse trabalho!

      Cada trabalho tem um certo número de cooldown, pedras magicas, itens, e xp. Os trabalhos são 100% traduzidos, tanto os itens quanto os próprios trabalhos, quero fazer isso com todo o rpg ainda, mas vai dar trabalho ja que o rpg é todo torto e errado

      É isso, essa vai ser uma forma a mais de ganhar coisas pra se fortalecer no Mundo de Bolham, que está pronto para crescer mais e mais`);

    message.channel.send(message.author, embed);
  }
};
