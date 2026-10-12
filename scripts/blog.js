// Blog: i post sono file .md in /posts, elencati in posts/posts.json.
// Ogni post inizia con un front matter:
// ---
// title: Titolo
// date: 2026-10-12
// tags: [ctf, web]
// excerpt: Breve descrizione
// ---
document.addEventListener('DOMContentLoaded', function () {
    const POSTS_DIR = './posts/';
    const TAG_COLORS = ['is-primary', 'is-success', 'is-warning', 'is-error'];

    const list = document.getElementById('blog-list');
    const post = document.getElementById('blog-post');
    const postMeta = document.getElementById('blog-post-meta');
    const postContent = document.getElementById('blog-post-content');
    const backBtn = document.getElementById('blog-back');
    const blogNavBtn = document.querySelector('.nav-btn[data-page="blog"]');

    let postsCache = null;

    // I link esterni nei post si aprono in una nuova scheda senza accesso a window.opener
    DOMPurify.addHook('afterSanitizeAttributes', function (node) {
        if (node.tagName === 'A' && /^https?:/i.test(node.getAttribute('href') || '')) {
            node.setAttribute('target', '_blank');
            node.setAttribute('rel', 'noopener noreferrer');
        }
    });

    function parseFrontMatter(text) {
        const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
        const meta = {};
        if (!match) return { meta, body: text };

        match[1].split(/\r?\n/).forEach(line => {
            const idx = line.indexOf(':');
            if (idx === -1) return;
            const key = line.slice(0, idx).trim();
            let value = line.slice(idx + 1).trim();
            if (key === 'tags') {
                value = value.replace(/^\[|\]$/g, '').split(',').map(t => t.trim()).filter(Boolean);
            }
            meta[key] = value;
        });
        return { meta, body: text.slice(match[0].length) };
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str == null ? '' : String(str);
        return div.innerHTML;
    }

    function formatDate(date) {
        const d = new Date(date);
        if (isNaN(d)) return escapeHtml(date);
        return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    function renderTags(tags) {
        if (!tags || !tags.length) return '';
        return '<div class="project-tags">' + tags.map((tag, i) =>
            `<span class="nes-badge"><span class="${TAG_COLORS[i % TAG_COLORS.length]}">${escapeHtml(tag)}</span></span>`
        ).join('') + '</div>';
    }

    async function loadPosts() {
        if (postsCache) return postsCache;
        if (location.protocol === 'file:') {
            throw new Error('Apri il sito tramite un server http (es. GitHub Pages), non come file locale.');
        }

        const res = await fetch(POSTS_DIR + 'posts.json', { cache: 'no-cache' });
        if (!res.ok) throw new Error('posts.json non trovato');
        const files = await res.json();

        const posts = await Promise.all(files.map(async file => {
            const r = await fetch(POSTS_DIR + file, { cache: 'no-cache' });
            if (!r.ok) return null;
            const { meta, body } = parseFrontMatter(await r.text());
            return {
                slug: file.replace(/\.md$/, ''),
                title: meta.title || file,
                date: meta.date || '',
                tags: meta.tags || [],
                excerpt: meta.excerpt || '',
                body
            };
        }));

        postsCache = posts.filter(Boolean).sort((a, b) => (b.date > a.date ? 1 : -1));
        return postsCache;
    }

    function showError(msg) {
        list.innerHTML = `<div class="nes-container is-dark"><p class="nes-text is-error">${escapeHtml(msg)}</p></div>`;
    }

    async function showList() {
        post.hidden = true;
        list.hidden = false;

        let posts;
        try {
            posts = await loadPosts();
        } catch (e) {
            showError('> Impossibile caricare i post. ' + e.message);
            return;
        }

        if (!posts.length) {
            list.innerHTML = '<div class="nes-container is-dark"><p>> Nessun post... per ora!</p></div>';
            return;
        }

        list.innerHTML = posts.map(p => `
            <a href="#blog/${encodeURIComponent(p.slug)}" class="project-link">
                <div class="project-card blog-card">
                    <h3 class="project-title">${escapeHtml(p.title)}</h3>
                    <p class="blog-meta">${formatDate(p.date)}</p>
                    ${p.excerpt ? `<p>${escapeHtml(p.excerpt)}</p>` : ''}
                    ${renderTags(p.tags)}
                </div>
            </a>
        `).join('');
    }

    async function showPost(slug) {
        let posts;
        try {
            posts = await loadPosts();
        } catch (e) {
            showError('> Impossibile caricare il post. ' + e.message);
            return;
        }

        const p = posts.find(x => x.slug === slug);
        if (!p) {
            location.hash = 'blog';
            return;
        }

        list.hidden = true;
        post.hidden = false;
        postMeta.innerHTML = `${formatDate(p.date)}${renderTags(p.tags)}`;
        postContent.innerHTML =
            `<h1>${escapeHtml(p.title)}</h1>` + DOMPurify.sanitize(marked.parse(p.body));
        window.scrollTo({ top: 0 });
    }

    function route() {
        let hash;
        try {
            hash = decodeURIComponent(location.hash.slice(1));
        } catch (e) {
            return;
        }
        if (!hash.startsWith('blog')) return;

        // Mostra la sezione blog se non è già attiva
        if (!document.getElementById('blog').classList.contains('active')) {
            blogNavBtn.click();
        }

        const slug = hash.split('/')[1];
        if (slug && !/^[\w-]+$/.test(slug)) {
            location.hash = 'blog';
            return;
        }
        if (slug) showPost(slug);
        else showList();
    }

    blogNavBtn.addEventListener('click', function () {
        if (location.hash.startsWith('#blog/')) return;
        history.replaceState(null, '', '#blog');
        showList();
    });

    // Lasciando il blog tramite la nav, pulisci l'hash
    document.querySelectorAll('.nav-btn:not([data-page="blog"])').forEach(btn => {
        btn.addEventListener('click', function () {
            if (location.hash) history.replaceState(null, '', location.pathname);
        });
    });

    backBtn.addEventListener('click', function () {
        location.hash = 'blog';
    });

    window.addEventListener('hashchange', route);
    route();
});
