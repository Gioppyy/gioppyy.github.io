// Blog: i post sono pre-renderizzati in HTML al momento del build
// (vedi scripts/build-blog.js) e incorporati in window.__POSTS__ da
// scripts/posts.generated.js. Qui non si scarica né si interpreta Markdown.
document.addEventListener('DOMContentLoaded', function () {
    const TAG_COLORS = ['is-primary', 'is-success', 'is-warning', 'is-error'];

    const list = document.getElementById('blog-list');
    const post = document.getElementById('blog-post');
    const postMeta = document.getElementById('blog-post-meta');
    const postContent = document.getElementById('blog-post-content');
    const backBtn = document.getElementById('blog-back');
    const blogNavBtn = document.querySelector('.nav-btn[data-page="blog"]');

    const posts = Array.isArray(window.__POSTS__) ? window.__POSTS__ : null;

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

    function showError(msg) {
        list.hidden = false;
        post.hidden = true;
        list.innerHTML = `<div class="nes-container is-dark"><p class="nes-text is-error">${escapeHtml(msg)}</p></div>`;
    }

    function showList() {
        post.hidden = true;
        list.hidden = false;

        if (!posts) {
            showError('> Post non disponibili: esegui "npm run build".');
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

    function showPost(slug) {
        if (!posts) {
            showError('> Post non disponibili: esegui "npm run build".');
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
        postContent.innerHTML = p.html; // già renderizzato e sanificato al build
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
