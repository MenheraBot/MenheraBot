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

  async run(ctx) {
    let mentioned;
    if (ctx.args[0]) {
      try {
        mentioned = await this.client.users.fetch(ctx.args[0].replace(/[<@!>]/g, ''));
      } catch {
        return ctx.replyT('error', 'commands:status.not-found');
      }
    } else mentioned = ctx.message.author;

    const user = await this.client.database.Rpg.findById(mentioned.id);
    if (!user) return ctx.replyT('error', 'commands:status.not-found');

    const userAvatarLink = mentioned.displayAvatarURL({ format: 'png' });
    const dmg =
      user?.familiar?.id && user.familiar.type === 'damage'
        ? user.damage +
          user?.weapon?.damage +
          (familiarsFile[user.familiar.id].boost.value +
            (user.familiar.level - 1) * familiarsFile[user.familiar.id].boost.value)
        : user.damage + user?.weapon?.damage;
    const ptr =
      user?.familiar?.id && user.familiar.type === 'armor'
        ? user.armor +
          user?.protection?.armor +
          (familiarsFile[user.familiar.id].boost.value +
            (user.familiar.level - 1) * familiarsFile[user.familiar.id].boost.value)
        : user.armor + user?.protection?.armor;
    const ap =
      user?.familiar?.id && user.familiar.type === 'abilityPower'
        ? user.abilityPower +
          (familiarsFile[user.familiar.id].boost.value +
            (user.familiar.level - 1) * familiarsFile[user.familiar.id].boost.value)
        : user.abilityPower;

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
      damage: ctx.locale('commands:status.dmg'),
      armor: ctx.locale('commands:status.armor'),
      ap: ctx.locale('commands:status.ap'),
      money: ctx.locale('commands:status.money'),
      userClass: ctx.locale(`roleplay:classes.${user.class}`),
      userJob: ctx.locale(`roleplay:job.${user.jobId}.name`),
    };

    const res = await NewHttp.statusRequest(UserDataToSend, userAvatarLink, i18nData);

    if (res.err) return ctx.replyT('error', 'commands:http-error');

    ctx.sendC(ctx.message.author, new MessageAttachment(Buffer.from(res.data), 'status.png'));
  }
};
