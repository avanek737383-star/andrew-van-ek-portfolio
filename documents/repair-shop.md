# Please Hold: The Cursed Computer Repair Shop

A static browser game created for Andrew Van Ek's portfolio. Six fictional tickets teach evidence-based troubleshooting through a humorous repair counter.

## Files

- `repair-shop.html`: game page.
- `css/repair-shop.css`: isolated visual design and responsive layout.
- `scripts/repair-shop-engine.js`: scenario definitions, repair rules, validation, scoring, and saved-state recovery.
- `scripts/repair-shop.js`: DOM rendering, keyboard navigation, local storage, and reset dialogs.
- `tests/repair-shop.test.mjs`: dependency-free engine tests; run with a recent Node.js using `node --test tests/repair-shop.test.mjs`.
- `tests/repair-shop.browser.mjs`: development browser checks. Requires Playwright and installed Microsoft Edge; serve this directory on `127.0.0.1:8766`, then run `node tests/repair-shop.browser.mjs`.

The game makes no AI or application-backend requests. Fonts are requested from Google Fonts, with system-font fallbacks. All file operations, diagnostic readings, repair commands, and customers are fictional. Local progress is saved under `avanek-please-hold-v1` when browser storage is available.

Cases one and six deliberately share a symptom but have different underlying faults. The first references ImageGlass's documented `--ig-set-default-viewer` command. The sixth is an illustrative cloud-file failure, not a diagnosis of the original intermittent Explorer behavior.

Created by Andrew Van Ek with implementation assistance from ChatGPT / Codex (OpenAI), November 25, 2026.
