const { MessageEmbed } = require('discord.js');
const moment = require('moment');
const Command = require('../../structures/command');
const { COLORS } = require('../../structures/MenheraConstants');

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

    const validArgs = [{
      opção: 'demônio',
      arguments: ['demonios', 'demônios', 'demons', 'demonio', 'demônio', 'demon'],
    },
    {
      opção: 'anjos',
      arguments: ['anjos', 'anjo', 'angels', 'angel'],
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
    const filtredOption = validArgs.filter((so) => so.arguments.includes(ctx.args[0].toLowerCase()));
    if (filtredOption.length === 0) return ctx.reply('error', `${ctx.locale('commands:hunt.no-args')}`);

    const option = filtredOption[0].opção;

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
      .setColor(COLORS.HuntDefault)
      .setThumbnail(avatar);
    if (ctx.message.channel.id === '717061688460967988') embed.setFooter(ctx.locale('commands:hunt.footer'));

    const {
      huntDemon, huntAngel, huntDemigod, huntGod,
    } = this.client.repositories.huntRepository;

    const areYouTheHuntOrTheHunter = async (probability, saveFn) => {
      const value = probability[Math.floor(Math.random() * probability.length)];
      await saveFn.call(this.client.repositories.huntRepository, ctx.message.author.id, value, cooldown);
      return value;
    };

    switch (option) {
      case 'demônio': {
        const demons = await areYouTheHuntOrTheHunter(probabilidadeDemonio, huntDemon);
        embed.setTitle(ctx.locale('commands:hunt.demons'))
          .setColor(COLORS.HuntDemon)
          .setDescription(ctx.locale('commands:hunt.description_start', { value: demons, hunt: ctx.locale('commands:hunt.demons') }));
        break;
      }
      case 'anjos': {
        const angels = await areYouTheHuntOrTheHunter(probabilidadeAnjo, huntAngel);
        embed.setTitle(ctx.locale('commands:hunt.angels'))
          .setColor(COLORS.HuntAngel)
          .setDescription(ctx.locale('commands:hunt.description_start', { value: angels, hunt: ctx.locale('commands:hunt.angels') }));
        break;
      }
      case 'semideuses': {
        const demigods = await areYouTheHuntOrTheHunter(probabilidadeSD, huntDemigod);
        embed.setTitle(ctx.locale('commands:hunt.sd'))
          .setColor(COLORS.HuntSD)
          .setDescription(ctx.locale('commands:hunt.description_start', { value: demigods, hunt: ctx.locale('ctx.hunt.sd') }));
        break;
      }
      case 'deus': {
        const gods = await areYouTheHuntOrTheHunter(probabilidadeDeuses, huntGod);
        embed.setColor(COLORS.HuntGod)
          .setTitle(ctx.locale('commands:hunt.gods'))
          .setDescription((gods > 0) ? ctx.locale('commands:hunt.god_hunted_success', { value: gods, hunt: ctx.locale('commands:hunt.gods') }) : ctx.locale('commands:hunt.god_hunted_fail'));
        if (gods > 0) embed.setColor(COLORS.HuntGod);
        break;
      }
    }
    ctx.send(embed);
  }
};
