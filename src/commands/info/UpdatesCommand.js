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
    const owner = await this.client.users.fetch(process.env.OWNER);

    const embed = new MessageEmbed()
      .setTitle(`${t('commands:updates.title')} ${version}`)
      .setColor('#a7e74f')
      .setFooter(`${this.client.user.username} ${t('commands:updates.footer')} ${owner.tag}`, owner.displayAvatarURL({ format: 'png', dynamic: true }))
      .setDescription(`Trisal

      ANTES DE TUDO GOSTARIA DE FALAR QUE ESTOU TESTANDO ESSE COMANDO EM PRODUÇÃO, ENTÃO SE A MENHERA DESLIGAR DO NADA, SAIBA QUE A CULPA É DO CÓDIGO QUE VAI SER LANÇADO SEM TER SIDO TESTADO ANTES, ENTÃO PODE SER QUE O COMANDO NÃO FUNCIONE DIREITO, OK????

      • Adicionado o comando m!trisal e m!untrisal (não tinha como fazer um nome melhor, sério)
      Você pode fazer um trisal com m!trisal, que não é afetado pelo casamento de nenhum dos participantes.
      Depois de montado o trisal, pode ser executado o comando m!trisal novamente para mandar uma foto de todos os integrandes, do memso jeito que é no m!ship, para fazer metadinhas e afins

      • Não quer mais o trisal? Sem problema, com o comando m!untrisal tu desfaz o trisal que está
      `);

    message.channel.send(message.author, embed);
  }
};
