import { loadLocales } from 'structures/LocalteStructure';
import { MenheraClient } from './types/menhera';

const setupMenheraClient = (client: MenheraClient) => {
  client.commands = new Map();
};

const initializeThirdParties = () => {
  loadLocales();
};

export { setupMenheraClient, initializeThirdParties };
