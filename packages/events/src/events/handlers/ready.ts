import { createHttpServer, registerAllRouters } from '../../structures/server/httpServer';
import blacklistRepository from '../../database/repositories/blacklistRepository';
import { startGameLoop } from '../../modules/bicho/bichoManager';
import { logger } from '../../utils/logger';
import { bot } from '../../index';
import { inactivityPunishment } from '../../structures/inactivityPunishment';

const setReadyEvent = (): void => {
  bot.events.ready = async () => {
    if (bot.isMaster) return;

    bot.isMaster = true;

    logger.info(`[MASTER] I was set as the events master instance. Initializing master services`);

    await startGameLoop();

    await blacklistRepository.flushBannedUsers();
    const allBannedUsers = await blacklistRepository.getAllBannedUsersIdFromMongo();
    await blacklistRepository.addBannedUsers(allBannedUsers);

    if (process.env.NOMICRERVICES) return;

    inactivityPunishment();
    createHttpServer();
    registerAllRouters();
  };
};

export { setReadyEvent };
