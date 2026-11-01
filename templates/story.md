---
# Copy to src/content/stories/<id>.md and fill in every field.
# Everything here is PUBLIC. Contact details, consent forms and field notes stay out of this repo.
id: HV-1961-000                 # HV-<storm year>-<three-digit number>; also the filename and URL
storm: hattie-1961              # must match an id in src/data/storms.json
title: ""
featured: false                 # true = may appear in "Featured voices" on the homepage
narrator:
  name: ""                      # full name (required)
  other_names: ""               # nicknames, maiden name, etc.
  age_in_1961:                  # witnesses only: a number, or leave blank if unknown
  residence: ""                 # town, country
  portrait: ""                  # e.g. /images/portraits/HV-1961-000.jpg, only with permission
type: witness                   # witness | family
original_witness: ""            # family accounts only (required for family)
relationship_to_witness: ""     # family accounts only (required for family)
location_1961: ""               # where the witness was during the storm
district: Belize                # Belize | Corozal | Orange Walk | Cayo | Stann Creek | Toledo
interviewers: [""]
interview_date: 2026-01-01
place_recorded: ""              # or "by phone" / "by video"
languages: [English]            # English | Kriol | Spanish | Garifuna | Q'eqchi' | Mopan | Yucatec Maya | Other
transcribed_by: ""
translated_by: ""               # leave blank if there is no translation
narrator_review_date: 2026-01-01  # optional; for your records, not shown on the site
rights: ""
content_warnings: []            # e.g. ["Descriptions of death"]
summary: ""
featured_quote: { text: "", timestamp: "" }   # copy exactly from the approved transcript
subjects: []
places: []
# start/end are positions in the full interview. Transcript timestamps use the same
# timeline, so a segment at 12:30 belongs to the clip whose range contains 12:30.
clips:
  - { n: 1, title: "", start: "00:00", end: "00:00", file: "/audio/HV-1961-000-01.mp3", language: English }
transcript: HV-1961-000.json    # filename in src/content/transcripts/
related_photos: []              # photo ids, e.g. [PH-1961-001]
published: 2026-01-01
---

Optional public notes about this recording. Delete this line if there are none.
