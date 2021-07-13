const Command = require('../../structures/command');
const { emojis } = require('../../structures/MenheraConstants');

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

module.exports = class GiveCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'give',
      aliases: ['pay', 'pagar'],
      cooldown: 5,
      category: 'economia',
    });
  }

  async run(ctx) {
    const selectedOption = ctx.args[0] && validArgs.find((option) => option.arguments.includes(ctx.args[0].toLowerCase()));
    if (!selectedOption) return this.replyInvalidArgsError(ctx);

    const to = ctx.message.mentions.users.first();
    if (!to) return this.replyBadUsageError(ctx);
    if (to.id === ctx.message.author.id) return this.replyForYourselfError(ctx);

    const input = ctx.args[2];
    if (!input) return this.replyBadUsageError(ctx);

    const value = parseInt(input.replace(/\D+/g, ''));
    if (!value || value < 1) return this.replyInvalidValueError(ctx);

    const authorData = ctx.data.user;
    const option = selectedOption.opção;

    const toData = await this.client.database.repositories.userRepository.findOrCreate(to.id);
    if (!toData) return this.replyNoAccountError(ctx);

    switch (option) {
      case 'estrelinhas':
        this.giveStar(authorData, toData, value, ctx, to.toString());
        break;
      case 'demônio':
        this.giveDemon(authorData, toData, value, ctx, to.toString());
        break;
      case 'anjos':
        this.giveAngel(authorData, toData, value, ctx, to.toString());
        break;
      case 'semideuses':
        this.giveSD(authorData, toData, value, ctx, to.toString());
        break;
      case 'deus':
        this.giveGod(authorData, toData, value, ctx, to.toString());
        break;
    }
  }

  static replyInvalidArgsError(ctx) {
    return ctx.replyT('error', 'commands:give.no-args', { prefix: ctx.data.server.prefix });
  }

  static replyBadUsageError(ctx) {
    return ctx.replyT('error', 'commands:give.bad-usage');
  }

  static replyForYourselfError(ctx) {
    return ctx.replyT('error', 'commands:give.self-mention');
  }

  static replyInvalidValueError(ctx) {
    return ctx.replyT('error', 'commands:give.invalid-value');
  }

  static replyNoAccountError(ctx) {
    return ctx.replyT('error', 'commands:give.no-dbuser');
  }

  static replyNotEnoughtError(ctx, localeField) {
    return ctx.reply('error', `${ctx.locale('commands:give.poor')} ${ctx.locale(`commands:give.${localeField}`)}`);
  }

  static replySuccess(ctx, value, emoji, mentionString) {
    return ctx.reply('success', `${ctx.locale('commands:give.transfered', { value, emoji })} ${mentionString}`);
  }

  async giveStar(from, to, value, ctx, mentionString) {
    if (value > from.estrelinhas) return this.replyNotEnoughtError(ctx, 'stars');

    await this.client.repositories.giveRepository.giveStars(from.id, to.id, value);

    return this.replySuccess(ctx, value, emojis.star, mentionString);
  }

  async giveDemon(from, to, value, ctx, mentionString) {
    if (value > from.caçados) return this.replyNotEnoughtError(ctx, 'demons');

    await this.client.repositories.giveRepository.giveDemons(from.id, to.id, value);

    return this.replySuccess(ctx, value, emojis.demon, mentionString);
  }

  async giveAngel(from, to, value, ctx, mentionString) {
    if (value > from.anjos) return this.replyNotEnoughtError(ctx, 'angels');

    await this.client.repositories.giveRepository.giveAngels(from.id, to.id, value);

    return this.replySuccess(ctx, value, emojis.angel, mentionString);
  }

  async giveSD(from, to, value, ctx, mentionString) {
    if (value > from.semideuses) return this.replyNotEnoughtError(ctx, 'semigods');

    await this.client.repositories.giveRepository.giveSemigods(from.id, to.id, value);

    return this.replySuccess(ctx, value, emojis.semigod, mentionString);
  }

  async giveGod(from, to, value, ctx, mentionString) {
    if (value > from.deuses) return this.replyNotEnoughtError(ctx, 'gods');

    await this.client.repositories.giveRepository.giveGods(from.id, to.id, value);

    return this.replySuccess(ctx, value, emojis.god, mentionString);
  }
};
