/* eslint-disable no-param-reassign */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
const { Message } = require('discord.js');
const { CanvasRenderingContext2D, createCanvas } = require('canvas');
const emotes = require('./emotes');

/*
*
*     Made by DanielaGC
*
*/

module.exports = class ProtoTypes {
  static start() {
    Message.prototype.menheraReply = async function send(emoji, message, ...args) {
      return this.channel.send(`${emotes[emoji] || '🐛'} **|** ${this.author}, ${message}`, ...args);
    };

    CanvasRenderingContext2D.prototype.roundImageCanvas = function roundImageCanvas(img, w = img.width, h = img.height, r = w * 0.5) {
      const canvas = createCanvas(w, h);
      const ctx = canvas.getContext('2d');

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(img, 0, 0, w, h);

      ctx.fillStyle = '#fff';
      ctx.globalCompositeOperation = 'destination-in';
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.5, r, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fill();

      return canvas;
    };
    CanvasRenderingContext2D.prototype.getLines = function getLines(text, maxWidth) {
      const words = text.split(' ');
      const lines = [];
      let currentLine = words[0];

      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const { width } = this.measureText(`${currentLine} ${word}`);
        if (width < maxWidth) {
          currentLine += ` ${word}`;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
      lines.push(currentLine);
      return lines;
    };
    CanvasRenderingContext2D.prototype.roundRect = function roundRect(x, y, width, height, radius, fill, stroke) {
      if (typeof stroke === 'undefined') {
        stroke = true;
      }
      if (typeof radius === 'undefined') {
        radius = 5;
      }
      if (typeof radius === 'number') {
        radius = {
          tl: radius, tr: radius, br: radius, bl: radius,
        };
      } else {
        const defaultRadius = {
          tl: 0, tr: 0, br: 0, bl: 0,
        };
        for (const side in defaultRadius) {
          radius[side] = radius[side] || defaultRadius[side];
        }
      }
      this.beginPath();
      this.moveTo(x + radius.tl, y);
      this.lineTo(x + width - radius.tr, y);
      this.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
      this.lineTo(x + width, y + height - radius.br);
      this.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
      this.lineTo(x + radius.bl, y + height);
      this.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
      this.lineTo(x, y + radius.tl);
      this.quadraticCurveTo(x, y, x + radius.tl, y);
      this.closePath();
      if (fill) {
        this.fill();
      }
      if (stroke) {
        this.stroke();
      }
    };
  }
};
