import MenheraClient from 'MenheraClient';
import { COLORS, EightBallAnswers, emojis } from '@structures/MenheraConstants';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed, MessageAttachment } from 'discord.js-light';
import HttpRequests from '@utils/HTTPrequests';

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
    await ctx.defer();

    const randomAnswer = EightBallAnswers[Math.floor(Math.random() * EightBallAnswers.length)];

    const res = this.client.picassoWs.isAlive
      ? await this.client.picassoWs.makeRequest({
          type: '8ball',
          id: ctx.interaction.id,
          data: { question: ctx.translate(`answers.${randomAnswer.id}`), type: randomAnswer.type },
        })
      : await HttpRequests.EightballRequest(
          ctx.translate(`answers.${randomAnswer.id}`),
          randomAnswer.type,
        );

    const embed = new MessageEmbed().setTitle(`${emojis.question} | ${ctx.translate('ask')}`);
    if (res.err) {
      embed
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

      await ctx.defer({ embeds: [embed] });
      return;
    }

    embed.setImage('attachment://8ball.png').setColor(COLORS.Purple);
    await ctx.defer({ embeds: [embed], files: [new MessageAttachment(res.data, '8ball.png')] });
  }
}
