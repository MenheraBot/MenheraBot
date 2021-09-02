import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js';
import MenheraClient from 'MenheraClient';

export default class PartyInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'party',
      description:
        '【ＲＰＧ】Inicie um grupo com pessoas da sua localização para irem à uma batalha contra monstros',
      category: 'rpg',
      options: [
        {
          name: 'user_one',
          description: 'Primeiro usuário da party',
          type: 'USER',
          required: false,
        },
        {
          name: 'user_two',
          description: 'Segundo usuário da party',
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
      ctx.replyT('error', 'common:not-registred');
      return;
    }

    // Todo

    const userParty = await this.client.repositories.rpgRepository.getUserParty(user.id);
    const userOne = ctx.options.getUser('user_one');
    const userTwo = ctx.options.getUser('user_two');

    if (!userParty && !userOne && !userTwo) {
      ctx.replyT('error', 'party.no-mention');
      return;
    }

    const embed = new MessageEmbed().setTitle(ctx.translate('title')).setColor(ctx.data.user.cor);

    if (userParty) {
      embed.setDescription(ctx.translate('description'));
      userParty.map(async (a) => {
        embed.addField('a', a);
      });

      ctx.editReply({ embeds: [embed], components: [{ type: 'ACTION_ROW', components: [] }] });
    }
  }
}
