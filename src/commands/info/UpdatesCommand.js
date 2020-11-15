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
      .setDescription(`**Nível 30 do RPG**

            • Agora ao atingir o nível 30, tu evolui para uma nova classe e ganha uma nova habilidade:

            Assassino -> Senhor das Sombras
                 • Habilidade: \`Sombras a Caminho\` - Envia as sombras para cegar seu inimigo

            Bárbaro -> Berserker
                • Habildiade: \`Frenesi\` - Entra em modo Frenesi, curando e causando dano a seus inimigos

            Clérigo -> Arcanjo
                • Habilidade: \`Manipulação Éterea\` - Envia os mensageiros da Luz para aniquilar seus inimigos

            Druida -> Guardião da Natureza
                • Habilidade: \`Chamado da Natuzera\` - Chama os seus aliados naturais para acabar com o inimigo

            Espadachim -> Mestre das Armas
                • Habilidade: \`Golpe das 7 Lâminas\` - Invoca todas as armas de sua alma, desferindo inúmeros golpes simultâneos

            Feiticeiro/místico -> Senhor das Galáxias
               • Habilidade: \`Super Nova\` - Cria uma supernova de força inabalável, expurgando seus inimigos

            Feiticeiro/dracônico -> Mestre dos Elementos
                • Habilidade: \`Força dos 5 Elementos\` - Conjura as forças dos 5 dragões elementais

            Feiticeiro/demoníaco -> Conjurador Demoníaco
                • Habilidade: \`Pentagrama Mundial\` - Fecha o Pentagrama entre os 5 Dragões Elementais, trazendo as forças do fim do mundo

            Monge -> Sacerdote
                • Habilidade: \`Guerra Espiritual\` - Invade a mente de seu inimigo, colocando-o fazendo com que sua mente luta contra si mesmo

            Necromante -> Senhor das Trevas
                • Habilidade: \`Fim dos Tempos\` - Todos os mortos do mundo aparecem para acabar com seu inimigo
        `);

    message.channel.send(message.author, embed);
  }
};
