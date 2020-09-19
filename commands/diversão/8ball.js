module.exports = {
  name: "8ball",
  aliases: ["perguntar", "futuro", "8"],
  cooldown: 3,
  category: "diversão",
  description: "Pergunte algo para a Menhera",
  usage: "m!8ball <pergunta>",
  run: async (client, message, args) => {

    if(args.length < 1) return message.reply("Faça uma pergunta para mim")

    let respostas = [
        "Acho que sim",
        "Provavelmente não",
        "Com toda certeza do universo",
        "Meus circuitos me fazem crer que isso é impossível",
        "Se pá que sim",
        "Nada é impossivel né maninho 😉",
        "Sim <:ok:727975974125436959>",
        "Não ;(",
        "Talvez ",
        "Rola um D20 pra ver isso aí",
        "Sim sim sim sim SIM SIM SIIIIM!!!!",
        "Kkk tu ainda pergunta?",
        "Ah cara, eu não queria te falar, mas não",
        "Também queria saber",
        "Isso vai ser melhor pra ti saber no futuro",
        "Certeza absoluta",
        "Minha resposta é não",
        "Minha resposta é sim",
        "Não queria te dar esperançar, mas talvez sim",
        "Claro que não né",
        "Claro que sim uai",
        "O minha flor, eu sei que tu não queria que fosse, mas sim",
        "$%&*&%#¨%¨@&%¨&#@%$#%@#¨%#¨@%@$#% &¨%&$ #%¨#%¨%#¨¨&¨% ¨%&%¨& &¨%$&*¨&",
        "Caramba, tu conseguiu tirar meu easter egg do 8Ball. Parabéns seu sortudo!!! Já caçou demônios hoje? Pois deveria!",
        "Absolutamente"
    ];

    const respostaRandom = respostas[Math.floor(Math.random() * respostas.length)];

    message.channel.send(`${message.author} ${respostaRandom}`)

}};
