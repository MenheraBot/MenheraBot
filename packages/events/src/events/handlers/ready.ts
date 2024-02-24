import blacklistRepository from '../../database/repositories/blacklistRepository';
import fairRepository from '../../database/repositories/fairRepository';
import { bot } from '../../index';
import { startGameLoop } from '../../modules/bicho/bichoManager';
import { setupTimers } from '../../modules/poker/timerManager';
import { setupBattleTimers } from '../../modules/roleplay/battle/battleTimers';
import { inactivityPunishment } from '../../structures/inactivityPunishment';
import { logger } from '../../utils/logger';

const setReadyEvent = (): void => {
  bot.events.ready = async (reason) => {
    if (typeof reason !== 'string') return;
    if (bot.isMaster) return;

    bot.isMaster = true;

    logger.info(`[MASTER] I was set as the events master instance. Initializing master services`);

    await startGameLoop();
    await setupTimers();
    await setupBattleTimers();
    await blacklistRepository.constructBannedUsers();
    await fairRepository.constructAnnouncements();

    if (process.env.NOMICRERVICES) return;

    inactivityPunishment();
  };
};

export { setReadyEvent };
