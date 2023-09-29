import { Bot, Component, DiscordComponent } from 'discordeno/*';

const transformComponentToDiscordComponent = (bot: Bot, payload: Component): DiscordComponent => {
  return {
    type: payload.type,
    custom_id: payload.customId,
    disabled: payload.disabled,
    required: payload.required,
    style: payload.style,
    label: payload.label,
    emoji: payload.emoji
      ? {
          id: payload.emoji.id?.toString(),
          name: payload.emoji.name,
          animated: payload.emoji.animated,
        }
      : undefined,
    url: payload.url,
    // @ts-expect-error dont exists
    channel_types: payload.channelTypes,
    // @ts-expect-error dont exists
    default_values: payload.defaultValues?.map((value) => ({
      id: `${value.id}`,
      type: value.type,
    })),
    options: payload.options?.map((option) => ({
      label: option.label,
      value: option.value,
      description: option.description,
      emoji: option.emoji
        ? {
            id: option.emoji.id?.toString(),
            name: option.emoji.name,
            animated: option.emoji.animated,
          }
        : undefined,
      default: option.default,
    })),
    placeholder: payload.placeholder,
    min_values: payload.minValues,
    max_values: payload.maxValues,
    min_length: payload.minLength,
    max_length: payload.maxLength,
    value: payload.value,
    components: payload.components?.map((component) =>
      bot.transformers.reverse.component(bot, component),
    ),
  };
};

export { transformComponentToDiscordComponent };
