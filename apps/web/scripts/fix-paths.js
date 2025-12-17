import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.resolve(__dirname, '../dist');
const indexPath = path.join(distDir, 'index.html');

if (fs.existsSync(indexPath)) {
  let html = fs.readFileSync(indexPath, 'utf-8');

  // Fix asset paths to include /app/ prefix
  html = html
    .replace(/src="\/assets\//g, 'src="/app/assets/')
    .replace(/href="\/assets\//g, 'href="/app/assets/')
    .replace(/href="\.\/favicon/g, 'href="/app/favicon');

  fs.writeFileSync(indexPath, html);
  console.log('Fixed asset paths in index.html');
} else {
  console.error('index.html not found in dist directory');
  process.exit(1);
}
