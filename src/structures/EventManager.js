module.exports = class EventManager {
  constructor(client) {
    this.client = client;
    this.events = [];
  }

  add(name, fun) {
    this.client.on(name, (...args) => this.handleEvent(name, args));
    this.events.push({ name, fun });
  }

  remove(name) {
    if (!this.events.filter((a) => a.name === name)[0]) return false;
    delete this.events[this.events.findIndex((a) => a.name === name)];
    return true;
  }

  handleEvent(name, args) {
    this.events.filter((a) => a.name === name).forEach((e) => e.fun.run(...args));
  }
};
