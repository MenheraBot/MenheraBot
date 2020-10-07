
module.exports = {
  name: "sucumba",
  aliases: ["sucumbe", "fuzer"],
  cooldown: 3,
  dir: 'SuccumbCommand',
  category: "diversão",
  description: "SUCUMBA MUCALOL",
  userPermission: null,
  clientPermission: ["EMBED_LINKS"],
  usage: "m!sucumba <@menção || texto>",
  run: async (client, message, args) => {
  const user = message.mentions.users.first() || args.join(" ");
  if(!user) return message.reply("n/a");
  if(user.id == message.author.id) return message.reply("n/a");
  message.channel.send(`SUCUMBA **${user}**\nVERME\nLIXO\nHORROROSO\nRUIM\nHORRÍVEL\nESCÓRIA\nBOSTA\nLIXOSO\nPERITO EM ENTREGAR GAME\nCOCOZENTO`);
}};
