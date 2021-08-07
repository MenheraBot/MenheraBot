import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageAttachment, MessageEmbed, User } from 'discord.js';
import HttpRequests from '@utils/HTTPrequests';

export default class HumorInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'ship',
      description: '「❤️」・Mostra o valor do ship de um casal',
      options: [
        {
          name: 'user',
          type: 'USER',
          description: 'Primeiro usuário',
          required: true,
        },
        {
          name: 'user_dois',
          type: 'USER',
          description: 'Segundo usuário. Caso não seja passado, o ship será feio com você',
          required: false,
        },
      ],
      category: 'fun',
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    if (!ctx.interaction.guild) return;

    const user1 = ctx.args[0].user as User;
    const user2 = ctx.args[1]?.user ?? ctx.interaction.user;

    if (!user1) {
      await ctx.replyT('error', 'commands:ship.unknow-user', {}, true);
      return;
    }

    if (!user2) {
      await ctx.replyT('error', 'commands:ship.unknow-user', {}, true);
      return;
    }

    const dbUserToTakeValue1 = await this.client.repositories.userRepository.find(user1.id);
    const dbUserToTakeValue2 = await this.client.repositories.userRepository.find(user2.id);

    const FinalValue1 = dbUserToTakeValue1?.shipValue
      ? dbUserToTakeValue1.shipValue
      : Math.floor(Math.random() * 55);
    const FinalValue2 = dbUserToTakeValue2?.shipValue
      ? dbUserToTakeValue2.shipValue
      : Math.floor(Math.random() * 55);

    let value = Number(FinalValue1) + Number(FinalValue2);
    if (Number(value) >= 100) {
      value = 100;
    }

    if (dbUserToTakeValue1?.casado && dbUserToTakeValue1?.casado === user2.id) value = 100;

    const avatarLinkOne = user1.displayAvatarURL({ format: 'png', size: 256 });
    const avatarLinkTwo = user2.displayAvatarURL({ format: 'png', size: 256 });
    const bufferedShipImage = await HttpRequests.shipRequest(avatarLinkOne, avatarLinkTwo, value);

    const member1 = ctx.interaction.guild.members.cache.get(user1.id);
    const member2 = ctx.interaction.guild.members.cache.get(user2.id);

    const name1 = member1 && member1?.nickname ? member1.nickname : user1.username;
    const name2 = member2 && member2?.nickname ? member2.nickname : user2.username;
    const mix = `${
      name1.substring(0, name1.length / 2) + name2.substring(name2.length / 2, name2.length)
    }`.replace(' ', '');

    const embed = new MessageEmbed()
      .setTitle(`${name1} + ${name2} = ${mix}`)
      .setDescription(
        `\n${ctx.locale('commands:ship.value')} **${value.toString()}%**\n\n${ctx.locale(
          'commands:ship.default',
        )}`,
      );

    let attc: MessageAttachment | null = null;

    if (!bufferedShipImage.err) {
      attc = new MessageAttachment(Buffer.from(bufferedShipImage.data as Buffer), 'ship.png');
      embed.setImage('attachment://ship.png');
    } else embed.setFooter(ctx.locale('commands:http-error'));

    if (Number(value) >= 25)
      embed
        .setColor('#cadf2a')
        .setDescription(
          `\n${ctx.locale('commands:ship.value')} **${value.toString()}%**\n\n${ctx.locale(
            'commands:ship.low',
          )}`,
        );
    if (Number(value) >= 50)
      embed
        .setColor('#d8937b')
        .setDescription(
          `\n${ctx.locale('commands:ship.value')} **${value.toString()}%**\n\n${ctx.locale(
            'commands:ship.ok',
          )}`,
        );
    if (Number(value) >= 75)
      embed
        .setColor('#f34a4a')
        .setDescription(
          `\n${ctx.locale('commands:ship.value')} **${value.toString()}%**\n\n${ctx.locale(
            'commands:ship.medium',
          )}`,
        );
    if (Number(value) >= 99)
      embed
        .setColor('#ec2c2c')
        .setDescription(
          `\n${ctx.locale('commands:ship.value')} **${value.toString()}%**\n\n${ctx.locale(
            'commands:ship.high',
          )}`,
        );
    if (Number(value) === 100)
      embed
        .setColor('#ff00df')
        .setDescription(
          `\n${ctx.locale('commands:ship.value')} **${value.toString()}%**\n\n${ctx.locale(
            'commands:ship.perfect',
          )}`,
        );

    if (attc)
      await ctx.reply({
        content: `**${ctx.locale('commands:ship.message-start')}**`,
        embeds: [embed],
        files: [attc],
      });
    else
      await ctx.reply({
        content: `**${ctx.locale('commands:ship.message-start')}**`,
        embeds: [embed],
      });
  }
}
