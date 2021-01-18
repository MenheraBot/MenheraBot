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
      .setDescription(`**Tradução de Boleham**

      Eu to trabalhando na tradução completa do RPG, mas isso é trabalhoso, mas algumas coisas ja foram traduzidas, e outras implementadas:

      • Todas as classes são traduzidas, tanto no \`m!register\`, como no \`m!status\`. Tanto as classes quanto as evoluções estão traduzidas

      • O \`m!top rpg\` agora mostra a família do jogador (Sugerido por @Tsugami#6868 )

      • Sobre os gifs de ações: Eu sei que estão repetitivos, e eu ia adicionar mais, mas quando eu fui atualizar (tipo agora) o Imgur estava off, então não consegui, mas logo logo vou adicionar mais!

      CORREÇÃO DE BUGS:

• O sistema de votos foi arrumado

• O comando m!warnlist está funcionando corretamente

• Eu ainda estou pensando em como arrumar o problema da guilda, mas é complexo, pois o código foi feito pelo TsuTsu, e a programação dele é muito mais avançada do que a minha, mas fica sussa que vou encontrar um jeito pra arrumar aquilo! Mas por enquanto, evite vender itens com a opção 0 da guilda!

      Por enquanto é isso! Use \`..notify\` para ficar por dentro de todas as novidades que são introduzidas (nnyaaan >...<) na Menhera!
      ||SPOILER: O COMANDO \`M!ASTOLFO\` VOLTARÁ!||`);

    message.channel.send(message.author, embed);
  }
};
