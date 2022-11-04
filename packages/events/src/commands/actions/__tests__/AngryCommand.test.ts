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

  // @ts-expect-error Mocking UwU
  angryCommand.execute(context);

  it('should return a message saying that cannot mention bots', () => {
    context.getOption.mockReturnValueOnce({ togles: { bot: true } });

    expect(context.makeMessage.mock.calls[0][0]).toEqual({ content: 'commands:raiva.bot' });
  });
});

export {};
