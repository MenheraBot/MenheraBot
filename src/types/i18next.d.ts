// import default language
import type commands from '../locales/en-US/commands.json';
import type common from '../locales/en-US/common.json';
import type data from '../locales/en-US/data.json';
import type events from '../locales/en-US/events.json';
import type permissions from '../locales/en-US/permissions.json';
import type roleplay from '../locales/en-US/roleplay.json';
import type enemies from '../locales/en-US/enemies.json';
import type items from '../locales/en-US/items.json';
import type abilities from '../locales/en-US/abilities.json';

export type Resources = {
  commands: typeof commands;
  common: typeof common;
  data: typeof data;
  events: typeof events;
  permissions: typeof permissions;
  roleplay: typeof roleplay;
  enemies: typeof enemies;
  items: typeof items;
  abilities: typeof abilities;
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
