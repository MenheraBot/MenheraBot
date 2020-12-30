// Cada entrie do objeto é o id da badge, com as informações dela

/*
  Níveis de raridade:

  0 = Disponível a partir do Discord
  1 = Disponível para compra com estrelinhas a qualquer momento
  2 = Disponível utilizando comandos
  3 = Disponível ajudando a Menhera reportando bugs de nível alto
  4 = Disponível ajudando no Desenvolvimento da Menhera
  5 = Disponível por tempo limitado em eventos especiais
  6 =Disponível somente para amigos próximos da Lux
*/

const Badges = {
  1: {
    name: 'Evento de Natal de 2020',
    availabeStartAt: '24/12/2020',
    availabeStoptAt: '26/12/2020',
    rarityLevel: 5,
    description: 'Esta badge foi possível ganhar ao participar do evento de natal de 2020 no servidor de suporte da Menhera',
    link: 'https://media.discordapp.net/attachments/793669360857907200/793681506215395338/badge1.png',
  },
  2: {
    name: 'HypeSquad Balance',
    availabeStartAt: '-----',
    availabeStoptAt: '-----',
    rarityLevel: 0,
    description: 'Badge disponível para as casas HypeSquad',
    link: 'https://media.discordapp.net/attachments/793669360857907200/793906827083382794/balance.png',
  },
  3: {
    name: 'HypeSquad Brilliance',
    availabeStartAt: '-----',
    availabeStoptAt: '-----',
    rarityLevel: 0,
    description: 'Badge disponível para as casas HypeSquad',
    link: 'https://media.discordapp.net/attachments/793669360857907200/793906823471956018/brilliance.png',
  },
  4: {
    name: 'HypeSquad Bravery',
    availabeStartAt: '-----',
    availabeStoptAt: '-----',
    rarityLevel: 0,
    description: 'Badge disponível para as casas HypeSquad',
    link: 'https://media.discordapp.net/attachments/793669360857907200/793906829302169610/bravery.png',
  },
  5: {
    name: 'Desenvolvedor de Bots Pioneiro',
    availabeStartAt: '-----',
    availabeStoptAt: '-----',
    rarityLevel: 0,
    description: 'Badge disponível para desenvolvedores de bots verificados do discord',
    link: 'https://media.discordapp.net/attachments/793669360857907200/793906831449784330/developer.png',
  },
};

module.exports = Badges;
