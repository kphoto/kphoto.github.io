import type { MessageValue } from '../format.ts';
import { en } from './en.ts';
import { es } from './es.ts';

export type MessageKey = keyof typeof en;

export type Catalog = Readonly<Record<MessageKey, MessageValue>>;

export type Catalogs = Readonly<Record<string, Partial<Catalog>>>;

export const catalogs: Catalogs = { en, es };
