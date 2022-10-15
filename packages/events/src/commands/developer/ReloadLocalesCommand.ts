import { reloadLocales } from '../../structures/localteStructure';
import { createCommand } from '../../structures/command/createCommand';

const ReloadLocalesCommand = createCommand({
  path: '',
  name: 'reloadlocales',
  description: '[DEV] Recarrega os locales da Menhera',
  devsOnly: true,
  category: 'dev',
  authorDataFields: [],
  execute: async () => {
    await reloadLocales();
  },
});

export default ReloadLocalesCommand;
