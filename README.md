<img width="150" height="150" align="left" style="float: left; margin: 0 10px 0 0;" alt="MenheraBot" src="https://i.imgur.com/jjgBki0.png">

[![ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/U6U32QC5D)

# Menhera Bot

[![](https://top.gg/api/widget/owner/708014856711962654.svg)](https://top.gg/bot/708014856711962654)
[![](https://top.gg/api/widget/servers/708014856711962654.svg)](https://discord.gg/fZMdQbA)
[![](https://top.gg/api/widget/upvotes/708014856711962654.svg)](https://top.gg/bot/708014856711962654/vote)

> Menhera is animating more than 25000 servers with her functionalities

MenheraBot is an open source Discord bot made in TypeScript with [Discord.js-light](https://www.npmjs.com/package/discord.js-light) by [Luxanna](https://github.com/ySnoopyDogy)
Feel free to add a star ⭐ to the repository to promote the project!

## 🚸 | Contributing

Pull requests are always welcome. You can make PRs and Issues. When creating pr's, the branch of the pr needs to be `canary`.

## 📁 | Folder Structure

The folder structure may be a little confusing, so here is a little schema of how the files are separated here

```bash
📦src
 ┣ 📂commands # here are every slash command of Menhera. Each folder here is a category. Subcommands are inside of it main command
 ┃ ┣ 📂DEVELOPER # Only available for the owner
 ┃ ┣ 📂actions # Commands where a user take and action, like hug or kiss
 ┃ ┣ 📂economy # Every command involving the usage of Estrelinhas (Menhera's currency system)
 ┃ ┣ 📂fun # Just some random commands to users have fun
 ┃ ┣ 📂info # Commands that shows some informations about various things
 ┃ ┣ 📂roleplay # Every command that interacts with the World of Boleham. The Roleplay Gaming system.
 ┃ ┗ 📂util # TBH, any command that dont enter in other categories
 ┃
 ┣ 📂database # Files that manage the Databases connection
 ┃ ┣ 📂repositories # Every repository of repository pattern to talk with the database
 ┃ ┣ 📜Collections.ts # MongoDB collections
 ┃ ┗ 📜Databases.ts # Main class that connect to the databases
 ┃
 ┣ 📂events # Discord gateway events
 ┃
 ┣ 📂locales # Localization files to translate commands
 ┃
 ┣ 📂modules # Modules is why i call the systems of Menhera that has a big structure
 ┃ ┣ 📂flufetty # A funny system to have a little buddy to care on Discord
 ┃ ┣ 📂roleplay # The Roleplay System
 ┃ ┃ ┣ 📂data # The static data of the RPG
 ┃ ┃ ┣ 📂structures # Just some classes that handle things to the RPG
 ┃ ┃ ┣ 📂utils # Some utils
 ┃ ┃
 ┃ ┗ 📂staticData # Static Data is the static info of Menhera's Economy System or user personalization
 ┃
 ┣ 📂structures # Classes that makes Menhera works
 ┃ ┣ 📂command # Base classes that envolves the commands creation
 ┃ ┃ ┣ 📂autocomplete # Discord Autocomplete interactions
 ┃ ┃
 ┃ ┣ 📂server # HTTP server to talk to the outside world
 ┃
 ┣ 📂types # Typings
 ┃
 ┣ 📂utils # Small (or they was suposed to be) files to make little things
 ┃
 ┣ 📜MenheraClient.ts # The folder who makes everything works
```

## 🎇 | Features

### 🌐 | Multi-language

Menhera can be used in brazilian portuguese or english

### 🕹 | Roleplay Gaming (RPG)

- Menhera owns a parallel world, the _Boleham's World_. You can reincarnate in this world as a class among 12 different classes, with more than 4 unique abilities each, and a race among 8 unique races with specific bonuses.
- **Battle System:** A differentiator of my RPG is its turn-based battle system, where the user participates in the battle from the beginning to the end, deciding which skill should be used at that moment to end your enemy

<img style="border-radius: 40px;" width="360" src="https://i.imgur.com/BWxcHdR.png" alt="Sistema de Batalha"></img>

### 💰 | Economy

- Menhera's currency is the Little Stars ⭐️ that can be won: _Betting on Heads or Tails_, _Betting on the card game 21_, _Betting on French Roulette_, _Betting on Jogo Do Bicho_, _Selling hunts that can be acquired by hunting Demons, Gods, Angels , among others with Super Xandão - O Ultimo Guerreio do Apocalypse_ and others.

### 🥰 | Actions

- Menhera's biggest category has commands for _kissing friends_, _hugging_, _kicking_, _killing_, and the special one of all, _licking friends_. And not only that, it is possible to compete in a top of who licked the most, and was breastfed the licked!

### ✨ | Fun

- Another very large category, it has several image manipulation commands to make fun of your friends, such as Macetava, Gado, Vasco (with the right to low quality), wedding system, the special _Trisal System_ among many others

## 🙋‍♀️ | Support

You can enter Menhera's [support server](https://discord.gg/fZMdQbA) to help further. And don't forget to help by voting for Menhera
<br></br>
![MenheraWidget](https://top.gg/api/widget/708014856711962654.svg?usernamecolor=FFFFFF&topcolor=000000)

## 📑 | Useful Links

- [Discord](https://discord.gg/fZMdQbA)
- [Github](https://github.com/ySnoopyDogy/MenheraBot)
- [Top.GG](https://top.gg/bot/708014856711962654)
- [Official Site](https://menherabot.xyz)

## 📜 | Source

Menhera uses the AGPL-3.0 license. See the `LICENSE` file for more information!

---

Made with ❤️ by [Luxanna](https://github.com/ySnoopyDogy)
