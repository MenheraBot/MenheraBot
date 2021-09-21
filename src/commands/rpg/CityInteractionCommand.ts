import { EmbedFieldData, MessageEmbed, MessageSelectMenu } from 'discord.js-light';
import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { emojis } from '@structures/MenheraConstants';
import Util from '@utils/Util';

export default class CityInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'cidade',
      description: '【ＲＰＧ】Tome ações que você pode fazer na cidade que você está',
      category: 'rpg',
      cooldown: 8,
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const user = await this.client.repositories.rpgRepository.findUser(ctx.author.id);
    if (!user) {
      ctx.replyL('error', 'common:not-registred', {}, true);
      return;
    }

    const buildings = this.client.boleham.Functions.getAllBuildingsFromLocationId(user.locationId);

    const select = new MessageSelectMenu()
      .setCustomId(ctx.interaction.id)
      .setMaxValues(1)
      .setMinValues(1)
      .setPlaceholder(ctx.translate('select'));

    const embed = new MessageEmbed()
      .setTitle(`${emojis.map} | ${ctx.locale(`roleplay:locations.${user.locationId}.name`)}`)
      .setColor(ctx.data.user.cor)
      .setDescription(
        ctx.translate('description', {
          city: ctx.locale(`roleplay:locations.${user.locationId}.name`),
        }),
      )
      .addFields(
        buildings.reduce((p: EmbedFieldData[], c) => {
          const toReturn = {
            name: ctx.locale(`roleplay:buildings.${c.id}.name`),
            value: ctx.locale(`roleplay:buildings.${c.id}.description`),
            inline: true,
          };

          select.addOptions({
            label: ctx.locale(`roleplay:buildings.${c.id}.name`),
            value: `${c.id}`,
            description: ctx.locale(`roleplay:buildings.${c.id}.description`),
          });
          return [...p, toReturn];
        }, []),
      );

    ctx.reply({ embeds: [embed], components: [{ type: 'ACTION_ROW', components: [select] }] });

    const collected = await Util.collectComponentInteractionWithId(
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
            components: [select.setDisabled(true).setPlaceholder(ctx.locale('common:timesup'))],
          },
        ],
      });
      return;
    }
    if (!collected.isSelectMenu()) return;

    const selectedBuild = this.client.boleham.Functions.getBuildingById(
      Number(collected.values[0]),
    );

    if (user.level < selectedBuild.minLevel) {
      ctx.editReply({
        content: `> ${ctx.locale('common:min-level', { level: selectedBuild.minLevel })}`,
        embeds: [],
        components: [],
      });
      return;
    }

    selectedBuild.execute(ctx, user);
  }
}
