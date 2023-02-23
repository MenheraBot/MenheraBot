import client, { Counter, Registry } from 'prom-client';

let register: Registry;
let commandsCounter: Counter;

const initializePrometheus = (): void => {
  if (process.env.NOMICROSERVICES) return;

  register = new client.Registry();

  register.setDefaultLabels({
    app: 'menhera-bot-events',
  });

  commandsCounter = new client.Counter({
    name: 'commands_count',
    help: 'Count of commands executed',
    labelNames: ['command'],
  });

  register.registerMetric(commandsCounter);
};

const getRegister = (): Registry => register;
const getCommandsCounter = (): Counter => commandsCounter;

export { initializePrometheus, getRegister, getCommandsCounter };
