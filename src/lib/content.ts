import {
  groupPostsByAuthor,
  groupPostsBySeries,
  groupPostsByTag,
  sortPostsByDateDesc,
} from './collections.ts';
import { isValidIsoDate } from './dates.ts';
import { extractFrontmatter } from './frontmatter.ts';
import { renderMarkdown } from './markdown.ts';
import { readingMinutes } from './readingTime.ts';
import { slugify } from './slug.ts';
import {
  SINGLE_LOCALE,
  type Author,
  type AuthorSocials,
  type ContentInput,
  type ContentLocales,
  type MarkdownPage,
  type PageTranslation,
  type Post,
  type PostTranslation,
  type SeriesMembership,
  type SiteModel,
} from './types.ts';
import { parseYaml, type YamlMap } from './yaml.ts';

export interface ContentIssue {
  readonly file: string;
  readonly message: string;
}

export class ContentValidationError extends Error {
  readonly issues: readonly ContentIssue[];

  constructor(issues: readonly ContentIssue[]) {
    const details = issues.map((issue) => `  - ${issue.file}: ${issue.message}`).join('\n');
    super(`content validation failed:\n${details}`);
    this.name = 'ContentValidationError';
    this.issues = issues;
  }
}

function readString(data: YamlMap, key: string): string {
  const value = data[key];
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`"${key}" must be a non-empty string`);
  }
  return value.trim();
}

function readOptionalString(data: YamlMap, key: string): string | undefined {
  const value = data[key];
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`"${key}" must be a non-empty string when present`);
  }
  return value.trim();
}

function readStringList(data: YamlMap, key: string): string[] {
  const value = data[key];
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`"${key}" must be a list with at least one entry`);
  }
  return value.map((entry, index) => {
    if (typeof entry !== 'string' || entry.trim() === '') {
      throw new Error(`"${key}" entry ${String(index + 1)} must be a non-empty string`);
    }
    return entry.trim();
  });
}

function rejectUnknownKeys(data: YamlMap, allowed: readonly string[]): void {
  const allowedSet = new Set(allowed);
  for (const key of Object.keys(data)) {
    if (!allowedSet.has(key)) {
      throw new Error(`unknown key "${key}" (allowed: ${allowed.join(', ')})`);
    }
  }
}

const POST_FILE_PATTERN = /^(\d{4}-\d{2}-\d{2})-([a-z0-9-]+)\.md$/;
const POST_TRANSLATION_PATTERN =
  /^(\d{4}-\d{2}-\d{2}-[a-z0-9-]+)\.([a-z]{2,3}(?:-[a-z0-9]{2,8})*)\.md$/;
const PAGE_TRANSLATION_PATTERN = /^([a-z0-9-]+)\.([a-z]{2,3}(?:-[a-z0-9]{2,8})*)\.md$/;

export function blogPath(slug: string, language: string, locales: ContentLocales): string {
  return language === locales.defaultLocale ? `/blog/${slug}/` : `/${language}/blog/${slug}/`;
}

function readLanguage(data: YamlMap, locales: ContentLocales): string {
  const language = readOptionalString(data, 'lang') ?? locales.defaultLocale;
  if (!locales.locales.includes(language)) {
    throw new Error(
      `"lang" value "${language}" is not one of the site locales (${locales.locales.join(', ')})`,
    );
  }
  return language;
}

export function parsePost(
  fileName: string,
  raw: string,
  locales: ContentLocales = SINGLE_LOCALE,
): Post {
  const fileMatch = POST_FILE_PATTERN.exec(fileName);
  if (!fileMatch) {
    throw new Error(
      'post file names must look like YYYY-MM-DD-name.md using lower-case letters, digits and hyphens',
    );
  }
  const datePart = fileMatch[1] ?? '';
  if (!isValidIsoDate(datePart)) {
    throw new Error(`file name date "${datePart}" is not a real calendar date`);
  }

  const { data, body } = extractFrontmatter(raw);
  rejectUnknownKeys(data, [
    'title',
    'date',
    'author',
    'summary',
    'tags',
    'series',
    'episode',
    'lang',
  ]);

  const title = readString(data, 'title');
  const date = readString(data, 'date');
  if (!isValidIsoDate(date)) {
    throw new Error(`"date" value "${date}" is not a valid YYYY-MM-DD date`);
  }
  if (date !== datePart) {
    throw new Error(`frontmatter date "${date}" must match the file name date "${datePart}"`);
  }
  const author = readString(data, 'author');
  const summary = readString(data, 'summary');
  const tags = readStringList(data, 'tags');
  const language = readLanguage(data, locales);

  const seriesName = readOptionalString(data, 'series');
  const episodeValue = data.episode;
  let series: SeriesMembership | undefined;
  if (seriesName === undefined) {
    if (episodeValue !== undefined) {
      throw new Error('"episode" is only allowed when the post declares a "series"');
    }
  } else {
    if (typeof episodeValue !== 'number' || !Number.isInteger(episodeValue) || episodeValue < 1) {
      throw new Error(
        '"episode" must be an integer of 1 or more when the post belongs to a series',
      );
    }
    series = { name: seriesName, slug: slugify(seriesName), episode: episodeValue };
  }

  const rendered = renderMarkdown(body);
  const slug = fileName.slice(0, -'.md'.length);
  return {
    slug,
    url: blogPath(slug, language, locales),
    language,
    title,
    date,
    author,
    summary,
    tags,
    ...(series ? { series } : {}),
    html: rendered.html,
    headings: rendered.headings,
    readingMinutes: readingMinutes(body),
    translations: new Map(),
  };
}

export interface ParsedPostTranslation {
  readonly slug: string;
  readonly translation: PostTranslation;
}

export function parsePostTranslation(
  fileName: string,
  raw: string,
  locales: ContentLocales = SINGLE_LOCALE,
): ParsedPostTranslation {
  const match = POST_TRANSLATION_PATTERN.exec(fileName);
  if (!match) {
    throw new Error('translation file names must look like YYYY-MM-DD-name.<locale>.md');
  }
  const slug = match[1] ?? '';
  const locale = match[2] ?? '';
  if (!locales.locales.includes(locale)) {
    throw new Error(
      `locale "${locale}" is not one of the site locales (${locales.locales.join(', ')})`,
    );
  }
  const { data, body } = extractFrontmatter(raw);
  rejectUnknownKeys(data, ['title', 'summary']);
  const rendered = renderMarkdown(body);
  return {
    slug,
    translation: {
      locale,
      url: blogPath(slug, locale, locales),
      title: readString(data, 'title'),
      summary: readString(data, 'summary'),
      html: rendered.html,
      headings: rendered.headings,
      readingMinutes: readingMinutes(body),
    },
  };
}

const AUTHOR_FILE_PATTERN = /^([a-z0-9-]+)\.ya?ml$/;

function readSocials(data: YamlMap): AuthorSocials | undefined {
  const value = data.socials;
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('"socials" must be a mapping of network name to handle');
  }
  const socials: Record<string, string> = {};
  for (const [network, handle] of Object.entries(value)) {
    if (typeof handle !== 'string' || handle.trim() === '') {
      throw new Error(`"socials.${network}" must be a non-empty string`);
    }
    socials[network] = handle.trim();
  }
  return socials;
}

export function parseAuthor(fileName: string, raw: string): Author {
  const fileMatch = AUTHOR_FILE_PATTERN.exec(fileName);
  if (!fileMatch) {
    throw new Error(
      'author file names must look like author-id.yml using lower-case letters, digits and hyphens',
    );
  }
  const id = fileMatch[1] ?? '';
  const data = parseYaml(raw);
  rejectUnknownKeys(data, ['name', 'email', 'bio', 'avatar', 'socials']);

  const name = readString(data, 'name');
  const email = readOptionalString(data, 'email');
  const bio = readOptionalString(data, 'bio');
  const avatar = readOptionalString(data, 'avatar');
  const socials = readSocials(data);
  return {
    id,
    name,
    ...(email !== undefined ? { email } : {}),
    ...(bio !== undefined ? { bio } : {}),
    ...(avatar !== undefined ? { avatar } : {}),
    ...(socials !== undefined ? { socials } : {}),
  };
}

const PAGE_FILE_PATTERN = /^([a-z0-9-]+)\.md$/;

export function parseMarkdownPage(
  fileName: string,
  raw: string,
  locales: ContentLocales = SINGLE_LOCALE,
): MarkdownPage {
  const fileMatch = PAGE_FILE_PATTERN.exec(fileName);
  if (!fileMatch) {
    throw new Error(
      'page file names must look like page-name.md using lower-case letters, digits and hyphens',
    );
  }
  const slug = fileMatch[1] ?? '';
  const { data, body } = extractFrontmatter(raw);
  rejectUnknownKeys(data, ['title']);
  const title = readString(data, 'title');
  const rendered = renderMarkdown(body);
  return {
    slug,
    language: locales.defaultLocale,
    title,
    html: rendered.html,
    headings: rendered.headings,
    translations: new Map(),
  };
}

export interface ParsedPageTranslation {
  readonly slug: string;
  readonly translation: PageTranslation;
}

export function parsePageTranslation(
  fileName: string,
  raw: string,
  locales: ContentLocales = SINGLE_LOCALE,
): ParsedPageTranslation {
  const match = PAGE_TRANSLATION_PATTERN.exec(fileName);
  if (!match) {
    throw new Error('page translation file names must look like page-name.<locale>.md');
  }
  const slug = match[1] ?? '';
  const locale = match[2] ?? '';
  if (!locales.locales.includes(locale)) {
    throw new Error(
      `locale "${locale}" is not one of the site locales (${locales.locales.join(', ')})`,
    );
  }
  const { data, body } = extractFrontmatter(raw);
  rejectUnknownKeys(data, ['title']);
  const rendered = renderMarkdown(body);
  return {
    slug,
    translation: {
      locale,
      title: readString(data, 'title'),
      html: rendered.html,
      headings: rendered.headings,
    },
  };
}

function sortedEntries(record: Readonly<Record<string, string>>): [string, string][] {
  return Object.entries(record).sort(([a], [b]) => a.localeCompare(b));
}

export function loadSiteModel(
  input: ContentInput,
  publishedThrough?: string,
  locales: ContentLocales = SINGLE_LOCALE,
): SiteModel {
  if (publishedThrough !== undefined && !isValidIsoDate(publishedThrough)) {
    throw new Error(`publishedThrough "${publishedThrough}" is not a valid YYYY-MM-DD date`);
  }
  const issues: ContentIssue[] = [];

  const authors = new Map<string, Author>();
  for (const [fileName, raw] of sortedEntries(input.authors)) {
    try {
      const author = parseAuthor(fileName, raw);
      authors.set(author.id, author);
    } catch (error) {
      issues.push({ file: `content/authors/${fileName}`, message: describe(error) });
    }
  }

  const postsBySlug = new Map<string, Post>();
  const postTranslations: [string, ParsedPostTranslation][] = [];
  for (const [fileName, raw] of sortedEntries(input.blog)) {
    try {
      if (POST_TRANSLATION_PATTERN.test(fileName)) {
        postTranslations.push([fileName, parsePostTranslation(fileName, raw, locales)]);
      } else {
        const post = parsePost(fileName, raw, locales);
        postsBySlug.set(post.slug, post);
      }
    } catch (error) {
      issues.push({ file: `content/blog/${fileName}`, message: describe(error) });
    }
  }

  const postTranslationMaps = new Map<string, Map<string, PostTranslation>>();
  for (const [fileName, { slug, translation }] of postTranslations) {
    const original = postsBySlug.get(slug);
    if (!original) {
      issues.push({
        file: `content/blog/${fileName}`,
        message: `translation of a missing post (expected content/blog/${slug}.md)`,
      });
      continue;
    }
    if (original.language === translation.locale) {
      issues.push({
        file: `content/blog/${fileName}`,
        message: `"${translation.locale}" is already the language of the original post`,
      });
      continue;
    }
    const map = postTranslationMaps.get(slug) ?? new Map<string, PostTranslation>();
    map.set(translation.locale, translation);
    postTranslationMaps.set(slug, map);
  }
  const posts: Post[] = [...postsBySlug.values()].map((post) => ({
    ...post,
    translations: postTranslationMaps.get(post.slug) ?? new Map(),
  }));

  const pagesBySlug = new Map<string, MarkdownPage>();
  const pageTranslations: [string, ParsedPageTranslation][] = [];
  for (const [fileName, raw] of sortedEntries(input.pages)) {
    try {
      if (PAGE_TRANSLATION_PATTERN.test(fileName)) {
        pageTranslations.push([fileName, parsePageTranslation(fileName, raw, locales)]);
      } else {
        const page = parseMarkdownPage(fileName, raw, locales);
        pagesBySlug.set(page.slug, page);
      }
    } catch (error) {
      issues.push({ file: `content/pages/${fileName}`, message: describe(error) });
    }
  }
  const pageTranslationMaps = new Map<string, Map<string, PageTranslation>>();
  for (const [fileName, { slug, translation }] of pageTranslations) {
    const original = pagesBySlug.get(slug);
    if (!original) {
      issues.push({
        file: `content/pages/${fileName}`,
        message: `translation of a missing page (expected content/pages/${slug}.md)`,
      });
      continue;
    }
    if (original.language === translation.locale) {
      issues.push({
        file: `content/pages/${fileName}`,
        message: `"${translation.locale}" is already the language of the original page`,
      });
      continue;
    }
    const map = pageTranslationMaps.get(slug) ?? new Map<string, PageTranslation>();
    map.set(translation.locale, translation);
    pageTranslationMaps.set(slug, map);
  }
  const pages = new Map<string, MarkdownPage>();
  for (const [slug, page] of pagesBySlug) {
    pages.set(slug, { ...page, translations: pageTranslationMaps.get(slug) ?? new Map() });
  }

  for (const post of posts) {
    if (!authors.has(post.author)) {
      issues.push({
        file: `content/blog/${post.slug}.md`,
        message: `unknown author "${post.author}" (expected content/authors/${post.author}.yml)`,
      });
    }
  }

  const seenEpisodes = new Map<string, Post>();
  const seriesNames = new Map<string, string>();
  for (const post of posts) {
    if (!post.series) {
      continue;
    }
    const knownName = seriesNames.get(post.series.slug);
    if (knownName === undefined) {
      seriesNames.set(post.series.slug, post.series.name);
    } else if (knownName !== post.series.name) {
      issues.push({
        file: `content/blog/${post.slug}.md`,
        message: `series "${post.series.name}" conflicts with earlier spelling "${knownName}"`,
      });
    }
    const key = `${post.series.slug}#${String(post.series.episode)}`;
    const existing = seenEpisodes.get(key);
    if (existing) {
      issues.push({
        file: `content/blog/${post.slug}.md`,
        message: `episode ${String(post.series.episode)} of "${post.series.name}" is already taken by ${existing.slug}`,
      });
    } else {
      seenEpisodes.set(key, post);
    }
  }

  if (issues.length > 0) {
    throw new ContentValidationError(issues);
  }

  const published =
    publishedThrough === undefined ? posts : posts.filter((post) => post.date <= publishedThrough);

  const sortedPosts = sortPostsByDateDesc(published);
  return {
    posts: sortedPosts,
    authors,
    postsByAuthor: groupPostsByAuthor(sortedPosts, authors.keys()),
    tags: groupPostsByTag(sortedPosts),
    series: groupPostsBySeries(sortedPosts),
    pages,
  };
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
