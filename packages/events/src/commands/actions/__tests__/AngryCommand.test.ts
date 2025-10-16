import { jest } from '@jest/globals';
import i18next from 'i18next';
import angryCommand from '../AngryCommand.js';

describe('AngryCommand tests', () => {
  const context = {
    getOption: jest.fn(),
    makeMessage: jest.fn(),
    prettyResponse: (_: unknown, text: string) => text,
    author: {
      discriminator: 1111,
      id: 1,
      username: 'veigar',
    },
    locale: jest.fn((text: string, data: Record<string, string> = {}) =>
      i18next.getFixedT('pt-BR')(text, data),
    ),
  };

  const noop = () => undefined;

  beforeEach(() => {
    context.getOption = jest.fn();
    context.makeMessage.mockClear();
    context.locale.mockClear();
  });

  it('should return a message saying that cannot mention bots', () => {
    context.getOption.mockReturnValueOnce({ toggles: { bot: true } });

    // @ts-expect-error Mocking UwU
    angryCommand.execute(context, noop);

    expect(context.makeMessage.mock.calls[0][0]).toEqual({ content: 'commands:raiva.bot' });
  });

  it('shoud send an embed talking about the author only', () => {
    // @ts-expect-error Mocking UwU
    angryCommand.execute(context, noop);

    expect(context.locale.mock.calls[0][0]).toBe('commands:raiva.no-mention.embed_title');
  });

  it('should has a reason when talking about the author only', () => {
    context.getOption.mockReturnValueOnce(undefined);
    context.getOption.mockReturnValueOnce('motivo tri');
    // @ts-expect-error Mocking UwU
    angryCommand.execute(context, noop);

    expect(
      // @ts-expect-error Didnt find a best way of doing it
      context.makeMessage.mock.calls[0][0].embeds[0].description.includes('Motivo tri'),
    ).toBe(true);
  });

  it('should send a embed mentioning the author and the target', () => {
    context.getOption.mockReturnValueOnce({ id: 2 });

    // @ts-expect-error Mocking UwU
    angryCommand.execute(context, noop);

    expect(
      // @ts-expect-error Didnt find a best way of doing it
      [1, 2].every((id) => context.makeMessage.mock.calls[0][0].embeds[0].description.includes(id)),
    ).toBe(true);
  });

  it('should include the reason in the final embed if given', () => {
    context.getOption.mockReturnValueOnce({ id: 2 });
    context.getOption.mockReturnValueOnce('motivo tri');
    // @ts-expect-error Mocking UwU
    angryCommand.execute(context, noop);

    expect(
      // @ts-expect-error Didnt find a best way of doing it
      context.makeMessage.mock.calls[0][0].embeds[0].description.includes('Motivo tri'),
    ).toBe(true);
  });
});

export {};
