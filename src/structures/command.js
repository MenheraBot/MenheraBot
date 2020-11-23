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
};
