import { Collection } from 'discordeno';
import { Interaction, Member, User } from 'discordeno/transformers';
import { InputTextComponent, MessageComponentTypes } from 'discordeno/types';

export type ComponentInteraction = Interaction & { data: { customId: string } };
export type SelectMenuInteraction = ComponentInteraction & { data: { values: string[] } };
export type SelectMenuUsersInteraction = SelectMenuInteraction & {
  data: { resolved: { users: Collection<bigint, User>; members: Collection<bigint, Member> } };
};

export type ModalInteraction = ComponentInteraction & {
  data: {
    components: { type: MessageComponentTypes.ActionRow; components: InputTextComponent[] }[];
  };
};
