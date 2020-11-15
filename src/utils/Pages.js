const { MessageCollector } = require('discord.js');

/**
 * returns the function when the first argument is not
 * @param {any} fn
 * @returns {Function}
 */
const func = (fn) => (typeof fn === 'function' ? fn : () => fn);

class PagesCollector extends MessageCollector {
  constructor(channel, {
    options, user, message, t, invalidOption, sent,
  }, collectorOptions = { max: 5 }) {
    super(channel, (m) => m.author.id === message.author.id, collectorOptions);
    this.options = options;
    this.user = user;
    this.t = t;
    this.invalidOption = func(invalidOption);
    this.message = message;
    this.sent = sent || null;
    this.on('collect', (msg) => this.onCollect(msg));
  }

  /**
   * Send a new page message or edit the current
   * @param  {...any} args arguments of #TextChannel.send or #Message.edit
   */
  async send(...args) {
    if (!this.sent || this.sent.deleted) {
      this.sent = await this.channel.send(...args);
    } else {
      this.sent = await this.sent.edit(...args);
    }

    return this.sent;
  }

  delete(...args) {
    if (this.sent && !this.sent.deleted) {
      this.sent.delete(...args);
      this.sent = null;
    }
  }

  async menheraReply(...args) {
    const sent = await this.message.menheraReply(...args);
    this.delete();
    this.sent = sent;
    return this.sent;
  }

  /**
   * Find option by title or displayed number
   * @param {String} content message content
   */
  getOption(content) {
    const str = content.toLowerCase();
    return this.options.find((o, i) => o.title.toLowerCase() === str || (i + 1) === Number(str));
  }

  async onCollect(message) {
    const option = this.getOption(message.content);

    if (!option) {
      return this.invalidOption(message, this);
    }

    const res = await func(option.exec)(message, option, this);

    if (res?.failed) {
      return;
    }

    if (Array.isArray(res)) {
      await this.collected.clear();
      // await this.resetTimer();
      this.options = res;
    } else {
      this.finish();
    }
  }

  /**
   * Stop collector listener
   */
  finish() {
    return this.stop('finish');
  }

  static fail() {
    return { failed: true };
  }
}

module.exports = PagesCollector;
