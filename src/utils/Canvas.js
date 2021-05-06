/* eslint-disable no-restricted-properties */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable no-mixed-operators */
/* eslint-disable no-bitwise */
/* eslint-disable no-nested-ternary */
const CanvasImport = require('canvas');
const { millify } = require('millify');
const http = require('./HTTPrequests');
const Util = require('./Util');
const ProfileBadges = require('../structures/ProfileBadges');
const familiarsFile = require('../structures/RpgHandler').familiars;

module.exports = class Canvas {
  static async TrisalBuilder(linkOne, linkTwo, linkThree) {
    const ImageOne = await CanvasImport.loadImage(linkOne);
    const ImageTwo = await CanvasImport.loadImage(linkTwo);
    const ImageThree = await CanvasImport.loadImage(linkThree);

    const canvas = CanvasImport.createCanvas(728, 256);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(ImageOne, 0, 0, 256, 256);
    ctx.drawImage(ImageTwo, 256, 0, 256, 256);
    ctx.drawImage(ImageThree, 512, 0, 256, 256);

    return canvas.toBuffer();
  }

  static async ProfileImage({
    member, user, avatar, marry,
  }, t) {
    // Criação da Área de Trabalho
    const canvas = CanvasImport.createCanvas(1080, 720);
    const ctx = canvas.getContext('2d');

    // Plano de Fundo
    const baseColor = user.cor || '#a788ff';
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header
    const darkerColor = Canvas.shadeColor(baseColor, -15);
    ctx.fillStyle = darkerColor;
    ctx.roundRect(0, 0, canvas.width, 240, 20, true, true);

    // Emblemas
    const darkestThanTheDarkerColor = Canvas.shadeColor(darkerColor, -10);
    ctx.fillStyle = darkestThanTheDarkerColor;
    ctx.roundRect(0, 164, canvas.width, 75, 20, true, true);

    // Área de Mamadas
    ctx.fillStyle = darkestThanTheDarkerColor;
    ctx.roundRect(890, 250, 180, 200, 20, true, true);

    // Avatar do usuário
    const userAvatar = await CanvasImport.loadImage(avatar);
    const roundedImage = await ctx.roundImageCanvas(userAvatar, 250, 250);
    ctx.beginPath();
    ctx.arc(120, 120, 122, 0, 2 * Math.PI);
    ctx.fillStyle = 'black';
    ctx.fill();
    ctx.closePath();
    ctx.drawImage(roundedImage, 0, 0, 240, 240);

    // Nick do usuário
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 50px Sans';
    ctx.fillText(ctx.getLines(member.tag, 650).join('\n'), 255, 90);
    ctx.strokeText(ctx.getLines(member.tag, 650).join('\n'), 255, 90);

    // Upvotes
    ctx.font = 'bold 45px Sans';
    ctx.fillText('Upvotes', 860, 60);
    ctx.strokeText('Upvotes', 860, 60);
    ctx.textAlign = 'center';
    ctx.fillText(user.votos, 980, 120);
    ctx.strokeText(user.votos, 980, 120);

    // Sobre Mim
    ctx.textAlign = 'left';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 45px Sans';
    ctx.fillText(`${t('commands:profile.about-me')}:`, 20, 300);
    ctx.strokeText(`${t('commands:profile.about-me')}:`, 20, 300);
    ctx.font = 'bold 32px Sans';
    ctx.fillText(ctx.getLines(user.nota, 870).join('\n'), 20, 350);
    ctx.strokeText(ctx.getLines(user.nota, 870).join('\n'), 20, 350);

    // Repaint do footer para evitar usuários engraçadinhos que fazem sobre mim com muita quebra de linhas
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 480, canvas.width, canvas.height);

    // Área de Informações
    const usageCommands = await http.getProfileCommands(member.id);
    if (usageCommands) {
      const usedCommands = usageCommands.cmds.count;
      const mostUsedCommand = usageCommands.array[0];
      ctx.font = 'bold 40px Sans';
      ctx.fillStyle = 'white';
      ctx.fillText(ctx.getLines(t('commands:profile.commands-usage', {
        user: member.username, usedCount: usedCommands, mostUsedCommandName: Util.captalize(mostUsedCommand.name), mostUsedCommandCount: mostUsedCommand.count,
      }), 1000).join('\n'), 20, 600);
      ctx.strokeText(ctx.getLines(t('commands:profile.commands-usage', {
        user: member.username, usedCount: usedCommands, mostUsedCommandName: Util.captalize(mostUsedCommand.name), mostUsedCommandCount: mostUsedCommand.count,
      }), 1000).join('\n'), 20, 600);
    }

    // Casado
    if (marry !== 'false') {
      ctx.fillStyle = 'white';
      const ringEmoji = await CanvasImport.loadImage('https://media.discordapp.net/attachments/784235115064721458/793642413964525618/emoji.png');
      ctx.font = 'bold 40px Sans';
      ctx.lineWidth = 1;
      ctx.textAlign = 'left';
      ctx.fillText(`${marry.tag} | ${user.data}`, 80, 535);
      ctx.strokeText(`${marry.tag} | ${user.data}`, 80, 535);
      ctx.drawImage(ringEmoji, 10, 490, 55, 55);
    }

    // Mamadas e Mamou
    ctx.textAlign = 'center';
    ctx.fillText(t('commands:profile.mamado'), 980, 290);
    ctx.strokeText(t('commands:profile.mamado'), 980, 290);
    ctx.fillText(t('commands:profile.mamou'), 980, 380);
    ctx.strokeText(t('commands:profile.mamou'), 980, 380);

    ctx.fillText(user.mamadas, 980, 335);
    ctx.strokeText(user.mamadas, 980, 335);
    ctx.fillText(user.mamou, 980, 425);
    ctx.strokeText(user.mamou, 980, 425);

    const badgesLink = await Canvas.getUserBadgesLink(user, member);

    if (badgesLink) {
      let number = 0;
      badgesLink.forEach((img) => {
        ctx.drawImage(img, 230 + (number * 64), 170, 64, 64);
        number++;
      });
    }

    return canvas.toBuffer();
  }

  static shadeColor(color, percent) {
    const num = parseInt(color.slice(1), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;

    const shadedColor = `#${(0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1)}`;
    return shadedColor;
  }

  static getLuminosity(color) {
    const colorWithoutHashtag = color.replace('#', '');

    const r = parseInt(colorWithoutHashtag.substr(0, 2)) || 0;
    const g = parseInt(colorWithoutHashtag.substr(2, 2)) || 0;
    const b = parseInt(colorWithoutHashtag.substr(4, 2)) || 0;

    const Luminosity = (r * 299 + g * 587 + b * 114) / 1000;
    return Luminosity;
  }

  static async getUserBadgesLink(user, discordUser) {
    const images = [];
    const links = [];

    const userFlags = discordUser.flags?.toArray();

    if (userFlags && userFlags.length > 0) {
      userFlags.forEach((flag) => {
        switch (flag) {
          case 'HOUSE_BRAVERY':
            links.push(ProfileBadges[4].link);
            break;
          case 'HOUSE_BRILLIANCE':
            links.push(ProfileBadges[3].link);
            break;
          case 'HOUSE_BALANCE':
            links.push(ProfileBadges[2].link);
            break;
          case 'EARLY_VERIFIED_DEVELOPER':
            links.push(ProfileBadges[5].link);
            break;
        }
      });
    }

    if (user?.casado !== 'false') {
      const ringEmoji = await CanvasImport.loadImage('https://media.discordapp.net/attachments/784235115064721458/793642413964525618/emoji.png');
      images.push(ringEmoji);
    }

    if (user.voteCooldown && parseInt(user?.voteCooldown) > Date.now()) {
      const voteEmoji = await CanvasImport.loadImage('https://media.discordapp.net/attachments/793669360857907200/826091383303307274/MenheraSmile2.png');
      images.push(voteEmoji);
    }

    if (user.votos > 100) {
      const hundredVoteEmoji = await CanvasImport.loadImage('https://media.discordapp.net/attachments/793669360857907200/839951784785346600/MenheraThumbsUp.png');
      images.push(hundredVoteEmoji);
    }

    if (links.length > 0) {
      for (const f in links) {
        const imageLoaded = await CanvasImport.loadImage(links[f]);
        images.push(imageLoaded);
      }
    }

    if (user.badges.length > 0) {
      for (const i in user.badges) {
        const { id } = user.badges[i];
        const { link } = ProfileBadges[id];
        const img = await CanvasImport.loadImage(link);
        images.push(img);
      }
    }

    return images;
  }

  static RainbowColorPercentage(percentage) {
    // A cada 14% mudar de cor
    const canvas = CanvasImport.createCanvas(456, 75);
    const context = canvas.getContext('2d');

    const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0.00, 'red');
    gradient.addColorStop(1 / 6, 'orange');
    gradient.addColorStop(2 / 6, 'yellow');
    gradient.addColorStop(3 / 6, 'green');
    gradient.addColorStop(4 / 6, 'aqua');
    gradient.addColorStop(5 / 6, 'blue');
    gradient.addColorStop(1.00, 'purple');

    context.fillStyle = gradient;
    context.lineWidth = 20;

    const howMuchToFill = percentage / 100;
    // Rainbow ship
    context.roundRect(0, 0, canvas.width * howMuchToFill, canvas.height, 40, true, false);

    // BlackBox
    context.roundRect(0, 0, canvas.width, canvas.height, 40, false, true);

    return canvas.toDataURL();
  }

  static async ShipImage(shipValue, member1, member2) {
    const canvas = CanvasImport.createCanvas(512, 350);
    const ctx = canvas.getContext('2d');

    const linkFirstAvatar = member1.displayAvatarURL({ format: 'png', size: 256 });
    const linkSecondAvatar = member2.displayAvatarURL({ format: 'png', size: 256 });

    const avatarOneLoaded = await CanvasImport.loadImage(linkFirstAvatar);
    const avatarTwoLoaded = await CanvasImport.loadImage(linkSecondAvatar);
    const shipLoadedImage = await CanvasImport.loadImage(Canvas.RainbowColorPercentage(shipValue));

    ctx.fillStyle = '#fff';

    ctx.drawImage(avatarOneLoaded, 0, 0, 256, 256);
    ctx.drawImage(avatarTwoLoaded, 256, 0, 256, 256);
    ctx.drawImage(shipLoadedImage, 20, 270, 456, 75);

    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.font = 'bold 58px Sans';
    ctx.fillText(`${shipValue}%`, 256, 330);
    ctx.strokeText(`${shipValue}%`, 256, 330);

    return canvas.toBuffer();
  }

  static async FiloBuilder(text) {
    const canvas = CanvasImport.createCanvas(720, 720);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 58px Sans';
    ctx.fillText(ctx.getLines(text, 720).join('\n'), 0, 100);

    const aristotelesImage = await CanvasImport.loadImage('https://i.imgur.com/ZXfqntW.png');
    ctx.drawImage(aristotelesImage, 0, 300, 412, 520);

    return canvas.toBuffer();
  }

  static async AstolfoCommandBuilder(text) {
    const canvas = CanvasImport.createCanvas(253, 330);
    const ctx = canvas.getContext('2d');

    const astolfoImage = await CanvasImport.loadImage('https://i.imgur.com/D4b4E8M.png');

    ctx.drawImage(astolfoImage, 0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#000';
    ctx.font = 'bold 20px Sans';
    ctx.fillText(ctx.getLines(text, 160).join('\n'), 72, 208);

    return canvas.toBuffer();
  }

  static async RpgStatusBuilder(user, member, t) {
    /* ---------------------- CREATE CANVAS -------------------------- */

    const canvas = CanvasImport.createCanvas(582, 275);
    const ctx = canvas.getContext('2d');

    /* ---------------------- LOADING IMAGES -------------------------- */

    const avatarImage = await CanvasImport.loadImage(member.displayAvatarURL({ format: 'png' }));
    const profileImg = await CanvasImport.loadImage('https://i.imgur.com/rrqGeeo.png');
    const heartIcon = await CanvasImport.loadImage('https://i.imgur.com/UihYcpx.png');
    const manaIcon = await CanvasImport.loadImage('https://i.imgur.com/pp1BTk1.png');
    const xpIcon = await CanvasImport.loadImage('https://i.imgur.com/qGN3zKT.png');
    const levelIcon = await CanvasImport.loadImage('https://i.imgur.com/VKooZU6.png');
    const dmgIcon = await CanvasImport.loadImage('https://i.imgur.com/trlnSIe.png');
    const armorIcon = await CanvasImport.loadImage('https://i.imgur.com/V7hdWyS.png');
    const magicIcon = await CanvasImport.loadImage('https://i.imgur.com/IxOlamv.png');
    const gemIcon = await CanvasImport.loadImage('https://i.imgur.com/B44r4sA.png');
    const classIcon = await CanvasImport.loadImage('https://i.imgur.com/6Z4B0dY.png');
    const jobIcon = await CanvasImport.loadImage('https://i.imgur.com/k7uMwn3.png');

    const roundedImage = await ctx.roundImageCanvas(avatarImage, 180, 180);

    /* ---------------------- CONSTANTS -------------------------- */

    const lifeFillMultiplier = user.life / user.maxLife;
    const manaFillMultiplier = user.mana / user.maxMana;
    const xpFillMultiplier = user.xp / user.nextLevelXp;
    const dmg = user?.familiar?.id && user.familiar.type === 'damage' ? user.damage + user.weapon.damage + (familiarsFile[user.familiar.id].boost.value + ((user.familiar.level - 1) * familiarsFile[user.familiar.id].boost.value)) : user.damage + user.weapon.damage;
    const ptr = user?.familiar?.id && user.familiar.type === 'armor' ? user.armor + user.protection.armor + (familiarsFile[user.familiar.id].boost.value + ((user.familiar.level - 1) * familiarsFile[user.familiar.id].boost.value)) : user.armor + user.protection.armor;

    /* ---------------------- CREATE BARS -------------------------- */

    const lifeGradiant = ctx.createLinearGradient(315, 67, 555, 90);
    lifeGradiant.addColorStop(1, 'red');
    lifeGradiant.addColorStop(0, '#FF5151');

    ctx.fillStyle = lifeGradiant;
    ctx.fillRect(312, 67, 240 * lifeFillMultiplier, 24);

    const manaGradiant = ctx.createLinearGradient(315, 95, 555, 115);
    manaGradiant.addColorStop(1, 'blue');
    manaGradiant.addColorStop(0, '#0080ff');

    ctx.fillStyle = manaGradiant;
    ctx.fillRect(312, 95, 240 * manaFillMultiplier, 20);

    const xpGradiant = ctx.createLinearGradient(315, 130, 555, 150);
    xpGradiant.addColorStop(1, '#ff8300');
    xpGradiant.addColorStop(0, '#ffd323');

    ctx.fillStyle = xpGradiant;
    ctx.fillRect(315, 120, 240 * xpFillMultiplier, 20);

    /* ---------------------- ADD ALL IMAGES -------------------------- */

    ctx.drawImage(roundedImage, 35, 25, 120, 120);
    ctx.drawImage(profileImg, 0, 0, 582, 275);
    ctx.drawImage(heartIcon, 265, 57, 42, 42);
    ctx.drawImage(manaIcon, 275, 85, 28, 28);
    ctx.drawImage(xpIcon, 280, 115, 24, 24);
    ctx.drawImage(levelIcon, 160, 80, 48, 48);

    /* ---------------------- WRITE TEXT -------------------------- */

    // BAR VALUES
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#000';
    ctx.font = 'bold 20px Sans';
    ctx.lineWidth = 0;

    ctx.fillText(`${user.life}/${user.maxLife}`, 400, 86);
    ctx.strokeText(`${user.life}/${user.maxLife}`, 400, 86);

    ctx.fillText(`${user.mana}/${user.maxMana}`, 400, 112);
    ctx.strokeText(`${user.mana}/${user.maxMana}`, 400, 112);

    ctx.fillText(`${millify(user.xp)}/${millify(user.nextLevelXp)}`, 400, 137);
    ctx.strokeText(`${millify(user.xp)}/${millify(user.nextLevelXp)}`, 400, 137);

    // USERNAME

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 38px Sans';
    ctx.lineWidth = 2;
    ctx.fillText(member.tag, 160, 32);
    ctx.strokeText(member.tag, 160, 32);

    // LEVEL

    ctx.fillStyle = '#aa8dd8';
    ctx.font = 'bold 32px Sans';
    ctx.textAlign = 'center';

    ctx.fillText(user.level, 240, 115);
    ctx.strokeText(user.level, 240, 115);

    // DAMAGE

    ctx.textAlign = 'left';
    ctx.font = 'bold 18px Verdana';
    ctx.lineWidth = 1;

    ctx.fillStyle = 'red';
    ctx.drawImage(dmgIcon, 60, 160, 28, 28);
    ctx.fillText(`${t('commands:status.dmg')}: ${dmg}`, 90, 180);

    // PROTECTION

    ctx.fillStyle = '#295564';
    ctx.drawImage(armorIcon, 60, 200, 28, 28);
    ctx.fillText(`${t('commands:status.armor')}: ${ptr}`, 90, 220);

    // MAGIC POWER

    ctx.fillStyle = 'purple';
    ctx.drawImage(magicIcon, 60, 235, 26, 26);
    ctx.fillText(`${t('commands:status.ap')}: ${user?.familiar?.id && user.familiar.type === 'abilityPower' ? user.abilityPower + (familiarsFile[user.familiar.id].boost.value + (user.familiar.level - 1) * familiarsFile[user.familiar.id].boost.value) : user.abilityPower}`, 90, 255);

    // GEMAS

    ctx.fillStyle = 'aqua';
    ctx.drawImage(gemIcon, 270, 235, 26, 26);
    ctx.fillText(`${t('commands:status.money')}: ${user.money}`, 295, 255);

    // CLASSE

    ctx.fillStyle = '#fff';
    ctx.drawImage(classIcon, 270, 160, 28, 28);
    ctx.fillText(t(`roleplay:classes.${user.class}`), 300, 180);

    // TRABALHO
    if (user?.jobId > 0) {
      ctx.fillStyle = 'yellow';
      ctx.drawImage(jobIcon, 290, 200, 28, 28);
      ctx.fillText(t(`roleplay:job.${user.jobId}.name`), 320, 220);
    }
    return canvas.toBuffer();
  }
};
