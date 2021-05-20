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

  async run({ message, server }, t) {
    const user = await this.client.database.Rpg.findById(message.author.id);
    if (!user) return message.menheraReply('error', t('commands:familiar.no-user', { prefix: server.prefix }));

    if (user.level < 15) return message.menheraReply('error', t('commands:familiar.no-level'));

    if (!user.familiar || !user.familiar.id) {
      const array = Object.entries(familiarsFile);
      const userFamiliar = array[Math.floor(Math.random() * array.length)];
      const embed = new MessageEmbed()
        .setTitle(t('commands:familiar.summon-title'))
        .setDescription(t('commands:familiar.summon-description'))
        .setColor('#6ee2f8')
        .setImage('https://i.imgur.com/nbbBZWo.gif');
      const sentMessage = await message.channel.send(message.author, embed);
      setTimeout(async () => {
        const familiar = {
          id: userFamiliar[0],
          level: 1,
          xp: 0,
          nextLevelXp: 1500,
          type: userFamiliar[1].boost.type,
        };

        await this.client.database.Rpg.updateOne({ _id: message.author.id }, { $set: familiar });

        sentMessage.edit({ content: `${message.author}, ${t('commands:familiar.success', { name: t(`roleplay:familiar.${userFamiliar[0]}`) })}`, embed: null });
      }, 3000);
    } else {
      const embed = new MessageEmbed()
        .setTitle(t('commands:familiar.info-title'))
        .setColor('6a4ea5')
        .setImage(familiarsFile[user.familiar.id].image)
        .setFooter(t('commands:familiar.footer'))
        .addFields([{
          name: t('commands:familiar.name'),
          value: t(`roleplay:familiar.${user.familiar.id}`),
          inline: true,
        }, {
          name: t('commands:familiar.level'),
          value: user.familiar.level,
          inline: true,
        }], [{
          name: t('commands:familiar.xp'),
          value: `${user.familiar.xp} / ${user.familiar.nextLevelXp}`,
          inline: false,
        }, {
          name: t(`roleplay:familiar.${familiarsFile[user.familiar.id].boost.name}`),
          value: familiarsFile[user.familiar.id].boost.value + ((user.familiar.level - 1) * familiarsFile[user.familiar.id].boost.value),
          inline: true,
        },
        ]);
      message.channel.send(message.author, embed);
    }
  }
};
