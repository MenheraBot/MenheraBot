/*
  Níveis de raridade:
  0 = Disponível a partir do Discord
  2 = Disponível utilizando comandos
  4 = Disponível ajudando no Desenvolvimento da Menhera
  5 = Disponível por tempo limitado em eventos especiais
  6 = Badges disponíveis apenas por presente da Lux
  7 = Exclusivo e praticamente impossivel
*/

enum BadgeRarity {
  DiscordBadge = 0,
  CommandBased = 2,
  HelpingDevelopment = 4,
  SpecialEvents = 5,
  SelectedPeople = 6,
  Exclusive = 7,
}

const profileBadges = {
  1: {
    name: 'Evento de Natal de 2020',
    availableStartAt: '24/12/2020',
    availableStopAt: '26/12/2020',
    rarityLevel: BadgeRarity.SpecialEvents,
    description:
      'Esta badge foi possível ganhar ao participar do evento de natal de 2020 no servidor de suporte da Menhera',
  },
  2: {
    name: 'HypeSquad Balance',
    availableStartAt: '-----',
    availableStopAt: '-----',
    rarityLevel: BadgeRarity.DiscordBadge,
    description: 'Badge disponível para as casas HypeSquad',
  },
  3: {
    name: 'HypeSquad Brilliance',
    availableStartAt: '-----',
    availableStopAt: '-----',
    rarityLevel: BadgeRarity.DiscordBadge,
    description: 'Badge disponível para as casas HypeSquad',
  },
  4: {
    name: 'HypeSquad Bravery',
    availableStartAt: '-----',
    availableStopAt: '-----',
    rarityLevel: BadgeRarity.DiscordBadge,
    description: 'Badge disponível para as casas HypeSquad',
  },
  5: {
    name: 'Desenvolvedor de Bots Pioneiro',
    availableStartAt: '-----',
    availableStopAt: '-----',
    rarityLevel: BadgeRarity.DiscordBadge,
    description: 'Badge disponível para desenvolvedores de bots verificados do discord',
  },
  6: {
    name: 'Banido',
    availableStartAt: '------',
    availableStopAt: '------',
    rarityLevel: BadgeRarity.SelectedPeople,
    description: 'Badge a princípio exclusiva do Nav3ne por já ter sido banido mais de 5 vezes',
  },
  7: {
    name: 'Desenvolvedor da Menhera',
    availableStartAt: '------',
    availableStopAt: '------',
    rarityLevel: BadgeRarity.HelpingDevelopment,
    description:
      'Badge exclusiva para usuários que ajudaram no desenvolvimento da Menhera dando sugesões espetaculares',
  },
  8: {
    name: '1 Evento de Aniversário',
    availableStartAt: '07/05/2021',
    availableStopAt: '07/05/2021',
    rarityLevel: BadgeRarity.SpecialEvents,
    description: 'Badge para os participantes do evento de aniversário de 1 ano da Menhera',
  },
  10: {
    name: 'Rpg V1',
    availableStartAt: '12/08/2021',
    availableStopAt: '12/08/2021',
    rarityLevel: BadgeRarity.CommandBased,
    description: 'Dado a todas pessoas que jogaram o RPG da Menhera em sua versão 1.0',
  },
  11: {
    name: 'Rpg V1 TOP PLAYERS',
    availableStartAt: '12/08/2021',
    availableStopAt: '12/08/2021',
    rarityLevel: BadgeRarity.Exclusive,
    description: 'Dado ao top 3 de cada classe do antigo RPG',
  },
  12: {
    name: 'Ascensão da Menhera | Halloween 2021',
    availableStartAt: '21/10/2021',
    availableStopAt: '1/09/2021',
    rarityLevel: BadgeRarity.SpecialEvents,
    description:
      'Dado aos jogadores que ajudaram a Menhera a atingir o seu ápice do poder, iniciando seu plano de vingança...',
  },
  13: {
    name: 'Evento de Natal de 2021',
    availableStartAt: '01/12/2021',
    availableStopAt: '30/12/2021',
    rarityLevel: BadgeRarity.SpecialEvents,
    description:
      'Esta Badge foi liberada para usuários que compraram o perfil de natal durante o evento',
  },
  14: {
    name: 'Bot Verificado',
    availableStartAt: '-----',
    availableStopAt: '-----',
    rarityLevel: BadgeRarity.DiscordBadge,
    description: 'Apenas bots verificados possuem esta badge. Simples',
  },
  15: {
    name: 'Designer Oficial',
    availableStartAt: '04/12/2021',
    availableStopAt: '-----',
    rarityLevel: BadgeRarity.HelpingDevelopment,
    description: 'Badge dada àqueles que tem um design dentro da Menhera!',
  },
  16: {
    name: 'Boleham V2 Beta',
    availableStartAt: '04/02/2022',
    availableStopAt: '20/02/2022',
    rarityLevel: BadgeRarity.CommandBased,
    description: 'Badge dada à todos que participaram do Beta da Versão 2 do Rpg da Menhera',
  },
  17: {
    name: 'Aliança',
    availableStartAt: '--------',
    availableStopAt: '--------',
    rarityLevel: BadgeRarity.CommandBased,
    description: 'Badge dada aos pombinhos apaixonados! Todos usuários casados possuem uma!',
  },
  18: {
    name: 'Ajudante Constante',
    availableStartAt: '--------',
    availableStopAt: '--------',
    rarityLevel: BadgeRarity.CommandBased,
    description: 'Esta badge só aparece no seu perfil caso você tenha votado nas ultimas 12 horas',
  },
  20: {
    name: 'Bug Reporter',
    availableStartAt: '02/04/2023',
    availableStopAt: '--------',
    rarityLevel: BadgeRarity.HelpingDevelopment,
    description: 'Badge para usuários que reportaram bugs de grande impacto da Menhera!',
  },
  23: {
    name: 'Aniversário Menhera 2023',
    availableStartAt: '07/05/2023',
    availableStopAt: '07/05/2023',
    rarityLevel: BadgeRarity.SpecialEvents,
    description:
      'Badge dada aos usuários que mamaram a Menhera durante o dia de seu aniversário de 3 anos',
  },
  24: {
    name: 'Hello Kitty',
    availableStartAt: '23/05/2023',
    availableStopAt: '-----',
    rarityLevel: BadgeRarity.CommandBased,
    description: 'Este usuário é fanático pela Hello Kitty <3',
  },
  25: {
    name: 'Fanático por Doces',
    availableStartAt: '15/10/2023',
    availableStopAt: '01/11/2023',
    rarityLevel: BadgeRarity.SpecialEvents,
    description: 'Esta badge foi dada aos usuários do TOP 10 do evento de hallowween de 2023',
  },
  26: {
    name: 'Alvo da Vizinhança',
    availableStartAt: '15/10/2023',
    availableStopAt: '01/11/2023',
    rarityLevel: BadgeRarity.SpecialEvents,
    description:
      'Badge dada a todos usuários que sofreram com todas travessuras do evento de halloween de 2023',
  },
  // -- Badges de Aniversário --
  200: {
    name: 'Um ano com a Menhera',
    availableStartAt: '07/05/2021',
    availableStopAt: '--------',
    rarityLevel: BadgeRarity.CommandBased,
    description:
      'Se você tem essa badge em seu perfil, parabéns! Você usa a Menhera a mais de um ano!',
  },
  201: {
    name: 'Dois anos com a Menhera',
    availableStartAt: '07/05/2022',
    availableStopAt: '--------',
    rarityLevel: BadgeRarity.CommandBased,
    description:
      'Se você tem essa badge em seu perfil, parabéns! Você usa a Menhera a mais de um ano!',
  },
  202: {
    name: 'Três anos com a Menhera',
    availableStartAt: '07/05/2023',
    availableStopAt: '--------',
    rarityLevel: BadgeRarity.CommandBased,
    description:
      'Se você tem essa badge em seu perfil, parabéns! Você usa a Menhera a mais de um ano!',
  },
  // -- Badges de Votos --
  100: {
    name: '50 Votos',
    availableStartAt: '------',
    availableStopAt: '------',
    rarityLevel: BadgeRarity.CommandBased,
    description: 'Disponível para usuários que votaram mais de 50 vezes na Menhera',
  },
  101: {
    name: '100 Votos',
    availableStartAt: '------',
    availableStopAt: '------',
    rarityLevel: BadgeRarity.CommandBased,
    description: 'Disponível para usuários que votaram mais de 100 vezes na Menhera',
  },
  102: {
    name: '200 Votos',
    availableStartAt: '------',
    availableStopAt: '------',
    rarityLevel: BadgeRarity.CommandBased,
    description: 'Disponível para usuários que votaram mais de 200 vezes na Menhera',
  },
  103: {
    name: '300 Votos',
    availableStartAt: '------',
    availableStopAt: '------',
    rarityLevel: BadgeRarity.CommandBased,
    description: 'Disponível para usuários que votaram mais de 300 vezes na Menhera',
  },
  104: {
    name: '400 Votos',
    availableStartAt: '------',
    availableStopAt: '------',
    rarityLevel: BadgeRarity.CommandBased,
    description: 'Disponível para usuários que votaram mais de 400 vezes na Menhera',
  },
  105: {
    name: '500 Votos',
    availableStartAt: '------',
    availableStopAt: '------',
    rarityLevel: BadgeRarity.CommandBased,
    description: 'Disponível para usuários que votaram mais de 500 vezes na Menhera',
  },
  106: {
    name: '1000 Votos',
    availableStartAt: '------',
    availableStopAt: '------',
    rarityLevel: BadgeRarity.CommandBased,
    description: 'Disponível para usuários que votaram mais de 1000 vezes na Menhera',
  },
};

export { profileBadges };
