import guildRepository from '../../database/repositories/guildRepository';
import { bot } from '../../index';

const setGuildDeleteEvent = (): void => {
  bot.events.guildDelete = async (_, guildId) => {
    await guildRepository.deleteGuild(guildId);
  };
};

export { setGuildDeleteEvent };
