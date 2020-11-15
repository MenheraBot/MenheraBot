const { Message } = require('discord.js');
const emotes = require('./emotes');

module.exports = class ProtoTypes {
  static start() {
    Message.prototype.menheraReply = async function send(emoji, message, ...args) {
      return this.channel.send(`${emotes[emoji] || '🐛'} **|** ${this.author}, ${message}`, ...args);
    };
  }
};
