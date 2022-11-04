import { jest } from '@jest/globals';
import angryCommand from '../AngryCommand';

describe('AngryCommand tests', () => {
  const context = {
    getOption: jest.fn(),
    makeMessage: jest.fn(),
    prettyResponse: (_: unknown, text: string) => text,
  };

  beforeEach(() => {
    context.getOption.mockClear();
    context.makeMessage.mockClear();
  });

  it('should return a message saying that cannot mention bots', () => {
    context.getOption.mockReturnValueOnce({ togles: { bot: true } });

    // @ts-expect-error Mocking UwU
    angryCommand.execute(context);

    // TESTS DONT WORK!

    // When testing, all nesting imports will try to connect to database and gateway process, make a way of conecting to the database, but
    // Removing the necessity of making conection to gateway and rest

    expect(context.makeMessage.mock.calls[0][0]).toEqual({ content: 'commands:raiva.bot' });
  });
});

export {};
