const Command = require('../../structures/command');

module.exports = class GiveCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'give',
      aliases: ['pay', 'pagar'],
      cooldown: 5,
      category: 'economia',
    });
  }

  async giveStar(user, user2, valor, message, mencionado, t) {
    if (valor > user.estrelinhas) return message.menheraReply('error', `${t('commands:give.poor')} ${t('commands:give.stars')}`);

    await this.client.database.Users.updateOne({ id: user.id }, { $inc: { estrelinhas: -valor } });
    await this.client.database.Users.updateOne({ id: user2.id }, { $inc: { estrelinhas: valor } });

    message.menheraReply('success', `${t('commands:give.transfered', { value: valor, emoji: '⭐' })} ${mencionado}`);
  }

  async giveDemon(user, user2, valor, message, mencionado, t) {
    if (valor > user.caçados) return message.menheraReply('error', `${t('commands:give.poor')} ${t('commands:give.demons')}`);

    await this.client.database.Users.updateOne({ id: user.id }, { $inc: { caçados: -valor } });
    await this.client.database.Users.updateOne({ id: user2.id }, { $inc: { caçados: valor } });

    message.menheraReply('success', `${t('commands:give.transfered', { value: valor, emoji: '<:Demon:758765044443381780>' })} ${mencionado}`);
  }

  async giveAngel(user, user2, valor, message, mencionado, t) {
    if (valor > user.anjos) return message.menheraReply('error', `${t('commands:give.poor')} ${t('commands:give.angels')}`);

    await this.client.database.Users.updateOne({ id: user.id }, { $inc: { anjos: -valor } });
    await this.client.database.Users.updateOne({ id: user2.id }, { $inc: { anjos: valor } });

    message.menheraReply('success', `${t('commands:give.transfered', { value: valor, emoji: '<:Angel:758765044204437535>' })} ${mencionado}`);
  }

  async giveSD(user, user2, valor, message, mencionado, t) {
    if (valor > user.semideuses) return message.menheraReply('error', `${t('commands:give.poor')} ${t('commands:give.semigods')}`);

    await this.client.database.Users.updateOne({ id: user.id }, { $inc: { semideuses: -valor } });
    await this.client.database.Users.updateOne({ id: user2.id }, { $inc: { semideuses: valor } });

    message.menheraReply('success', `${t('commands:give.transfered', { value: valor, emoji: '<:SemiGod:758766732235374674>' })} ${mencionado}`);
  }

  async giveGod(user, user2, valor, message, mencionado, t) {
    if (valor > user.deuses) return message.menheraReply('error', `${t('commands:give.poor')} ${t('commands:give.gods')}`);

    await this.client.database.Users.updateOne({ id: user.id }, { $inc: { deuses: -valor } });
    await this.client.database.Users.updateOne({ id: user2.id }, { $inc: { deuses: valor } });

    message.menheraReply('success', `${t('commands:give.transfered', { value: valor, emoji: '<:God:758474639570894899>' })} ${mencionado}`);
  }

  async run({
    message, args, server, authorData: selfData,
  }, t) {
    if (!args[0]) return message.menheraReply('error', t('commands:give.no-args', { prefix: server.prefix }));

    const authorData = selfData ?? new this.client.database.Users({ id: message.author.id });

    const validArgs = [{
      opção: 'estrelinhas',
      arguments: ['estrelinhas', 'stars', 'star', 'estrelas'],
    },
    {
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
    ];

    const selectedOption = validArgs.some((so) => so.arguments.includes(args[0].toLowerCase()));
    if (!selectedOption) return message.menheraReply('error', t('commands:give.no-args', { prefix: server.prefix }));
    const filtredOption = validArgs.filter((f) => f.arguments.includes(args[0].toLowerCase()));

    const option = filtredOption[0].opção;
    const mencionado = message.mentions.users.first();
    const input = args[2];
    if (!input) return message.menheraReply('error', t('commands:give.bad-usage'));
    const valor = parseInt(input.replace(/\D+/g, ''));
    if (!mencionado) return message.menheraReply('error', t('commands:give.bad-usage'));
    if (mencionado.id === message.author.id) return message.menheraReply('error', t('commands:give.self-mention'));

    const user2 = await this.client.database.Users.findOne({ id: mencionado.id });

    if (!user2) return message.menheraReply('error', t('commands:give.no-dbuser'));
    if (!valor) return message.menheraReply('error', t('commands:give.invalid-value'));

    if (valor < 1) return message.menheraReply('error', t('commands:give.invalid-value'));

    switch (option) {
      case 'estrelinhas':
        this.giveStar(authorData, user2, valor, message, mencionado, t);
        break;
      case 'demônio':
        this.giveDemon(authorData, user2, valor, message, mencionado, t);
        break;
      case 'anjos':
        this.giveAngel(authorData, user2, valor, message, mencionado, t);
        break;
      case 'semideuses':
        this.giveSD(authorData, user2, valor, message, mencionado, t);
        break;
      case 'deus':
        this.giveGod(authorData, user2, valor, message, mencionado, t);
        break;
    }
  }
};
