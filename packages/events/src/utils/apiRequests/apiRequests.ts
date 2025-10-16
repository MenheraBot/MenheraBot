import axios from 'axios';
import { getEnviroments } from '../getEnviroments.js';

const { MENHERA_API_URL, MENHERA_AGENT, MENHERA_API_TOKEN } = getEnviroments([
  'MENHERA_API_URL',
  'MENHERA_API_TOKEN',
  'MENHERA_AGENT',
]);

const dataRequest = axios.create({
  baseURL: `${MENHERA_API_URL}/data`,
  timeout: 7000,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': MENHERA_AGENT,
    Authorization: MENHERA_API_TOKEN,
  },
});

const statusRequest = axios.create({
  baseURL: `${MENHERA_API_URL}/info`,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': MENHERA_AGENT,
    Authorization: MENHERA_API_TOKEN,
  },
});

export { dataRequest, statusRequest };
