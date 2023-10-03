import client, { Gauge, Registry } from 'prom-client';

let register: Registry;
let commandsCounter: Gauge;
let interactionsCounter: Gauge;

const initializePrometheus = (): void => {
  if (process.env.NOMICROSERVICES) return;

  register = new client.Registry();

  register.setDefaultLabels({
    app: 'menhera-bot-events',
  });

  commandsCounter = new client.Gauge({
    name: 'commands_count',
    help: 'Count of commands executed',
    labelNames: ['command_name'],
  });

  interactionsCounter = new client.Gauge({
    name: 'interactions_count',
    help: 'Number of interactions received',
    labelNames: ['type'],
  });

  register.registerMetric(commandsCounter);
  register.registerMetric(interactionsCounter);
};

const getRegister = (): Registry => register;
const getCommandsCounter = (): Gauge => commandsCounter;
const getInteractionsCounter = (): Gauge => interactionsCounter;

export { initializePrometheus, getRegister, getCommandsCounter, getInteractionsCounter };
