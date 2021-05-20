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

  async run({ message, authorData: selfData, args }, t) {
    const authorData = selfData ?? new this.client.database.Users({ id: message.author.id });

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

    if (!args[0]) return message.menheraReply('error', `${t('commands:hunt.no-args')}`);
    const selectedOption = validArgs.some((so) => so.arguments.includes(args[0].toLowerCase()));
    if (!selectedOption) return message.menheraReply('error', `${t('commands:hunt.no-args')}`);
    const filtredOption = validArgs.filter((f) => f.arguments.includes(args[0].toLowerCase()));

    const option = filtredOption[0].opção;

    if (!option) return message.menheraReply('error', `${t('commands:hunt.no-args')} \`${validOptions.join('`, `')}\``);

    const probabilidadeDemonio = message.guild.id === '717061688460967988' ? this.client.constants.probabilities.support.demon : this.client.constants.probabilities.normal.demon;
    const probabilidadeAnjo = message.guild.id === '717061688460967988' ? this.client.constants.probabilities.support.angel : this.client.constants.probabilities.normal.angel;
    const probabilidadeSD = message.guild.id === '717061688460967988' ? this.client.constants.probabilities.support.demigod : this.client.constants.probabilities.normal.demigod;
    const probabilidadeDeuses = message.guild.id === '717061688460967988' ? this.client.constants.probabilities.support.god : this.client.constants.probabilities.normal.god;

    if (option === 'ajuda') return message.menheraReply('question', t('commands:hunt.help'));
    if (option === 'probabilidades') {
      return message.channel.send(t('commands:hunt.probabilities', {
        demon: probabilidadeDemonio, angel: probabilidadeAnjo, demi: probabilidadeSD, god: probabilidadeDeuses,
      }));
    }

    if (parseInt(authorData.caçarTime) < Date.now()) {
      const avatar = message.author.displayAvatarURL({ format: 'png', dynamic: true });
      const embed = new MessageEmbed()
        .setTitle(t('commands:hunt.title'))
        .setColor('#faa40f')
        .setThumbnail(avatar)
        .setFooter(t('commands:hunt.footer'));

      const timeToCoodlwon = this.client.constants.probabilities.defaultTime + Date.now();

      switch (option) {
        case 'demônio': {
          const dc = probabilidadeDemonio[Math.floor(Math.random() * probabilidadeDemonio.length)];
          this.client.database.Users.updateOne({ id: message.author.id }, { $inc: { caçados: dc }, $set: { caçarTime: timeToCoodlwon } });
          embed.setDescription(`${t('commands:hunt.description_start', { value: dc })} ${t('commands:hunt.demons')}`);
          message.channel.send(embed);
          break;
        }
        case 'anjos': {
          const da = probabilidadeAnjo[Math.floor(Math.random() * probabilidadeAnjo.length)];
          this.client.database.Users.updateOne({ id: message.author.id }, { $inc: { anjos: da }, $set: { caçarTime: timeToCoodlwon } });
          embed.setDescription(`${t('commands:hunt.description_start', { value: da })} ${t('commands:hunt.angels')}`);
          message.channel.send(embed);
          break;
        }
        case 'semideuses': {
          const ds = probabilidadeSD[Math.floor(Math.random() * probabilidadeSD.length)];
          this.client.database.Users.updateOne({ id: message.author.id }, { $inc: { semideuses: ds }, $set: { caçarTime: timeToCoodlwon } });
          embed.setDescription(`${t('commands:hunt.description_start', { value: ds })} ${t('commands:hunt.sd')}`);
          message.channel.send(embed);
          break;
        }
        case 'deus': {
          const dd = probabilidadeDeuses[Math.floor(Math.random() * probabilidadeDeuses.length)];
          this.client.database.Users.updateOne({ id: message.author.id }, { $inc: { deuses: dd }, $set: { caçarTime: timeToCoodlwon } });
          if (dd > 0) embed.setColor('#e800ff');
          embed.setDescription((dd > 0) ? t('commands:hunt.god_hunted_success', { value: dd }) : t('commands:hunt.god_hunted_fail', { value: dd }));
          message.channel.send(embed);
          break;
        }
      }
    } else {
      message.menheraReply('error', t('commands:hunt.cooldown', { time: moment.utc(parseInt(authorData.caçarTime - Date.now())).format('mm:ss') }));
    }
  }
};
