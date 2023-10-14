import { ApplicationCommandOptionTypes, ButtonStyles } from 'discordeno/types';
import { User } from 'discordeno/transformers';

import { mentionUser } from '../../utils/discord/userUtils';
import { randomFromArray } from '../../utils/miscUtils';
import { createActionRow, createButton } from '../../utils/discord/componentUtils';
import { createCommand } from '../../structures/command/createCommand';

const availableAuthors = [
  'Zinédine Zidane',
  'Pedro Certezas',
  'Dwayne "The Rock" Johnson',
  'Vin Diesel',
  'Dida',
  'Leando Karnal',
  'Kanye West (Now Ye)',
  'Marcio Victor',
  'Jason Statham',
  'Bruce Willis',
  'Príncipe William',
  'Professor Xavier',
  'Paulo Zulu',
  'Sheemar Moore',
  'Rafael Zulu',
  'Michael Stipe',
  'Damon Wayans (Michale Kyle)',
  'Stanley Tucci',
  'Henrique Fogaça',
  'Terry Crews',
  'Thiaguinho',
  'Tiago Leifert',
  'Woody Harrelson',
  'Samuel Jackson',
  'Billi Zane',
  'John Malkovich',
  'James Spader',
  'Mahatma Gandhi',
  'Agostinho Carrara',
  'Jeff Bezos',
  'Michael Jordan',
  'Rick do Trato Feito',
  'Dr. Drauzio Varella',
];

const CalvoCommand = createCommand({
  path: '',
  name: 'calvo',
  nameLocalizations: { 'en-US': 'bald' },
  description: '「👨‍🦲」・Descubra o nível de calvice de alguém',
  descriptionLocalizations: { 'en-US': "「👨‍  」・Find out someone's baldness level" },
  options: [
    {
      name: 'user',
      type: ApplicationCommandOptionTypes.User,
      description: 'Usuário para descobrir o nível de calvíce',
      descriptionLocalizations: { 'en-US': 'User to find out baldness level' },
      required: true,
    },
  ],
  category: 'fun',
  authorDataFields: [],
  execute: async (ctx, finishCommand) => {
    const user = ctx.getOption<User>('user', 'users', true);

    const baldType = Math.floor(Math.random() * 4);
    const baldLevel = Math.floor(Math.random() * 4);

    const moreButton = createButton({
      label: ctx.locale('commands:calvo.know-more'),
      style: ButtonStyles.Link,
      url: 'https://i.imgur.com/EyOt51G.jpg',
    });

    await ctx.makeMessage({
      content: ctx.locale('commands:calvo.text', {
        name: user.username,
        user: mentionUser(user.id),
        stage: ctx.locale(`commands:calvo.stage-${baldLevel as 0}`),
        type: ctx.locale(`commands:calvo.type-${baldType as 0}`),
        description: ctx.locale(`commands:calvo.descriptions.${baldType as 0}-${baldLevel as 0}`),
        author: randomFromArray(availableAuthors),
      }),
      components: [createActionRow([moreButton])],
    });

    finishCommand();
  },
});

export default CalvoCommand;
