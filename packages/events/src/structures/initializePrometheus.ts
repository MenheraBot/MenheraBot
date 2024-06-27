import client, { Counter, Registry } from 'prom-client';
import { logger } from '../utils/logger';

let register: Registry;
let commandsCounter: Counter;
let interactionsCounter: Counter;
let ratelimitCounter: Counter;
let stuckQueuesCounter: Counter;
let redisCacheCounter: Counter;

const initializePrometheus = (): void => {
  register = new client.Registry();

  commandsCounter = new client.Counter({
    name: 'commands_count',
    help: 'Count of commands executed',
    labelNames: ['command_name', 'complete_command'],
  });

  interactionsCounter = new client.Counter({
    name: 'interactions_count',
    help: 'Number of interactions received',
    labelNames: ['type'],
  });

  ratelimitCounter = new client.Counter({
    name: 'ratelimit',
    help: 'Amount of rate limits errors',
    labelNames: ['type'],
  });

  stuckQueuesCounter = new client.Counter({
    name: 'stuckqueues',
    help: 'Times that a stuck rate limit bucket queue were found and cleared',
  });

  redisCacheCounter = new client.Counter({
    name: 'redis_cache',
    help: 'Amount of hit and misses by redis cache',
    labelNames: ['type', 'status'],
  });

  register.registerMetric(ratelimitCounter);
  register.registerMetric(commandsCounter);
  register.registerMetric(interactionsCounter);
  register.registerMetric(stuckQueuesCounter);
  register.registerMetric(redisCacheCounter);
};

const getRegister = (): Registry => register;
const getCommandsCounter = (): Counter => commandsCounter;
const getInteractionsCounter = (): Counter => interactionsCounter;
const getRateLimitCounter = (): Counter => ratelimitCounter;
const getStuckQueuesCounter = (): Counter => stuckQueuesCounter;
const getRedisCacheCounter = (): Counter => redisCacheCounter;

const registerCacheStatus = (data: unknown, type: string): void => {
  if (process.env.NOMICROSERVICES) return;

  if (!redisCacheCounter) return logger.debug('Prometheus counters are not ready', data, type);

  redisCacheCounter.inc(
    {
      type,
      status: data ? 'HIT' : 'MISS',
    },
    0.5,
  );
};

export {
  initializePrometheus,
  registerCacheStatus,
  getRegister,
  getCommandsCounter,
  getRedisCacheCounter,
  getStuckQueuesCounter,
  getInteractionsCounter,
  getRateLimitCounter,
};
