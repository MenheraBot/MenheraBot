const { MessageEmbed } = require('discord.js');
const moment = require('moment');
const Command = require('../../structures/command');

module.exports = class HuntCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'hunt',
      aliases: ['cacar', 'caça', 'caca', 'caçar'],
      category: 'diversão',
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx) {
    const authorData = ctx.data.user;

    const validOptions = ['demonios', 'anjos', 'semideuses', 'deuses', 'ajuda', 'probabilidades'];

    const validArgs = [{
      opção: 'demônio',
      arguments: ['demonios', 'demônios', 'demons', 'demonio', 'demônio'],
    },
    {
      opção: 'anjos',
      arguments: ['anjos', 'anjo', 'angels'],
    },
    {
      opção: 'semideuses',
      arguments: ['semideuses', 'semideus', 'semi-deuses', 'sd', 'semi-deus', 'demigods', 'dg', 'demigod'],
    },
    {
      opção: 'deus',
      arguments: ['deus', 'deuses', 'gods', 'god'],
    },
    {
      opção: 'ajuda',
      arguments: ['ajudas', 'help', 'h', 'ajuda'],
    },
    {
      opção: 'probabilidades',
      arguments: ['probabilidades', 'probabilidade', 'probability', 'probabilities'],
    },
    ];

    if (!ctx.args[0]) return ctx.reply('error', `${ctx.locale('commands:hunt.no-args')}`);
    const selectedOption = validArgs.some((so) => so.arguments.includes(ctx.args[0].toLowerCase()));
    if (!selectedOption) return ctx.reply('error', `${ctx.locale('commands:hunt.no-args')}`);
    const filtredOption = validArgs.filter((f) => f.arguments.includes(ctx.args[0].toLowerCase()));

    const option = filtredOption[0].opção;

    if (!option) return ctx.reply('error', `${ctx.locale('commands:hunt.no-args')} \`${validOptions.join('`, `')}\``);

    const probabilidadeDemonio = ctx.message.guild.id === '717061688460967988' ? this.client.constants.probabilities.support.demon : this.client.constants.probabilities.normal.demon;
    const probabilidadeAnjo = ctx.message.guild.id === '717061688460967988' ? this.client.constants.probabilities.support.angel : this.client.constants.probabilities.normal.angel;
    const probabilidadeSD = ctx.message.guild.id === '717061688460967988' ? this.client.constants.probabilities.support.demigod : this.client.constants.probabilities.normal.demigod;
    const probabilidadeDeuses = ctx.message.guild.id === '717061688460967988' ? this.client.constants.probabilities.support.god : this.client.constants.probabilities.normal.god;

    if (option === 'ajuda') return ctx.replyT('question', 'commands:hunt.help');
    if (option === 'probabilidades') {
      return ctx.send(ctx.locale('commands:hunt.probabilities', {
        demon: probabilidadeDemonio, angel: probabilidadeAnjo, demi: probabilidadeSD, god: probabilidadeDeuses,
      }));
    }

    if (parseInt(authorData.caçarTime) > Date.now()) return ctx.replyT('error', 'commands:hunt.cooldown', { time: moment.utc(parseInt(authorData.caçarTime - Date.now())).format('mm:ss') });

    const avatar = ctx.message.author.displayAvatarURL({ format: 'png', dynamic: true });
    const cooldown = this.client.constants.probabilities.defaultTime + Date.now();
    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:hunt.title'))
      .setColor('#faa40f')
      .setThumbnail(avatar)
      .setFooter(ctx.locale('commands:hunt.footer'));

    switch (option) {
      case 'demônio': {
        const dc = probabilidadeDemonio[Math.floor(Math.random() * probabilidadeDemonio.length)];
        this.client.repositories.huntRepository.huntDemon(ctx.message.author.id, dc, cooldown);
        embed.setDescription(`${ctx.locale('commands:hunt.description_start', { value: dc })} ${ctx.locale('commands:hunt.demons')}`);
        break;
      }
      case 'anjos': {
        const da = probabilidadeAnjo[Math.floor(Math.random() * probabilidadeAnjo.length)];
        this.client.repositories.huntRepository.huntAngel(ctx.message.author.id, da, cooldown);
        embed.setDescription(`${ctx.locale('commands:hunt.description_start', { value: da })} ${ctx.locale('commands:hunt.angels')}`);
        break;
      }
      case 'semideuses': {
        const ds = probabilidadeSD[Math.floor(Math.random() * probabilidadeSD.length)];
        this.client.repositories.huntRepository.huntDemigod(ctx.message.author.id, ds, cooldown);
        embed.setDescription(`${ctx.locale('commands:hunt.description_start', { value: ds })} ${ctx.locale('commands:hunt.sd')}`);
        break;
      }
      case 'deus': {
        const dd = probabilidadeDeuses[Math.floor(Math.random() * probabilidadeDeuses.length)];
        this.client.repositories.huntRepository.huntGod(ctx.message.author.id, dd, cooldown);
        if (dd > 0) embed.setColor('#e800ff');
        embed.setDescription((dd > 0) ? ctx.locale('commands:hunt.god_hunted_success', { value: dd }) : ctx.locale('commands:hunt.god_hunted_fail', { value: dd }));
        break;
      }
    }
    ctx.send(embed);
  }
};
