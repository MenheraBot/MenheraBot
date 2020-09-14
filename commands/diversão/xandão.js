const Discord = require("discord.js");

module.exports = {
  name: "xandão",
  aliases: ["xandao", "superxandao"],
  cooldown: 2,
  category: "diversão",
  description: "SEM PRESSÃO",
  usage: "m!xandão",
  run: async (client, message, args) => {

    const channel = client.channels.cache.get(message.channel.id);

    let frases = [
        "SEM PRESSÃO, AQUI É XANDÃO",
        "AQUI É XANDÃO, O ÚLTIMO HERÓI DA TERRA",
        "PRIMEIRO QUE, O XANDÃO NÃO JOGA LOL, O XANDÃO JOGA DE DREIVÃO",
        "NAMORAR É PROS FRACOS, AQUI É XANDÃO",
        "QUEM QUE VAI SER LOUCO DE ASSALTAR O SUPER XANDÃO, DANDO 5 SOCOS POR SEGUNDO",
        "SE VOCÊ É VIRGEM, VOCÊ É UM CAMPEÃO",
        "TOMA ESSE DOUBLE BICEPS",
        "XANDÃO É LOBO SOLITÁRIO",
        "O CAPS LOCK MOSTRA O PEITORAL DE AÇO POR TRAZ DE QUEM TA FALANDO",
        "TEM QUE JOGAR DE DREIVÃO. NÃO TEM ESSES NEGÓCIOS DE FICAR JOGANDO MAGIAZINHA",
        "XANDAO VIVE NO TOPO DA MONTANHA GELADA EM SEU CASTELO",
        "SE VOCÊ ESTIVER PERDENDO, É MELHOR INOVAR NA BUILD E FAZER O JOGO ACABAR LOGO",
        "TÔ AQUI NO TOPO DO MEU CASTELO SÓ VENDO OS FRACASSADOS LÁ EM BAIXO",
        "XAYAH FAZ ASSIM: 'AIN XANDÃO, EU ME DESPENO PRA VOCÊ'",
        "PUNHETA É COISA DE FRACASSADO",
        "A TERRA É PLANA, TEM PROVAS, PESQUISA!",
        "XANDÃO, CAÇADOR DE DEMÔNIOS",
        "XANDÃO CAÇA DEMÔNIOS",
        "UM VERDADEIRO CAMPEÃO TEM QUE EXALAR ENERGIA, IGUAL XANDÃO",
        "O SUPER XANDÃO, CAÇADOR DE DEMÔNIOS, INIMIGO DOS FRACASSADOS",
        "ISSO SÓ AFETA OS VELHOS, QUE ESTÃO COM O PÉ NA COVA, OU OS FRACASSADOS, AQUI É XANDÃO, ME RESPEITA",
        "XANDÃO É FRUTO DE UMA FORÇA DIVINA",
        "VOCÊS SÃO FRUTOS DESSA GENÉTICA RIDÍCULA DOS PAIS DE VOCÊS",
        "JANNA PLAYER, AH, VÊ SE PODE UMA COISA DESSAS 'AIN XANDÃO EU VOU ASSOPRAR VOCÊ'",
        "'FOFO S2', OLHA O NICK DESSE FRACASSADO",
        "'Por que você fala de si mesmo em terceira pessoa?'\nPORQUE AQUI É XANDÃO",
        "MEU NOME É XANDAO, FRUTO DE UMA VONTADE DIVINA E ÚLTIMO HERÓI DA TERRA",
        "NO FINAL DOS TEMPOS DEIXA COMIGO, QUE O APOCALIPSE SÓ VAI ACONTECER PARA OS PERDEDORES",
        "'Xandão, quantos centímetros de braço?'\nMUITO",
        "Meu deus Xandão a gente vai morrer!!\n RELAXA QUE NO FIM DA ESCURIDÃO TEM XANDÃO, SÓ SEGURAR NO BRAÇO DE XANDAO QUE NINGUÉM MORRE",
        "CAMPEÕES USAM O FLASH SÓ PARA FENTE, NUNCA PARA TRÁS",
        "O ÁLCOOL NÃO ACRESCENTA EM NADA NA NOSSA VIDA E É UMA PERDA DE DINHEIRO, TIPO PAGAR PRA COMER ALGUÉM, SUA MÃE FAZ ISSO DE GRAÇA",
        "NÃO TÁ GOSTANDO? ENTÃO PQ TÁ AQUI AINDA, VAI LÁ TOMAR SEU NESCAU E SER UM FRACASSADO",
        "MULHER DIZ QUE GOSTA DE HOMEM MAGRINHO, MAS DE MADRUGADA TÁ LIGANDO PRO XANDÃO PROCURANDO UM HOMEM DE VERDADE",
        "ALÔ? SUPER XANDÃO FALANDO"
    ];

    var fraseEscolhida = frases[Math.floor(Math.random() * frases.length)];

    try{
		const webhooks = await channel.fetchWebhooks();
        let webhook = webhooks.first();
        if(!webhook){
            
           await channel.createWebhook('Super Xandão', {
                avatar: 'https://i.imgur.com/8KNCucR.png',
            }).then(web => {
             web.send(fraseEscolhida, {
                    username: 'Super Xandão',
                    avatarURL: 'https://i.imgur.com/8KNCucR.png'
                });
            })
           
        } else {

		await webhook.send(fraseEscolhida, {
			username: 'Super Xandão',
			avatarURL: 'https://i.imgur.com/8KNCucR.png'
		});
        }
    } catch(err) {
        message.reply("Para que eu possa executar este comando, peça para que os administradores me concedam a permissão `Gerenciar Webhooks`")
    }

}};
