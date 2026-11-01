// Content collections and their schemas.
//
// Everything in these files is PUBLIC and is rendered on the site. Private
// interview records (contact details, consent forms, field notes) must never
// be added to this repository.
//
// The build fails with a clear message if a required field is missing or has
// the wrong shape, so mistakes are caught before anything is published.

import { defineCollection, reference, z } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { DISTRICTS, LANGUAGES } from './config';

/** "MM:SS" or "H:MM:SS" */
const timestamp = z
  .string()
  .regex(/^(\d{1,2}:)?\d{1,2}:\d{2}$/, 'Use a timestamp like "04:15" or "1:04:15"');

const language = z.enum(LANGUAGES);

// ---------- Storms ----------
const storms = defineCollection({
  loader: file('src/data/storms.json'),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    year: z.number().int(),
    status: z.enum(['collecting', 'future']),
    blurb: z.string(),
  }),
});

// ---------- Oral histories ----------
const stories = defineCollection({
  // Keep the entry id identical to the `id` field (e.g. HV-1961-001) so URLs match.
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/stories',
    generateId: ({ entry, data }) => (data.id as string) ?? entry.replace(/\.md$/, ''),
  }),
  schema: z
    .object({
      id: z.string().regex(/^HV-\d{4}-\d{3}$/, 'Story ids look like HV-1961-001'),
      storm: reference('storms'),
      title: z.string().min(1),
      featured: z.boolean().default(false),
      narrator: z.object({
        name: z.string().min(1, 'Narrators are always identified by full name'),
        other_names: z.string().optional(),
        age_in_1961: z.number().int().min(0).max(120).optional().nullable(),
        residence: z.string().min(1),
        portrait: z.string().optional(),
      }),
      type: z.enum(['witness', 'family']),
      original_witness: z.string().optional(),
      relationship_to_witness: z.string().optional(),
      location_1961: z.string().min(1),
      district: z.enum(DISTRICTS),
      interviewers: z.array(z.string()).min(1),
      interview_date: z.coerce.date(),
      place_recorded: z.string().min(1),
      languages: z.array(language).min(1),
      transcribed_by: z.string().min(1),
      translated_by: z.string().optional(),
      narrator_review_date: z.coerce.date().optional(), // kept for your records; not shown on the site
      rights: z.string().min(1),
      content_warnings: z.array(z.string()).default([]),
      summary: z.string().min(1),
      featured_quote: z
        .object({ text: z.string(), timestamp: timestamp.optional().or(z.literal('')) })
        .optional(),
      subjects: z.array(z.string()).default([]),
      places: z.array(z.string()).default([]),
      clips: z
        .array(
          z.object({
            n: z.number().int().positive(),
            title: z.string().min(1),
            start: timestamp,
            end: timestamp,
            file: z.string().regex(/^\/audio\/.+\.mp3$/, 'Clip files live in /audio/ and end in .mp3'),
            language: language,
          }),
        )
        .min(1),
      /** Filename in src/content/transcripts/, e.g. HV-1961-001.json */
      transcript: z
        .string()
        .regex(/\.json$/, 'Give the transcript filename, e.g. HV-1961-001.json')
        .transform((f) => f.replace(/\.json$/, '')),
      related_photos: z.array(reference('photos')).default([]),
      published: z.coerce.date(),
    })
    .superRefine((s, ctx) => {
      if (s.type === 'family') {
        if (!s.original_witness) {
          ctx.addIssue({ code: 'custom', path: ['original_witness'], message: 'Family accounts need the original witness' });
        }
        if (!s.relationship_to_witness) {
          ctx.addIssue({ code: 'custom', path: ['relationship_to_witness'], message: 'Family accounts need the relationship to the witness' });
        }
      }
      const clipNumbers = s.clips.map((c) => c.n);
      if (new Set(clipNumbers).size !== clipNumbers.length) {
        ctx.addIssue({ code: 'custom', path: ['clips'], message: 'Clip numbers must be unique' });
      }
    }),
});

// ---------- Transcripts ----------
const transcripts = defineCollection({
  loader: glob({
    pattern: '**/*.json',
    base: './src/content/transcripts',
    generateId: ({ entry }) => entry.replace(/\.json$/, ''),
  }),
  schema: z.object({
    original_language: language,
    translation_language: language.optional().nullable(),
    segments: z
      .array(
        z.object({
          clip: z.number().int().positive(),
          t: timestamp,
          speaker: z.string().min(1),
          original: z.string().default(''),
          translation: z.string().optional().default(''),
          withheld: z.boolean().default(false),
        }),
      )
      .min(1),
  }),
});

// ---------- Photographs ----------
const photos = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/photos',
    generateId: ({ entry, data }) => (data.id as string) ?? entry.replace(/\.md$/, ''),
  }),
  schema: z.object({
    id: z.string().regex(/^PH-\d{4}-\d{3}$/, 'Photo ids look like PH-1961-001'),
    storm: reference('storms'),
    title: z.string().min(1),
    caption: z.string().min(1),
    /** Describes what the image shows, for screen readers. */
    alt: z.string().min(1),
    date: z.string().min(1),
    creator: z.string().min(1),
    lender: z.string().min(1),
    /** Original publication or collection the image comes from. */
    source: z.string().optional(),
    /** Link to the source's catalogue record, if it has one. */
    source_url: z.string().url().optional().or(z.literal('')),
    /** Short credit line shown under the image wherever it is used, e.g. "Wellcome Collection, RAMC/1196. CC BY-NC." */
    credit: z.string().optional(),
    /** Where visitors can explore the full item on another website, e.g. a digitised book. */
    explore_url: z.string().url().optional().or(z.literal('')),
    explore_label: z.string().optional(),
    original_or_copy: z.string().min(1),
    rights: z.string().min(1),
    /** Web copy shown on the site */
    image: z.string().regex(/^\/images\//, 'Images live in /images/'),
    /** Optional full-resolution original offered as a download */
    image_original: z.string().optional(),
    related_stories: z.array(reference('stories')).default([]),
    /** Used to order the "latest photographs" grid */
    published: z.coerce.date(),
  }),
});

// ---------- Media (news reports, newsreels and other video hosted elsewhere) ----------
// Nothing here is copied onto the site. A record either embeds a YouTube video
// (youtube_id) or links out to where the item lives (url).
const media = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/media',
    generateId: ({ entry, data }) => (data.id as string) ?? entry.replace(/\.md$/, ''),
  }),
  schema: z
    .object({
      id: z.string().regex(/^MD-\d{4}-\d{3}$/, 'Media ids look like MD-1961-001'),
      storm: reference('storms'),
      title: z.string().min(1),
      kind: z.string().min(1), // e.g. "Newsreel", "Television news report"
      summary: z.string().min(1),
      date: z.string().min(1), // free text, e.g. "1961" or "November 2021"
      creator: z.string().min(1), // reporter, film-maker or production company
      publisher: z.string().min(1), // who published it, e.g. "British Pathé"
      duration: z.string().optional(), // e.g. "0:41"
      platform: z.enum(['YouTube', 'Facebook', 'Website']),
      url: z.string().url(), // the item's own page
      youtube_id: z.string().regex(/^[\w-]{11}$/, 'A YouTube id is the 11 characters after v= in the link').optional().or(z.literal('')), // embed this YouTube video on the page
      rights: z.string().min(1),
      credit: z.string().min(1),
      related_stories: z.array(reference('stories')).default([]),
      published: z.coerce.date(), // date added to the archive
    })
    .superRefine((m, ctx) => {
      if (m.youtube_id && m.platform !== 'YouTube') {
        ctx.addIssue({ code: 'custom', path: ['youtube_id'], message: 'Only YouTube videos can be embedded' });
      }
    }),
});

export const collections = { storms, stories, transcripts, photos, media };
