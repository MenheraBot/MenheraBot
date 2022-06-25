import { COLORS, EightBallAnswers, emojis } from '@structures/Constants';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed, MessageAttachment } from 'discord.js-light';
import { VangoghRoutes, requestVangoghImage } from '@utils/VangoghRequests';
import { toWritableUTF } from '@utils/Util';

export default class EightballCommand extends InteractionCommand {
  constructor() {
    super({
      name: '8ball',
      description: '「🎱」・Faça uma pergunta de resposta Sim/Não para a Menhera',
      descriptionLocalizations: { 'en-US': '「🎱」・Ask Menhera a Yes/No answer question' },
      options: [
        {
          name: 'pergunta',
          nameLocalizations: { 'en-US': 'question' },
          description: 'Pergunta para ser feita',
          descriptionLocalizations: { 'en-US': 'Question to be asked' },
          type: 'STRING',
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

    const res = await requestVangoghImage(
      VangoghRoutes.EightBall,
      {
        question: ctx.options.getString('pergunta', true),
        answer: ctx.locale(`commands:8ball.answers.${randomAnswer.id as 1}`),
        type: randomAnswer.type,
        username: toWritableUTF(ctx.author.username),
      },
      ctx,
    );

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
        .setColor(COLORS.Aqua)
        .setFooter({ text: ctx.locale('common:http-error') });

      await ctx.defer({ embeds: [embed] });
      return;
    }

    embed.setImage('attachment://8ball.png').setColor(COLORS.Purple);
    await ctx.defer({ embeds: [embed], files: [new MessageAttachment(res.data, '8ball.png')] });
  }
}
