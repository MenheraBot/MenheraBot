module.exports = class MessageUpdate {
	constructor(client) {
		this.client = client
	}

	run(oldMessage, newMessage) {
		if (oldMessage.content === newMessage.content) return
		this.client.emit("message", newMessage)
	}
}