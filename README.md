<img width="150" height="150" align="left" style="float: left; margin: 0 10px 0 0;" alt="MenheraBot" src="https://i.imgur.com/jjgBki0.png">

# Menhera Bot

[![](https://top.gg/api/widget/owner/708014856711962654.svg)](https://top.gg/bot/708014856711962654)
[![](https://top.gg/api/widget/servers/708014856711962654.svg)](https://discord.gg/fZMdQbA)
[![](https://top.gg/api/widget/upvotes/708014856711962654.svg)](https://top.gg/bot/708014856711962654/vote)
[![Build and publish Menhera images](https://github.com/MenheraBot/MenheraBot/actions/workflows/deploy.yml/badge.svg?branch=production)](https://github.com/MenheraBot/MenheraBot/actions/workflows/deploy.yml)

> Menhera is animating more than 90k servers with her functionalities

MenheraBot is an open source Discord bot made in TypeScript with [Discordeno](https://discordeno.mod.land/) with foccus in Fun.
Feel free to add a star ⭐ to the repository to promote the project!

## 👨‍💻 | Contributing

Pull requests are always welcome. If you have any ideia, want to implement a new feature, fix some bug, or even improve the code itself, you can do it openning a pull request to the `master` branch. Check the next session about running the project.

## 🔥 | Running

This monorepo is divided in 3 main packages. The REST takes care of making contact with Discord's API, with this, we can avoid rate limits before making the request to the API **(NOT USED AT THE MOMENT)**. The Orchestrator receives all data from the outside world. It receives the HTTP interactions from Discord, vote webhooks from top.gg and prometheus scrapes. And we got the the Events pacakge, which takes care of processing every interaction made by users. To run the bot, just follow the steps:

1. 🧹 Clone the repository

```bash
git clone https://github.com/MenheraBot/MenheraBot.git
```

2. 💻 Populate the env files. 
> Every package has a .env.example file with every entry needed. Just create a .env file with all the entries.

3. 🔥 Install deps and build all the packages

```bash
yarn install && yarn build:all
```

4. 🏃‍♂️ Running all services

> Open 2 terminals and execute each command in a different one. The EVENTS package depends on the other package in production.

```bash
# yarn rest dev
# yarn orchestrator dev
yarn events dev
```

5. 🐦 Running tests

```bash
yarn test
```

## 🎇 | Features

### 🌐 | Multi-language

Menhera can be used in brazilian portuguese or english

### 💰 | Economy

- Menhera's currency is the Little Stars ⭐️ that can be won: _Betting on Heads or Tails_, _Betting on the card game 21_, _Betting on French Roulette_, _Betting on Jogo Do Bicho_, _Selling hunts that can be acquired by hunting Demons, Gods, Angels , among others with Super Xandão - O Ultimo Guerreio do Apocalypse_ and others.

### 🥰 | Actions

- Menhera's biggest category has commands for _kissing friends_, _hugging_, _kicking_, _killing_, and the special one of all, _licking friends_. And not only that, it is possible to compete in a top of who licked the most, and was breastfed the licked!

### ✨ | Fun

- Another very large category, it has several image manipulation commands to make fun of your friends, such as Macetava, 8ball, Gado, Vasco (with the right to low quality), wedding system, the special _Poliamory System_ among many others

## 🙋‍♀️ | Support

You can enter Menhera's [support server](https://discord.gg/fZMdQbA) to help further. And don't forget to help by voting for Menhera
<br></br>
![MenheraWidget](https://top.gg/api/widget/708014856711962654.svg?usernamecolor=FFFFFF&topcolor=000000)

## 📑 | Useful Links

- [Discord](https://discord.gg/fZMdQbA)
- [Github](https://github.com/ySnoopyDogy/MenheraBot)
- [Top.GG](https://top.gg/bot/708014856711962654)
- [Official Site](https://menherabot.xyz)

## 📧 | Contact

Discord: **@ysnoopydogy**

Twitter: **[@Luxanna_Dev](https://twitter.com/Luxanna_Dev)**

Email: **[contact@luancaliel.dev](mailto:contact@luancaliel.dev)**


## 📜 | Source

Menhera uses the AGPL-3.0 license. See the `LICENSE` file for more information!

---

Made with ❤️ by [Luxanna](https://github.com/ySnoopyDogy)
