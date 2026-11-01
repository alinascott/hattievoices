# Hattie Voices

An oral history archive of Hurricane Hattie, which struck British Honduras (now Belize) on 31 October 1961, told by the people who lived through it and the families who carry their stories. The site also collects photographs from the time.

It is a static site built with [Astro](https://astro.build) and deployed to GitHub Pages. There is no database, no user accounts and no uploads. Nothing submitted by the public appears on the site automatically: every story is added by hand, after it has been transcribed and approved by the narrator or their family.

> **Public repository warning.** Everything in this repository is published. Contact details, consent forms and interview notes must stay outside it.

---

## My publishing workflow

### 1. Copy a template story file and fill in the frontmatter

```bash
cp templates/story.md src/content/stories/HV-1961-001.md
```

- The filename, the `id` field and the page URL must all match: `HV-1961-001.md` → `id: HV-1961-001` → `/stories/HV-1961-001/`.
- Number stories in order: `HV-<storm year>-<three digits>`.
- Every field has a comment in the template explaining what goes in it. The required ones are checked when the site builds (see [When the build fails](#when-the-build-fails)).
- Set `featured: true` to make the story eligible for "Featured voices" on the homepage. The three most recently published featured stories are shown.
- For a **family account**, set `type: family` and fill in `original_witness` and `relationship_to_witness`. Leave `age_in_1961` out.
- Copy `featured_quote` exactly from the approved transcript. Never paraphrase it.
- To link photographs, list their ids in `related_photos`, e.g. `[PH-1961-001]`. You only need to link a story and a photo in one direction; both pages will show the link.
- Anything you write below the closing `---` appears on the story page under "Notes". Leave it empty if there are none.

### 2. Add the transcript JSON and MP3 clips

```bash
cp templates/transcript.json src/content/transcripts/HV-1961-001.json
```

**Transcript** (`src/content/transcripts/HV-1961-001.json`), named to match the `transcript:` field in the story:

```json
{
  "original_language": "Kriol",
  "translation_language": "English",
  "segments": [
    { "clip": 1, "t": "00:00", "speaker": "Interviewer", "original": "…", "translation": "…", "withheld": false },
    { "clip": 1, "t": "00:42", "speaker": "Narrator", "original": "", "translation": "", "withheld": true }
  ]
}
```

- **Timestamps** (`t`) use the same timeline as the clips' `start` and `end`: positions in the full interview. A segment at `12:30` belongs to the clip whose range contains 12:30. The build stops if a segment falls outside its clip's range.
- **Withheld passages:** set `"withheld": true` and leave the text empty. The site shows *[Passage withheld at the narrator's request]* in its place and leaves it out of search. Make sure the passage is also removed from the MP3 access copy.
- **No translation?** Set `"translation_language": null` and leave out the `translation` fields. The language toggle only appears when a translation exists.
- `original_language` and `translation_language` must be one of: English, Kriol, Spanish, Garifuna, Q'eqchi', Mopan, Yucatec Maya, Other.

**Audio:** put MP3 access copies in `public/audio/`, named as in the story's `clips` list, e.g. `public/audio/HV-1961-001-01.mp3`. Mono at 64–96 kbps is plenty for speech and keeps pages quick on mobile data.

### 3. Preview locally

```bash
npm run dev
```

Open <http://localhost:4321>, check the story page, play each clip and click a few timestamps. Then run a full build, which runs every content check:

```bash
npm run build
```

### 4. Commit and push; GitHub Actions deploys the site

```bash
git add src/content public/audio
```

```bash
git commit -m "Add HV-1961-001"
```

```bash
git push
```

The **Deploy to GitHub Pages** workflow builds and publishes the site, usually within two minutes. Follow it under the repository's **Actions** tab. If the build fails there, nothing changes on the live site.

---

## Adding a photograph

1. Put the image in `public/images/`. A JPEG around 1,600 px on its long side is a good web copy. Optionally keep a full-resolution original alongside it for download.
2. `cp templates/photo.md src/content/photos/PH-1961-006.md` (the next free number) and fill it in. `alt` describes what the image shows for people using screen readers; `caption` is the visible caption; `credit` is the short line shown under the image.
3. Set `published` to the date you add it. The homepage shows the most recent six.
4. If the item can be explored further on another website, such as a digitised book, set `explore_url` and `explore_label` to add a button to it. For Friesen's *Hurricane "Hattie"* on UF Digital Collections, viewer image N+1 shows printed page N, so page 84 is `https://ufdc.ufl.edu/UF00095344/00001/images/85`.

The homepage hero uses `public/images/belize-city-aerial-1962-hero.jpg`, a copy of the RAF aerial photograph with the printed caption strip cropped off. Its record (`src/content/photos/PH-1961-001.md`) points to the uncropped original, and the hero's caption and credit line are read from that record, so a change there updates both places. `scripts/make-hero.mjs` regenerates the web copies if the original changes.

## Adding video and news reports

Newsreels, news reports and other video go on the **Media** page. They are never copied to the site.

1. `cp templates/media.md src/content/media/MD-1961-006.md` (the next free number) and fill it in.
2. **YouTube:** set `platform: YouTube`, `url` to the video's link, and `youtube_id` to the 11 characters after `v=`. The video plays on the page, using YouTube's privacy-enhanced player.
3. **Anywhere else** (Facebook, a news site): set `platform` and `url`, and delete `youtube_id`. The page shows a "Watch on …" button that opens the original.

## Adding a storm to the timeline

Storms live in `src/data/storms.json`. Each has `id`, `name`, `year`, `status` (`collecting` or `future`) and `blurb`. To open a new chapter, set its `status` to `collecting`, then give its stories and photos that storm's `id` in their `storm` field, and ids using its year (e.g. `HV-2001-001`).

## Settings

[`src/config.ts`](src/config.ts) holds everything site-wide:

| Setting | What it does |
| --- | --- |
| `name` | The project name, used in the header, footer, page titles and citations. Rename the site here. |
| `contactEmail` | Shown in the footer, the About page, the Get involved page and the thank-you page. |
| `projectLead` | Credit in the footer, homepage and About page. |
| `formEndpoint` | Where the Get involved form is sent. Leave it empty to disconnect the form; it then asks people to email instead. |

### Where form submissions go

The Get involved form uses [FormSubmit](https://formsubmit.co), a free service that forwards each submission to an email address. No account is needed. Submissions arrive in **hattievoices@gmail.com** as an email with a table of answers, each labelled with its question. The subject line says which path was chosen, e.g. "Hattie Voices: Share a relative's story".

The form is already activated. `formEndpoint` uses the form's private code (`https://formsubmit.co/4b13676e…`) rather than the email address, so the address can't be harvested from the page source. FormSubmit may ask you to confirm the form once more the first time someone submits from the live site; if so, click the link in the email it sends.

After a successful send, people are taken to `/get-involved/thank-you/`. The form also works without JavaScript: FormSubmit shows its own spam check, then redirects to the same page. `_honey` is a hidden spam trap; `_subject`, `_template` and `_next` are FormSubmit settings.

## Before launch

```bash
npm run placeholders
```

This lists every bracketed placeholder and TODO still in the content, settings and pages. Also:

- [ ] Send a test submission from the live Get involved page and check it arrives in hattievoices@gmail.com.
- [ ] Add the first oral history (see [My publishing workflow](#my-publishing-workflow)). Until then, the Listen page says "The first stories are being recorded now" and Featured voices is empty.

## When the build fails

The build checks every story, transcript and photo, and stops with a message naming the file and field. Common causes:

- A required field is missing or empty, e.g. `narrator.name` or `summary`.
- A value isn't in its list: `district`, `languages`, a clip's `language`, or `storm`.
- A family account without `original_witness` or `relationship_to_witness`.
- The `id` doesn't match the filename.
- The transcript file named in `transcript:` doesn't exist, or a segment refers to a clip number that isn't in `clips`.
- A segment's timestamp falls outside its clip's `start`–`end`.
- A related photo or story doesn't exist, or a photo's image file is missing from `public/images/`.

A missing MP3 doesn't stop the build; it prints a warning, and the clip shows as unavailable on the page.

---

## Setting up

### Requirements

[Node.js](https://nodejs.org) 22 or later.

```bash
npm install
```

| Command | Action |
| --- | --- |
| `npm run dev` | Start the local preview at <http://localhost:4321> |
| `npm run build` | Build the site into `dist/`, running all content checks |
| `npm run preview` | Serve the built `dist/` folder locally |
| `npm run placeholders` | List unfinished placeholder values |

### Deploying to GitHub Pages (one-time setup)

1. Push this folder to a GitHub repository, with `main` as the default branch.
2. In the repository, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Push to `main`, or run the workflow by hand from the **Actions** tab.

The site will be at `https://<your-username>.github.io/<repository-name>/`. The workflow works out that address itself.

**Custom domain:** under **Settings → Secrets and variables → Actions → Variables**, add `SITE_URL` (e.g. `https://hattievoices.org`) and `BASE_PATH` set to `/`, then add the domain under **Settings → Pages**. Do the same (with `BASE_PATH` `/`) if the repository is named `<your-username>.github.io`.

### Project structure

```text
public/
  audio/                 MP3 access copies of clips
  images/                photographs and the hero image
src/
  config.ts              site name, contact, form endpoint, languages, districts
  content.config.ts      collection schemas (the rules each file must follow)
  content/
    stories/             one .md file per oral history
    transcripts/         one .json file per story
    photos/              one .md file per photograph
  data/storms.json       storms for the timeline
  components/            header, footer, cards, clip player, transcript
  layouts/BaseLayout.astro
  lib/                   content helpers and cross-file checks
  pages/                 one file per page or page template
  styles/                design tokens and global styles
templates/               blank story, transcript and photo files to copy
scripts/                 hero image and placeholder helpers
.github/workflows/       GitHub Pages deployment
```
