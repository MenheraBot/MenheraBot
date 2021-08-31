import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js';
import { IRpgUserSchema } from '../Types';

export default async (ctx: InteractionCommandContext, user: IRpgUserSchema): Promise<void> => {
  const embed = new MessageEmbed()
    .setColor(ctx.data.user.cor)
    .setTitle(ctx.translate('first.title'))
    .setDescription(ctx.translate('first.description'));

  const userDailyQuests = ctx.client.repositories.rpgRepository.getUserDailyQuests(
    ctx.interaction.user.id,
  );
};
