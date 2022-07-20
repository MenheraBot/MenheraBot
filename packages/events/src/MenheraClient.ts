import { MenheraClient } from 'types/menhera';

const setupMenheraClient = (client: MenheraClient) => {
  client.commands = new Map();
};

export { setupMenheraClient };
