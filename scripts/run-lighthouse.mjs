import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';

const execFileAsync = promisify(execFile);
const baseUrl = process.env.LH_BASE_URL || 'http://127.0.0.1:4173';
const routes = [
  { name: 'home', path: '/' },
  { name: 'detail', path: '/nft/nft-001' },
];
const presets = ['desktop', 'mobile'];
const outputDir = 'lighthouse-reports';
await fs.mkdir(outputDir, { recursive: true });
const result = {};

for (const route of routes) {
  result[route.name] = {};
  for (const preset of presets) {
    const runs = [];
    for (let index = 1; index <= 3; index += 1) {
      const output = outputDir + '/' + route.name + '-' + preset + '-' + index + '.json';
      await execFileAsync('npx', [
        'lighthouse',
        baseUrl + route.path,
        ...(preset === 'desktop' ? ['--preset=desktop'] : ['--form-factor=mobile', '--screenEmulation.mobile', '--screenEmulation.width=390', '--screenEmulation.height=844', '--screenEmulation.deviceScaleFactor=2']),
        '--output=json',
        '--output-path=' + output,
        '--chrome-flags=--headless',
        '--quiet',
      ], { shell: true, maxBuffer: 10 * 1024 * 1024 });
      const report = JSON.parse(await fs.readFile(output, 'utf8'));
      runs.push(Object.fromEntries(
        ['performance', 'accessibility', 'best-practices', 'seo'].map((key) => [
          key,
          Math.round((report.categories[key]?.score ?? 0) * 100),
        ]),
      ));
    }
    const median = (values) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
    result[route.name][preset] = {
      runs,
      median: Object.fromEntries(Object.keys(runs[0]).map((key) => [key, median(runs.map((run) => run[key]))])),
    };
  }
}

await fs.writeFile('lighthouse-report.json', JSON.stringify({ baseUrl, result }, null, 2));
console.log(JSON.stringify({ baseUrl, result }, null, 2));


