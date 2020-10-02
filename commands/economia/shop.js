const usuario = require("../../models/user.js");

module.exports = {
    name: "shop",
    aliases: ["loja", "vender", "comprar", "compra", "vende", "sell", "buy"],
    cooldown: 5,
    category: "economia",
    description: "Abra a loja da Menhera",
    userPermission: null,
    clientPermission: ["EMBED_LINKS"],
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
                { cor: '#6308c0', preço: 50000, nome: "1 - Roxo Escuro" }, { cor: '#df0509', preço: 50000, nome: "2 - Vermelho" }, { cor: '#55e0f7', preço: 50000, nome: "3 - Ciano" },
                { cor: '#03fd1c', preço: 50000, nome: "4 - Verde Neon" }, { cor: '#fd03c9', preço: 50000, nome: "5 - Rosa Choque" }, { cor: '#e2ff08', preço: 50000, nome: "6 - Amarelo" }, { cor: 'SUA ESCOLHA', preço: 100000, nome: "7 - Sua Escolha" }
            ];

            const dataCores = {
                title: "Compre Cores para seu Perfil",
                color: '#6cbe50',
                thumbnail: {
                    url: 'https://i.imgur.com/t94XkgG.png'
                },
                description: `Seu saldo atual é de **${saldoAtual}**⭐ estrelinhas`,
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
                        if (user.estrelinhas < coresDisponíveis[0].preço) return message.channel.send(`<:negacao:759603958317711371> | ${message.author} você não tem estrelinhas o suficiente para comprar esta cor!`).then(() => embedMessage.delete().catch)
                        user.estrelinhas = user.estrelinhas - coresDisponíveis[0].preço
                        user.cores.push(coresDisponíveis[0])
                        user.save()
                        message.channel.send(`<:positivo:759603958485614652> | Certo! Você comprou a cor **${coresDisponíveis[0].nome}** por **${coresDisponíveis[0].preço}** ⭐! Você ficou com **${user.estrelinhas}** ⭐ estrelinhas`).then(() => embedMessage.delete().catch)
                        break;
                    case '2':
                        if(user.cores.some(res => res.cor === coresDisponíveis[1].cor)) return message.channel.send(`🟡 | ${message.author} eu agradeço sua empolgação para comprar em meu brechó, mas você já possui esta cor!`).then(() => embedMessage.delete().catch)
                        if (user.estrelinhas < coresDisponíveis[1].preço) return message.channel.send(`<:negacao:759603958317711371> | ${message.author} você não tem estrelinhas o suficiente para comprar esta cor!`).then(() => embedMessage.delete().catch)
                        user.estrelinhas = user.estrelinhas - coresDisponíveis[1].preço
                        user.cores.push(coresDisponíveis[1])
                        user.save()
                        message.channel.send(`<:positivo:759603958485614652> | Certo! Você comprou a cor **${coresDisponíveis[1].nome}** por **${coresDisponíveis[1].preço}** ⭐! Você ficou com **${user.estrelinhas}** ⭐ estrelinhas`).then(() => embedMessage.delete().catch)
                        break;
                    case '3':
                        if(user.cores.some(res => res.cor === coresDisponíveis[2].cor)) return message.channel.send(`🟡 | ${message.author} eu agradeço sua empolgação para comprar em meu brechó, mas você já possui esta cor!`).then(() => embedMessage.delete().catch)
                        if (user.estrelinhas < coresDisponíveis[2].preço) return message.channel.send(`<:negacao:759603958317711371> | ${message.author} você não tem estrelinhas o suficiente para comprar esta cor!`).then(() => embedMessage.delete().catch)
                        user.estrelinhas = user.estrelinhas - coresDisponíveis[2].preço
                        user.cores.push(coresDisponíveis[2])
                        user.save()
                        message.channel.send(`<:positivo:759603958485614652> | Certo! Você comprou a cor **${coresDisponíveis[2].nome}** por **${coresDisponíveis[2].preço}** ⭐! Você ficou com **${user.estrelinhas}** ⭐ estrelinhas`).then(() => embedMessage.delete().catch)
                        break;
                    case '4':
                        if(user.cores.some(res => res.cor === coresDisponíveis[3].cor)) return message.channel.send(`🟡 | ${message.author} eu agradeço sua empolgação para comprar em meu brechó, mas você já possui esta cor!`).then(() => embedMessage.delete().catch)
                        if (user.estrelinhas < coresDisponíveis[3].preço) return message.channel.send(`<:negacao:759603958317711371> | ${message.author} você não tem estrelinhas o suficiente para comprar esta cor!`).then(() => embedMessage.delete().catch)
                        user.estrelinhas = user.estrelinhas - coresDisponíveis[3].preço
                        user.cores.push(coresDisponíveis[3])
                        user.save()
                        message.channel.send(`<:positivo:759603958485614652> | Certo! Você comprou a cor **${coresDisponíveis[3].nome}** por **${coresDisponíveis[3].preço}** ⭐! Você ficou com **${user.estrelinhas}** ⭐ estrelinhas`).then(() => embedMessage.delete().catch)
                        break;
                    case '5':
                        if(user.cores.some(res => res.cor === coresDisponíveis[4].cor)) return message.channel.send(`🟡 | ${message.author} eu agradeço sua empolgação para comprar em meu brechó, mas você já possui esta cor!`).then(() => embedMessage.delete().catch)
                        if (user.estrelinhas < coresDisponíveis[4].preço) return message.channel.send(`<:negacao:759603958317711371> | ${message.author} você não tem estrelinhas o suficiente para comprar esta cor!`).then(() => embedMessage.delete().catch)
                        user.estrelinhas = user.estrelinhas - coresDisponíveis[4].preço
                        user.cores.push(coresDisponíveis[4])
                        user.save()
                        message.channel.send(`<:positivo:759603958485614652> | Certo! Você comprou a cor **${coresDisponíveis[4].nome}** por **${coresDisponíveis[4].preço}** ⭐! Você ficou com **${user.estrelinhas}** ⭐ estrelinhas`).then(() => embedMessage.delete().catch)
                        break;
                    case '6':
                        if(user.cores.some(res => res.cor === coresDisponíveis[5].cor)) return message.channel.send(`🟡 | ${message.author} eu agradeço sua empolgação para comprar em meu brechó, mas você já possui esta cor!`).then(() => embedMessage.delete().catch)
                        if (user.estrelinhas < coresDisponíveis[5].preço) return message.channel.send(`<:negacao:759603958317711371> | ${message.author} você não tem estrelinhas o suficiente para comprar esta cor!`).then(() => embedMessage.delete().catch)
                        user.estrelinhas = user.estrelinhas - coresDisponíveis[5].preço
                        user.cores.push(coresDisponíveis[5]) 
                        user.save()
                        message.channel.send(`<:positivo:759603958485614652> | Certo! Você comprou a cor **${coresDisponíveis[5].nome}** por **${coresDisponíveis[5].preço}** ⭐! Você ficou com **${user.estrelinhas}** ⭐ estrelinhas`).then(() => embedMessage.delete().catch)
                        break;
                    case '7':
                        if(user.cores.some(res => res.nome === coresDisponíveis[6].nome)) return message.channel.send(`🟡 | ${message.author} eu agradeço sua empolgação para comprar em meu brechó, mas você já possui esta cor!`).then(() => embedMessage.delete().catch)
                        if (user.estrelinhas < coresDisponíveis[6].preço) return message.channel.send(`<:negacao:759603958317711371> | ${message.author} você não tem estrelinhas o suficiente para comprar esta cor!`).then(() => embedMessage.delete().catch)
                        
                        const hexFiltro = m => m.author.id === message.author.id;
                        const hexColletor = message.channel.createMessageCollector(hexFiltro, { max: 1, time: 30000, errors: ["time"] });

                        message.channel.send("Envie um código de hexcolor **SEM A HASHTAG** (Exemplo: AABBCC) de sua escolha para adicionar em seu perfil")

                        hexColletor.on('collect', m => {
                            isHexColor = hex => typeof hex === 'string' && hex.length === 6 && !isNaN(Number('0x' + hex))
                            if(isHexColor(m.content)){
                                user.estrelinhas = user.estrelinhas - coresDisponíveis[6].preço
                                user.cores.push({nome: '7 - Sua Escolha', cor: `#${m.content}`, preço: 1000000})
                                user.save()
                                message.channel.send(`<:positivo:759603958485614652> | UUUAUUUU!!! VOCÊ ACABOU DE COMPRAR UMA COR DE SUA ESCOLHA!!!\nSua escolha atual é **#${m.content}**\nVocê gastou **${coresDisponíveis[6].preço}** ⭐ e ficou com **${user.estrelinhas}** ⭐ estrelinhas`).then(() => embedMessage.delete().catch)
                            } else {
                                return message.channel.send(`<:negacao:759603958317711371> | ${message.author} esta cor não é uma cor válida!`).then(() => embedMessage.delete().catch)
                            }

                        })
                }
            })

        } else {
            //abre loja de rolls

            const valorRoll = 8500;
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
                    message.channel.send(`<:negacao:759603958317711371> | ${message.author}, este valor não é um número válido!`)
                } else {

                    if ((valor * valorRoll) > user.estrelinhas) return message.channel.send(`<:negacao:759603958317711371> | ${message.author}, você não possui estrelas suficientes para comprar esta quantidade de rolls!`)

                    user.estrelinhas = user.estrelinhas - (valor * valorRoll);
                    user.rolls = user.rolls + valor;
                    user.save()

                    message.channel.send(`<:positivo:759603958485614652> | ${message.author}, você comprou **${valor}** 🔑 rolls por ${valor * valorRoll} ⭐ estrelinhas! \nAgora você tem **${user.rolls}** 🔑 e **${user.estrelinhas}**⭐`)
                }
            });

        }
    });

}

function lojaVender(message, embedMessage, user, saldoAtual) {

    const demons = user.caçados || 0;
    const anjos = user.anjos || 0;
    const sd = user.semideuses || 0;
    const deuses = user.deuses || 0;

    const dataVender = {
        title: "Brechó da Menhera",
        color: '#e77fa1',
        thumbnail: {
            url: 'https://i.imgur.com/t94XkgG.png'
        },
        description: `Seu saldo atual é de **${saldoAtual}**⭐ estrelinhas e suas caças são:\n\n<:DEMON:758765044443381780>: **${demons}** demônios\n<:ANGEL:758765044204437535>: **${anjos}** anjos\n<:SEMIGOD:758766732235374674>: **${sd}** semideuses\n<:God:758474639570894899>: **${deuses}** deuses`,
        footer: {
            text: "Digite no chat a opção de sua escolha e o valor"
        },
        fields: [{
            name: 'Opções de Vendas',
            value: '1 - Vender Demônios (700⭐) \n2 - Vender Anjos (3500)\n3 - Vender Semi-Deuses (10000⭐)\n4 - Vender Deuses (50000⭐)\n\nDigite sua escolha e a quantidade. Exemplo: (`1 50`)',
            inline: false
        }]
    }

    embedMessage.edit(message.author, { embed: dataVender }).catch()

    const filter = m => m.author.id === message.author.id;
    const collector = message.channel.createMessageCollector(filter, { max: 1, time: 30000, errors: ["time"] });

    collector.on('collect', m => {

        const cArgs = m.content.split(/ +/g);
        const valor = parseInt(cArgs[1]);

        const valorDemonio = 700;
        const valorAnjo = 3500;
        const valorSD = 10000;
        const valorDeus = 50000;

        if (cArgs[0] === "1") {
            
            if (isNaN(valor) || valor < 1) {
                embedMessage.delete().catch()
                return message.channel.send(`<:negacao:759603958317711371> | ${message.author}, este valor não é um número válido!`)
            } else {
                if (valor > user.caçados) return message.channel.send(`<:negacao:759603958317711371> | ${message.author}, você não possui todos estes demônios!`)
                user.caçados = user.caçados - valor;
                user.estrelinhas = user.estrelinhas + (valor * valorDemonio);
                user.save()
                message.channel.send(`<:positivo:759603958485614652> | ${message.author}, você vendeu **${valor}** <:DEMON:758765044443381780> demônios e recebeu **${valor * valorDemonio}** ⭐ estrelinhas!\nAgora você tem **${user.caçados}** <:DEMON:758765044443381780> e **${user.estrelinhas}**⭐`)
            }
           
        } else if (cArgs[0] === "2"){

            if (isNaN(valor) || valor < 1) {
                embedMessage.delete().catch()
                message.channel.send(`<:negacao:759603958317711371> | ${message.author}, este valor não é um número válido!`)
            } else {
                if (valor > user.anjos) return message.channel.send(`<:negacao:759603958317711371> | ${message.author}, você não possui todos estes anjos!`)
                user.anjos = user.anjos - valor;
                user.estrelinhas = user.estrelinhas + (valor * valorAnjo);
                user.save()
                message.channel.send(`<:positivo:759603958485614652> | ${message.author}, você vendeu **${valor}** <:ANGEL:758765044204437535> anjos e recebeu **${valor * valorAnjo}** ⭐ estrelinhas!\nAgora você tem **${user.anjos}** <:ANGEL:758765044204437535> e **${user.estrelinhas}**⭐`)
            }

        } else if(cArgs[0] === "3"){

            if (isNaN(valor) || valor < 1) {
                embedMessage.delete().catch()
                message.channel.send(`<:negacao:759603958317711371> | ${message.author}, este valor não é um número válido!`)
            } else {
                if (valor > user.semideuses) return message.channel.send(`<:negacao:759603958317711371> | ${message.author}, você não possui todos estes semideuses!`)
                user.semideuses = user.semideuses - valor;
                user.estrelinhas = user.estrelinhas + (valor * valorSD);
                user.save()
                message.channel.send(`<:positivo:759603958485614652> | ${message.author}, você vendeu **${valor}** <:SEMIGOD:758766732235374674> semideuses e recebeu **${valor * valorSD}** ⭐ estrelinhas!\nAgora você tem **${user.semideuses}** <:SEMIGOD:758766732235374674> e **${user.estrelinhas}**⭐`)
            }

        } else if(cArgs[0] === "4"){

            if (isNaN(valor) || valor < 1) {
                embedMessage.delete().catch()
                message.channel.send(`<:negacao:759603958317711371> | ${message.author}, este valor não é um número válido!`)
            } else {
                if (valor > user.deuses) return message.channel.send(`<:negacao:759603958317711371> | ${message.author}, você não possui todos estes deuses!`)
                user.deuses = user.deuses - valor;
                user.estrelinhas = user.estrelinhas + (valor * valorDeus);
                user.save()
                message.channel.send(`<:positivo:759603958485614652> | ${message.author}, você vendeu **${valor}** <:God:758474639570894899> deuses e recebeu **${valor * valorDeus}** ⭐ estrelinhas!\nAgora você tem **${user.deuses}** <:God:758474639570894899> e **${user.estrelinhas}**⭐`)
            }
        } else {
            embedMessage.delete().catch()
            message.channel.send(`<:negacao:759603958317711371> | ${message.author}, esta opção não é válida!`)
        }
    });
}

