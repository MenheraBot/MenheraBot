const NewHttp = require('@utils/NewHttp');
const { MessageEmbed, MessageAttachment } = require('discord.js');
const Command = require('../../structures/command');

module.exports = class TrisalCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'trisal',
      cooldown: 10,
      category: 'diversão',
      clientPermissions: ['MANAGE_MESSAGES', 'EMBED_LINKS'],
    });
  }

  async run(ctx) {
    let authorData = ctx.data.user;
    if (!authorData) authorData = await this.client.database.repositories.userRepository.find(ctx.message.author.id);
    if (!authorData) return ctx.replyT('error', 'commands:trisal.no-owner');
    if (authorData.trisal?.length === 0 && !ctx.args[1]) return ctx.replyT('error', 'commands:trisal.no-args');

    if (authorData.trisal?.length > 0) {
      const marryTwo = await this.client.users.fetch(authorData.trisal[0]);
      const marryThree = await this.client.users.fetch(authorData.trisal[1]);

      if (!marryTwo || !marryThree) return ctx.replyT('error', 'commands:trisal.marry-not-found');

      const userOneAvatar = ctx.message.author.displayAvatarURL({ dynamic: false, size: 256, format: 'png' });
      const userTwoAvatar = marryTwo.displayAvatarURL({ dynamic: false, size: 256, format: 'png' });
      const userThreeAvatar = marryThree.displayAvatarURL({ dynamic: false, size: 256, format: 'png' });

      const res = await NewHttp.trisalRequest(userOneAvatar, userTwoAvatar, userThreeAvatar);
      if (res.err) return ctx.replyT('error', 'commands:http-error');

      const attachment = new MessageAttachment(Buffer.from(res.data), 'trisal.png');

      const embed = new MessageEmbed()
        .attachFiles(attachment)
        .setDescription(`${ctx.locale('commands:trisal.embed.description')} ${ctx.message.author}, ${marryTwo}, ${marryThree}`)
        .setColor('#ac76f9')
        .setImage('attachment://trisal.png');

      return ctx.send(embed);
    }

    const [mencionado1, mencionado2] = ctx.message.mentions.users.keyArray();

    if (!mencionado1 || !mencionado2) return ctx.replyT('error', 'commands:trisal.no-mention');
    if (mencionado1 === ctx.message.author.id || mencionado2 === ctx.message.author.id) return ctx.replyT('error', 'commands:trisal.self-mention');
    if (mencionado1.bot || mencionado2.bot) return ctx.replyT('error', 'commands:trisal.bot-mention');
    if (mencionado1 === mencionado2) return ctx.retryT('error', 'commands:trisal:same-mention');

    const user1 = authorData;
    const user2 = await this.client.database.repositories.userRepository.find(mencionado1);
    const user3 = await this.client.database.repositories.userRepository.find(mencionado2);

    if (!user1 || !user2 || !user3) return ctx.replyT('error', 'commands:trisal.no-db');

    if (user2.trisal?.length > 0 || user3.trisal?.length > 0) return ctx.replyT('error', 'commands:trisal.comedor-de-casadas');

    const messageMention1 = await this.client.users.fetch(mencionado1);
    const messageMention2 = await this.client.users.fetch(mencionado2);

    const msg = await ctx.send(`${ctx.locale('commands:trisal.accept-message')} ${ctx.message.author}, ${messageMention1}, ${messageMention2}`);
    await msg.react('✅');

    const acceptableIds = [ctx.message.author.id, mencionado1, mencionado2];

    const filter = (reaction, usuario) => reaction.emoji.name === '✅' && acceptableIds.includes(usuario.id);

    const collector = msg.createReactionCollector(filter, { time: 14000 });

    const acceptedIds = [];

    collector.on('collect', async (_reaction, user) => {
      if (!acceptedIds.includes(user.id)) acceptedIds.push(user.id);

      if (acceptedIds.length === 3) {
        user1.trisal = [mencionado1, mencionado2];
        user2.trisal = [ctx.message.author.id, mencionado2];
        user3.trisal = [ctx.message.author.id, mencionado1];
        await user1.save();
        await user2.save();
        await user3.save();

        ctx.replyT('success', 'commands:trisal.done');
      }
    });

    setTimeout(() => {
      if (acceptedIds.length !== 3) ctx.replyT('error', 'commands:trisal.error');
    }, 15000);
  }
};
