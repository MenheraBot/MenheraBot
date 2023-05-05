import client, { Counter, Registry } from 'prom-client';

let register: Registry;
let commandsCounter: Counter;
let interactionsCounter: Counter;

const initializePrometheus = (): void => {
  register = new client.Registry();

  register.setDefaultLabels({
    app: 'menhera-bot-events',
  });

  commandsCounter = new client.Counter({
    name: 'commands_count',
    help: 'Count of commands executed',
    labelNames: ['category'],
  });

  interactionsCounter = new client.Counter({
    name: 'interactions_count',
    help: 'Number of interactions received',
    labelNames: ['type'],
  });

  register.registerMetric(commandsCounter);
  register.registerMetric(interactionsCounter);
};

const getRegister = (): Registry => register;
const getCommandsCounter = (): Counter => commandsCounter;
const getInteractionsCounter = (): Counter => interactionsCounter;

export { initializePrometheus, getRegister, getCommandsCounter, getInteractionsCounter };
