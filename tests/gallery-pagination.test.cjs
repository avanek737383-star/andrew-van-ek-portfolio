const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
class Element {
    constructor() { this.children = []; this.attrs = {}; this.events = {}; this.style = {}; this.classList = { add() {}, remove() {}, contains() { return false; } }; }
    set innerHTML(value) { this.html = value; this.children = []; }
    get innerHTML() { return this.html || ''; }
    setAttribute(key, value) { this.attrs[key] = value; }
    querySelector() { return null; }
    appendChild(child) { this.children.push(child); }
    addEventListener(key, fn) { this.events[key] = fn; }
    focus() { this.focused = true; }
    scrollIntoView() {}
}
const ids = new Map(['gallery-grid', 'gallery-pagination', 'gallery-page-status'].map(id => [id, new Element()]));
const document = { readyState: 'loading', getElementById: id => ids.get(id) || null, querySelectorAll: () => [], createElement: () => new Element(), addEventListener() {}, body: new Element() };
const window = { location: { hash: '', pathname: '/gallery.html' }, history: { replaceState() {} } };
const code = fs.readFileSync(path.join(root, 'scripts/gallery.js'), 'utf8').replace('    function init() {', '    window.galleryTest = { galleryItems, state, renderGrid, updateCategoryUI, checkInitialHash };\n    function init() {');
vm.runInNewContext(code, { document, window });
const api = window.galleryTest;
const grid = ids.get('gallery-grid'), pager = ids.get('gallery-pagination'), status = ids.get('gallery-page-status');
const total = api.galleryItems.length;
const pageCount = Math.ceil(total / api.state.pageSize);
assert.equal(total, 248);
assert.equal(new Set(api.galleryItems.map(x => x.id)).size, total);
api.renderGrid();
assert.equal(grid.children.length, 24);
assert.equal(pager.children.length, pageCount + 2);
assert.equal(pager.children[0].disabled, true);
assert.ok(status.textContent.includes(`1–24 of ${total}`));
pager.children[2].events.click();
assert.equal(api.state.page, 2);
assert.equal(grid.children[0].id, 'card-' + api.galleryItems[24].id);
assert.equal(status.focused, true);
api.state.page = pageCount;
api.renderGrid();
assert.equal(grid.children.length, total - (pageCount - 1) * 24);
assert.equal(pager.children.at(-1).disabled, true);
assert.equal(pager.children.at(-2).attrs['aria-current'], 'page');
assert.ok(status.textContent.includes(`${(pageCount - 1) * 24 + 1}–${total} of ${total}`));
api.state.activeCategory = 'homelab';
api.updateCategoryUI();
assert.equal(api.state.page, 1);
assert.match(status.textContent, /of 96 captures · Page 1 of 4/);
api.state.activeCategory = 'xp-wallpapers';
api.updateCategoryUI();
assert.equal(grid.children.length, 20);
assert.equal(pager.hidden, true);
window.location.hash = '#' + api.galleryItems.at(-1).id;
api.state.activeCategory = 'homelab';
api.checkInitialHash();
assert.equal(api.state.activeCategory, 'all');
assert.equal(api.state.page, pageCount);
assert.ok(grid.children.some(x => x.id === 'card-' + api.galleryItems.at(-1).id));
const index = JSON.parse(fs.readFileSync(path.join(root, 'data/search-index.json')));
for (const item of api.galleryItems) assert.ok(index.some(x => x.id === 'gallery-' + item.id), 'Missing search entry: ' + item.id);
console.log('Gallery checks passed: page boundaries, navigation, category reset, single-page categories, deep links, unique IDs, and all gallery search entries.');
