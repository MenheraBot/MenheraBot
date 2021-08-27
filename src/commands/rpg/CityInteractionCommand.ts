import { EmbedFieldData, MessageEmbed, MessageSelectMenu } from 'discord.js';
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
    const user = await this.client.repositories.rpgRepository.findUser(ctx.interaction.user.id);
    if (!user) {
      ctx.replyT('error', 'common:not-registred');
      return;
    }

    const buildings = this.client.boleham.Functions.getAllBuildingsFromLocationId(user.locationId);

    const select = new MessageSelectMenu()
      .setCustomId(ctx.interaction.id)
      .setMaxValues(1)
      .setMinValues(1)
      .setPlaceholder(ctx.locale('commands:cidade.select'));

    const embed = new MessageEmbed()
      .setTitle(`${emojis.map} | ${ctx.locale(`roleplay:locations.${user.locationId}.name`)}`)
      .setColor(ctx.data.user.cor)
      .setDescription(
        ctx.locale('commands:cidade.description', {
          city: ctx.locale(`roleplay:locations.${user.locationId}.name`),
        }),
      )
      .addFields(
        buildings.reduce((p: EmbedFieldData[], c) => {
          const toReturn = {
            name: ctx.locale(`roleplay:buildings.${c[0]}.name`),
            value: ctx.locale(`roleplay:buildings.${c[0]}.description`),
            inline: true,
          };

          select.addOptions({
            label: ctx.locale(`roleplay:buildings.${c[0]}.name`),
            value: c[0],
            description: ctx.locale(`roleplay:buildings.${c[0]}.description`),
          });
          return [...p, toReturn];
        }, []),
      );

    ctx.reply({ embeds: [embed], components: [{ type: 'ACTION_ROW', components: [select] }] });

    const collected = await Util.collectComponentInteractionWithId(
      ctx.channel,
      ctx.interaction.user.id,
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

    const selectedBuild = this.client.boleham.Functions.getBuildingById(collected.values[0]);

    selectedBuild.execute(ctx, user);
  }
}
