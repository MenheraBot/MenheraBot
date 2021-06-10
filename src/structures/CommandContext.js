import emotes from './emotes';

// TODO: Interfaces to User and Server
module.exports = class CommandContext {
  constructor(client, message, args, data, i18n) {
    this.client = client;
    this.message = message;
    this.args = args;
    this.data = data;
    this.i18n = i18n;
  }

  async replyT(emoji, text, translateOptions = {}) {
    return this.message.channel.send(`${emotes[emoji] || '🐛'} **|** ${this.message.author}, ${this.i18n(text, translateOptions)}`);
  }

  async reply(emoji, text) {
    return this.message.channel.send(`${emotes[emoji] || '🐛'} **|** ${this.message.author}, ${text}`);
  }

  async send(message) {
    return this.message.channel.send(message);
  }

  async sendC(content, config) {
    return this.message.channel.send(content, config);
  }

  locale(text, translateVars = {}) {
    return this.i18n(text, translateVars);
  }
};
