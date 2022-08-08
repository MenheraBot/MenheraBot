import { makeCloseCommandButton, makeCooldown } from '@roleplay/utils/AdventureUtils';
import { getUserMaxLife, getUserMaxMana } from '@roleplay/utils/Calculations';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import Util, {
  actionRow,
  disableComponents,
  makeCustomId,
  moreThanAnHour,
  resolveCustomId,
} from '@utils/Util';
import { MessageButton, MessageEmbed } from 'discord.js-light';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

export const BASE_LIFE_PER_CICLE = 167;
export const MAX_USER_LIFE_TO_MULTIPLY = 800;
export const BASE_MANA_PER_CICLE = 100;
export const MAX_USER_MANA_TO_MULTIPLY = 600;
export const CICLE_DURATION_IN_MINUTES = 60;
const MINUTES_COOLDOWN_TO_RECHURCH = 45;

export default class ChurchCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'igreja',
      nameLocalizations: { 'en-US': 'church' },
      description: '【ＲＰＧ】⛪ | Vá para a Igreja da Capital',
      descriptionLocalizations: { 'en-US': '【ＲＰＧ】⛪ | Go to Capital Church' },
      category: 'roleplay',
      cooldown: 7,
      authorDataFields: ['selectedColor'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const user = await ctx.client.repositories.roleplayRepository.findUser(ctx.author.id);
    if (!user) {
      ctx.makeMessage({ content: ctx.prettyResponse('error', 'common:unregistered') });
      return;
    }

    const inChurch = user.cooldowns.find((a) => a.reason === 'church');

    if (inChurch && inChurch.data === 'COOLDOWN' && inChurch.until > Date.now()) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:igreja.cooldown', {
          time: dayjs.duration(inChurch.until - Date.now()).format('mm:ss'),
        }),
      });
      return;
    }

    if (inChurch && inChurch.data === 'DEATH' && inChurch.until > Date.now()) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:igreja.death', {
          time: dayjs
            .duration(inChurch.until - Date.now())
            .format(moreThanAnHour(inChurch.until) ? 'HH:mm:ss' : 'mm:ss'),
          subtime: ctx.locale(moreThanAnHour(inChurch.until) ? 'common:hours' : 'common:minutes'),
        }),
      });
      return;
    }

    if (inChurch && inChurch.data === 'DEATH' && inChurch.until <= Date.now()) {
      user.cooldowns.splice(
        user.cooldowns.findIndex((a) => a.reason === 'church' && a.data === 'DEATH'),
        1,
      );

      await ctx.client.repositories.roleplayRepository.updateUser(ctx.author.id, {
        cooldowns: user.cooldowns,
        life: getUserMaxLife(user),
        mana: getUserMaxMana(user),
      });

      ctx.makeMessage({
        content: ctx.prettyResponse('success', 'commands:igreja.back-from-death', {
          user: ctx.author.username,
        }),
      });
      return;
    }

    const userMaxLife = getUserMaxLife(user);
    const userMaxMana = getUserMaxMana(user);
    const lifePerCicle =
      BASE_LIFE_PER_CICLE +
      Math.floor(userMaxLife / MAX_USER_LIFE_TO_MULTIPLY) * BASE_LIFE_PER_CICLE;

    const manaPerCicle =
      BASE_MANA_PER_CICLE +
      Math.floor(userMaxMana / MAX_USER_MANA_TO_MULTIPLY) * BASE_MANA_PER_CICLE;

    const prayToMaxLife = ((userMaxLife - user.life) * CICLE_DURATION_IN_MINUTES) / lifePerCicle;
    const prayToMaxMana = ((userMaxMana - user.mana) * CICLE_DURATION_IN_MINUTES) / manaPerCicle;

    const prayToMaximize = Math.max(prayToMaxLife, prayToMaxMana);

    if (prayToMaximize < 10) {
      ctx.makeMessage({ content: ctx.prettyResponse('error', 'commands:igreja.healthy') });
      return;
    }

    const embed = new MessageEmbed()
      .setColor(ctx.data.user.selectedColor)
      .setThumbnail(ctx.author.displayAvatarURL({ dynamic: true }))
      .setTitle(ctx.prettyResponse('church', 'commands:igreja.title'))
      .setDescription(
        ctx.locale('commands:igreja.description', {
          cooldown: CICLE_DURATION_IN_MINUTES,
          subtime: ctx.locale('common:minutes'),
          life: lifePerCicle,
          mana: manaPerCicle,
          rechurch: MINUTES_COOLDOWN_TO_RECHURCH,
          untilCooldown: dayjs
            .duration(Math.floor(prayToMaximize * 60000))
            .format(prayToMaximize >= 60 ? 'HH:mm:ss' : 'mm:ss'),
          untilSubtime: ctx.locale(prayToMaximize > 60 ? 'common:hours' : 'common:minutes'),
        }),
      );

    const [prayCustomId, customIdBase] = makeCustomId('BUTTON');

    const prayButton = new MessageButton()
      .setCustomId(prayCustomId)
      .setStyle('PRIMARY')
      .setLabel(ctx.locale('commands:igreja.pray'));

    const exitButton = makeCloseCommandButton(customIdBase, ctx.i18n);

    const GratherThanAnHour = (time: number): boolean => time >= 3600000;

    if (inChurch && inChurch.data !== 'COOLDOWN') {
      const inChurchFor = Date.now() - (inChurch.data as number);
      embed.addField(
        ctx.prettyResponse('crown', 'commands:igreja.praying'),
        ctx.locale('commands:igreja.praying-description', {
          cooldown: dayjs
            .duration(inChurchFor)
            .format(GratherThanAnHour(inChurchFor) ? 'HH:mm:ss' : 'mm:ss'),
          subtime: ctx.locale(GratherThanAnHour(inChurchFor) ? 'common:hours' : 'common:minutes'),
          life: Math.min(
            Math.floor((inChurchFor / (CICLE_DURATION_IN_MINUTES * 60000)) * lifePerCicle),
            userMaxLife,
          ),
          mana: Math.min(
            Math.floor((inChurchFor / (CICLE_DURATION_IN_MINUTES * 60000)) * manaPerCicle),
            userMaxMana,
          ),
        }),
      );
      prayButton.setLabel(ctx.locale('commands:igreja.stop')).setStyle('DANGER');
    }

    ctx.makeMessage({ embeds: [embed], components: [actionRow([prayButton, exitButton])] });

    const selected = await Util.collectComponentInteractionWithStartingId(
      ctx.channel,
      ctx.author.id,
      customIdBase,
      12000,
    );

    if (!selected) {
      ctx.makeMessage({
        components: [actionRow(disableComponents(ctx.locale('common:timesup'), [prayButton]))],
      });
      return;
    }

    if (resolveCustomId(selected.customId) === 'CLOSE_COMMAND') {
      ctx.deleteReply();
      return;
    }

    if (inChurch && inChurch.data !== 'COOLDOWN') {
      const inChurchFor = Date.now() - (inChurch.data as number);
      const life = Math.floor((inChurchFor / (CICLE_DURATION_IN_MINUTES * 60000)) * lifePerCicle);
      const prayedLife = Math.min(life + user.life, userMaxLife);
      const mana = Math.floor((inChurchFor / (CICLE_DURATION_IN_MINUTES * 60000)) * manaPerCicle);
      const prayedMana = Math.min(mana + user.mana, userMaxMana);

      makeCooldown(user.cooldowns, {
        reason: 'church',
        data: 'COOLDOWN',
        until: Date.now() + 1000 * 60 * MINUTES_COOLDOWN_TO_RECHURCH,
      });

      await ctx.client.repositories.roleplayRepository.updateUser(ctx.author.id, {
        life: prayedLife,
        mana: prayedMana,
        cooldowns: user.cooldowns,
      });

      ctx.makeMessage({
        embeds: [],
        components: [],
        content: ctx.prettyResponse('success', 'commands:igreja.prayed', {
          life: prayedLife,
          mana: prayedMana,
        }),
      });
      return;
    }

    await ctx.client.repositories.roleplayRepository.updateUser(ctx.author.id, {
      cooldowns: makeCooldown(user.cooldowns, {
        reason: 'church',
        until: Infinity,
        data: Date.now(),
      }),
    });

    ctx.makeMessage({
      embeds: [],
      components: [],
      content: ctx.prettyResponse('success', 'commands:igreja.enter-pray'),
    });
  }
}
