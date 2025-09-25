import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT = resolve(__dirname, '..');
const PUBLIC_DIR = resolve(ROOT, 'public');
const CONFIG_PATH = resolve(ROOT, 'regions.config.json');
const BASE_URL = 'https://conexion-ecuador-canada.com';

function loadRegions() {
  const raw = readFileSync(CONFIG_PATH, 'utf8');
  return JSON.parse(raw);
}

function generate() {
  const regions = loadRegions();
  const today = new Date().toISOString().split('T')[0];
  const staticRoutes = [
    { loc: '/', changefreq: 'weekly', priority: 1.0 }
  ];

  const urls = [
    ...staticRoutes.map(r => ({ ...r, lastmod: today })),
    ...regions.map(r => ({
      loc: `/${r.slug}`,
      changefreq: r.changefreq || 'weekly',
      priority: r.priority || 0.9,
      lastmod: today
    }))
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url>\n    <loc>${BASE_URL}${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`).join('\n')}\n</urlset>\n`;

  if (!existsSync(PUBLIC_DIR)) mkdirSync(PUBLIC_DIR, { recursive: true });
  const outPath = resolve(PUBLIC_DIR, 'sitemap.xml');
  writeFileSync(outPath, xml, 'utf8');
  console.log(`✅ Sitemap generado (${urls.length} URLs) -> public/sitemap.xml`);
}

generate();