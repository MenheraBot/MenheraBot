import blacklistRepository from '../../database/repositories/blacklistRepository.js';
import fairRepository from '../../database/repositories/fairRepository.js';
import notificationRepository from '../../database/repositories/notificationRepository.js';
import { bot } from '../../index.js';
import { startGameLoop } from '../../modules/bicho/bichoManager.js';
import { setupTimers } from '../../modules/poker/timerManager.js';
import { inactivityPunishment } from '../../structures/inactivityPunishment.js';
import { logger } from '../../utils/logger.js';

const setReadyEvent = (): void => {
  bot.events.ready = async (reason) => {
    if (typeof reason !== 'string') return;
    if (bot.isMaster) return;

    bot.isMaster = true;

    logger.info(`[MASTER] I was set as the events master instance. Initializing master services`);

    await startGameLoop();
    await setupTimers();
    await blacklistRepository.constructBannedUsers();
    await notificationRepository.deleteOldNotifications();
    await fairRepository.constructAnnouncements();

    if (process.env.NOMICRERVICES) return;

    inactivityPunishment();
  };
};

export { setReadyEvent };
