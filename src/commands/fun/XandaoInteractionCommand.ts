import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { User } from 'discord.js-light';

export default class XandaoInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'xandao',
      description: '「💪」・Sem pressão aqui é Xandão! Receba uma frase iluminada do Xandão.',
      options: [
        {
          name: 'texto',
          type: 'STRING',
          description: 'Caso queira que o Xandão fale algo por ti, envie o texto',
          required: false,
        },
      ],
      category: 'fun',
      cooldown: 5,
      clientPermissions: ['MANAGE_WEBHOOKS', 'MANAGE_CHANNELS'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    if (ctx.channel.type === 'DM' || ctx.channel.isThread()) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:xandao.only-text'),
        ephemeral: true,
      });
      return;
    }

    ctx.defer();
    const texto = ctx.options.getString('texto');

    const frases = [
      'SEM PRESSÃO, AQUI É XANDÃO',
      'AQUI É XANDÃO, O ÚLTIMO HERÓI DA TERRA',
      'PRIMEIRO QUE, O XANDÃO NÃO JOGA LOL, O XANDÃO JOGA DE DREIVÃO',
      'NAMORAR É PROS FRACOS, AQUI É XANDÃO',
      'QUEM QUE VAI SER LOUCO DE ASSALTAR O SUPER XANDÃO, DANDO 5 SOCOS POR SEGUNDO',
      'SE VOCÊ É VIRGEM, VOCÊ É UM CAMPEÃO',
      'TOMA ESSE DOUBLE BICEPS',
      'XANDÃO É LOBO SOLITÁRIO',
      'O CAPS LOCK MOSTRA O PEITORAL DE AÇO POR TRAZ DE QUEM TA FALANDO',
      'TEM QUE JOGAR DE DREIVÃO. NÃO TEM ESSES NEGÓCIOS DE FICAR JOGANDO MAGIAZINHA',
      'XANDAO VIVE NO TOPO DA MONTANHA GELADA EM SEU CASTELO',
      'SE VOCÊ ESTIVER PERDENDO, É MELHOR INOVAR NA BUILD E FAZER O JOGO ACABAR LOGO',
      'TÔ AQUI NO TOPO DO MEU CASTELO SÓ VENDO OS FRACASSADOS LÁ EM BAIXO',
      "XAYAH FAZ ASSIM: 'AIN XANDÃO, EU ME DESPENO PRA VOCÊ'",
      'PUNHETA É COISA DE FRACASSADO',
      'A TERRA É PLANA, TEM PROVAS, PESQUISA!',
      'XANDÃO, CAÇADOR DE DEMÔNIOS',
      'XANDÃO CAÇA DEMÔNIOS',
      'UM VERDADEIRO CAMPEÃO TEM QUE EXALAR ENERGIA, IGUAL XANDÃO',
      'O SUPER XANDÃO, CAÇADOR DE DEMÔNIOS, INIMIGO DOS FRACASSADOS',
      'ISSO SÓ AFETA OS VELHOS, QUE ESTÃO COM O PÉ NA COVA, OU OS FRACASSADOS, AQUI É XANDÃO, ME RESPEITA',
      'XANDÃO É FRUTO DE UMA FORÇA DIVINA',
      'VOCÊS SÃO FRUTOS DESSA GENÉTICA RIDÍCULA DOS PAIS DE VOCÊS',
      "JANNA PLAYER, AH, VÊ SE PODE UMA COISA DESSAS 'AIN XANDÃO EU VOU ASSOPRAR VOCÊ'",
      "'FOFO S2', OLHA O NICK DESSE FRACASSADO",
      "'Por que você fala de si mesmo em terceira pessoa?'\nPORQUE AQUI É XANDÃO",
      'MEU NOME É XANDAO, FRUTO DE UMA VONTADE DIVINA E ÚLTIMO HERÓI DA TERRA',
      'NO FINAL DOS TEMPOS DEIXA COMIGO, QUE O APOCALIPSE SÓ VAI ACONTECER PARA OS PERDEDORES',
      "'Xandão, quantos centímetros de braço?'\nMUITO",
      'Meu deus Xandão a gente vai morrer!!\n RELAXA QUE NO FIM DA ESCURIDÃO TEM XANDÃO, SÓ SEGURAR NO BRAÇO DE XANDAO QUE NINGUÉM MORRE',
      'CAMPEÕES USAM O FLASH SÓ PARA FENTE, NUNCA PARA TRÁS',
      'O ÁLCOOL NÃO ACRESCENTA EM NADA NA NOSSA VIDA E É UMA PERDA DE DINHEIRO, TIPO PAGAR PRA COMER ALGUÉM, SUA MÃE FAZ ISSO DE GRAÇA',
      'NÃO TÁ GOSTANDO? ENTÃO PQ TÁ AQUI AINDA, VAI LÁ TOMAR SEU NESCAU E SER UM FRACASSADO',
      'MULHER DIZ QUE GOSTA DE HOMEM MAGRINHO, MAS DE MADRUGADA TÁ LIGANDO PRO XANDÃO PROCURANDO UM HOMEM DE VERDADE',
      'ALÔ? SUPER XANDÃO FALANDO',
    ];

    const fraseEscolhida = frases[Math.floor(Math.random() * frases.length)];

    let fala: string;
    if (!texto) {
      fala = fraseEscolhida;
    } else fala = `${texto}\n\n📢 | ${ctx.author.toString()}`;

    try {
      const webhooks = await ctx.channel.fetchWebhooks();

      const clientUser = ctx.client.user;
      if (!clientUser) return;
      const ownWebhook = webhooks
        .filter((hook) => (hook.owner as User).id === clientUser.id)
        .first();

      if (ownWebhook) {
        await ownWebhook.send({
          content: fala,
          username: 'Super Xandão',
          avatarURL: 'https://i.imgur.com/8KNCucR.png',
        });
        ctx.deleteReply();
      } else {
        await ctx.channel
          .createWebhook('Super Xandão', {
            avatar: 'https://i.imgur.com/8KNCucR.png',
          })
          .then((web) => {
            web.send({
              content: fala,
              username: 'Super Xandão',
              avatarURL: 'https://i.imgur.com/8KNCucR.png',
            });
          });
        ctx.deleteReply();
      }
    } catch (err) {
      await ctx.makeMessage({ content: `${ctx.locale('commands:xandao.err_message')}` });
    }
  }
}
