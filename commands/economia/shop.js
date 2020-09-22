const usuario = require("../../models/user.js");

module.exports = {
    name: "shop",
    aliases: ["loja", "vender", "comprar", "compra", "vende", "sell", "buy"],
    cooldown: 2,
    category: "economia",
    description: "Abra a loja da Menhera",
    usage: "m!daily",
    run: async (client, message, args) => {

        let user = await usuario.findOne({ id: message.author.id });
        const saldoAtual = user.estrelinhas;

        const validArgs = ["1", "comprar", "2", "vender"];

        const dataLoja = {
            title: "Brechó da Menhera",
            color: '#559bf7',
            thumbnail: {
                url: 'https://i.imgur.com/t94XkgG.png'
            },
            description: `Seu saldo atual é de **${saldoAtual}**⭐ estrelinhas`,
            footer: {
                text: "Digite no chat a opção de sua escolha"
            },
            fields: [{
                name: 'Escolha entre uma das opções para acessar meu Brechó',
                value: '1 - Comprar\n2 - Vender',
                inline: false
            }]
        }
        const embedMessage = await message.channel.send(message.author, { embed: dataLoja });


        const filter = m => m.author.id === message.author.id && validArgs.some(answer => answer.toLowerCase() === m.content.toLowerCase());
        const collector = message.channel.createMessageCollector(filter, { max: 1, time: 15000, errors: ["time"] });

        collector.on('collect', m => {
            m.delete().catch()

            if (m.content === "1" || m.content.toLowerCase() === "comprar") {
                lojaComprar(message, embedMessage, user, saldoAtual);
            } else lojaVender(message, embedMessage, user, saldoAtual);
        });
    }
}

function lojaComprar(message, embedMessage, user, saldoAtual) {

    return embedMessage.edit({ embed: { title: 'Esta seção está em desenvolvimento' } })

    const dataComprar = {
        title: "Brechó da Menhera",
        color: '#6cbe50',
        thumbnail: {
            url: 'https://i.imgur.com/t94XkgG.png'
        },
        description: `Seu saldo atual é de **${saldoAtual}**⭐ estrelinhas`,
        footer: {
            text: "Digite no chat a opção de sua escolha"
        },
        fields: [{
            name: 'Opções de Compras',
            value: '1 - Comprar Cores \n2 - Comprar Rolls',
            inline: false
        }]
    }

    embedMessage.edit(message.author, { embed: dataComprar }).catch()

    const validBuyArgs = ["1", "cores", "2", "rolls"];

    const filter = m => m.author.id === message.author.id && validBuyArgs.some(answer => answer.toLowerCase() === m.content.toLowerCase());
    const collector = message.channel.createMessageCollector(filter, { max: 1, time: 15000, errors: ["time"] });

    collector.on('collect', m => {
        m.delete().catch()

        if (m.content === "1" || m.content.toLowerCase() === "cores") {
            //abre loja de cores
            embedMessage.edit({ embed: { title: 'Esta seção está em desenvolvimento' } })
        } else {
            //abre loja de rolls
        }
    });

}

function lojaVender(message, embedMessage, user, saldoAtual) {


    const dataComprar = {
        title: "Brechó da Menhera",
        color: '#e77fa1',
        thumbnail: {
            url: 'https://i.imgur.com/t94XkgG.png'
        },
        description: `Seu saldo atual é de **${saldoAtual}**⭐ estrelinhas`,
        footer: {
            text: "Digite no chat a opção de sua escolha"
        },
        fields: [{
            name: 'Opções de Vendas',
            value: '1 - Vender Mamadas \n2 - Vender Demônios',
            inline: false
        }]
    }

    embedMessage.edit(message.author, { embed: dataComprar }).catch()

    const validBuyArgs = ["1", "mamadas", "2", "demônios", "demonios", "demonio", "caça", "caca"];

    const filter = m => m.author.id === message.author.id && validBuyArgs.some(answer => answer.toLowerCase() === m.content.toLowerCase());
    const collector = message.channel.createMessageCollector(filter, { max: 1, time: 15000, errors: ["time"] });

    collector.on('collect', m => {
        m.delete().catch()

        if (m.content === "1" || m.content.toLowerCase() === "mamadas") {
            //abre loja de mamads
            embedMessage.edit({ embed: { title: 'Esta seção está em desenvolvimento' } })
        } else {

            const demoniosAtual = user.caçados;
            const valorDemonio = 200;
            const dataCaça = {
                title: "Venda Demônios",
                color: '#e77fa1',
                thumbnail: {
                    url: 'https://i.imgur.com/t94XkgG.png'
                },
                description: `Você possui **${demoniosAtual}** 😈 demônios caçados`,
                footer: {
                    text: "Digite no chat quantos demônios desejas vender"
                },
                fields: [{
                    name: 'Tabela de preços',
                    value: `1 Demônio = ${valorDemonio}`,
                    inline: false
                }]
            }

            embedMessage.edit(message.author, {embed: dataCaça})

            
        const filterColetor = m => m.author.id === message.author.id;
        const quantidadeCollector = message.channel.createMessageCollector(filterColetor, { max: 1, time: 15000, errors: ["time"] });

        quantidadeCollector.on('collect', m => {

            const valor = parseInt(m.content);
            if(isNaN(valor) || valor < 1){
                embedMessage.delete().catch()
                message.channel.send(`❌ | ${message.author}, este valor não é um número válido!`)
            } else {

                if(valor > user.caçados) return message.channel.send(`❌ | ${message.author}, você não possui todos estes demônios!`)

                user.caçados = user.caçados - valor;
                user.estrelinhas = user.estrelinhas + (valor * valorDemonio);
                user.save()

                message.channel.send(`✅ | ${message.author}, você vendeu **${valor}** 😈 demônios e recebeu **${valor * valorDemonio}** ⭐ estrelinhas!\nAgora você tem **${user.caçados}** 😈 e **${user.estrelinhas}**⭐`)
            }
        });
  }});
}

