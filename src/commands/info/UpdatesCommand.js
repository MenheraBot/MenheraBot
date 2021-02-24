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
      .setDescription(`**Várias Mudanças Na Atualização 2.6.0!**

      • SlotMachine
       Corrigido o problema onde quebrava o balanco da Menhera! Novos valores:
      :banana: 2: 1.2x,  3: 1.5x
      :cherries: 2: 1.4x, 3: 1.9x
      :tangerine: 2: 1.6, 3: 2x
      :grapes: 2: 2.2x, 3: 2.3x
      :moneybag: 2: 2.4x, 3: 2.8x
      :seven: 2: 2.9x, 3: 3x
      **Valor de derrota:** aposta + aposta * 1.5
      **Novo cooldown:** 40 segundos

      • Novo Sistema de Familiares
      Após a remoção das famílias, muitos usuários apresentaram problemas para batalhar contra os níveis mais altos! Para isso, foram adicionados os familiares! Utilize \`m!familiar\` para invocar um familiar, e após o Ritual de Invocação, utilize o comando novamente para ver os status de seu familiar!
      No momento os familiares só darão um pequeno boost em seus status, mas brevemente, haverá uma forma de atualizá-los, deixando mais fortes!

      • BUG FIXES:
      - Resolvido problema do comando \`m!cry\` ao mencionar um bot
      - Resolvido a localização do trabalho do jogador no \`m!stats\`, que fazia com que o emoji ficasse em cima da armadura! `);

    message.channel.send(message.author, embed);
  }
};
