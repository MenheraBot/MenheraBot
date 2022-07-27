import { createCommand } from '../../structures/command/createCommand';

const DivorceCommand = createCommand({
  path: '',
  name: 'divorciar',
  nameLocalizations: { 'en-US': 'divorce' },
  description: '「💔」・Divorcie de seu atual cônjuje',
  descriptionLocalizations: { 'en-US': '「💔」・Divorce from your current spouse' },
  category: 'fun',
  authorDataFields: ['married'],
  execute: async (ctx) => {},
});

export default DivorceCommand;
