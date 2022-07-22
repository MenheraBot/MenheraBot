import { readdirSync } from 'node:fs';
import path from 'node:path';
import i18next from 'i18next';
import translationBackend from 'i18next-fs-backend';

import { logger } from '../utils/logger';

const loadLocales = (): void => {
  const namespaces = readdirSync(path.resolve(__dirname, '..', '..', 'locales', 'pt-BR')).map((a) =>
    a.replace('.json', ''),
  );

  const filepath = path.resolve(__dirname, '..', '..', 'locales');
  i18next
    .use(translationBackend)
    .init({
      ns: namespaces,
      preload: readdirSync(filepath),
      fallbackLng: 'pt-BR',
      backend: {
        loadPath: `${filepath}/{{lng}}/{{ns}}.json`,
      },
      interpolation: {
        escapeValue: false,
      },
      returnEmptyString: false,
    })
    .then(() => {
      logger.info('[LOCALES] Locales loaded!');
    })
    .catch((e) => {
      logger.info(`[LOCALES] Locales failed on loading: ${e.message}`);
    });
};

export { loadLocales };
