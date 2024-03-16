import client, { Counter, Registry } from 'prom-client';

let register: Registry;
let commandsCounter: Counter;
let interactionsCounter: Counter;
let ratelimitCounter: Counter;
let stuckQueuesCounter: Counter;

const initializePrometheus = (): void => {
  if (process.env.NOMICROSERVICES) return;

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

  register.registerMetric(ratelimitCounter);
  register.registerMetric(commandsCounter);
  register.registerMetric(interactionsCounter);
  register.registerMetric(stuckQueuesCounter);
};

const getRegister = (): Registry => register;
const getCommandsCounter = (): Counter => commandsCounter;
const getInteractionsCounter = (): Counter => interactionsCounter;
const getRateLimitCounter = (): Counter => ratelimitCounter;
const getStuckQueuesCounter = (): Counter => stuckQueuesCounter;

export {
  initializePrometheus,
  getRegister,
  getCommandsCounter,
  getStuckQueuesCounter,
  getInteractionsCounter,
  getRateLimitCounter,
};
