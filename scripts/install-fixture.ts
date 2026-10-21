import { cpSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const target = fileURLToPath(new URL('../data', import.meta.url));
if (existsSync(target)) {
  console.error(
    'Refusing to overwrite existing data/. Move it aside explicitly before installing the sample.',
  );
  process.exitCode = 1;
} else {
  cpSync(fileURLToPath(new URL('./fixtures', import.meta.url)), target, {
    recursive: true,
    force: false,
    errorOnExist: true,
  });
  console.log(
    'Installed one fictional sample in data/. This is not quiz data.',
  );
}
