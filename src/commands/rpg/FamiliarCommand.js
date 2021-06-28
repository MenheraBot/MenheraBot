const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');
const familiarsFile = require('../../structures/Rpgs/familiar.json');
/*
NA DATABASE:

 familiar: {
   id: number
   level: number
   xp: number
   nextlevelXp: number
 }

*/
module.exports = class FamiliarCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'familiar',
      aliases: ['pet'],
      category: 'rpg',
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx) {
    const user = await this.client.database.Rpg.findById(ctx.message.author.id);
    if (!user) return ctx.replyT('error', 'commands:familiar.no-user', { prefix: ctx.data.server.prefix });

    if (user.level < 15) return ctx.replyT('error', 'commands:familiar.no-level');

    if (!user.familiar || !user.familiar.id) {
      const array = Object.entries(familiarsFile);
      const userFamiliar = array[Math.floor(Math.random() * array.length)];
      const embed = new MessageEmbed()
        .setTitle(ctx.locale('commands:familiar.summon-title'))
        .setDescription(ctx.locale('commands:familiar.summon-description'))
        .setColor('#6ee2f8')
        .setImage('https://i.imgur.com/nbbBZWo.gif');
      const sentMessage = await ctx.sendC(ctx.message.author, embed);
      setTimeout(async () => {
        user.familiar = {
          id: userFamiliar[0],
          level: 1,
          xp: 0,
          nextLevelXp: 1500,
          type: userFamiliar[1].boost.type,
        };
        await user.save();
        sentMessage.edit({ content: `${ctx.message.author}, ${ctx.locale('commands:familiar.success', { name: ctx.locale(`roleplay:familiar.${userFamiliar[0]}`) })}`, embed: null });
      }, 3000);
    } else {
      const embed = new MessageEmbed()
        .setTitle(ctx.locale('commands:familiar.info-title'))
        .setColor('6a4ea5')
        .setImage(familiarsFile[user.familiar.id].image)
        .setFooter(ctx.locale('commands:familiar.footer'))
        .addFields([{
          name: ctx.locale('commands:familiar.name'),
          value: ctx.locale(`roleplay:familiar.${user.familiar.id}`),
          inline: true,
        }, {
          name: ctx.locale('commands:familiar.level'),
          value: user.familiar.level,
          inline: true,
        }], [{
          name: ctx.locale('commands:familiar.xp'),
          value: `${user.familiar.xp} / ${user.familiar.nextLevelXp}`,
          inline: false,
        }, {
          name: ctx.locale(`roleplay:familiar.${familiarsFile[user.familiar.id].boost.name}`),
          value: familiarsFile[user.familiar.id].boost.value + ((user.familiar.level - 1) * familiarsFile[user.familiar.id].boost.value),
          inline: true,
        },
        ]);
      ctx.sendC(ctx.message.author, embed);
    }
  }
};
