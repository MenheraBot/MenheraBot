const Command = require('../../structures/command');

module.exports = class LanguageCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'language',
      aliases: ['linguagem', 'lang'],
      cooldown: 15,
      userPermissions: ['MANAGE_GUILD'],
      clientPermissions: ['EMBED_LINKS', 'ADD_REACTIONS', 'MANAGE_MESSAGES'],
      category: 'moderação',
    });
  }

  async run(ctx) {
    ctx.replyT('question', 'commands:language.question').then((msg) => {
      msg.react('🇧🇷');
      setTimeout(() => {
        msg.react('🇺🇸');
      }, 500);

      const collector = msg.createReactionCollector((r, u) => (r.emoji.name === '🇧🇷', '🇺🇸') && (u.id !== this.client.user.id && u.id === ctx.message.author.id));
      collector.on('collect', (r) => {
        switch (r.emoji.name) {
          case '🇧🇷':
            ctx.data.server.lang = 'pt-BR';
            ctx.data.server.save();
            msg.delete({ timeout: 100 });
            ctx.message.channel.send(':map: | Agora eu irei falar em ~~brasileiro~~ português');
            break;
          case '🇺🇸':
            ctx.data.server.lang = 'en-US';
            ctx.data.server.save();
            msg.delete({ timeout: 100 });
            ctx.message.channel.send(":map: | Now I'll talk in english");
            break;
        }
      });
    });
  }
};
