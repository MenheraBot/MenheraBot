import MenheraClient from 'MenheraClient';
import { COLORS } from '@structures/MenheraConstants';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js-light';

export default class EightballInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
      name: '8ball',
      description: '「🎱」・Faça uma pergunta de resposta Sim/Não para a Menhera',
      options: [
        {
          name: 'pergunta',
          type: 'STRING',
          description: 'Pergunta para ser feita',
          required: true,
        },
      ],
      category: 'fun',
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    type TAnsweTypes = 'negative' | 'afirmative' | 'neutral';
    const answers: { id: number; type: TAnsweTypes }[] = [
      {
        id: 0,
        type: 'afirmative',
      },
      {
        id: 1,
        type: 'afirmative',
      },
      {
        id: 2,
        type: 'afirmative',
      },
      {
        id: 3,
        type: 'afirmative',
      },
      {
        id: 4,
        type: 'afirmative',
      },
      {
        id: 5,
        type: 'afirmative',
      },
      {
        id: 6,
        type: 'afirmative',
      },
      {
        id: 7,
        type: 'afirmative',
      },
      {
        id: 8,
        type: 'afirmative',
      },
      {
        id: 9,
        type: 'afirmative',
      },
      {
        id: 10,
        type: 'negative',
      },
      {
        id: 11,
        type: 'negative',
      },
      {
        id: 12,
        type: 'negative',
      },
      {
        id: 13,
        type: 'negative',
      },
      {
        id: 14,
        type: 'negative',
      },
      {
        id: 15,
        type: 'neutral',
      },
      {
        id: 16,
        type: 'neutral',
      },
      {
        id: 17,
        type: 'neutral',
      },
      {
        id: 18,
        type: 'neutral',
      },
      {
        id: 19,
        type: 'neutral',
      },
    ];
    const randomAnswer = answers[Math.floor(Math.random() * answers.length)];

    const embed = new MessageEmbed()
      .addFields([
        {
          name: ctx.translate('question'),
          value: `${ctx.options.getString('pergunta', true)}`,
        },
        {
          name: ctx.translate('answer'),
          value: ctx.translate(`answers.${randomAnswer.id}`),
        },
      ])
      .setColor(COLORS.Aqua);

    await ctx.reply({ embeds: [embed] });
  }
}
