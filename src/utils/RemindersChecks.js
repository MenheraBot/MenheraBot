const i18next = require('i18next');

module.exports = class RemindersEventLoop {
  constructor(client) {
    this.client = client;
  }

  async loop() {
    setInterval(async () => {
      const documentos = await this.client.database.Reminders.find();
      documentos.forEach((reminder) => {
        const rememberTime = parseInt(reminder.rememberAt);
        if (rememberTime <= (Date.now() + 1000 * 30)) this.sendReminder(reminder); // Soma 30 segundos ao minuto, caso o reminder seja nos proximos 30 segundos
      });
    }, 1000 * 60);
  }

  async sendReminder(doc) {
    const language = (doc.serverLang) || 'pt-BR';
    const t = i18next.getFixedT(language);

    if (doc.rememberInPv) {
      try {
        const user = await this.client.users.fetch(doc.id);
        await user.send(`<a:notification:771485861413650502> | ${doc.content}`);
        await this.client.database.Reminders.findByIdAndDelete(doc._id).catch();
      } catch {
        const channel = await this.client.channels.fetch(doc.channelId).catch();
        await channel.send(`<a:notification:771485861413650502> | <@${doc.id}> __${t('events:remember.remember')}__, ${doc.content}\n\n\`${t('events:reminder.no-dm')}\``).catch();
        await this.client.database.Reminders.findByIdAndDelete(doc._id).catch();
      }
    } else {
      try {
        const channel = await this.client.channels.fetch(doc.channelId);
        await channel.send(`<a:notification:771485861413650502> | <@${doc.id}>, ${doc.content}`);
        await this.client.database.Reminders.findByIdAndDelete(doc._id).catch();
      } catch {
        const user = await this.client.users.fetch(doc.id);
        await user.send(`<a:notification:771485861413650502> | ${doc.content}\n\n\`${t('events:reminder.no-channel')}\``).catch();
        await this.client.database.Reminders.findByIdAndDelete(doc._id).catch();
      }
    }
  }
};
