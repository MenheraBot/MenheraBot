import { VangoghUserprofileData } from '../../commands/info/ProfileCommand';
import { getProfileImageUrl } from '../../structures/cdnManager';

const huntValues = {
  roll: 15_000,
  demons: 900,
  giants: 1_200,
  angels: 2_300,
  archangels: 3_100,
  demigods: 5_800,
  gods: 14_000,
};

const colorPrices = {
  purple: 30_000,
  red: 30_000,
  cian: 30_000,
  green: 30_000,
  pink: 30_000,
  yellow: 30_000,
  your_choice: 50_000,
};

const customImagePrice = 150_000;

const unbuyableThemes = [3, 4, 5, 6, 25, 26, 27, 47, 51];
const helloKittyThemes = [31, 32, 33, 34, 35, 36, 37];

const previewProfileData: {
  user: VangoghUserprofileData;
  usageCommands: { cmds: { count: number }; array: { name: string; count: number }[] };
} = {
  user: {
    color: '#70c9f9' as const,
    image: getProfileImageUrl(1),
    avatar: 'https://menherabot.xyz/favicon.png',
    votes: 666,
    info: 'Gostou desse perfil? E que tal comprar? Nem vai ser tao caro, eu confio que tu vai querer, boa sorte UwU',
    badges: [6],
    hiddingBadges: [],
    username: 'PreviewMode',
    marryDate: '16/02/2004 às 22:23',
    mamadas: 23,
    mamou: 22,
    id: '',
    marryUsername: 'Luxanna',
    title: 'Observador',
    married: true,
  },
  usageCommands: {
    cmds: {
      count: 666,
    },
    array: [{ name: 'eval', count: 666 }],
  },
};

export {
  huntValues,
  colorPrices,
  unbuyableThemes,
  customImagePrice,
  previewProfileData,
  helloKittyThemes,
};
