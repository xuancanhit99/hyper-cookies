import { build } from 'esbuild';
import { cp, mkdir, readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDirectory = path.join(projectRoot, 'dist');

const manifest = JSON.parse(await readFile(path.join(projectRoot, 'manifest.json'), 'utf8'));
const packageJson = JSON.parse(await readFile(path.join(projectRoot, 'package.json'), 'utf8'));
if (manifest.version !== packageJson.version) {
  throw new Error(`Version mismatch: manifest=${manifest.version}, package=${packageJson.version}`);
}

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

await build({
  entryPoints: {
    popup: path.join(projectRoot, 'src/popup.ts'),
    background: path.join(projectRoot, 'src/background.ts')
  },
  outdir: outputDirectory,
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: 'chrome120',
  minify: process.env.NODE_ENV === 'production',
  sourcemap: process.env.NODE_ENV === 'production' ? false : 'linked',
  legalComments: 'none'
});

for (const filename of ['manifest.json', 'popup.html', 'popup.css']) {
  await cp(path.join(projectRoot, filename), path.join(outputDirectory, filename));
}

const imageFiles = ['10.png', '10.svg', 'drive.svg', 'us.svg', 'vn.svg'];
await mkdir(path.join(outputDirectory, 'images'), { recursive: true });
for (const filename of imageFiles) {
  await cp(
    path.join(projectRoot, 'images', filename),
    path.join(outputDirectory, 'images', filename)
  );
}

await mkdir(path.join(outputDirectory, 'fonts'), { recursive: true });
await cp(
  path.join(projectRoot, 'fonts/material-symbols-rounded.woff2'),
  path.join(outputDirectory, 'fonts/material-symbols-rounded.woff2')
);

console.log(`Built ${manifest.name} ${manifest.version} in ${outputDirectory}`);
