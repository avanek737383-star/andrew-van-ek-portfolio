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
assert.equal(api.galleryItems.length, 227);
assert.equal(new Set(api.galleryItems.map(x => x.id)).size, 227);
api.renderGrid();
assert.equal(grid.children.length, 24);
assert.equal(pager.children.length, 12);
assert.equal(pager.children[0].disabled, true);
assert.match(status.textContent, /1–24 of 227/);
pager.children[2].events.click();
assert.equal(api.state.page, 2);
assert.equal(grid.children[0].id, 'card-muse-codex-credit-correction-verified');
assert.equal(status.focused, true);
api.state.page = 10;
api.renderGrid();
assert.equal(grid.children.length, 11);
assert.equal(pager.children.at(-1).disabled, true);
assert.equal(pager.children.at(-2).attrs['aria-current'], 'page');
assert.match(status.textContent, /217–227 of 227/);
api.state.activeCategory = 'homelab';
api.updateCategoryUI();
assert.equal(api.state.page, 1);
assert.match(status.textContent, /of 90 captures · Page 1 of 4/);
api.state.activeCategory = 'xp-wallpapers';
api.updateCategoryUI();
assert.equal(grid.children.length, 20);
assert.equal(pager.hidden, true);
window.location.hash = '#' + api.galleryItems.at(-1).id;
api.state.activeCategory = 'homelab';
api.checkInitialHash();
assert.equal(api.state.activeCategory, 'all');
assert.equal(api.state.page, 10);
assert.ok(grid.children.some(x => x.id === 'card-' + api.galleryItems.at(-1).id));
const index = JSON.parse(fs.readFileSync(path.join(root, 'data/search-index.json')));
for (const item of api.galleryItems) assert.ok(index.some(x => x.id === 'gallery-' + item.id), 'Missing search entry: ' + item.id);
console.log('Gallery checks passed: page boundaries, navigation, category reset, single-page categories, deep links, unique IDs, and all 227 search entries.');
