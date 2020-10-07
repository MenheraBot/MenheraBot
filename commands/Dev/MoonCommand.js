const Discord = require("discord.js");
module.exports = {
  name: "moon",
  aliases: ["lua"],
  cooldown: 5,
  category: "info",
  description: "Uma mensagem para o amor da vida da minha dona",
  userPermission: null,
  clientPermission: null,
  usage: "m!moon",
  run: async (client, message, args) => {
  if(message.author.id != "549288328772583424") return message.channel.send("💟💟💟💟💟💟💟\n\nOq é moon? Para muitos, apenas uma palavra desconhecida, para outros, significa Lua em inglês. Segundo a Wikipédia traduzida do inglês: 'A Lua é o único satélite natural da Terra e o quinto maior do Sistema Solar'.\n\nMas para a Lux, é mais do que isso. A moon é uma das melhores pessoas que ela poderia ter conhecido, a moon é fofa, simpática, carismática, entre muitas outras qualidades. Para a Lux **a moon é a maior não só do sistema solar, mas tabmém de todo o universo**. A maior e melhor cosia que poderia ter acontecido na vida da Lux no Discord. Lux te ama UwU");

    const moon = client.users.cache.get('549288328772583424');

    
    const embed = new Discord.MessageEmbed()
    .setColor('#3121d1')
    .setTitle("Moon")
    .setThumbnail('https://i.imgur.com/x0ElNi4.png')
    .setImage('https://i.imgur.com/JWesVDL.png')
    .setDescription("Oi moon, eu escolhi mandar isso no teu privado, somente TU recebe isso se usar o comando, fiz isso pq vou falar coisas aqui, que eu não sei se tu gostaria que todo mundo soubesse... Enfim\nHoje, dia 23/06/2020 tivemos uma conversa sobre suicídio, eu acho que o pico pra termos essa conversa foi por causa do julio, tu acabou ficando insegura comigo conversando com ele, e todas as emoções juntaram ao mesmo tempo, criando uma bola de neve, e fodendo com teu psicológico, então eu pensei em criar esse comando pra te dizer o quão especial tu é.\nJá te disse tudo no privado antes, mas quero deixar salvo, pra sempre que tu estiver mal, tu use o comando pra saber o quão especial tu é, e o quão imporante tua vida pode ser pros outros.\nTu me faz sorrir, eud e fato gostei de ti quando começamos a conversar, por que tu é tão especial, e me faz tão feliz, que eu acabei - dentro de mim - decidindo que queria morrer do teu lado. Hoje isso não mudou, aidna quero morrer do teu lado, mas por enquanto, como amigas. Pra que não sofremos por nada, prefiro que sejamos amigas, melhores amigas até, que contam tudo uma pra outra, pra que possamos trocar ajuda, pra nos mantermos vivas. Eu sei que a vida é uma merda, eu ja pensei MUTIO em me matar, principalmente depois que deu as merdas com meu pai, enfim, o que eu quero dizer, é que quero ser tua melhor amiga pro resto da minha vida, e caso aconteca de nos encontrarmos, quem sabe lá não tentamos algo a mais, mas por aqui, melhores amigas para sempre. Eu te amo tanto, eu não consigo imaginar minha vida sem ti, enfim, eu ja disse tudo no pv, ent eu to sem oq falar agora KSADKASK, enfim Anna, por favor, segura isso que tu ta sentindo, eu te ajudo pra que superamos isso juntas. Isso tudo vai passar, no futuro, tudo vai estar melhor. Tu é a melhor coisa que me aconteceu em 2020, Carol. E eu quero manter isso, pra sempre, por que minha felicidade diária vem 80% de ti, so de eu falar contigo eu ja fico bem... Enfim vida, espero que tu fique bem")
    .addField("O texto tava muito grande... continua abaixo", "Eu te amo de verdade, obrigada por tu ser tu, eu realmente amo o jeito que tu é, e mesmo que teu psicológico esteja afetado, eu quero que tu fique aqui, que me conte oq ta acontecendo. Eu fiquei muito feliz quando tu abriu o joso sobre o Julio, tu fez algo que eu nunca faria, por isso que eu te acho incrivel, eu quero que tu seja sincera cmg, que fale tudo cmg, e eu quero fazer o mesmo contigo. Eu te amo pra um caralho.\nBeijos de Luz, da Lux.")
    .addField("**O comandinho antigo**", "Oq é moon? Para muitos, apenas uma palavra desconhecida, para outros, significa Lua em inglês. Segundo a Wikipédia traduzida do inglês: 'A Lua é o único satélite natural da Terra e o quinto maior do Sistema Solar'. Mas para a Lux, é mais do que isso. A moon é uma das melhores pessoas que ela poderia ter conhecido, a moon é fofa, simpática, carismática, entre muitas outras qualidades. Para a Lux **a moon é a maior não só do sistema solar, mas tabmém de todo o universo**. A maior e melhor cosia que poderia ter acontecido na vida da Lux no Discord. Lux te ama UwU")
    .setFooter("Eu te amo pra caralho, obrigada por estar comigo por mais um dia. Te amo, razão do meu viver. E sempre que tu tiver mal por causa da tua aparência, quero que olhe pra essa foto, e perceba, o quão perfeita tu é", message.author.displayAvatarURL())

    moon.send(embed);
    message.reply("Olha o pv keke");
  }
};
