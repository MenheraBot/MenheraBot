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
        const collector = message.channel.createMessageCollector(filter, { max: 1, time: 30000, errors: ["time"] });

        collector.on('collect', m => {

            if (m.content === "1" || m.content.toLowerCase() === "comprar") {
                lojaComprar(message, embedMessage, user, saldoAtual);
            } else lojaVender(message, embedMessage, user, saldoAtual);
        });
    }
}

function lojaComprar(message, embedMessage, user, saldoAtual) {

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
    const collector = message.channel.createMessageCollector(filter, { max: 1, time: 30000, errors: ["time"] });

    collector.on('collect', m => {

        if (m.content === "1" || m.content.toLowerCase() === "cores") {
            //abre loja de cores

            const coresDisponíveis = [
                { cor: '#a67bd1', preço: 30000, nome: "1 - Roxo Escuro" }, { cor: '#df0509', preço: 50000, nome: "2 - Vermelho" }, { cor: '#55e0f7', preço: 85000, nome: "3 - Ciano" },
                { cor: '#03fd1c', preço: 100000, nome: "4 - Verde Neon" }, { cor: '#fd03c9', preço: 250000, nome: "5 - Rosa Choque" }, { cor: '#e2ff08', preço: 500000, nome: "6 - Amarelo" }, { cor: 'SUA ESCOLHA', preço: 1000000, nome: "7 - Sua Escolha" }
            ];

            let nomeCor = coresDisponíveis.some(cor => cor.cor === user.cor)
            if (!nomeCor) nomeCor = { nome: "Padrão" }

            const dataCores = {
                title: "Compre Cores para seu Perfil",
                color: '#6cbe50',
                thumbnail: {
                    url: 'https://i.imgur.com/t94XkgG.png'
                },
                description: `Seu saldo atual é de **${saldoAtual}**⭐ estrelinhas, e sua cor atual é **${nomeCor.nome}**`,
                footer: {
                    text: "Digite no chat a opção que queres comprar"
                },
                fields: [{
                    name: 'Tabela de Preços',
                    value: coresDisponíveis.map(c => `${c.nome} | Código da cor: \`${c.cor}\` | Preço: **${c.preço}**⭐`).join("\n"),
                    inline: false
                }]
            }
            embedMessage.edit({ embed: dataCores })


            const validCorArgs = ["1", "2", "3", "4", "5", "6", "7"];

            const filtroCor = m => m.author.id === message.author.id && validCorArgs.some(answer => answer.toLowerCase() === m.content.toLowerCase());
            const CorColetor = message.channel.createMessageCollector(filtroCor, { max: 1, time: 30000, errors: ["time"] });

            CorColetor.on('collect', m => {
                switch (m.content) {
                    case '1':
                        if(user.cores.some(res => res.cor === coresDisponíveis[0].cor)) return message.channel.send(`🟡 | ${message.author} eu agradeço sua empolgação para comprar em meu brechó, mas você já possui esta cor!`).then(() => embedMessage.delete().catch)
                        if (user.estrelinhas < coresDisponíveis[0].preço) return message.channel.send(`❌ | ${message.author} você não tem estrelinhas o suficiente para comprar esta cor!`).then(() => embedMessage.delete().catch)
                        user.estrelinhas = user.estrelinhas - coresDisponíveis[0].preço
                        user.cores.push(coresDisponíveis[0])
                        user.save()
                        message.channel.send(`✅ | Certo! Você comrpou a cor **${coresDisponíveis[0].nome}** por **${coresDisponíveis[0].preço}** ⭐! Você ficou com **${user.estrelinhas}** ⭐ estrelinhas`).then(() => embedMessage.delete().catch)
                        break;
                    case '2':
                        if(user.cores.some(res => res.cor === coresDisponíveis[1].cor)) return message.channel.send(`🟡 | ${message.author} eu agradeço sua empolgação para comprar em meu brechó, mas você já possui esta cor!`).then(() => embedMessage.delete().catch)
                        if (user.estrelinhas < coresDisponíveis[1].preço) return message.channel.send(`❌ | ${message.author} você não tem estrelinhas o suficiente para comprar esta cor!`).then(() => embedMessage.delete().catch)
                        user.estrelinhas = user.estrelinhas - coresDisponíveis[1].preço
                        user.cores.push(coresDisponíveis[1])
                        user.save()
                        message.channel.send(`✅ | Certo! Você comrpou a cor **${coresDisponíveis[1].nome}** por **${coresDisponíveis[1].preço}** ⭐! Você ficou com **${user.estrelinhas}** ⭐ estrelinhas`).then(() => embedMessage.delete().catch)
                        break;
                    case '3':
                        if(user.cores.some(res => res.cor === coresDisponíveis[2].cor)) return message.channel.send(`🟡 | ${message.author} eu agradeço sua empolgação para comprar em meu brechó, mas você já possui esta cor!`).then(() => embedMessage.delete().catch)
                        if (user.estrelinhas < coresDisponíveis[2].preço) return message.channel.send(`❌ | ${message.author} você não tem estrelinhas o suficiente para comprar esta cor!`).then(() => embedMessage.delete().catch)
                        user.estrelinhas = user.estrelinhas - coresDisponíveis[2].preço
                        user.cores.push(coresDisponíveis[2])
                        user.save()
                        message.channel.send(`✅ | Certo! Você comrpou a cor **${coresDisponíveis[2].nome}** por **${coresDisponíveis[2].preço}** ⭐! Você ficou com **${user.estrelinhas}** ⭐ estrelinhas`).then(() => embedMessage.delete().catch)
                        break;
                    case '4':
                        if(user.cores.some(res => res.cor === coresDisponíveis[3].cor)) return message.channel.send(`🟡 | ${message.author} eu agradeço sua empolgação para comprar em meu brechó, mas você já possui esta cor!`).then(() => embedMessage.delete().catch)
                        if (user.estrelinhas < coresDisponíveis[3].preço) return message.channel.send(`❌ | ${message.author} você não tem estrelinhas o suficiente para comprar esta cor!`).then(() => embedMessage.delete().catch)
                        user.estrelinhas = user.estrelinhas - coresDisponíveis[3].preço
                        user.cores.push(coresDisponíveis[3])
                        user.save()
                        message.channel.send(`✅ | Certo! Você comrpou a cor **${coresDisponíveis[3].nome}** por **${coresDisponíveis[3].preço}** ⭐! Você ficou com **${user.estrelinhas}** ⭐ estrelinhas`).then(() => embedMessage.delete().catch)
                        break;
                    case '5':
                        if(user.cores.some(res => res.cor === coresDisponíveis[4].cor)) return message.channel.send(`🟡 | ${message.author} eu agradeço sua empolgação para comprar em meu brechó, mas você já possui esta cor!`).then(() => embedMessage.delete().catch)
                        if (user.estrelinhas < coresDisponíveis[4].preço) return message.channel.send(`❌ | ${message.author} você não tem estrelinhas o suficiente para comprar esta cor!`).then(() => embedMessage.delete().catch)
                        user.estrelinhas = user.estrelinhas - coresDisponíveis[4].preço
                        user.cores.push(coresDisponíveis[4])
                        user.save()
                        message.channel.send(`✅ | Certo! Você comrpou a cor **${coresDisponíveis[4].nome}** por **${coresDisponíveis[4].preço}** ⭐! Você ficou com **${user.estrelinhas}** ⭐ estrelinhas`).then(() => embedMessage.delete().catch)
                        break;
                    case '6':
                        if(user.cores.some(res => res.cor === coresDisponíveis[5].cor)) return message.channel.send(`🟡 | ${message.author} eu agradeço sua empolgação para comprar em meu brechó, mas você já possui esta cor!`).then(() => embedMessage.delete().catch)
                        if (user.estrelinhas < coresDisponíveis[5].preço) return message.channel.send(`❌ | ${message.author} você não tem estrelinhas o suficiente para comprar esta cor!`).then(() => embedMessage.delete().catch)
                        user.estrelinhas = user.estrelinhas - coresDisponíveis[5].preço
                        user.cores.push(coresDisponíveis[5]) 
                        user.save()
                        message.channel.send(`✅ | Certo! Você comrpou a cor **${coresDisponíveis[5].nome}** por **${coresDisponíveis[5].preço}** ⭐! Você ficou com **${user.estrelinhas}** ⭐ estrelinhas`).then(() => embedMessage.delete().catch)
                        break;
                    case '7':
                        if(user.cores.some(res => res.cor === coresDisponíveis[6].cor)) return message.channel.send(`🟡 | ${message.author} eu agradeço sua empolgação para comprar em meu brechó, mas você já possui esta cor!`).then(() => embedMessage.delete().catch)
                        if (user.estrelinhas < coresDisponíveis[6].preço) return message.channel.send(`❌ | ${message.author} você não tem estrelinhas o suficiente para comprar esta cor!`).then(() => embedMessage.delete().catch)
                  
                }
            })

        } else {
            //abre loja de rolls

            const valorRoll = 5000;
            const rollsATual = user.rolls;

            const dataRolls = {
                title: "Compre Rolls",
                color: '#b66642',
                thumbnail: {
                    url: 'https://i.imgur.com/t94XkgG.png'
                },
                description: `Seu saldo atual é de **${saldoAtual}**⭐ estrelinhas, e você tem **${rollsATual}** 🔑 rolls`,
                footer: {
                    text: "Digite no chat quantos rolls quer comprar"
                },
                fields: [{
                    name: 'Tabela de Preços',
                    value: `1 Roll = **${valorRoll}** ⭐`,
                    inline: false
                }]
            }

            embedMessage.edit(message.author, { embed: dataRolls })

            const filterColetor = m => m.author.id === message.author.id;
            const quantidadeCollector = message.channel.createMessageCollector(filterColetor, { max: 1, time: 30000, errors: ["time"] });

            quantidadeCollector.on('collect', m => {

                const valor = parseInt(m.content);
                if (isNaN(valor) || valor < 1) {
                    embedMessage.delete().catch()
                    message.channel.send(`❌ | ${message.author}, este valor não é um número válido!`)
                } else {

                    if ((valor * valorRoll) > user.estrelinhas) return message.channel.send(`❌ | ${message.author}, você não possui estrelas suficientes para comprar esta quantidade de rolls!`)

                    user.estrelinhas = user.estrelinhas - (valor * valorRoll);
                    user.rolls = user.rolls + valor;
                    user.save()

                    message.channel.send(`✅ | ${message.author}, você comprou **${valor}** 🔑 rolls por ${valor * valorRoll} ⭐ estrelinhas! \nAgora você tem **${user.rolls}** 🔑 e **${user.estrelinhas}**⭐`)
                }
            });

        }
    });

}

function lojaVender(message, embedMessage, user, saldoAtual) {

    const dataVender = {
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

    embedMessage.edit(message.author, { embed: dataVender }).catch()

    const validBuyArgs = ["1", "mamadas", "2", "demônios", "demonios", "demonio", "caça", "caca"];

    const filter = m => m.author.id === message.author.id && validBuyArgs.some(answer => answer.toLowerCase() === m.content.toLowerCase());
    const collector = message.channel.createMessageCollector(filter, { max: 1, time: 30000, errors: ["time"] });

    collector.on('collect', m => {

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
                    value: `**1** Demônio = **${valorDemonio}** ⭐`,
                    inline: false
                }]
            }

            embedMessage.edit(message.author, { embed: dataCaça })


            const filterColetor = m => m.author.id === message.author.id;
            const quantidadeCollector = message.channel.createMessageCollector(filterColetor, { max: 1, time: 30000, errors: ["time"] });

            quantidadeCollector.on('collect', m => {

                const valor = parseInt(m.content);
                if (isNaN(valor) || valor < 1) {
                    embedMessage.delete().catch()
                    message.channel.send(`❌ | ${message.author}, este valor não é um número válido!`)
                } else {

                    if (valor > user.caçados) return message.channel.send(`❌ | ${message.author}, você não possui todos estes demônios!`)

                    user.caçados = user.caçados - valor;
                    user.estrelinhas = user.estrelinhas + (valor * valorDemonio);
                    user.save()

                    message.channel.send(`✅ | ${message.author}, você vendeu **${valor}** 😈 demônios e recebeu **${valor * valorDemonio}** ⭐ estrelinhas!\nAgora você tem **${user.caçados}** 😈 e **${user.estrelinhas}**⭐`)
                }
            });
        }
    });
}

