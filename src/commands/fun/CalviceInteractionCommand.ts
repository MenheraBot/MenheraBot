import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageButton } from 'discord.js-light';
import { actionRow, RandomFromArray } from '@utils/Util';

const availableAuthors = [
  'Zinédine Zidane',
  'Pedro Certezas',
  'Dwayne "The Rock" Johnson',
  'Vin Diesel',
  'Dida',
  'Leando Karnal',
  'Kayne West',
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

export default class CalviceInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'calvo',
      description: '「👨‍🦲」・Descubra o nível de calvice de alguém',
      options: [
        {
          name: 'user',
          type: 'USER',
          description: 'Usuário para descobrir o nível de calvice',
          required: true,
        },
      ],
      category: 'fun',
      cooldown: 5,
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const user = ctx.options.getUser('user', true);

    const calviceType = Math.floor(Math.random() * 4);
    const calviceLevel = Math.floor(Math.random() * 4);

    const moreButton = new MessageButton()
      .setLabel(ctx.locale('commands:calvo.know-more'))
      .setStyle('LINK')
      .setURL('https://i.imgur.com/EyOt51G.jpg');

    ctx.makeMessage({
      content: ctx.locale('commands:calvo.text', {
        name: user.username,
        user: user.toString(),
        stage: ctx.locale(`commands:calvo.stage-${calviceLevel as 0}`),
        type: ctx.locale(`commands:calvo.type-${calviceType as 0}`),
        description: ctx.locale(
          `commands:calvo.descriptions.${calviceType as 0}-${calviceLevel as 0}`,
        ),
        author: RandomFromArray(availableAuthors),
      }),
      components: [actionRow([moreButton])],
    });
  }
}
