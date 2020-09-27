module.exports = {
    name: "reload",
    aliases: ["recarregar"],
    cooldown: 2,
    category: "Dev",
    description: "Atualiza um comando sem reiniciar o bot",
    usage: "m!reload <comando>",
    
    run: async (client, message, args) => {

        if (!args.length) return message.channel.send(`❌ | Porra Lux, qual é o comando né krl`);
         const commandName = args[0].toLowerCase();
         const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

         if (!command) return message.channel.send(`❌ | Nenhum comando existente com o nome \`${commandName}\`, ${message.author}!`);

         delete require.cache[require.resolve(`../${command.category}/${command.name}.js`)];

         try {
            const newCommand = require(`../${command.category}/${command.name}.js`);
            client.commands.set(newCommand.name, newCommand);
            message.channel.send(`✅ | O comando \`${command.name}\` foi recarregado com sucesso`)
        } catch (error) {
            console.error(error);
            message.channel.send(`❌ | Um erro aconteceu ao recarregar o caomdno \`${command.name}\`:\n\`${error.message}\``);
        }

}}