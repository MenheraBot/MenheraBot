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
    async run(message, args) {
        //Aquivo extra para testes
    }
}