import CommandContext from '@structures/CommandContext';
import MenheraClient from 'MenheraClient';
import Command from '@structures/Command';

export default class EightBallCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: '8ball',
      category: 'diversão',
    });
  }

  async run(ctx: CommandContext) {
    if (ctx.args.length < 1) return ctx.replyT('error', 'commands:8ball.no-args');

    const lingua = ctx.data.server.lang || 'pt-BR';

    const respostasPT = [
      '<:positivo:759603958485614652> | Acho que sim',
      '<:negacao:759603958317711371> | Provavelmente não',
      '<:positivo:759603958485614652> | Com toda certeza do universo',
      '<:negacao:759603958317711371> | Meus circuitos me fazem crer que isso é impossível',
      '<:positivo:759603958485614652> | Se pá que sim',
      '<:positivo:759603958485614652> | Nada é impossivel né maninho 😉',
      '<:positivo:759603958485614652> | Sim <:ok:727975974125436959>',
      '<:negacao:759603958317711371> | Não ;(',
      '<:positivo:759603958485614652> | Talvez ',
      '<:positivo:759603958485614652> | Rola um D20 pra ver isso aí',
      '<:positivo:759603958485614652> | Sim sim sim sim SIM SIM SIIIIM!!!!',
      '<:positivo:759603958485614652> | Kkk tu ainda pergunta?',
      '<:negacao:759603958317711371> | Ah cara, eu não queria te falar, mas não',
      '<:positivo:759603958485614652> | Também queria saber',
      '<:positivo:759603958485614652> | Isso vai ser melhor pra ti saber no futuro',
      '<:positivo:759603958485614652> | Certeza absoluta',
      '<:negacao:759603958317711371> | Minha resposta é não',
      '<:positivo:759603958485614652> | Minha resposta é sim',
      '<:positivo:759603958485614652> | Não queria te dar esperançar, mas talvez sim',
      '<:negacao:759603958317711371> | Claro que não né',
      '<:positivo:759603958485614652> | Claro que sim uai',
      '<:positivo:759603958485614652> | O minha flor, eu sei que tu não queria que fosse, mas sim',
      '<:negacao:759603958317711371> | $%&*&%#¨%¨@&%¨&#@%$#%@#¨%#¨@%@$#% &¨%&$ #%¨#%¨%#¨¨&¨% ¨%&%¨& &¨%$&*¨&',
      '<:positivo:759603958485614652> | Absolutamente',
    ];

    const respostasUS = [
      '<:positivo:759603958485614652> | I think so',
      '<:negacao:759603958317711371> | Probably not',
      '<:positivo:759603958485614652> | With all certainty of the universe',
      '<:negacao:759603958317711371> | My circuits make me believe that this is impossible',
      '<:positivo:759603958485614652> | Yes, yes',
      '<:positivo:759603958485614652> | Nothing is impossible right bro 😉',
      '<:positivo:759603958485614652> | Yes <:ok:727975974125436959>',
      '<:negacao:759603958317711371> | No ;(',
      '<:positivo:759603958485614652> | Maybe',
      '<:positivo:759603958485614652> | Roll a D20 to see it',
      '<:positivo:759603958485614652> | Yes yes yes yes YES YES YES !!!!',
      '<:positivo:759603958485614652> | LOL you still ask?',
      "<:negacao:759603958317711371> | Oh man, I didn't want to tell you, but no",
      '<:positivo:759603958485614652> | I also wanted to know',
      '<:positivo:759603958485614652> | This will be better for you to know in the future',
      '<:positivo:759603958485614652> | Absolutely sure',
      '<:negacao:759603958317711371> | My answer is no',
      '<:positivo:759603958485614652> | My answer is yes',
      "<:positivo:759603958485614652> | I didn't want to give you hope, but maybe yes",
      '<:negacao:759603958317711371> | Of course not bro',
      '<:positivo:759603958485614652> | Of course yes yeet',
      "<:positivo:759603958485614652> |My flower, I know you didn't want it to be, but yes",
      '<:negacao:759603958317711371> | $%&*&%#¨%¨@&%¨&#@%$#%@#¨%#¨@%@$#% &¨%&$ #%¨#%¨%#¨¨&¨% ¨%&%¨& &¨%$&*¨&',
      '<:positivo:759603958485614652> | Absolutely',
    ];

    const respostas = lingua === 'pt-BR' ? respostasPT : respostasUS;

    const respostaRandom = respostas[Math.floor(Math.random() * respostas.length)];

    ctx.send(`${respostaRandom}, ${ctx.message.author}`);
  }
}
