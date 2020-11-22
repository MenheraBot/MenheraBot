module.exports = class Command {
  constructor(client, options) {
    this.client = client;

    this.config = {
      name: options.name || null,
      category: options.category || 'util',
      aliases: options.aliases || [],
      description: options.description || null,
      cooldown: options.cooldown || 3,
      userPermissions: options.userPermissions || null,
      clientPermissions: options.clientPermissions || null,
      devsOnly: options.devsOnly || false,
    };
    this.maintenance = false;
    this.maintenanceReason = '';
  }

  setMaintenance(status, reason = '') {
    this.maintenance = status;
    this.maintenanceReason = reason;
  }

  static getOption(message, yes = ['adicionar', 'adc', 'add', 'insert'], no = ['remover', 'remove', 'delete', 'deletar']) {
    const cleanMessage = message.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    if (yes.filter((a) => a === cleanMessage)[0]) return 'yes';
    if (no.filter((a) => a === cleanMessage)[0]) return 'no';
    return null;
  }
};
