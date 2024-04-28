import { ApplicationCommandOptionTypes, ButtonStyles } from 'discordeno/types';

import { User } from 'discordeno/transformers';
import { createCommand } from '../../structures/command/createCommand';
import { getDisplayName } from '../../utils/discord/userUtils';
import { createActionRow, createButton, createCustomId } from '../../utils/discord/componentUtils';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import {
  farmerModel,
  profileImagesModel,
  themeCreditsModel,
  titlesModel,
  userThemesModel,
  usersModel,
} from '../../database/collections';

const executeMigrateAccount = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [oldId, newId] = ctx.sentData;

  await ctx.ack();

  await Promise.all([
    usersModel.deleteOne({ id: newId }),
    userThemesModel.deleteOne({ id: newId }),
    themeCreditsModel.deleteOne({ id: newId }),
    themeCreditsModel.deleteOne({ id: newId }),
    profileImagesModel.deleteOne({ id: newId }),
    farmerModel.deleteOne({ id: newId }),
    titlesModel.deleteOne({ id: newId }),
  ]);

  await Promise.all([
    usersModel.updateOne({ id: oldId }, { $set: { id: newId } }),
    userThemesModel.updateOne({ id: oldId }, { $set: { id: newId } }),
    themeCreditsModel.updateOne({ id: oldId }, { $set: { id: newId } }),
    themeCreditsModel.updateOne({ id: oldId }, { $set: { id: newId } }),
    profileImagesModel.updateOne({ id: oldId }, { $set: { id: newId } }),
    farmerModel.updateOne({ id: oldId }, { $set: { id: newId } }),
    titlesModel.updateOne({ id: oldId }, { $set: { id: newId } }),
  ]);

  ctx.makeMessage({ components: [], content: 'É OS GURI' });
};

const DeployCommand = createCommand({
  path: '',
  name: 'migrar_conta',
  description: '[DEV] Migra os dados de um usuário para o outro (sem API)',
  options: [
    {
      type: ApplicationCommandOptionTypes.User,
      name: 'conta_antiga',
      description: 'name.split("_").join(" ")',
      required: true,
    },
    {
      name: 'conta_nova',
      description: 'name.split("_").join(" ")',
      type: ApplicationCommandOptionTypes.User,
      required: true,
    },
  ],
  devsOnly: true,
  category: 'dev',
  commandRelatedExecutions: [executeMigrateAccount],
  authorDataFields: [],
  execute: async (ctx, finishCommand) => {
    finishCommand();

    const oldAccount = ctx.getOption<User>('conta_antiga', 'users', true);
    const newAccount = ctx.getOption<User>('conta_nova', 'users', true);

    const confirmButton = createButton({
      customId: createCustomId(
        0,
        ctx.user.id,
        ctx.originalInteractionId,
        oldAccount.id,
        newAccount.id,
      ),
      label: 'DALE PAPAI',
      style: ButtonStyles.Danger,
    });

    ctx.makeMessage({
      content: `Só pra confirmar, tu vai todos os dados da Menhera da conta \`${getDisplayName(
        oldAccount,
      )} - ${oldAccount.id}\` para a conta \`${getDisplayName(newAccount)} - ${newAccount.id}\``,
      components: [createActionRow([confirmButton])],
    });
  },
});

export default DeployCommand;
