const { readdirSync } = require("fs-extra")
const i18next = require("i18next")
const translationBackend = require("i18next-node-fs-backend")

class LocaleStructure {
    constructor(client) {
        this.client = client
        this.languages = ["pt-BR", "en-US"]
        this.ns = ["commands", "events", "permissions", "roleplay"]
    }

    load() {
        try {
            this.startLocales()
            console.log("[LOCALES] Locales loaded!")
            return true
        } catch (err) {
            console.error(err)
        }
    }

    async startLocales() {
        try {
            i18next.use(translationBackend).init({
                ns: this.ns,
                preload: await readdirSync("./src/locales/"),
                fallbackLng: "pt-BR",
                backend: {
                    loadPath: "./src/locales/{{lng}}/{{ns}}.json"
                },
                interpolation: {
                    escapeValue: false
                },
                returnEmpyString: false
            })
        } catch (err) {
            console.error(err)
        }
    }
}

module.exports = LocaleStructure