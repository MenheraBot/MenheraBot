import { ApplicationCommandOptionTypes } from 'discordeno/types';

import userThemesRepository from '../../database/repositories/userThemesRepository';
import { COLORS, EMOJIS } from '../../structures/constants';
import { createEmbed } from '../../utils/discord/embedUtils';
import { randomFromArray, toWritableUtf } from '../../utils/miscUtils';
import { createCommand } from '../../structures/command/createCommand';
import { VanGoghEndpoints, vanGoghRequest } from '../../utils/vanGoghRequest';

const EighballAnswers: Array<{ id: number; type: 'positive' | 'neutral' | 'negative' }> = [
  {
    id: 0,
    type: 'positive',
  },
  {
    id: 1,
    type: 'positive',
  },
  {
    id: 2,
    type: 'positive',
  },
  {
    id: 3,
    type: 'positive',
  },
  {
    id: 4,
    type: 'positive',
  },
  {
    id: 5,
    type: 'positive',
  },
  {
    id: 6,
    type: 'positive',
  },
  {
    id: 7,
    type: 'positive',
  },
  {
    id: 8,
    type: 'positive',
  },
  {
    id: 9,
    type: 'positive',
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
  {
    id: 20,
    type: 'positive',
  },
  {
    id: 21,
    type: 'neutral',
  },
  {
    id: 22,
    type: 'negative',
  },
  {
    id: 23,
    type: 'negative',
  },
  {
    id: 24,
    type: 'positive',
  },
  {
    id: 25,
    type: 'positive',
  },
  {
    id: 26,
    type: 'negative',
  },
  {
    id: 27,
    type: 'negative',
  },
  {
    id: 28,
    type: 'negative',
  },
  {
    id: 29,
    type: 'neutral',
  },
  {
    id: 30,
    type: 'neutral',
  },
];

const EightballCommand = createCommand({
  path: '',
  name: '8ball',
  description: '「🎱」・Faça uma pergunta de resposta Sim/Não para a Menhera',
  descriptionLocalizations: { 'en-US': '「🎱」・Ask Menhera a Yes/No answer question' },
  options: [
    {
      name: 'pergunta',
      nameLocalizations: { 'en-US': 'question' },
      description: 'Pergunta para ser feita',
      descriptionLocalizations: { 'en-US': 'Question to be asked' },
      type: ApplicationCommandOptionTypes.String,
      required: true,
    },
  ],
  category: 'fun',
  authorDataFields: [],
  execute: async (ctx, finishCommand) => {
    const randomAnswer = randomFromArray(EighballAnswers) as { id: 0; type: 'positive' };

    const question = ctx.getOption<string>('pergunta', false, true);

    await ctx.defer();

    const [backgroundTheme, textBoxTheme, menheraTheme] =
      await userThemesRepository.getThemesForEightBall(ctx.author.id);

    const res = await vanGoghRequest(VanGoghEndpoints.EightBall, {
      question,
      answer: ctx.locale(`commands:8ball.answers.${randomAnswer.id}`),
      type: randomAnswer.type,
      username: toWritableUtf(ctx.author.username),
      backgroundTheme,
      menheraTheme,
      textBoxTheme,
    });

    const embed = createEmbed({
      title: `${EMOJIS.question} | ${ctx.locale('commands:8ball.ask')}`,
      footer: { text: ctx.locale('commands:8ball.themes') },
    });

    if (res.err) {
      embed.fields = [
        {
          name: ctx.locale('commands:8ball.question'),
          value: question,
        },
        {
          name: ctx.locale('commands:8ball.answer'),
          value: ctx.locale(`commands:8ball.answers.${randomAnswer.id}`),
        },
      ];
      embed.color = COLORS.Aqua;
      embed.footer = { text: ctx.locale('common:http-error') };

      await ctx.makeMessage({ embeds: [embed] });
      return finishCommand();
    }

    embed.image = { url: `attachment://bola-oititcho.png` };
    embed.color = COLORS.Purple;

    await ctx.makeMessage({
      embeds: [embed],
      file: {
        name: `bola-oititcho.png`,
        blob: res.data,
      },
    });

    finishCommand();
  },
});

export default EightballCommand;
