import { ConsumableItem, ItemsFile } from '@roleplay/Types';
import { removeFromInventory } from '@roleplay/utils/AdventureUtils';
import { getUserMaxLife, getUserMaxMana } from '@roleplay/utils/Calculations';
import { getItemById } from '@roleplay/utils/DataUtils';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { IReturnData } from '@utils/Types';
import Util, { actionRow, disableComponents, resolveSeparatedStrings } from '@utils/Util';
import {
  MessageButton,
  MessageEmbed,
  MessageSelectMenu,
  SelectMenuInteraction,
} from 'discord.js-light';

export default class InventoryInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'inventario',
      description: '【ＲＰＧ】📦 | Abra o inventário de alguém',
      category: 'roleplay',
      options: [
        {
          name: 'user',
          description: 'O usuário que queres ver o inventário',
          type: 'USER',
          required: false,
        },
      ],
      cooldown: 7,
      authorDataFields: ['selectedColor'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const mentioned = ctx.options.getUser('user') ?? ctx.author;

    const user = await ctx.client.repositories.roleplayRepository.findUser(mentioned.id);
    if (!user) {
      ctx.makeMessage({ content: ctx.prettyResponse('error', 'common:unregistered') });
      return;
    }

    const embed = new MessageEmbed()
      .setThumbnail(mentioned.displayAvatarURL({ dynamic: true }))
      .setTitle(ctx.locale('commands:inventario.title', { user: mentioned.username }))
      .setColor(ctx.data.user.selectedColor);

    const resolvedItems: Array<IReturnData<ItemsFile> & { level: number; amount: number }> = [];

    const text = user.inventory.map((a) => {
      resolvedItems.push({ ...getItemById(a.id), level: a.level, amount: a.amount });
      return `• **${ctx.locale(`items:${a.id as 1}.name`)}** | ${ctx.locale(
        'common:roleplay.level',
      )} - **${a.level}** (${a.amount}) `;
    });

    embed.setDescription(
      text.length > 0 ? text.join('\n') : ctx.locale('commands:inventario.no-items'),
    );

    const usePotion = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | USE`)
      .setLabel(ctx.locale('commands:inventario.use'))
      .setStyle('PRIMARY')
      .setDisabled(true);

    if (
      mentioned.id === ctx.author.id &&
      resolvedItems.some((a) => a.data.flags.includes('consumable')) &&
      (user.mana < getUserMaxMana(user) || user.life < getUserMaxLife(user))
    )
      usePotion.setDisabled(false);

    if (user.cooldowns.some((a) => a.reason === 'church' && a.data !== 'COOLDOWN'))
      usePotion.setDisabled(true);

    ctx.makeMessage({ embeds: [embed], components: [actionRow([usePotion])] });

    if (usePotion.disabled) return;

    const selected = await Util.collectComponentInteractionWithStartingId(
      ctx.channel,
      ctx.author.id,
      ctx.interaction.id,
      7000,
    );

    if (!selected) {
      ctx.makeMessage({
        components: [actionRow(disableComponents(ctx.locale('common:timesup'), [usePotion]))],
      });
      return;
    }

    embed.setDescription('');

    const availablePotions = resolvedItems.filter((a) =>
      a.data.flags.includes('consumable'),
    ) as Array<IReturnData<ConsumableItem> & { level: number; amount: number }>;

    const selectMenu = new MessageSelectMenu().setCustomId(`${ctx.interaction.id} | SELECT`);

    const showedItems: { id: number; level: number }[] = [];

    availablePotions.forEach((a) => {
      if (!showedItems.some((b) => a.id === b.id && a.level === b.level))
        showedItems.push({ id: a.id, level: a.level });
      if (selectMenu.options.length < 25) {
        for (let i = 0; i < a.amount; i++) {
          selectMenu.addOptions({
            label: ctx.locale(`items:${a.id as 1}.name`),
            value: `${a.id} | ${a.level} | ${i}`,
          });
        }
      }
    });

    showedItems.forEach((a) => {
      const item = getItemById<ConsumableItem>(a.id);
      embed.addField(
        ctx.locale(`items:${a.id as 1}.name`),
        ctx.locale('commands:inventario.use-description', {
          level: a.level,
          regeneration: item.data.baseBoost + item.data.perLevel * a.level,
        }),
      );
    });

    selectMenu.setMaxValues(selectMenu.options.length);

    ctx.makeMessage({ embeds: [embed], components: [actionRow([selectMenu])] });

    const selectedItems =
      await Util.collectComponentInteractionWithStartingId<SelectMenuInteraction>(
        ctx.channel,
        ctx.author.id,
        ctx.interaction.id,
        7000,
      );

    if (!selectedItems) {
      ctx.makeMessage({
        components: [actionRow(disableComponents(ctx.locale('common:timesup'), [selectMenu]))],
      });
      return;
    }

    selectedItems.values.forEach((a) => {
      const [itemId, itemLevel] = resolveSeparatedStrings(a);
      const item = getItemById<ConsumableItem>(Number(itemId));

      const toRegenValue = Math.floor(item.data.baseBoost + item.data.perLevel * Number(itemLevel));
      const toRegenType = item.data.boostType;

      user[toRegenType] += toRegenValue;
      removeFromInventory([{ id: Number(itemId), level: Number(itemLevel) }], user.inventory);
    });

    if (user.life > getUserMaxLife(user)) user.life = getUserMaxLife(user);
    if (user.mana > getUserMaxMana(user)) user.mana = getUserMaxMana(user);

    await ctx.client.repositories.roleplayRepository.updateUser(ctx.author.id, {
      life: user.life,
      mana: user.mana,
      inventory: user.inventory,
    });

    ctx.makeMessage({
      embeds: [],
      components: [],
      content: ctx.prettyResponse('success', 'commands:inventario.use-success'),
    });
  }
}
