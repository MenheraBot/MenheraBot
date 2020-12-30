/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable no-mixed-operators */
/* eslint-disable no-bitwise */
/* eslint-disable no-nested-ternary */
const CanvasImport = require('canvas');
const http = require('./HTTPrequests');
const Util = require('./Util');
const ProfileBadges = require('../structures/ProfileBadges');

module.exports = class Canvas {
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

    const userBadges = user.badges;

    const userFlags = discordUser.flags.toArray();

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

    if (links.length > 0) {
      for (let f = 0; f < links.length; f++) {
        const imageLoaded = await CanvasImport.loadImage(links[f]);
        images.push(imageLoaded);
      }
    }

    if (user.badges.length > 0) {
      for (let i = 0; i < userBadges.length; i++) {
        const { id } = userBadges[i];
        const { link } = ProfileBadges[id];
        const img = await CanvasImport.loadImage(link);
        images.push(img);
      }
    }

    return images;
  }
};
