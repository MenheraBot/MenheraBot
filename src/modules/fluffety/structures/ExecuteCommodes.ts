import InteractionCommandContext from '@structures/command/InteractionContext';

export const executeBedroom = async (ctx: InteractionCommandContext): Promise<void> => {
  console.log(ctx);
};

export const executeKitchen = async (ctx: InteractionCommandContext): Promise<void> => {
  console.log(ctx);
};

export const executeOutisde = async (ctx: InteractionCommandContext): Promise<void> => {
  console.log(ctx);
};
