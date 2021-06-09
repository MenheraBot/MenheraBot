/* eslint-disable no-param-reassign */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
const { Message } = require('discord.js');

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
  }
};
