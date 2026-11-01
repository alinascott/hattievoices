// One-off: derive web copies of the RAF aerial photograph.
// - hero: caption strip (rows 1184+) removed, used as the homepage background
// - full: uncropped original as a lighter JPEG for the photo record page
import sharp from 'sharp';

const src = 'public/images/belize-city-aerial-1962.png';
const { width } = await sharp(src).metadata();

await sharp(src)
  .extract({ left: 0, top: 4, width, height: 1180 })
  .flatten({ background: '#ffffff' })
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile('public/images/belize-city-aerial-1962-hero.jpg');

await sharp(src)
  .flatten({ background: '#ffffff' })
  .jpeg({ quality: 85, mozjpeg: true })
  .toFile('public/images/belize-city-aerial-1962.jpg');
