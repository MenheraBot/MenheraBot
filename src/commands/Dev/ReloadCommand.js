const Command = require("../../structures/command")
module.exports = class UpdateCommand extends Command {
    constructor(client) {
        super(client, {
            name: "reload",
            description: "Updata um comando",
            devsOnly: true,
            category: "Dev"
        })
    }
    async run({ message, args, server }, t) {

        const option = this.getOption(args[0], ["command", "comando"], ["evento", "event"])
		if (!option) return message.channel.send("me dê uma opção válida. Opções disponíveis: `evento`, `comando`")
		if (!args[1]) return message.channel.send("me dê um comando/evento para recarregar.")
		const type = option === "yes" ? "comando" : "evento"

		const rst = option === "yes" ? this.client.reloadCommand(args[1]) : this.client.reloadEvent(args[1])
		if (rst instanceof Error) return message.channel.send(`falha no recarregamento do ${type}.Stack:\n\`\`\`js${rst}\`\`\``)
		if (rst === false) return message.channel.send(`${type} inexistente.`)

		message.channel.send(`${type} recarregado com sucesso!`)

    }
}