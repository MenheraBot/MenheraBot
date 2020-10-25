const Command = require("../../structures/command")
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