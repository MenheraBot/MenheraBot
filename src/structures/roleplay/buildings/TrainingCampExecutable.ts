import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageButton, MessageEmbed } from 'discord.js';
import { IRpgUserSchema } from '../Types';

export default async (ctx: InteractionCommandContext, user: IRpgUserSchema): Promise<void> => {
  const embed = new MessageEmbed()
    .setColor(ctx.data.user.cor)
    .setTitle(ctx.locale('buildings:training_camp.title'))
    .setDescription(ctx.locale('buildings:training_camp.description'));

  const acceptButton = new MessageButton()
    .setCustomId(`${ctx.interaction.id} | JOIN`)
    .setStyle('PRIMARY')
    .setLabel(ctx.locale('buildings:training_camp.join'));

  const notNowButton = new MessageButton()
    .setCustomId(`${ctx.interaction.id} | NEGATE`)
    .setStyle('DANGER')
    .setLabel(ctx.locale('buildings:training_camp.not-now'));

  ctx.editReply({
    embeds: [embed],
    components: [{ type: 'ACTION_ROW', components: [acceptButton, notNowButton] }],
  });
};
