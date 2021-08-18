/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-param-reassign */
import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed, MessageSelectMenu } from 'discord.js';
import { COLORS, emojis } from '@structures/MenheraConstants';
import Util from '@utils/Util';

export default class BicudaInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'ficha',
      description: '【ＲＰＧ】Mostra a ficha de seu personagem | Registra-se no Rpg.',
      category: 'rpg',
      options: [
        {
          name: 'user',
          description: 'Usuário para ver a ficha',
          type: 'USER',
          required: false,
        },
      ],
      cooldown: 10,
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const user = await this.client.repositories.rpgRepository.findUser(ctx.interaction.user.id);

    if (!user) {
      this.registerUser(ctx);
      return;
    }
    return this.showFicha(ctx);
  }

  async showFicha(ctx: InteractionCommandContext): Promise<void> {
    const user = ctx.options.getUser('user') ?? ctx.interaction.user;

    const embed = new MessageEmbed()
      .setTitle('SEXO?')
      .setDescription(`TUA CLASSE E COISAS ASSIM TLG${this.client.ws.ping} ${user.toString()}`);

    ctx.reply({ embeds: [embed] });
  }

  async registerUser(ctx: InteractionCommandContext): Promise<void> {
    let text = `${ctx.locale('commands:ficha.register.description')}\n`;

    const SelectOption = new MessageSelectMenu()
      .setCustomId(ctx.interaction.id)
      .setMinValues(1)
      .setMaxValues(1)
      .setPlaceholder(ctx.locale('commands:ficha.register.select-class'));

    this.client.boleham.Classes.forEach((cls) => {
      SelectOption.addOptions({
        label: ctx.locale(`roleplay:classes.${cls[0]}.name`),
        value: cls[0],
        emoji: emojis.rpg[cls[1].name],
      });
      text += `\n${emojis.rpg[cls[1].name]} | **${ctx.locale(
        `roleplay:classes.${cls[0]}.name`,
      )}** - ${ctx.locale(`roleplay:classes.${cls[0]}.description`)}\n`;
    });

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:ficha.register.title'))
      .setColor(COLORS.Pear)
      .setThumbnail(ctx.interaction.user.displayAvatarURL())
      .setDescription(text);

    ctx.reply({
      embeds: [embed],
      components: [{ type: 'ACTION_ROW', components: [SelectOption] }],
    });

    const classCollected = await Util.collectComponentInteractionWithId(
      ctx.channel,
      ctx.interaction.user.id,
      ctx.interaction.id,
      90000,
    );

    if (!classCollected) {
      ctx.editReply({
        components: [
          {
            type: 'ACTION_ROW',
            components: [
              SelectOption.setDisabled(true).setPlaceholder(ctx.locale('common:timesup')),
            ],
          },
        ],
      });
      return;
    }

    if (!classCollected.isSelectMenu()) return;
    const choosedClass = classCollected.values[0];

    const selectRace = new MessageSelectMenu()
      .setCustomId(ctx.interaction.id)
      .setMinValues(1)
      .setMaxValues(1)
      .setPlaceholder(ctx.locale('commands:ficha.register.select-race'));

    text = `${ctx.locale('commands:ficha.register.description')}\n`;

    this.client.boleham.Races.forEach((cls) => {
      selectRace.addOptions({
        label: ctx.locale(`roleplay:races.${cls[0]}.name`),
        value: cls[0],
        emoji: emojis.rpg[cls[1].name],
      });
      text += `\n${emojis.rpg[cls[1].name]} | **${ctx.locale(
        `roleplay:races.${cls[0]}.name`,
      )}** - ${ctx.locale(`roleplay:races.${cls[0]}.description`)}\n`;
    });

    embed.setDescription(text).setColor(COLORS.HuntGiant);

    ctx.editReply({
      embeds: [embed],
      components: [{ type: 'ACTION_ROW', components: [selectRace] }],
    });

    const raceCollected = await Util.collectComponentInteractionWithId(
      ctx.channel,
      ctx.interaction.user.id,
      ctx.interaction.id,
      90000,
    );

    if (!raceCollected) {
      ctx.editReply({
        components: [
          {
            type: 'ACTION_ROW',
            components: [selectRace.setDisabled(true).setPlaceholder(ctx.locale('common:timesup'))],
          },
        ],
      });
      return;
    }
    if (!raceCollected.isSelectMenu()) return;
    const choosedRace = raceCollected.values[0];

    const initialData = this.client.boleham.basicFunction.getDataToRegister(
      ctx.interaction.user.id,
      choosedClass,
      choosedRace,
    );

    const created = await this.client.repositories.rpgRepository.createUser(initialData);
    if (!created) {
      ctx.editReply({
        embeds: [],
        components: [],
        content: ctx.locale('commands:ficha.register.error'),
      });
      return;
    }
    ctx.editReply({
      embeds: [],
      components: [],
      content: ctx.locale('commands:ficha.register.done'),
    });
  }
}
