const MENTION_REGEX = /^(?:<@!?)?([0-9]{16,18})(?:>)?$/;
module.exports = class Util {
  static getIdByMention(mention) {
    if (!mention) return null;
    const regexResult = MENTION_REGEX.exec(mention);
    return regexResult && regexResult[1];
  }
};
