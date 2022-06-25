// Cada entrie do objeto é o id da badge, com as informações dela

import { IBadge, IUserSchema } from '@custom_types/Menhera';
import { DiscordFlagsToMenheraBadges } from '@structures/Constants';
import { User } from 'discord.js-light';

/*
  Níveis de raridade:

  0 = Disponível a partir do Discord
  1 = Disponível para compra com estrelinhas a qualquer momento
  2 = Disponível utilizando comandos
  3 = Disponível ajudando a Menhera reportando bugs de nível alto
  4 = Disponível ajudando no Desenvolvimento da Menhera
  5 = Disponível por tempo limitado em eventos especiais
  6 = Disponível somente para amigos próximos da Lux
  7 = Exclusivo e praticamente impossivel
*/

const Badges = {
  1: {
    name: 'Evento de Natal de 2020',
    availabeStartAt: '24/12/2020',
    availabeStoptAt: '26/12/2020',
    rarityLevel: 5,
    description:
      'Esta badge foi possível ganhar ao participar do evento de natal de 2020 no servidor de suporte da Menhera',
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
  6: {
    name: 'Banido',
    availabeStartAt: '------',
    availabeStoptAt: '------',
    rarityLevel: 7,
    description: 'Badge exclusiva do Nav3ne por já ter sido banido mais de 5 vezes',
    link: 'https://media.discordapp.net/attachments/793669360857907200/793940062391369808/banido.png',
  },
  7: {
    name: 'Desenvolvedor da Menhera',
    availabeStartAt: '------',
    availabeStoptAt: '------',
    rarityLevel: 4,
    description: 'Badge exclusiva para usuários que ajudaram no desenvolvimento da Menhera',
    link: 'https://cdn.discordapp.com/attachments/793669360857907200/794288854143991838/developer.png',
  },
  8: {
    name: '1 Evento de Aniversário',
    availabeStartAt: '07/05/2021',
    availabeStoptAt: '07/05/2021',
    rarityLevel: 5,
    description: 'Badge para os participantes do evento de aniversário de 1 ano da Menhera',
    link: 'https://media.discordapp.net/attachments/793669360857907200/839946893903527948/birthday.png',
  },
  9: {
    name: '100 Votos',
    availabeStartAt: '------',
    availabeStoptAt: '------',
    rarityLevel: 2,
    description: 'Disponível para usuários que votaram mais de 100 vezes na Menhera',
    link: 'https://media.discordapp.net/attachments/793669360857907200/839951784785346600/MenheraThumbsUp.png',
  },
  10: {
    name: 'Rpg V1',
    availabeStartAt: '12/08/2021',
    availabeStoptAt: '12/08/2021',
    rarityLevel: 5,
    description: 'Dado a todas pessoas que jogaram o RPG da Menhera em sua versão 1.0',
    link: 'https://media.discordapp.net/attachments/793669360857907200/875366274987872286/rpg.png',
  },
  11: {
    name: 'Rpg V1 TOP PLAYERS',
    availabeStartAt: '12/08/2021',
    availabeStoptAt: '12/08/2021',
    rarityLevel: 7,
    description: 'Dado ao top 3 de cada classe do antigo RPG',
    link: 'https://media.discordapp.net/attachments/793669360857907200/875373756737028187/boleham.png',
  },
  12: {
    name: 'Ascensão da Menhera | Halloween 2021',
    availabeStartAt: '21/10/2021',
    availabeStoptAt: '1/09/2021',
    rarityLevel: 5,
    description:
      'Dado aos jogadores que ajudaram a Menhera a atingir o seu ápice do poder, iniciando seu plano de vingança...',
    link: 'https://media.discordapp.net/attachments/793669360857907200/900569702680633344/halloween.png',
  },
  13: {
    name: 'Evento de Natal de 2021',
    availabeStartAt: '01/12/2021',
    availabeStoptAt: '30/12/2021',
    rarityLevel: 5,
    description:
      'Esta Badge foi liberada para usuários que compraram o perfil de natal durante o evento',
    link: 'https://media.discordapp.net/attachments/793669360857907200/915072294810968094/natal2021.png',
  },
  14: {
    name: 'Bot Verificado',
    availabeStartAt: '-----',
    availabeStoptAt: '-----',
    rarityLevel: 0,
    description: 'Apenas bots verificados possuem esta badge. Simples',
    link: 'https://media.discordapp.net/attachments/793669360857907200/915072406203285594/bot.png',
  },
  15: {
    name: 'Designer Oficial',
    availabeStartAt: '04/12/2021',
    availabeStoptAt: '-----',
    rarityLevel: 4,
    description: 'Badge dada àqueles que tem um design dentro da Menhera!',
    link: 'https://media.discordapp.net/attachments/793669360857907200/916723467498434590/pencil.png',
  },
  16: {
    name: 'Boleham V2 Beta',
    availabeStartAt: '04/02/2022',
    availabeStoptAt: '20/02/2022',
    rarityLevel: 5,
    description: 'Badge dada à todos que participaram do Beta da Versão 2 do Rpg da Menhera',
    link: 'https://media.discordapp.net/attachments/793669360857907200/939245622039556166/beta.png',
  },
  17: {
    name: 'Aliança',
    availabeStartAt: '--------',
    availabeStoptAt: '--------',
    rarityLevel: 2,
    description: 'Badge dada aos pombinhos apaixonados! Todos usuários casados possuem uma!',
    link: 'https://media.discordapp.net/attachments/793669360857907200/990263332340658226/ring.png',
  },
  18: {
    name: 'Ajudante Constante',
    availabeStartAt: '--------',
    availabeStoptAt: '--------',
    rarityLevel: 2,
    description: 'Esta badge só aparece no seu perfil caso você tenha votado nas ultimas 12 horas',
    link: 'https://media.discordapp.net/attachments/793669360857907200/939245622039556166/beta.png',
  },
};

export const getUserBadges = (user: IUserSchema, member: User): Array<IBadge> => {
  const userBadges: Array<IBadge> = user.badges;

  member?.flags?.toArray().forEach((name) => {
    if (DiscordFlagsToMenheraBadges[name])
      userBadges.push({
        id: DiscordFlagsToMenheraBadges[name],
        obtainAt: `${member.createdTimestamp}`,
      });
  });

  if (user.married && user.married !== 'false')
    userBadges.push({ id: 17, obtainAt: `${user.marriedAt ?? member.createdTimestamp}` });

  if (user.voteCooldown > Date.now()) userBadges.push({ id: 18, obtainAt: `${user.voteCooldown}` });

  return userBadges;
};

export default Badges;
