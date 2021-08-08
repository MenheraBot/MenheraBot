import Command from '@structures/command/Command';
import 'moment-duration-format';
import MenheraClient from 'MenheraClient';
import CommandContext from '@structures/command/CommandContext';
import { MessageEmbed } from 'discord.js';

export default class SlashinfoCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'slashinfo',
      aliases: ['slash'],
      cooldown: 10,
      category: 'info',
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: CommandContext): Promise<void> {
    const allTextCommands = this.client.commands.size;
    const allSlashCommands = this.client.slashCommands.size;

    const progress = (allSlashCommands * 100) / allTextCommands;

    const embed = new MessageEmbed()
      .setTitle('Estado dos Slash Commands')
      .setColor('BLURPLE')
      .setDescription(
        `Ainda faltam **${
          allTextCommands - allSlashCommands
        }** comandos para serem transcritos\nOs comandos normais pararão de funcionar em alguns meses devido à mudanças do Discord!`,
      )
      .addFields(
        [
          {
            name: 'Text Commands',
            value: allTextCommands.toString(),
            inline: true,
          },
          {
            name: 'Slash Commands',
            value: allSlashCommands.toString(),
            inline: true,
          },
        ],
        [
          {
            name: 'Slash Criados até o momento',
            value: `\`${this.client.slashCommands.map((a) => a.config.name).join('`, `')}\``,
            inline: false,
          },
          {
            name: 'Progresso',
            value: `**${progress.toFixed(2)}%**`,
            inline: true,
          },
        ],
      );

    ctx.send(embed);
  }
}
