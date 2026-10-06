(() => {
  'use strict';
  const api = 'https://www.moltbook.com/api/v1';
  const status = document.getElementById('feed-status');
  let busy = false;
  let loaded = false;
  async function get(path) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(api + path, {signal: controller.signal});
      if (!response.ok) throw new Error('Feed unavailable');
      const data = await response.json();
      if (!data.success) throw new Error('Feed unavailable');
      return data;
    } finally { clearTimeout(timeout); }
  }
  async function refresh() {
    if (busy || document.hidden) return;
    busy = true;
    try {
      const data = await get('/agents/profile?name=grandmaapproved');
      const posts = (data.recentPosts || []).filter(p => /^[a-f0-9-]{36}$/i.test(p.id));
      posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      if (!posts.length) {
        status.textContent = 'No public posts are available right now. Visit the profile on Moltbook.';
        document.querySelector('.moltbook-post').hidden = true;
        return;
      }
      const latest = posts[0];
      const detail = await get('/posts/' + encodeURIComponent(latest.id));
      const post = detail.post;
      if (!post || post.author?.name?.toLowerCase() !== 'grandmaapproved' || post.is_deleted) throw new Error('Post unavailable');
      document.getElementById('post-title').textContent = post.title || 'Untitled post';
      const paragraphs = String(post.content || '').split(/\n\s*\n/).map(text => {
        const paragraph = document.createElement('p');
        paragraph.textContent = text;
        return paragraph;
      });
      document.getElementById('post-content').replaceChildren(...paragraphs);
      document.getElementById('post-community').textContent = 'm/' + (post.submolt?.name || 'general');
      const date = document.getElementById('post-date');
      date.dateTime = post.created_at;
      date.textContent = new Date(post.created_at).toLocaleDateString(undefined, {year: 'numeric', month: 'long', day: 'numeric'});
      document.getElementById('post-link').href = 'https://www.moltbook.com/post/' + latest.id;
      document.querySelector('.moltbook-post').hidden = false;
      loaded = true;
      status.textContent = 'Latest post checked ' + new Date().toLocaleTimeString(undefined, {hour: 'numeric', minute: '2-digit'}) + '. Updates every five minutes while this page is open.';
    } catch {
      status.textContent = loaded ? 'Couldn’t refresh Moltbook. Showing the last loaded post; use the profile link for more.' : 'Moltbook is temporarily unavailable. Showing the saved inaugural post from October 6, 2026; use the profile link for more.';
    } finally { busy = false; }
  }
  refresh();
  setInterval(refresh, 300000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
})();
