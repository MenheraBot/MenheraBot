const { readdirSync } = require('fs-extra');
const path = require('path');
const i18next = require('i18next');
const translationBackend = require('i18next-node-fs-backend');

class LocaleStructure {
  constructor() {
    this.ns = ['commands', 'events', 'permissions', 'roleplay'];
    this.languages = ['pt-BR', 'en-US'];
  }

  async load() {
    try {
      const filepath = path.resolve(__dirname, '..', 'locales');
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
        returnEmpyString: false,
      });
      console.log('[LOCALES] Locales loaded!');
    } catch (err) {
      console.log(`[LOCALES] Falha no Load dos Locales: ${err.message}`);
    }
  }

  reload() {
    return i18next.reloadResources(this.languages, this.ns)
      .then(() => true)
      .catch(() => false);
  }
}

module.exports = LocaleStructure;
