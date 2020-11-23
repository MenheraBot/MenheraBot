module.exports = class EventManager {
  constructor(client) {
    this.client = client;
    this.events = new Map();
  }

  add(name, filepath, event) {
    event.dir = filepath;
    event.run = event.run.bind(event);
    this.client.on(name, event.run);
    this.events.set(name, event);
  }
};
