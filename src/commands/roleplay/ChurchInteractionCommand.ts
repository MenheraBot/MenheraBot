import { getUserMaxLife, getUserMaxMana } from '@roleplay/utils/Calculations';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { actionRow } from '@utils/Util';
import { MessageButton, MessageEmbed } from 'discord.js-light';
import moment from 'moment';

const BASE_LIFE_PER_CICLE = 167;
const BASE_MANA_PER_CICLE = 100;
const CICLE_DURATION_IN_MINUTES = 60;

export default class ChurchInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'igreja',
      description: '【ＲＰＧ】Vá para a Igreja da Capital',
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

    const userMaxLife = getUserMaxLife(user);
    const userMaxMana = getUserMaxMana(user);

    const lifePerCicle = BASE_LIFE_PER_CICLE + Math.floor(userMaxLife / 1000) * BASE_LIFE_PER_CICLE;

    const manaPerCicle = BASE_MANA_PER_CICLE + Math.floor(userMaxMana / 700) * BASE_MANA_PER_CICLE;

    const prayToMaxLife = ((userMaxLife - user.life) * CICLE_DURATION_IN_MINUTES) / lifePerCicle;
    const prayToMaxMana = ((userMaxMana - user.mana) * CICLE_DURATION_IN_MINUTES) / manaPerCicle;

    const prayToMaximize = prayToMaxLife > prayToMaxMana ? prayToMaxLife : prayToMaxMana;

    const embed = new MessageEmbed()
      .setColor(ctx.data.user.selectedColor)
      .setTitle(ctx.prettyResponse('church', 'commands:igreja.title'))
      .setDescription(
        ctx.locale('commands:igreja.description', {
          cooldown: CICLE_DURATION_IN_MINUTES,
          subtime: ctx.locale('common:minutes'),
          life: lifePerCicle,
          mana: manaPerCicle,
          untilCooldown: moment
            .utc(Math.floor(prayToMaximize * 60000))
            .format(prayToMaximize > 60 ? 'HH:mm:ss' : 'mm:ss'),
          untilSubtime: ctx.locale(prayToMaximize > 60 ? 'common:hours' : 'common:minutes'),
        }),
      );

    const prayButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | PRAY`)
      .setStyle('PRIMARY')
      .setLabel(ctx.locale('commands:igreja.pray'));

    ctx.makeMessage({ embeds: [embed], components: [actionRow([prayButton])] });
  }
}
