/* eslint-disable prefer-destructuring */
const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');

function getSlots(length, multipliers) {
  const slot1 = Math.floor(Math.random() * length);
  const slot2 = Math.floor(Math.random() * length);
  const slot3 = Math.floor(Math.random() * length);
  const result = {
    slots: {
      1: slot1,
      2: slot2,
      3: slot3,
    },
    multiplier: 0,
  };

  if (slot1 === slot2 && slot1 === slot3) {
    result.multiplier = multipliers[slot1][3];
  } else if (slot1 === slot2 || slot1 === slot3) {
    result.multiplier = multipliers[slot1][2];
  } else if (slot2 === slot3) {
    result.multiplier = multipliers[slot2][2];
  }

  return result;
}

module.exports = class SlotMachineCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'slotmachine',
      aliases: ['slot', 'caçaniquel', 'cacaniquel'],
      cooldown: 5,
      category: 'economia',
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run({ message, args, authorData: user }, t) {
    const options = ['🍌', '🍒', '🍊', '🍇', '💰', ':seven:'];

    const input = args[0];
    if (!input) return message.menheraReply('error', t('commands:slotmachine.invalid-value'));
    const valor = parseInt(input.replace(/\D+/g, ''));
    if (!valor || valor < 5000) return message.menheraReply('error', t('commands:slotmachine.invalid-value'));
    if (valor > user.estrelinhas) return message.menheraReply('error', t('commands:slotmachine.poor'));

    user.estrelinhas -= valor;

    const multipliers = [
      {
        2: 1,
        3: 5,
      },
      {
        2: 1,
        3: 9,
      },
      {
        2: 1,
        3: 17,
      },
      {
        2: 2,
        3: 24,
      },
      {
        2: 2,
        3: 34,
      },
      {
        2: 4,
        3: 100,
      },
    ];

    const result = getSlots(options.length, multipliers);
    const line1 = `${options[result.slots[1] - 1] || options[options.length - 1]} **|** ${options[result.slots[2] - 1] || options[options.length - 1]} **|** ${options[result.slots[3] - 1] || options[options.length - 1]}`;
    const line2 = `${options[result.slots[1]]} **|** ${options[result.slots[2]]} **|** ${options[result.slots[3]]}`;
    const line3 = `${options[result.slots[1] + 1] || options[0]} **|** ${options[result.slots[2] + 1] || options[0]} **|** ${options[result.slots[3] + 1] || options[0]}`;

    const embed = new MessageEmbed()
      .setTitle(t('commands:slotmachine.title'))
      .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
      .setColor('#37efbb')
      .setDescription(`${line1}\n**---------------** \n${line2}\n**---------------** \n${line3}`);

    if (result.multiplier === 0) {
      user.estrelinhas -= (Math.floor(valor / 2));
      embed.setColor('#fc0505');
      embed.addField(t('commands:slotmachine.lose-title'), t('commands:slotmachine.lose-text', { valor: (valor + Math.floor(valor / 2)) }));
    } else {
      user.estrelinhas += (result.multiplier * valor);
      embed.addField(t('commands:slotmachine.win-title'), t('commands:slotmachine.win-text', { multiplier: (result.multiplier * valor), valor }));
    }

    message.channel.send(message.author, embed);
    await user.save().catch();
  }
};
