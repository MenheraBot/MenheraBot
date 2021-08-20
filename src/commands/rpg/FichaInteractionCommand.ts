import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import {
  EmbedFieldData,
  MessageActionRowComponent,
  MessageButton,
  MessageComponentInteraction,
  MessageEmbed,
  MessageEmbedOptions,
  MessageSelectMenu,
  User,
} from 'discord.js';
import { COLORS, emojis } from '@structures/MenheraConstants';
import Util from '@utils/Util';
import { IRpgUserSchema } from '@structures/roleplay/Types';
import { Document } from 'mongoose';

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
    const userToFind = ctx.options.getUser('user');
    const user = await this.client.repositories.rpgRepository.findUser(
      userToFind?.id ?? ctx.interaction.user.id,
    );

    if (!userToFind && !user) {
      this.registerUser(ctx);
      return;
    }

    if (!user) {
      ctx.replyT('error', 'commands:ficha.non-user');
      return;
    }
    return this.showFicha(ctx, user, ctx.options.getUser('user') ?? ctx.interaction.user);
  }

  async showFicha(
    ctx: InteractionCommandContext,
    user: IRpgUserSchema & Document,
    member: User,
  ): Promise<void> {
    const userClassData = this.client.boleham.Functions.getClassDataById(user.classId);
    const userRaceData = this.client.boleham.Functions.getRaceDataById(user.raceId);

    const translateFromCommand = (field: string, options = {}, namespace = 'commands:ficha') =>
      ctx.locale(`${namespace}.${field}`, options);

    const registerInfoEmbed = {
      title: translateFromCommand('first.title', { user: member.username }),
      color: ctx.data.user.cor,
      image: { url: 'https://i.imgur.com/ooHGEBj.jpg' },
      fields: [
        {
          name: `${emojis.rpg[userClassData.name]} | ${translateFromCommand('first.class')}`,
          value: ctx.locale(`roleplay:classes.${user.classId}.name`),
          inline: true,
        },
        {
          name: `${emojis.rpg[userRaceData.name]} |${translateFromCommand('first.race')}`,
          value: ctx.locale(`roleplay:races.${user.raceId}.name`),
          inline: true,
        },
        {
          name: `${emojis.money} | ${translateFromCommand('first.money')}`,
          value: translateFromCommand('first.money-info', {
            bronze: user.money.bronze,
            silver: user.money.silver,
            gold: user.money.gold,
            emoji_bronze: emojis.roleplay_custom.bronze,
            emoji_silver: emojis.roleplay_custom.silver,
            emoji_gold: emojis.roleplay_custom.gold,
          }),
          inline: true,
        },
        {
          name: `${emojis.pin} | ${translateFromCommand('first.location')}`,
          value: ctx.locale(`roleplay:locations.${user.locationId}.name`),
          inline: true,
        },
        {
          name: `${emojis.trident} | ${translateFromCommand('first.clan')}`,
          value: user.clanId ? `${user.clanId}` : translateFromCommand('first.no-clan'),
          inline: true,
        },
        {
          name: `${emojis.double_hammer} | ${translateFromCommand('first.job')}`,
          value: user.job?.id ? `${user.job.id}` : translateFromCommand('first.no-job'),
          inline: true,
        },
      ],
    };

    const statusEmbed = {
      title: translateFromCommand('second.title', { user: member.username }),
      color: ctx.data.user.cor,
      fields: [
        {
          name: `${emojis.roleplay_custom.level} | ${translateFromCommand('second.level')}`,
          value: `**${user.level}**`,
          inline: true,
        },
        {
          name: `${emojis.blood} | ${translateFromCommand('second.life')}`,
          value: `${user.life} / ${user.maxLife}`,
          inline: true,
        },
        {
          name: `${emojis.mana} | ${translateFromCommand('second.mana')}`,
          value: `${user.mana} / ${user.maxMana}`,
          inline: true,
        },
        {
          name: `${emojis.xp} | ${translateFromCommand('second.xp')}`,
          value: `${user.xp} / ${this.client.boleham.Functions.getMaxXpForLevel(user.level)}`,
          inline: true,
        },
        {
          name: `${emojis.roleplay_custom.tired} | ${translateFromCommand('second.tired')}`,
          value: `${user.tiredness}**%**`,
          inline: true,
        },
        {
          name: `${emojis.sword} | ${translateFromCommand('second.damage')}`,
          value: `${user.baseDamage}`,
          inline: true,
        },
        {
          name: `${emojis.shield} | ${translateFromCommand('second.armor')}`,
          value: `${user.baseArmor}`,
          inline: true,
        },
        {
          name: `${emojis.roleplay_custom.speed} | ${translateFromCommand('second.speed')}`,
          value: `${user.speed}`,
          inline: true,
        },
        {
          name: `${emojis.roleplay_custom.attack_skill} | ${translateFromCommand(
            'second.atkSkill',
          )}`,
          value: `${user.attackSkill}`,
          inline: true,
        },
        {
          name: `${emojis.roleplay_custom.ability_skill} | ${translateFromCommand(
            'second.abtSkill',
          )}`,
          value: `${user.abilitySkill}`,
          inline: true,
        },
        {
          name: `${emojis.roleplay_custom.lucky} | ${translateFromCommand('second.lucky')}`,
          value: `${user.lucky}`,
          inline: true,
        },
      ],
    };

    const abilityEmbed = {
      title: translateFromCommand('third.title', { user: member.username }),
      color: ctx.data.user.cor,
      fields: user.abilities.reduce((p: EmbedFieldData[], c) => {
        const abilityInfo = this.client.boleham.Functions.getAbilityById(c.id);
        const field = {
          name: `${emojis.roleplay_custom[abilityInfo.element]} | ${ctx.locale(
            `roleplay:abilities.${c.id}.name`,
          )}`,
          value: translateFromCommand('third.ability-info', {
            level: c.level,
            xp: c.xp,
            cost: abilityInfo.cost,
            cooldown: abilityInfo.turnsCooldown,
          }),
          inline: true,
        };
        return [...p, field];
      }, []),
    };

    const infoButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | INFO`)
      .setStyle('SECONDARY')
      .setDisabled(true)
      .setLabel(translateFromCommand('info'));

    const statusButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | STATUS`)
      .setStyle('PRIMARY')
      .setLabel(translateFromCommand('status'));

    const abilityButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | ABILITY`)
      .setStyle('PRIMARY')
      .setLabel(translateFromCommand('ability'));

    ctx.reply({
      embeds: [registerInfoEmbed],
      components: [{ type: 'ACTION_ROW', components: [infoButton, statusButton, abilityButton] }],
    });

    const filter = (int: MessageComponentInteraction) =>
      int.customId.startsWith(ctx.interaction.id) && int.user.id === ctx.interaction.user.id;

    if (!ctx.interaction.channel) return;

    const collector = ctx.interaction.channel.createMessageComponentCollector({
      filter,
      componentType: 'BUTTON',
      time: 30000,
      max: 3,
    });

    collector.on('end', () => {
      ctx.editReply({
        components: [
          {
            type: 'ACTION_ROW',
            components: [
              infoButton.setDisabled(true).setLabel(ctx.locale('common:timesup')),
              statusButton.setDisabled(true).setLabel(ctx.locale('common:timesup')),
              abilityButton.setDisabled(true).setLabel(ctx.locale('common:timesup')),
            ],
          },
        ],
      });
    });

    collector.on('collect', (int) => {
      int.deferUpdate();
      let toSendEmbed: MessageEmbedOptions = registerInfoEmbed;
      let toSendComponents: MessageActionRowComponent[] = [];
      switch (int.customId.replace(`${ctx.interaction.id} | `, '')) {
        case 'STATUS':
          toSendEmbed = statusEmbed;
          toSendComponents = [
            infoButton.setDisabled(false).setStyle('PRIMARY'),
            statusButton.setDisabled(true).setStyle('SECONDARY'),
            abilityButton.setDisabled(false).setStyle('PRIMARY'),
          ];
          break;
        case 'INFO':
          toSendEmbed = registerInfoEmbed;
          toSendComponents = [
            infoButton.setDisabled(true).setStyle('SECONDARY'),
            statusButton.setDisabled(false).setStyle('PRIMARY'),
            abilityButton.setDisabled(false).setStyle('PRIMARY'),
          ];
          break;
        case 'ABILITY':
          toSendEmbed = abilityEmbed;
          toSendComponents = [
            infoButton.setDisabled(false).setStyle('PRIMARY'),
            statusButton.setDisabled(false).setStyle('PRIMARY'),
            abilityButton.setDisabled(true).setStyle('SECONDARY'),
          ];
          break;
      }

      ctx.editReply({
        embeds: [toSendEmbed],
        components: [{ type: 'ACTION_ROW', components: toSendComponents }],
      });
    });
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

    const initialData = this.client.boleham.Functions.getDataToRegister(
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
