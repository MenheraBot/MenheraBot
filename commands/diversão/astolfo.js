const Discord = require("discord.js");
const jimp = require("jimp");
const fs = require("fs-extra");

module.exports = {
  name: "astolfo",
  aliases: ["grande", "egn"],
  cooldown: 5,
  category: "diversão",
  description: "É grande né?",
  usage: "m!astolfo <texto>",
  run: async (client, message, args) => {

  let fonte = await jimp.loadFont(jimp.FONT_SANS_32_BLACK);
  let texto = args.join(" ").toUpperCase();
  if (!texto) return message.reply("O que é grande? me diga");

  jimp.read('astolfo.png').then(img => {
      img.print(fonte, 66, 184, texto, 200).write("astolfopronto.png");

      message.channel.send(``, { files: ["astolfopronto.png"] });
    });
  setTimeout(() => {
    fs.remove("astolfopronto.png", err => {
      if (err) return console.error(err);
    });
  }, 3000);
}}
