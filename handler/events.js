const fs = require("fs-extra");

module.exports = (client) => {

    fs.readdir("./events/", (err, files) => {
        if (err) console.log(err);

        files.forEach(file => {

            if (!file.endsWith(".js")) return;

            const event = require(`../events/${file}`);
            let eventName = file.split(".")[0];
            client.on(eventName, event.bind(null, client));
            delete require.cache[require.resolve(`../events/${file}`)];
        })
    })
}