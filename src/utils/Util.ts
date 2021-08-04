const MENTION_REGEX = /^(?:<@!?)?([0-9]{16,18})(?:>)?$/;
export default class Util {
  static getIdByMention(mention: string): string | null {
    if (!mention) return null;
    const regexResult = MENTION_REGEX.exec(mention);
    return regexResult && regexResult[1];
  }

  static captalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
