import axios from 'axios';
import { bot } from '..';
import { logger } from './logger';

let retryTimeout: NodeJS.Timeout;
let retries = 0;

const loadChangelog = async (): Promise<void> => {
  logger.info('[CHANGELOG] Getting the current update changelog');

  const response = await axios
    .get(`https://menherabot.xyz/api/changelog?version=${process.env.VERSION}`)
    .catch(() => null);

  if (!response) {
    retries += 1;
    logger.info(
      `[CHANGELOG] There is still no changelog for this version. Current try: ${retries}`,
    );

    retryTimeout = setTimeout(() => {
      loadChangelog();
    }, 60_000 * retries);
    return;
  }

  retries = 0;
  clearTimeout(retryTimeout);
  bot.changelog = response.data;
};

export { loadChangelog };
