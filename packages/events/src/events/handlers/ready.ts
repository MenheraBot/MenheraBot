import blacklistRepository from '../../database/repositories/blacklistRepository';
import { startGameLoop } from '../../modules/bicho/bichoManager';
import { logger } from '../../utils/logger';
import { bot } from '../../index';

const setReadyEvent = (): void => {
  bot.events.ready = async () => {
    logger.debug("I'M THE MASTER");
    await startGameLoop();

    await blacklistRepository.flushBannedUsers();
    const allBannedUsers = await blacklistRepository.getAllBannedUsersIdFromMongo();
    await blacklistRepository.addBannedUsers(allBannedUsers);
  };
};

export { setReadyEvent };
