import blacklistRepository from '../../database/repositories/blacklistRepository';
import { bot } from '../../index';
import { startGameLoop } from '../../modules/bicho/bichoManager';
import { inactivityPunishment } from '../../structures/inactivityPunishment';
import { logger } from '../../utils/logger';

const setReadyEvent = (): void => {
  bot.events.ready = async (reason) => {
    if (typeof reason !== 'string') return;
    if (bot.isMaster) return;

    bot.isMaster = true;

    logger.info(`[MASTER] I was set as the events master instance. Initializing master services`);

    await startGameLoop();

    await blacklistRepository.flushBannedUsers();
    const allBannedUsers = await blacklistRepository.getAllBannedUsersIdFromMongo();
    await blacklistRepository.addBannedUsers(allBannedUsers);

    if (process.env.NOMICRERVICES) return;

    inactivityPunishment();
  };
};

export { setReadyEvent };
