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
    author: {
      discriminator: 1111,
    },
    locale: (text: string) => text,
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

  it('shoud send an embed talking about the author only', () => {
    // @ts-expect-error Mocking UwU
    angryCommand.execute(context);

    // @ts-expect-error Didnt find a best way of doing it
    expect(context.makeMessage.mock.calls[0][0].embeds[0].title).toBe(
      'commands:raiva.no-mention.embed_title',
    );
  });
});

export {};
