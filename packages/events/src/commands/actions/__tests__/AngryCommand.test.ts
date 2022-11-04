import { jest } from '@jest/globals';
import { closeConnections } from '../../../database/databases';
import angryCommand from '../AngryCommand';

afterAll(() => {
  closeConnections();
});

describe('AngryCommand tests', () => {
  const context = {
    getOption: jest.fn(),
    makeMessage: jest.fn(),
    prettyResponse: (_: unknown, text: string) => text,
  };

  beforeEach(() => {
    context.getOption = jest.fn();
    context.makeMessage.mockClear();
  });

  it('should return a message saying that cannot mention bots', () => {
    context.getOption.mockReturnValueOnce({ toggles: { bot: true } });

    // @ts-expect-error Mocking UwU
    angryCommand.execute(context);

    expect(context.makeMessage.mock.calls[0][0]).toEqual({ content: 'commands:raiva.bot' });
  });
});

export {};
