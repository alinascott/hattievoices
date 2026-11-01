// Site-wide settings. Change values here rather than in individual pages.

export const SITE = {
  /** Working name of the project. Rename here and it changes everywhere. */
  name: 'Hattie Voices',
  tagline: 'An oral history of Hurricane Hattie, British Honduras, 1961',
  description:
    'Oral histories and photographs of Hurricane Hattie, which struck British Honduras (now Belize) on 31 October 1961, told by the people who lived through it and the families who carry their stories.',

  /** Project contact address, shown in the footer, About page and Get involved page. */
  contactEmail: 'hattievoices@gmail.com',

  /** Shown in the footer, homepage and About page. */
  projectLead: 'Alina Scott, PhD',

  /** Where the project lead's name links to. */
  projectLeadUrl: 'https://alinascott.github.io/portfolio/',

  /**
   * Where the Get involved form is sent. FormSubmit (formsubmit.co) forwards each
   * submission by email to hattievoices@gmail.com. The form is activated, and this is
   * its private code, so the email address doesn't appear in the page source.
   * Leave empty to disconnect the form.
   */
  formEndpoint: 'https://formsubmit.co/4b13676e185b69e8677dd8fddcf46b25',
};

/** Languages offered in filters and forms. */
export const LANGUAGES = [
  'English',
  'Kriol',
  'Spanish',
  'Garifuna',
  "Q'eqchi'",
  'Mopan',
  'Yucatec Maya',
  'Other',
] as const;

/** Districts of Belize, used for filtering and in the data model. */
export const DISTRICTS = [
  'Belize',
  'Corozal',
  'Orange Walk',
  'Cayo',
  'Stann Creek',
  'Toledo',
] as const;
