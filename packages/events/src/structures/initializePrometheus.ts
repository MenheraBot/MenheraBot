import client, { Counter, Registry } from 'prom-client';

let register: Registry;
let commandsCounter: Counter;
let interactionsCounter: Counter;
let experimentsCommandsCounter: Counter;

const initializePrometheus = (): void => {
  if (process.env.NOMICROSERVICES) return;

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

  experimentsCommandsCounter = new client.Counter({
    name: 'total_commands',
    help: 'Amount off all comands with infos executed',
    labelNames: ['user_id', 'guild_id', 'command_name'],
  });

  register.registerMetric(commandsCounter);
  register.registerMetric(interactionsCounter);
  register.registerMetric(experimentsCommandsCounter);
};

const getRegister = (): Registry => register;
const getCommandsCounter = (): Counter => commandsCounter;
const getInteractionsCounter = (): Counter => interactionsCounter;
const getExperimentsCommandsCounter = (): Counter => experimentsCommandsCounter;

export {
  initializePrometheus,
  getRegister,
  getExperimentsCommandsCounter,
  getCommandsCounter,
  getInteractionsCounter,
};
