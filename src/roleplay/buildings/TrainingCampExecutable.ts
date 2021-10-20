import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageButton, MessageEmbed } from 'discord.js-light';
import Util from '@utils/Util';
import BolehamBattle from '@roleplay/BolehamBattle';
import { IBattleUser, IRpgUserSchema } from '../Types';
import { resolveCustomId } from '../Utils';

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

  const collected = await Util.collectComponentInteractionWithStartingId(
    ctx.channel,
    ctx.author.id,
    ctx.interaction.id,
    15000,
  );

  if (!collected) {
    ctx.editReply({
      components: [
        {
          type: 'ACTION_ROW',
          components: [
            acceptButton.setDisabled(true).setLabel(ctx.locale('common:timesup')),
            notNowButton.setDisabled(true).setLabel(ctx.locale('common:timesup')),
          ],
        },
      ],
    });
    return;
  }

  if (resolveCustomId(collected.customId) === 'NEGATE') {
    ctx.deleteReply();
    return;
  }

  const inParty = await ctx.client.repositories.rpgRepository.getUserParty(ctx.author.id);

  if (inParty) {
    ctx.editReply({
      components: [],
      embeds: [
        embed.setDescription(ctx.locale('buildings:training_camp.in-party')).setColor('RED'),
      ],
    });
    return;
  }

  ctx.deleteReply();

  const selectedMob = ctx.client.boleham.Battle.getRandomMob(user.level, 2, 1, true);
  const parsedToBattleMob = ctx.client.boleham.Battle.prepareMobForBattle(selectedMob, ctx.i18n);
  const parsedToBattleUser = await ctx.client.boleham.Battle.prepareUserForBattle(user);

  const BattleManager = new BolehamBattle(ctx, [parsedToBattleUser], parsedToBattleMob);
  BattleManager.on('exception', console.error).on('endBattle', (a: IBattleUser[]) =>
    console.log(a[0]),
  );
};
