import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateData } from './validate-data.ts';

/** Copy the tracked gallery unchanged; collected records stay in local JSON. */
export function writeGallery(directory: string) {
  copyFileSync(
    fileURLToPath(new URL('./templates/gallery.html', import.meta.url)),
    resolve(directory, 'gallery.html'),
  );
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const directory = fileURLToPath(new URL('../data', import.meta.url));
  validateData(directory, { complete: true });
  writeGallery(directory);
  console.log(
    'Copied scripts/templates/gallery.html to data/gallery.html. Start npm run dev and open /data/gallery.html.',
  );
}
