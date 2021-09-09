import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js';
import { IRpgUserSchema } from '../Types';

export default async (ctx: InteractionCommandContext, user: IRpgUserSchema): Promise<void> => {
  const embed = new MessageEmbed()
    .setColor(ctx.data.user.cor)
    .setTitle(ctx.locale('buildings:training_camp.title'));
};
