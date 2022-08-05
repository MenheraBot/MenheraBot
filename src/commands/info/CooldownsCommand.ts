/* eslint-disable no-unused-expressions */
import { MessageEmbed, MessageButton, MessageActionRow, EmbedFieldData } from 'discord.js-light';
import dayjs from 'dayjs';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { actionRow } from '@utils/Util';

export default class CooldownsCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'cooldowns',
      description: '「⌛」・Mostra todos os seus tempos de recarga',
      descriptionLocalizations: { 'en-US': '「⌛」・Shows all your cooldowns' },
      category: 'info',
      cooldown: 5,
      authorDataFields: ['huntCooldown', 'voteCooldown', 'selectedColor'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const canDo = (value: number): boolean => value <= 0;
    const moreThanAnHour = (time: number): boolean => time >= 3600000;

    const createField = (type: string, cooldown: number): EmbedFieldData => ({
      name: ctx.locale(`commands:cooldowns.${type as 'vote'}`),
      value: ctx.locale(
        canDo(cooldown) ? 'commands:cooldowns.no-cooldown' : 'commands:cooldowns.time',
        {
          time: dayjs(cooldown).format(moreThanAnHour(cooldown) ? 'HH:mm:ss' : 'mm:ss'),
          subtime: ctx.locale(moreThanAnHour(cooldown) ? 'common:hours' : 'common:minutes'),
          unix: Math.floor((cooldown + Date.now()) / 1000),
        },
      ),
      inline: false,
    });

    const rpgUser = await ctx.client.repositories.roleplayRepository.findUser(ctx.author.id);

    const huntCooldown = ctx.data.user.huntCooldown - Date.now();
    const voteCooldown = ctx.data.user.voteCooldown - Date.now();
    const dungeonCooldown = rpgUser
      ? (rpgUser.cooldowns.find((a) => a.reason === 'dungeon')?.until ?? 0) - Date.now()
      : 0;

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:cooldowns.title'))
      .setColor(ctx.data.user.selectedColor)
      .addFields([createField('vote', voteCooldown), createField('hunt', huntCooldown)]);

    if (!rpgUser) {
      embed.addField(
        ctx.locale('commands:cooldowns.dungeon'),
        ctx.locale('commands:cooldowns.no-dungeon'),
        false,
      );
    } else embed.addFields(createField('dungeon', dungeonCooldown));

    const components: MessageActionRow[] = [];

    if (voteCooldown < 0) {
      const voteButton = new MessageButton()
        .setStyle('LINK')
        .setURL('https://top.gg/bot/708014856711962654/vote')
        .setLabel(ctx.locale('commands:cooldowns.click-to-vote'));

      components.push(actionRow([voteButton]));
    }

    await ctx.makeMessage({ embeds: [embed], components });
  }
}
