// Build dei post del blog.
// Legge i file .md in posts/, li converte in HTML (con syntax highlighting),
// e genera il sito statico in dist/. I post vengono incorporati in
// dist/scripts/posts.generated.js come window.__POSTS__: il browser non
// scarica né interpreta Markdown a runtime.
import { readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync, cpSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const POSTS_DIR = join(ROOT, 'posts');
const DIST = join(ROOT, 'dist');

marked.use(markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
        const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
    }
}));

// I link esterni nei post si aprono in una nuova scheda in sicurezza.
const renderer = new marked.Renderer();
const baseLink = renderer.link.bind(renderer);
renderer.link = function (href, title, text) {
    const html = baseLink(href, title, text);
    if (/^https?:/i.test(href || '')) {
        return html.replace(/^<a /, '<a target="_blank" rel="noopener noreferrer" ');
    }
    return html;
};
marked.use({ renderer });

function parseFrontMatter(text) {
    const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
    const meta = {};
    if (!match) return { meta, body: text };
    for (const line of match[1].split(/\r?\n/)) {
        const idx = line.indexOf(':');
        if (idx === -1) continue;
        const key = line.slice(0, idx).trim();
        let value = line.slice(idx + 1).trim();
        if (key === 'tags') {
            value = value.replace(/^\[|\]$/g, '').split(',').map(t => t.trim()).filter(Boolean);
        }
        meta[key] = value;
    }
    return { meta, body: text.slice(match[0].length) };
}

function escapeHtml(str) {
    return String(str == null ? '' : str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const slugRe = /^[\w-]+$/;

const files = readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
const posts = files.map(file => {
    const slug = file.replace(/\.md$/, '');
    if (!slugRe.test(slug)) {
        throw new Error(`Slug non valido: "${file}". Usa solo lettere, numeri, - e _`);
    }
    const { meta, body } = parseFrontMatter(readFileSync(join(POSTS_DIR, file), 'utf8'));
    const bodyHtml = marked.parse(body);
    return {
        slug,
        title: meta.title || file,
        date: meta.date || '',
        tags: meta.tags || [],
        excerpt: meta.excerpt || '',
        html: `<h1>${escapeHtml(meta.title || file)}</h1>` + bodyHtml
    };
}).sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0));

// Costruzione di dist/
rmSync(DIST, { recursive: true, force: true });
mkdirSync(join(DIST, 'scripts'), { recursive: true });

const staticEntries = ['index.html', 'styles', 'scripts/main.js', 'scripts/blog.js', 'posts/assets', '.nojekyll'];
for (const entry of staticEntries) {
    const src = join(ROOT, entry);
    if (existsSync(src)) cpSync(src, join(DIST, entry), { recursive: true });
}

writeFileSync(
    join(DIST, 'scripts', 'posts.generated.js'),
    'window.__POSTS__ = ' + JSON.stringify(posts) + ';\n'
);

// Verifica fail-closed: dist/ deve contenere SOLO asset statici.
// Niente sorgenti, script di build, Markdown o file di progetto raggiungibili.
const ALLOWED_EXT = new Set(['.html', '.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico', '.woff', '.woff2']);
const BLOCKED_NAMES = new Set(['build-blog.js', 'package.json', 'package-lock.json']);

function walk(dir) {
    const out = [];
    for (const name of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, name.name);
        if (name.isDirectory()) out.push(...walk(full));
        else out.push(full);
    }
    return out;
}

const leaked = [];
for (const file of walk(DIST)) {
    const base = file.split('/').pop();
    if (base === '.nojekyll') continue;
    const ext = base.includes('.') ? base.slice(base.lastIndexOf('.')).toLowerCase() : '';
    if (!ALLOWED_EXT.has(ext) || BLOCKED_NAMES.has(base)) leaked.push(file);
}

if (leaked.length) {
    console.error('Build interrotta: file non statici in dist/:');
    leaked.forEach(f => console.error('  - ' + f));
    process.exit(1);
}

console.log(`Build completata: ${posts.length} post -> dist/`);
posts.forEach(p => console.log(`  - ${p.slug} (${p.date})`));
