const Command = require("../../structures/command")
const request = require("request")
module.exports = class TestCommand extends Command {
    constructor(client) {
        super(client, {
            name: "test",
            description: "Arquivo destinado para testes",
            devsOnly: true,
            category: "Dev"
        })
    }
    async run({ message, args, server }, t) {

        /* const files = await this.client.database.Rpg.find()
        let entries = 0

        files.forEach(file => {
            let itens = []
            let loots = []
            file.inventory.forEach(inv => {
                if (inv.type == "Item") {
                    itens.push(inv)
                }
              })
              file.loots.forEach(loot => {
                loots.push(loot.name)
            })

            const countedLoots = countItems(loots)
            const countedItems = countItems(itens)

            let itensAmount = 0;
            let lootsAmount = 0;
            
            countedItems.forEach(oi => {
                itensAmount += oi.amount
            })

            countedLoots.forEach(tchau => {
                lootsAmount += tchau.amount
            })
            
            const espaçoTotal = itensAmount + lootsAmount

            file.backpack = {name: file.backpack.name, }
           
            entries++;
        });
        console.log("Documentos contados: " + entries) */

        /* 
 =====================================DELETAR GUILDAS INATIVAS==========================================================
        const files = await this.client.database.Guilds.find()
        files.forEach(doc => {
            if(doc.prefix == "m!"){
                if(doc.blockedChannels == null || doc.blockedChannels.length == 0){
                    this.client.database.Guilds.findOneAndDelete({id: doc.id}).then(console.log("Arquivo deletado"))
                }
            }
        }); */
    }
}

function countItems(arr) {
    const countMap = {};

    for (const element of arr) {
        countMap[element] = (countMap[element] || 0) + 1;
    }
    return Object.entries(countMap).map(([value, count]) => ({
        name: value,
        amount: count
    })
    );
}