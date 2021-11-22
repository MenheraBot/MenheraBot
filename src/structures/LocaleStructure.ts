import { readdirSync } from 'node:fs';
import path from 'node:path';
import i18next from 'i18next';
import translationBackend from 'i18next-fs-backend';

export default class LocaleStructure {
  public ns: Array<string>;

  public languages: Array<string>;

  constructor() {
    this.ns = ['common', 'commands', 'data', 'events', 'permissions'];
    this.languages = ['pt-BR', 'en-US'];
  }

  async load(): Promise<void> {
    try {
      const filepath = path.resolve(__dirname, '..', '..', 'src', 'locales');
      await i18next.use(translationBackend).init({
        ns: this.ns,
        preload: readdirSync(filepath),
        fallbackLng: 'pt-BR',
        backend: {
          loadPath: `${filepath}/{{lng}}/{{ns}}.json`,
        },
        interpolation: {
          escapeValue: false,
        },
        returnEmptyString: false,
      });
      console.log('[LOCALES] Locales loaded!');
    } catch (err) {
      if (err instanceof Error) console.log(`[LOCALES] Falha no Load dos Locales: ${err.message}`);
    }
  }

  async reload(): Promise<boolean> {
    try {
      await i18next.reloadResources(this.languages, this.ns);
      return true;
    } catch (e) {
      return false;
    }
  }
}
