// Helpers for reading the content collections, plus cross-file checks that
// zod can't do on a single file (e.g. a story's transcript must exist).

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { getCollection, getEntry, type CollectionEntry } from 'astro:content';

export type Story = CollectionEntry<'stories'>;
export type Photo = CollectionEntry<'photos'>;
export type Transcript = CollectionEntry<'transcripts'>;

const newestFirst = (a: { data: { published: Date } }, b: { data: { published: Date } }) =>
  b.data.published.getTime() - a.data.published.getTime();

let checked = false;

// Load the stories collection once per build (Astro warns each time it is read while empty)
let storiesLoad: Promise<Story[]> | undefined;
const allStories = () => (storiesLoad ??= getCollection('stories'));

/** All published oral histories, newest first. Fails the build on broken links between files. */
export async function getStories(): Promise<Story[]> {
  const stories = [...(await allStories())].sort(newestFirst);
  if (!checked) {
    await checkStories(stories);
    checked = true;
  }
  return stories;
}

export async function getFeaturedStories(limit = 3): Promise<Story[]> {
  return (await getStories()).filter((s) => s.data.featured).slice(0, limit);
}

export async function getPhotos(): Promise<Photo[]> {
  // Photos added on the same day appear newest id first
  const photos = (await getCollection('photos')).sort((a, b) => newestFirst(a, b) || b.id.localeCompare(a.id));
  const storyIds = new Set((await allStories()).map((s) => s.id));
  const problems: string[] = [];
  for (const p of photos) {
    if (p.id !== p.data.id) problems.push(`${p.id}: filename and id field differ (${p.data.id})`);
    for (const ref of p.data.related_stories) {
      if (!storyIds.has(ref.id)) problems.push(`${p.id}: related story "${ref.id}" not found`);
    }
    for (const file of [p.data.image, p.data.image_original].filter(Boolean) as string[]) {
      if (!existsSync(join('public', file))) problems.push(`${p.id}: image public${file} not found`);
    }
  }
  if (problems.length) throw new Error(`Content problems:\n  - ${problems.join('\n  - ')}`);
  return photos;
}

export type Media = CollectionEntry<'media'>;

/** Media records with this `kind` are survivor testimonies: grouped on their own on the Media page and kept off the homepage strip. */
export const TESTIMONY_KIND = 'Survivor testimony';

/** News reports, newsreels and other video, newest first. */
export async function getMedia(): Promise<Media[]> {
  // Items added on the same day appear newest id first
  const items = (await getCollection('media')).sort((a, b) => newestFirst(a, b) || b.id.localeCompare(a.id));
  const storyIds = new Set((await allStories()).map((s) => s.id));
  const problems: string[] = [];
  for (const m of items) {
    if (m.id !== m.data.id) problems.push(`${m.id}: filename and id field differ (${m.data.id})`);
    for (const ref of m.data.related_stories) {
      if (!storyIds.has(ref.id)) problems.push(`${m.id}: related story "${ref.id}" not found`);
    }
  }
  if (problems.length) throw new Error(`Content problems:\n  - ${problems.join('\n  - ')}`);
  return items;
}

export async function getTranscript(story: Story): Promise<Transcript> {
  const t = await getEntry('transcripts', story.data.transcript);
  if (!t) throw new Error(`${story.id}: transcript "${story.data.transcript}.json" not found in src/content/transcripts/`);
  return t;
}

/** "04:15" or "1:04:15" → seconds */
export function toSeconds(ts: string): number {
  return ts.split(':').map(Number).reduce((acc, n) => acc * 60 + n, 0);
}

/** 2026-01-01 → "1 January 2026" (dates are stored as UTC midnight) */
export function formatDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

/** BCP 47 codes so screen readers pronounce each language correctly. */
export const LANG_CODES: Record<string, string> = {
  English: 'en',
  Kriol: 'bzj',
  Spanish: 'es',
  Garifuna: 'cab',
  "Q'eqchi'": 'kek',
  Mopan: 'mop',
  'Yucatec Maya': 'yua',
};

export function typeLabel(type: Story['data']['type']): string {
  return type === 'witness' ? 'Witness' : 'Family account';
}

async function checkStories(stories: Story[]) {
  const problems: string[] = [];
  const photoIds = new Set((await getCollection('photos')).map((p) => p.id));

  for (const s of stories) {
    if (s.id !== s.data.id) problems.push(`${s.id}: filename and id field differ (${s.data.id})`);

    const t = await getEntry('transcripts', s.data.transcript);
    if (!t) {
      problems.push(`${s.id}: transcript "${s.data.transcript}.json" not found`);
    } else {
      const clips = new Map(s.data.clips.map((c) => [c.n, c]));
      for (const seg of t.data.segments) {
        const clip = clips.get(seg.clip);
        if (!clip) {
          problems.push(`${s.id}: transcript segment at ${seg.t} refers to clip ${seg.clip}, which isn't in the clips list`);
          continue;
        }
        // Segment times use the same interview timeline as the clip's start and end.
        const [t0, start, end] = [toSeconds(seg.t), toSeconds(clip.start), toSeconds(clip.end)];
        if (end > start && (t0 < start || t0 > end)) {
          problems.push(`${s.id}: transcript segment at ${seg.t} is outside clip ${clip.n} (${clip.start}–${clip.end})`);
        }
      }
    }

    for (const clip of s.data.clips) {
      if (!existsSync(join('public', clip.file))) {
        console.warn(`[content] ${s.id}: audio file public${clip.file} not found. The clip will show as unavailable.`);
      }
    }

    for (const ref of s.data.related_photos) {
      if (!photoIds.has(ref.id)) problems.push(`${s.id}: related photo "${ref.id}" not found`);
    }
  }

  if (problems.length) {
    throw new Error(`Content problems:\n  - ${problems.join('\n  - ')}`);
  }
}
