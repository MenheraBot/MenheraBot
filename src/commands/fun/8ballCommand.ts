import { COLORS, EightBallAnswers, emojis } from '@structures/Constants';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed, MessageAttachment } from 'discord.js-light';
import HttpRequests from '@utils/HTTPrequests';

export default class EightballCommand extends InteractionCommand {
  constructor() {
    super({
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
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    await ctx.defer();

    const randomAnswer = EightBallAnswers[Math.floor(Math.random() * EightBallAnswers.length)];

    const res = ctx.client.picassoWs.isAlive
      ? await ctx.client.picassoWs.makeRequest({
          type: '8ball',
          id: ctx.interaction.id,
          data: {
            question: ctx.options.getString('pergunta', true),
            answer: ctx.locale(`commands:8ball.answers.${randomAnswer.id as 1}`),
            type: randomAnswer.type,
            username: ctx.author.username,
          },
        })
      : await HttpRequests.EightballRequest({
          answer: ctx.locale(`commands:8ball.answers.${randomAnswer.id as 1}`),
          question: ctx.options.getString('pergunta', true),
          type: randomAnswer.type,
          username: ctx.author.username,
        });

    const embed = new MessageEmbed().setTitle(
      `${emojis.question} | ${ctx.locale('commands:8ball.ask')}`,
    );

    if (res.err) {
      embed
        .addFields([
          {
            name: ctx.locale('commands:8ball.question'),
            value: `${ctx.options.getString('pergunta', true)}`,
          },
          {
            name: ctx.locale('commands:8ball.answer'),
            value: ctx.locale(`commands:8ball.answers.${randomAnswer.id as 1}`),
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
