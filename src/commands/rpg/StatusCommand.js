const NewHttp = require('@utils/NewHttp');
const { MessageAttachment } = require('discord.js');
const familiarsFile = require('../../structures/RpgHandler').familiars;
const Command = require('../../structures/command');

module.exports = class StatusCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'status',
      aliases: ['stats'],
      cooldown: 7,
      category: 'rpg',
      clientPermissions: ['EMBED_LINKS', 'ATTACH_FILES'],
    });
  }

  async run({ message, args }, t) {
    let mentioned;
    if (args[0]) {
      try {
        mentioned = await this.client.users.fetch(args[0].replace(/[<@!>]/g, ''));
      } catch {
        return message.menheraReply('error', t('commands:status.not-found'));
      }
    } else mentioned = message.author;

    const user = await this.client.database.Rpg.findById(mentioned.id);
    if (!user) return message.menheraReply('error', t('commands:status.not-found'));

    const userAvatarLink = mentioned.displayAvatarURL({ format: 'png' });
    const dmg = user?.familiar?.id && user.familiar.type === 'damage' ? user.damage + user?.weapon?.damage + (familiarsFile[user.familiar.id].boost.value + ((user.familiar.level - 1) * familiarsFile[user.familiar.id].boost.value)) : user.damage + user?.weapon?.damage;
    const ptr = user?.familiar?.id && user.familiar.type === 'armor' ? user.armor + user?.protection?.armor + (familiarsFile[user.familiar.id].boost.value + ((user.familiar.level - 1) * familiarsFile[user.familiar.id].boost.value)) : user.armor + user?.protection?.armor;
    const ap = user?.familiar?.id && user.familiar.type === 'abilityPower' ? user.abilityPower + (familiarsFile[user.familiar.id].boost.value + (user.familiar.level - 1) * familiarsFile[user.familiar.id].boost.value) : user.abilityPower;

    const UserDataToSend = {
      life: user.life,
      maxLife: user.maxLife,
      mana: user.mana,
      maxMana: user.maxMana,
      xp: user.xp,
      level: user.level,
      nextLevelXp: user.nextLevelXp,
      damage: dmg,
      armor: ptr,
      abilityPower: ap,
      tag: mentioned.tag,
      money: user.money,
      jobId: user.jobId,
    };

    const i18nData = {
      damage: t('commands:status.dmg'),
      armor: t('commands:status.armor'),
      ap: t('commands:status.ap'),
      money: t('commands:status.money'),
      userClass: t(`roleplay:classes.${user.class}`),
      userJob: t(`roleplay:job.${user.jobId}.name`),
    };

    const res = await NewHttp.statusRequest(UserDataToSend, userAvatarLink, i18nData);

    if (res.err) return message.menheraReply('error', t('commands:http-error'));

    message.channel.send(message.author, new MessageAttachment(Buffer.from(res.data), 'status.png'));
  }
};
