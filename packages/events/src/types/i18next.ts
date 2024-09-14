// import default language
import type commands from '../../locales/pt-BR/commands.json';
import type common from '../../locales/pt-BR/common.json';
import type data from '../../locales/pt-BR/data.json';
import type events from '../../locales/pt-BR/events.json';
import type permissions from '../../locales/pt-BR/permissions.json';
import type roleplay from '../../locales/pt-BR/roleplay.json';
import type items from '../../locales/pt-BR/items.json';
import type abilities from '../../locales/pt-BR/abilities.json';
import type enemies from '../../locales/pt-BR/enemies.json';

export const availableLanguages = ['pt-BR' as const, 'en-US' as const];
export type AvailableLanguages = (typeof availableLanguages)[number];

export type Resources = {
  commands: typeof commands;
  common: typeof common;
  data: typeof data;
  events: typeof events;
  permissions: typeof permissions;
  roleplay: typeof roleplay;
  items: typeof items;
  abilities: typeof abilities;
  enemies: typeof enemies;
};

type TokenTranslation<Namespaces, R extends boolean = false> = Extract<
  keyof {
    [Key in Extract<keyof Namespaces, string> as Namespaces[Key] extends string | number
      ? `${Key}`
      : `${Key}${R extends true ? '.' : ':'}${TokenTranslation<Namespaces[Key], true>}`]: unknown;
  },
  string
>;

export type Translation = TokenTranslation<Resources>;
