/**
 * Andrew Van Ek Portfolio - Universal Client-Side Site Search Engine & Spotlight Modal
 * Fast, dependency-free full-text search across 370+ maintenance entries, projects, and systems.
 */
(function () {
    'use strict';

    var SEARCH_INDEX_URL = 'data/search-index.json';
    var cachedIndex = null;
    var indexFetchPromise = null;

    function escapeHTML(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function tokenize(query) {
        if (!query) return [];
        return query
            .toLowerCase()
            .replace(/[^a-z0-9_\-\.]+/g, ' ')
            .trim()
            .split(/\s+/)
            .filter(function (t) { return t.length >= 2; });
    }

    function fetchIndex() {
        if (cachedIndex) return Promise.resolve(cachedIndex);
        if (indexFetchPromise) return indexFetchPromise;

        indexFetchPromise = fetch(SEARCH_INDEX_URL)
            .then(function (res) {
                if (!res.ok) throw new Error('Search index unavailable: ' + res.status);
                return res.json();
            })
            .then(function (data) {
                cachedIndex = data;
                return cachedIndex;
            })
            .catch(function (err) {
                console.error('[Search] Failed to load index:', err);
                indexFetchPromise = null;
                return [];
            });

        return indexFetchPromise;
    }

    function extractSnippet(content, terms, maxLength) {
        maxLength = maxLength || 200;
        if (!content) return '';
        var lower = content.toLowerCase();
        var firstIdx = -1;
        terms.forEach(function (term) {
            var idx = lower.indexOf(term);
            if (idx !== -1 && (firstIdx === -1 || idx < firstIdx)) {
                firstIdx = idx;
            }
        });
        if (firstIdx === -1) {
            return content.length > maxLength ? content.slice(0, maxLength) + '...' : content;
        }
        var start = Math.max(0, firstIdx - 45);
        var end = Math.min(content.length, start + maxLength);
        var prefix = start > 0 ? '...' : '';
        var suffix = end < content.length ? '...' : '';
        return prefix + content.slice(start, end).trim() + suffix;
    }

    function highlightText(text, terms) {
        if (!text || !terms || terms.length === 0) return escapeHTML(text);
        var escaped = escapeHTML(text);
        terms.forEach(function (term) {
            if (!term || term.length < 2) return;
            var pattern = new RegExp('(' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
            escaped = escaped.replace(pattern, '<mark class="search-highlight">$1</mark>');
        });
        return escaped;
    }

    function performSearch(items, query, categoryFilter) {
        var terms = tokenize(query);
        if (terms.length === 0) return [];
        var rawLower = query.toLowerCase().trim();

        var scored = [];
        for (var i = 0; i < items.length; i++) {
            var item = items[i];

            if (categoryFilter && categoryFilter !== 'all') {
                if (item.category.toLowerCase() !== categoryFilter.toLowerCase()) {
                    continue;
                }
            }

            var titleLower = (item.title || '').toLowerCase();
            var contentLower = (item.content || '').toLowerCase();
            var subcatLower = (item.subcategory || '').toLowerCase();
            var idLower = (item.id || '').toLowerCase();

            var score = 0;
            var matchedTerms = 0;

            if (rawLower.length > 2) {
                if (titleLower.indexOf(rawLower) !== -1) score += 70;
                if (contentLower.indexOf(rawLower) !== -1) score += 35;
            }

            for (var t = 0; t < terms.length; t++) {
                var term = terms[t];
                var termHit = false;

                if (titleLower.indexOf(term) !== -1) {
                    score += 30;
                    termHit = true;
                }
                if (idLower.indexOf(term) !== -1) {
                    score += 25;
                    termHit = true;
                }
                if (subcatLower.indexOf(term) !== -1) {
                    score += 15;
                    termHit = true;
                }
                if (contentLower.indexOf(term) !== -1) {
                    score += 8;
                    termHit = true;
                }

                if (termHit) matchedTerms++;
            }

            if (matchedTerms > 0) {
                if (matchedTerms === terms.length && terms.length > 1) {
                    score += 50;
                }
                scored.push({
                    item: item,
                    score: score,
                    matchedTerms: terms
                });
            }
        }

        scored.sort(function (a, b) {
            return b.score - a.score;
        });

        return scored;
    }

    function getCategoryColor(cat) {
        switch ((cat || '').toLowerCase()) {
            case 'maintenance log': return '#0284c7';
            case 'projects': return '#059669';
            case 'ai labs': return '#7c3aed';
            case 'systems & stats': return '#d97706';
            case 'career & about': return '#475569';
            default: return '#2563eb';
        }
    }

    // =========================================================================
    // Spotlight Quick-Search Modal
    // =========================================================================
    var modalEl = null;
    var modalInput = null;
    var modalResults = null;
    var modalActiveIdx = -1;
    var modalActiveFilter = 'all';

    function createSpotlightModal() {
        if (modalEl) return;

        modalEl = document.createElement('div');
        modalEl.id = 'site-search-modal';
        modalEl.className = 'search-modal-backdrop';
        modalEl.setAttribute('role', 'dialog');
        modalEl.setAttribute('aria-modal', 'true');
        modalEl.setAttribute('aria-label', 'Search entire website');
        modalEl.style.display = 'none';

        modalEl.innerHTML = [
            '<div class="search-modal-dialog">',
            '  <div class="search-modal-header">',
            '    <div class="search-modal-input-wrap">',
            '      <svg class="search-modal-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
            '      <input type="search" id="modal-search-input" class="search-modal-input" placeholder="Search 370+ maintenance tasks, projects, AI labs, stats..." autocomplete="off" spellcheck="false" />',
            '      <button type="button" class="search-modal-close" aria-label="Close search (Esc)">Esc</button>',
            '    </div>',
            '    <div class="search-modal-filters" role="tablist">',
            '      <button type="button" class="search-filter-chip active" data-filter="all">All</button>',
            '      <button type="button" class="search-filter-chip" data-filter="Maintenance Log">Maintenance Log</button>',
            '      <button type="button" class="search-filter-chip" data-filter="Projects">Projects</button>',
            '      <button type="button" class="search-filter-chip" data-filter="AI Labs">AI Labs</button>',
            '      <button type="button" class="search-filter-chip" data-filter="Systems &amp; Stats">Systems &amp; Stats</button>',
            '    </div>',
            '  </div>',
            '  <div class="search-modal-body">',
            '    <div class="search-modal-results" id="modal-search-results">',
            '      <div class="search-modal-empty">Type keywords to search across 370+ documented items...</div>',
            '    </div>',
            '  </div>',
            '  <div class="search-modal-footer">',
            '    <div class="search-modal-hints">',
            '      <span><kbd>&uarr;</kbd><kbd>&darr;</kbd> Navigate</span>',
            '      <span><kbd>&crarr;</kbd> Select</span>',
            '      <span><kbd>Esc</kbd> Close</span>',
            '    </div>',
            '    <a href="search.html" id="modal-full-search-link" class="search-modal-view-all">Open dedicated search page &rarr;</a>',
            '  </div>',
            '</div>'
        ].join('\n');

        document.body.appendChild(modalEl);

        modalInput = modalEl.querySelector('#modal-search-input');
        modalResults = modalEl.querySelector('#modal-search-results');
        var closeBtn = modalEl.querySelector('.search-modal-close');
        var viewAllLink = modalEl.querySelector('#modal-full-search-link');

        // Close handlers
        closeBtn.addEventListener('click', closeSpotlightModal);
        modalEl.addEventListener('click', function (e) {
            if (e.target === modalEl) closeSpotlightModal();
        });

        // Category filter chips
        var chips = modalEl.querySelectorAll('.search-filter-chip');
        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                chips.forEach(function (c) { c.classList.remove('active'); });
                chip.classList.add('active');
                modalActiveFilter = chip.getAttribute('data-filter') || 'all';
                renderModalResults();
            });
        });

        // Input search
        var debounceTimer = null;
        modalInput.addEventListener('input', function () {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(renderModalResults, 50);
        });

        // Keyboard navigation
        modalEl.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                closeSpotlightModal();
                e.preventDefault();
                return;
            }

            var items = modalResults.querySelectorAll('.search-modal-item');
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (items.length > 0) {
                    modalActiveIdx = (modalActiveIdx + 1) % items.length;
                    updateModalActiveItem(items);
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (items.length > 0) {
                    modalActiveIdx = (modalActiveIdx - 1 + items.length) % items.length;
                    updateModalActiveItem(items);
                }
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (modalActiveIdx >= 0 && modalActiveIdx < items.length) {
                    var link = items[modalActiveIdx].querySelector('a');
                    if (link) window.location.href = link.href;
                } else if (modalInput.value.trim()) {
                    window.location.href = 'search.html?q=' + encodeURIComponent(modalInput.value.trim());
                }
            }
        });
    }

    function updateModalActiveItem(items) {
        items.forEach(function (item, idx) {
            item.classList.toggle('active', idx === modalActiveIdx);
            if (idx === modalActiveIdx) {
                item.scrollIntoView({ block: 'nearest' });
            }
        });
    }

    function openSpotlightModal(initialQuery) {
        createSpotlightModal();
        fetchIndex(); // prefetch index
        modalEl.style.display = 'flex';
        modalEl.setAttribute('aria-hidden', 'false');
        document.body.classList.add('search-modal-open');

        if (typeof initialQuery === 'string') {
            modalInput.value = initialQuery;
        }

        setTimeout(function () {
            modalInput.focus();
            if (modalInput.value) {
                renderModalResults();
            }
        }, 30);
    }

    function closeSpotlightModal() {
        if (!modalEl) return;
        modalEl.style.display = 'none';
        modalEl.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('search-modal-open');
        modalActiveIdx = -1;
    }

    function renderModalResults() {
        if (!modalInput || !modalResults) return;
        var query = modalInput.value.trim();
        var viewAll = modalEl.querySelector('#modal-full-search-link');

        if (!query) {
            modalResults.innerHTML = '<div class="search-modal-empty">Type keywords to search across 370+ documented items...<br><span style="font-size:0.85rem;color:#64748b;margin-top:8px;display:block;">Try: <code>slax</code>, <code>xfs</code>, <code>tailscale</code>, <code>dpms</code>, <code>cinnamon</code>, <code>folding</code></span></div>';
            modalActiveIdx = -1;
            if (viewAll) viewAll.href = 'search.html';
            return;
        }

        if (viewAll) {
            viewAll.href = 'search.html?q=' + encodeURIComponent(query) + (modalActiveFilter !== 'all' ? '&cat=' + encodeURIComponent(modalActiveFilter) : '');
        }

        fetchIndex().then(function (items) {
            var results = performSearch(items, query, modalActiveFilter);
            if (results.length === 0) {
                modalResults.innerHTML = '<div class="search-modal-empty">No matching entries found for "<strong>' + escapeHTML(query) + '</strong>".<br><span style="font-size:0.85rem;color:#64748b;margin-top:6px;display:block;">Try checking spelling or searching a broader term.</span></div>';
                modalActiveIdx = -1;
                return;
            }

            var limit = Math.min(results.length, 7);
            var html = '';
            for (var i = 0; i < limit; i++) {
                var res = results[i];
                var it = res.item;
                var color = getCategoryColor(it.category);
                var snip = extractSnippet(it.content, res.matchedTerms, 160);
                var hlTitle = highlightText(it.title, res.matchedTerms);
                var hlSnip = highlightText(snip, res.matchedTerms);

                html += [
                    '<div class="search-modal-item" data-idx="' + i + '">',
                    '  <a href="' + escapeHTML(it.url) + '">',
                    '    <div class="search-modal-item-meta">',
                    '      <span class="search-category-badge" style="background:' + color + '18;color:' + color + ';border-color:' + color + '40;">' + escapeHTML(it.category) + '</span>',
                    '      <span class="search-subcat-meta">' + escapeHTML(it.subcategory || '') + '</span>',
                    '    </div>',
                    '    <div class="search-modal-item-title">' + hlTitle + '</div>',
                    '    <div class="search-modal-item-snippet">' + hlSnip + '</div>',
                    '  </a>',
                    '</div>'
                ].join('');
            }

            modalResults.innerHTML = html;
            modalActiveIdx = 0;
            var renderedItems = modalResults.querySelectorAll('.search-modal-item');
            updateModalActiveItem(renderedItems);

            // Hover on items
            renderedItems.forEach(function (el, idx) {
                el.addEventListener('mouseenter', function () {
                    modalActiveIdx = idx;
                    updateModalActiveItem(renderedItems);
                });
            });
        });
    }

    // =========================================================================
    // Dedicated Search Page (/search.html)
    // =========================================================================
    function initSearchPage() {
        var pageContainer = document.getElementById('search-page-container');
        if (!pageContainer) return;

        var input = document.getElementById('search-page-input');
        var clearBtn = document.getElementById('search-page-clear');
        var resultsContainer = document.getElementById('search-page-results');
        var summaryContainer = document.getElementById('search-page-summary');
        var filterPills = document.querySelectorAll('.search-page-pill');

        var currentFilter = 'all';

        // Parse URL params
        var params = new URLSearchParams(window.location.search);
        var qParam = params.get('q') || '';
        var catParam = params.get('cat') || 'all';

        if (qParam && input) {
            input.value = qParam;
        }
        if (catParam) {
            currentFilter = catParam;
            filterPills.forEach(function (pill) {
                pill.classList.toggle('active', pill.getAttribute('data-filter') === currentFilter);
            });
        }

        function runPageSearch() {
            var query = input.value.trim();
            if (clearBtn) clearBtn.style.display = query ? 'flex' : 'none';

            // Sync URL
            var newUrl = new URL(window.location.href);
            if (query) newUrl.searchParams.set('q', query);
            else newUrl.searchParams.delete('q');

            if (currentFilter && currentFilter !== 'all') newUrl.searchParams.set('cat', currentFilter);
            else newUrl.searchParams.delete('cat');

            window.history.replaceState({}, '', newUrl.toString());

            if (!query) {
                summaryContainer.innerHTML = '<p class="search-summary-text">Showing suggested topics across all 370+ index items. Type a query above to filter.</p>';
                renderSuggestions();
                return;
            }

            summaryContainer.innerHTML = '<p class="search-summary-text">Searching...</p>';
            var startTime = performance.now();

            fetchIndex().then(function (items) {
                var results = performSearch(items, query, currentFilter);
                var duration = Math.round(performance.now() - startTime);

                // Update filter pill counts for current query
                updateFilterPillCounts(items, query);

                if (results.length === 0) {
                    summaryContainer.innerHTML = '<p class="search-summary-text">No matches found for "<strong>' + escapeHTML(query) + '</strong>" (' + duration + ' ms).</p>';
                    resultsContainer.innerHTML = [
                        '<div class="search-no-results">',
                        '  <h3>No matching items</h3>',
                        '  <p>Try searching broader terms like <code>slax</code>, <code>xfs</code>, <code>tailscale</code>, <code>dpms</code>, <code>nightlight</code>, or <code>storage</code>.</p>',
                        '</div>'
                    ].join('');
                    return;
                }

                summaryContainer.innerHTML = '<p class="search-summary-text">Found <strong>' + results.length + '</strong> result' + (results.length === 1 ? '' : 's') + ' for "<strong>' + escapeHTML(query) + '</strong>" in <strong>' + duration + ' ms</strong>.</p>';

                var html = '';
                for (var i = 0; i < results.length; i++) {
                    var res = results[i];
                    var it = res.item;
                    var color = getCategoryColor(it.category);
                    var snip = extractSnippet(it.content, res.matchedTerms, 240);
                    var hlTitle = highlightText(it.title, res.matchedTerms);
                    var hlSnip = highlightText(snip, res.matchedTerms);

                    // Append highlight param so landing page highlights the match
                    var destUrl = it.url;
                    if (res.matchedTerms.length > 0) {
                        var anchorIdx = destUrl.indexOf('#');
                        var hlQuery = encodeURIComponent(res.matchedTerms[0]);
                        if (anchorIdx !== -1) {
                            destUrl = destUrl.slice(0, anchorIdx) + '?highlight=' + hlQuery + destUrl.slice(anchorIdx);
                        } else {
                            destUrl = destUrl + '?highlight=' + hlQuery;
                        }
                    }

                    html += [
                        '<article class="search-card">',
                        '  <header class="search-card-header">',
                        '    <div class="search-card-badges">',
                        '      <span class="search-category-badge" style="background:' + color + '15;color:' + color + ';border-color:' + color + '40;">' + escapeHTML(it.category) + '</span>',
                        '      <span class="search-subcat-meta">' + escapeHTML(it.subcategory || '') + '</span>',
                        '    </div>',
                        '    <h2 class="search-card-title"><a href="' + escapeHTML(destUrl) + '">' + hlTitle + '</a></h2>',
                        '  </header>',
                        '  <p class="search-card-snippet">' + hlSnip + '</p>',
                        '  <footer class="search-card-footer">',
                        '    <a href="' + escapeHTML(destUrl) + '" class="search-card-jump-btn">Jump to section &rarr;</a>',
                        '  </footer>',
                        '</article>'
                    ].join('');
                }

                resultsContainer.innerHTML = html;
            });
        }

        function updateFilterPillCounts(items, query) {
            var allResults = performSearch(items, query, 'all');
            var catCounts = { 'all': allResults.length };
            allResults.forEach(function (r) {
                var c = r.item.category;
                catCounts[c] = (catCounts[c] || 0) + 1;
            });

            filterPills.forEach(function (pill) {
                var f = pill.getAttribute('data-filter');
                var count = catCounts[f] || (f === 'all' ? allResults.length : 0);
                var label = pill.getAttribute('data-label') || f;
                pill.textContent = label + ' (' + count + ')';
            });
        }

        function renderSuggestions() {
            var suggestions = [
                'Slax', 'XFS', 'Tailscale', 'DPMS', 'Night Light', 'Folding@home',
                'Coin Predictor', 'exFAT', 'Cinnamon', 'Desk Clock', 'GVSU', 'Fishbeck', 'Nemo'
            ];
            var html = [
                '<div class="search-suggestions-box">',
                '  <h3>Popular Topics &amp; Quick Searches</h3>',
                '  <div class="search-suggestions-tags">'
            ];
            suggestions.forEach(function (tag) {
                html.push('<button type="button" class="search-suggestion-btn" data-tag="' + escapeHTML(tag) + '">' + escapeHTML(tag) + '</button>');
            });
            html.push('  </div>');
            html.push('</div>');
            resultsContainer.innerHTML = html.join('');

            resultsContainer.querySelectorAll('.search-suggestion-btn').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    input.value = btn.getAttribute('data-tag');
                    runPageSearch();
                });
            });
        }

        var debounceTimer = null;
        input.addEventListener('input', function () {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(runPageSearch, 60);
        });

        if (clearBtn) {
            clearBtn.addEventListener('click', function () {
                input.value = '';
                input.focus();
                runPageSearch();
            });
        }

        filterPills.forEach(function (pill) {
            pill.addEventListener('click', function () {
                filterPills.forEach(function (p) { p.classList.remove('active'); });
                pill.classList.add('active');
                currentFilter = pill.getAttribute('data-filter') || 'all';
                runPageSearch();
            });
        });

        runPageSearch();
    }

    // =========================================================================
    // In-Page Keyword Highlight & Anchor Flash
    // =========================================================================
    function initInPageHighlighter() {
        var params = new URLSearchParams(window.location.search);
        var hlTerm = params.get('highlight');
        if (!hlTerm) return;

        var hash = window.location.hash;
        var targetEl = hash ? document.querySelector(hash) : null;

        if (targetEl) {
            targetEl.classList.add('search-target-flash');
            setTimeout(function () {
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    }

    // =========================================================================
    // Global Keyboard Shortcuts & Navbar Hook
    // =========================================================================
    function initGlobalSearchTriggers() {
        // Intercept navbar search link
        document.addEventListener('click', function (e) {
            var trigger = e.target.closest('#nav-search-trigger, .nav-search-link, .nav-search-btn');
            if (trigger) {
                // If on search.html, allow normal link navigation; otherwise open Spotlight modal
                if (!window.location.pathname.endsWith('search.html')) {
                    e.preventDefault();
                    openSpotlightModal();
                }
            }
        });

        // Keyboard hotkeys: Ctrl+K, Cmd+K, or "/"
        document.addEventListener('keydown', function (e) {
            var activeEl = document.activeElement;
            var isInputActive = activeEl && (
                activeEl.tagName === 'INPUT' ||
                activeEl.tagName === 'TEXTAREA' ||
                activeEl.isContentEditable
            );

            if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
                e.preventDefault();
                if (modalEl && modalEl.style.display !== 'none') {
                    closeSpotlightModal();
                } else {
                    openSpotlightModal();
                }
                return;
            }

            if (e.key === '/' && !isInputActive) {
                e.preventDefault();
                openSpotlightModal();
            }
        });
    }

    // Initialize all search features
    function init() {
        initGlobalSearchTriggers();
        initSearchPage();
        initInPageHighlighter();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
