const { Message } = require("discord.js")
const emotes = require("./emotes")
module.exports = class ProtoTypes {
    static start() {
        Message.prototype.menheraReply = async function send(emoji, message, ...args) {

            emoji = emotes[emoji]
            return this.channel.send(`${emoji ? emoji : "🐛"} **|** ${this.author}, ${message}`, ...args)
        }
    }
}