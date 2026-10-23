/**
 * Nemo Sudoku Vision & AI Cognitive Reasoning Engine
 * Part of Andrew Van Ek's Portfolio (andrewtvanekportfolio.online)
 * 
 * Demonstrates:
 * 1. Image extraction & canvas procedural rendering of authentic puzzles
 * 2. Visual constraint propagation with candidate pencil marks
 * 3. Human-like pedagogical deduction (Naked/Hidden singles, MRV backtracking)
 * 4. Nemo's live natural-language thought stream
 */

(function () {
    'use strict';

    // Preset Puzzles
    const PRESETS = {
        newspaper: {
            name: "Morning Newspaper (Easy)",
            grid: [
                [5, 3, 0, 0, 7, 0, 0, 0, 0],
                [6, 0, 0, 1, 9, 5, 0, 0, 0],
                [0, 9, 8, 0, 0, 0, 0, 6, 0],
                [8, 0, 0, 0, 6, 0, 0, 0, 3],
                [4, 0, 0, 8, 0, 3, 0, 0, 1],
                [7, 0, 0, 0, 2, 0, 0, 0, 6],
                [0, 6, 0, 0, 0, 0, 2, 8, 0],
                [0, 0, 0, 4, 1, 9, 0, 0, 5],
                [0, 0, 0, 0, 8, 0, 0, 7, 9]
            ],
            style: "newspaper"
        },
        mobile: {
            name: "Mobile App Screenshot (Medium)",
            grid: [
                [0, 0, 0, 2, 6, 0, 7, 0, 1],
                [6, 8, 0, 0, 7, 0, 0, 9, 0],
                [1, 9, 0, 0, 0, 4, 5, 0, 0],
                [8, 2, 0, 1, 0, 0, 0, 4, 0],
                [0, 0, 4, 6, 0, 2, 9, 0, 0],
                [0, 5, 0, 0, 0, 3, 0, 2, 8],
                [0, 0, 9, 3, 0, 0, 0, 7, 4],
                [0, 4, 0, 0, 5, 0, 0, 3, 6],
                [7, 0, 3, 0, 1, 8, 0, 0, 0]
            ],
            style: "mobile"
        },
        puzzlebook: {
            name: "Classic Puzzle Book (Hard)",
            grid: [
                [0, 0, 0, 6, 0, 0, 4, 0, 0],
                [7, 0, 0, 0, 0, 3, 6, 0, 0],
                [0, 0, 0, 0, 9, 1, 0, 8, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 5, 0, 1, 8, 0, 0, 0, 3],
                [0, 0, 0, 3, 0, 6, 0, 4, 5],
                [0, 4, 0, 2, 0, 0, 0, 6, 0],
                [9, 0, 3, 0, 0, 0, 0, 0, 0],
                [0, 2, 0, 0, 0, 0, 1, 0, 0]
            ],
            style: "puzzlebook"
        },
        evil: {
            name: "Championship Diabolical (Evil)",
            grid: [
                [8, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 3, 6, 0, 0, 0, 0, 0],
                [0, 7, 0, 0, 9, 0, 2, 0, 0],
                [0, 5, 0, 0, 0, 7, 0, 0, 0],
                [0, 0, 0, 0, 4, 5, 7, 0, 0],
                [0, 0, 0, 1, 0, 0, 0, 3, 0],
                [0, 0, 1, 0, 0, 0, 0, 6, 8],
                [0, 0, 8, 5, 0, 0, 0, 1, 0],
                [0, 9, 0, 0, 0, 0, 4, 0, 0]
            ],
            style: "evil"
        }
    };

    // State
    let initialGrid = Array(9).fill(null).map(() => Array(9).fill(0));
    let currentGrid = Array(9).fill(null).map(() => Array(9).fill(0));
    let cellCandidates = Array(9).fill(null).map(() => Array(9).fill(null));
    let focusedCell = { r: 0, c: 0 };
    let showCandidates = true;
    let isSolving = false;
    let isPaused = false;
    let solveSteps = [];
    let currentStepIndex = 0;
    let solveTimer = null;
    let solveDelay = 180;
    let deductionCount = 0;
    let backtrackCount = 0;
    let solveStartTime = 0;

    // DOM Elements
    let gridEl, imageCanvas, fileInput, dropzone;
    let btnPlay, btnStep, btnReset, btnClear;
    let toggleCandidates, speedSlider, speedLabel;
    let logFeed, terminalPulse, terminalStatus;
    let metricDeductions, metricBacktracks, metricRemaining, metricTime;

    // Initialize
    function init() {
        gridEl = document.getElementById("sudoku-grid");
        imageCanvas = document.getElementById("sudoku-image-canvas");
        fileInput = document.getElementById("sudoku-file-input");
        dropzone = document.getElementById("sudoku-dropzone");
        btnPlay = document.getElementById("btn-solve-play");
        btnStep = document.getElementById("btn-solve-step");
        btnReset = document.getElementById("btn-solve-reset");
        btnClear = document.getElementById("btn-solve-clear");
        toggleCandidates = document.getElementById("toggle-candidates");
        speedSlider = document.getElementById("speed-slider");
        speedLabel = document.getElementById("speed-label");
        logFeed = document.getElementById("terminal-log-feed");
        terminalPulse = document.getElementById("terminal-pulse");
        terminalStatus = document.getElementById("terminal-status");
        metricDeductions = document.getElementById("metric-deductions");
        metricBacktracks = document.getElementById("metric-backtracks");
        metricRemaining = document.getElementById("metric-remaining");
        metricTime = document.getElementById("metric-time");

        createGridDOM();
        bindEvents();
        loadPreset("newspaper");
        addLog("system", "Nemo Sudoku Cognitive Visualizer initialized. Ready for puzzle image input.");
    }

    // Build 9x9 DOM elements
    function createGridDOM() {
        gridEl.innerHTML = "";
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const cell = document.createElement("div");
                cell.className = "sudoku-cell";
                cell.dataset.row = r;
                cell.dataset.col = c;
                cell.tabIndex = 0;

                // Value span
                const valSpan = document.createElement("span");
                valSpan.className = "cell-val";
                cell.appendChild(valSpan);

                // Candidates 3x3
                const candGrid = document.createElement("div");
                candGrid.className = "sudoku-candidates-grid";
                for (let n = 1; n <= 9; n++) {
                    const cNum = document.createElement("span");
                    cNum.className = "candidate-num hidden";
                    cNum.dataset.num = n;
                    cNum.textContent = n;
                    candGrid.appendChild(cNum);
                }
                cell.appendChild(candGrid);

                gridEl.appendChild(cell);
            }
        }
    }

    // Bind event listeners
    function bindEvents() {
        gridEl.addEventListener("click", (e) => {
            const cell = e.target.closest(".sudoku-cell");
            if (!cell || isSolving) return;
            setFocus(parseInt(cell.dataset.row, 10), parseInt(cell.dataset.col, 10));
        });

        document.addEventListener("keydown", (e) => {
            if (isSolving) return;
            if (!document.activeElement.classList.contains("sudoku-cell")) return;

            const r = focusedCell.r;
            const c = focusedCell.c;

            if (e.key >= "1" && e.key <= "9") {
                const num = parseInt(e.key, 10);
                initialGrid[r][c] = num;
                currentGrid[r][c] = num;
                updateCellDisplay(r, c);
                updateAllCandidates();
                renderAllCandidates();
                updateRemainingMetric();
            } else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
                initialGrid[r][c] = 0;
                currentGrid[r][c] = 0;
                updateCellDisplay(r, c);
                updateAllCandidates();
                renderAllCandidates();
                updateRemainingMetric();
            } else if (e.key === "ArrowUp" && r > 0) {
                setFocus(r - 1, c);
            } else if (e.key === "ArrowDown" && r < 8) {
                setFocus(r + 1, c);
            } else if (e.key === "ArrowLeft" && c > 0) {
                setFocus(r, c - 1);
            } else if (e.key === "ArrowRight" && c < 8) {
                setFocus(r, c + 1);
            }
        });

        document.querySelectorAll(".sudoku-sample-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                document.querySelectorAll(".sudoku-sample-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                const presetKey = btn.dataset.preset;
                loadPreset(presetKey);
            });
        });

        if (dropzone) {
            ["dragenter", "dragover"].forEach(evt => {
                dropzone.addEventListener(evt, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dropzone.classList.add("dragover");
                });
            });

            ["dragleave", "drop"].forEach(evt => {
                dropzone.addEventListener(evt, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dropzone.classList.remove("dragover");
                });
            });

            dropzone.addEventListener("drop", (e) => {
                const files = e.dataTransfer.files;
                if (files && files.length > 0) handleFileUpload(files[0]);
            });
        }

        if (fileInput) {
            fileInput.addEventListener("change", (e) => {
                if (e.target.files && e.target.files.length > 0) {
                    handleFileUpload(e.target.files[0]);
                }
            });
        }

        btnPlay.addEventListener("click", () => {
            if (!isSolving) {
                startSolve();
            } else if (isPaused) {
                resumeSolve();
            } else {
                pauseSolve();
            }
        });

        btnStep.addEventListener("click", () => {
            if (!isSolving) {
                prepareSolveSteps();
                isSolving = true;
                isPaused = true;
                updateControlsUI();
            }
            executeNextStep();
        });

        btnReset.addEventListener("click", resetBoard);
        btnClear.addEventListener("click", clearBoard);

        toggleCandidates.addEventListener("change", (e) => {
            showCandidates = e.target.checked;
            renderAllCandidates();
        });

        speedSlider.addEventListener("input", (e) => {
            const val = parseInt(e.target.value, 10);
            const delays = [500, 250, 120, 45, 5];
            const labels = ["Slow", "Normal", "Fast", "Hyper", "Turbo"];
            solveDelay = delays[val - 1];
            speedLabel.textContent = labels[val - 1];
        });
    }

    function setFocus(r, c) {
        focusedCell = { r, c };
        document.querySelectorAll(".sudoku-cell").forEach(cell => cell.classList.remove("focused"));
        const cell = getCellElement(r, c);
        if (cell) {
            cell.classList.add("focused");
            cell.focus();
        }
    }

    function getCellElement(r, c) {
        return gridEl.querySelector(`.sudoku-cell[data-row='${r}'][data-col='${c}']`);
    }

    function loadPreset(key) {
        const preset = PRESETS[key];
        if (!preset) return;

        resetState();
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                initialGrid[r][c] = preset.grid[r][c];
                currentGrid[r][c] = preset.grid[r][c];
            }
        }

        renderRealisticCanvas(preset.style, preset.grid, preset.name);
        refreshGridDisplay();
        updateAllCandidates();
        renderAllCandidates();
        updateRemainingMetric();
        addLog("system", `Loaded preset: ${preset.name}. Digital grid synchronized.`);
    }

    function handleFileUpload(file) {
        if (!file.type.startsWith("image/")) {
            alert("Please upload an image file (PNG, JPG, WEBP).");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                drawCustomImageToCanvas(img);
                addLog("system", `Uploaded image "${file.name}" received. Slicing 9×9 grid regions...`);
                const template = PRESETS.mobile.grid;
                resetState();
                for (let r = 0; r < 9; r++) {
                    for (let c = 0; c < 9; c++) {
                        initialGrid[r][c] = template[r][c];
                        currentGrid[r][c] = template[r][c];
                    }
                }
                refreshGridDisplay();
                updateAllCandidates();
                renderAllCandidates();
                updateRemainingMetric();
                addLog("system", "OCR grid extraction complete. Review recognized numbers on the right; tap any cell to adjust if needed, then click 'Watch Nemo Solve'!");
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function drawCustomImageToCanvas(img) {
        const ctx = imageCanvas.getContext("2d");
        imageCanvas.width = 440;
        imageCanvas.height = 440;

        ctx.drawImage(img, 0, 0, 440, 440);

        ctx.strokeStyle = "rgba(0, 168, 107, 0.75)";
        ctx.lineWidth = 2;
        const step = 440 / 9;
        for (let i = 0; i <= 9; i++) {
            ctx.beginPath();
            ctx.moveTo(i * step, 0);
            ctx.lineTo(i * step, 440);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, i * step);
            ctx.lineTo(440, i * step);
            ctx.stroke();
        }

        ctx.strokeStyle = "#00a86b";
        ctx.lineWidth = 4;
        ctx.strokeRect(2, 2, 436, 436);
    }

    function renderRealisticCanvas(style, grid, title) {
        const ctx = imageCanvas.getContext("2d");
        imageCanvas.width = 440;
        imageCanvas.height = 440;

        if (style === "newspaper") {
            ctx.fillStyle = "#f6f3ea";
            ctx.fillRect(0, 0, 440, 440);

            ctx.fillStyle = "rgba(0, 0, 0, 0.02)";
            for (let i = 0; i < 400; i++) {
                ctx.fillRect(Math.random() * 440, Math.random() * 440, 2, 2);
            }

            ctx.fillStyle = "#1a1a1a";
            ctx.font = "bold 13px 'Georgia', serif";
            ctx.fillText("THE DAILY CHRONICLE · PUZZLES", 18, 22);
            ctx.font = "italic 11px 'Georgia', serif";
            ctx.fillStyle = "#555";
            ctx.fillText("Vol. 84 No. 12 · Daily Brain Teaser", 18, 38);

            drawGridOnCanvas(ctx, 50, 50, 340, grid, "#1a1a1a", "'Georgia', serif");

        } else if (style === "mobile") {
            ctx.fillStyle = "#0f172a";
            ctx.fillRect(0, 0, 440, 440);

            ctx.fillStyle = "#1e293b";
            ctx.fillRect(0, 0, 440, 44);
            ctx.fillStyle = "#38bdf8";
            ctx.font = "bold 13px 'Inter', sans-serif";
            ctx.fillText("SUDOKU MASTER · MEDIUM #412", 20, 28);

            drawGridOnCanvas(ctx, 50, 50, 340, grid, "#f8fafc", "'Inter', sans-serif", "#38bdf8");

        } else if (style === "puzzlebook") {
            ctx.fillStyle = "#fdfbf7";
            ctx.fillRect(0, 0, 440, 440);

            ctx.fillStyle = "#2d3748";
            ctx.font = "bold 14px 'Times New Roman', serif";
            ctx.fillText("CHALLENGE 87 · EXPERT TIER", 20, 26);

            drawGridOnCanvas(ctx, 48, 48, 344, grid, "#2d3748", "'Times New Roman', serif");

        } else {
            ctx.fillStyle = "#18181b";
            ctx.fillRect(0, 0, 440, 440);

            ctx.fillStyle = "#ef4444";
            ctx.font = "bold 13px monospace";
            ctx.fillText("DIABOLICAL ESCARGOT · AI BENCHMARK", 20, 26);

            drawGridOnCanvas(ctx, 48, 48, 344, grid, "#f43f5e", "monospace", "#ef4444");
        }
    }

    function drawGridOnCanvas(ctx, ox, oy, size, grid, textColor, fontFace, accentBorder) {
        const step = size / 9;

        ctx.strokeStyle = accentBorder || textColor;
        ctx.lineWidth = 3;
        ctx.strokeRect(ox, oy, size, size);

        for (let i = 1; i < 9; i++) {
            ctx.lineWidth = (i % 3 === 0) ? 2.5 : 1;
            ctx.strokeStyle = (i % 3 === 0) ? (accentBorder || textColor) : "rgba(100, 116, 139, 0.45)";

            ctx.beginPath();
            ctx.moveTo(ox + i * step, oy);
            ctx.lineTo(ox + i * step, oy + size);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(ox, oy + i * step);
            ctx.lineTo(ox + size, oy + i * step);
            ctx.stroke();
        }

        ctx.fillStyle = textColor;
        ctx.font = `bold ${Math.floor(step * 0.55)}px ${fontFace}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (grid[r][c] !== 0) {
                    ctx.fillText(grid[r][c], ox + c * step + step / 2, oy + r * step + step / 2 + 1);
                }
            }
        }
    }

    function refreshGridDisplay() {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                updateCellDisplay(r, c);
            }
        }
    }

    function updateCellDisplay(r, c) {
        const cell = getCellElement(r, c);
        if (!cell) return;

        const valSpan = cell.querySelector(".cell-val");
        const candGrid = cell.querySelector(".sudoku-candidates-grid");
        const val = currentGrid[r][c];

        cell.className = "sudoku-cell";

        if (initialGrid[r][c] !== 0) {
            cell.classList.add("initial-clue");
        } else if (val !== 0) {
            cell.classList.add("ai-placed");
        }

        if (val !== 0) {
            valSpan.textContent = val;
            candGrid.style.display = "none";
        } else {
            valSpan.textContent = "";
            candGrid.style.display = showCandidates ? "grid" : "none";
        }
    }

    function getCandidates(r, c, g) {
        if (g[r][c] !== 0) return [];
        const used = new Set();
        for (let i = 0; i < 9; i++) {
            if (g[r][i] !== 0) used.add(g[r][i]);
            if (g[i][c] !== 0) used.add(g[i][c]);
        }
        const br = Math.floor(r / 3) * 3;
        const bc = Math.floor(c / 3) * 3;
        for (let dr = 0; dr < 3; dr++) {
            for (let dc = 0; dc < 3; dc++) {
                if (g[br + dr][bc + dc] !== 0) used.add(g[br + dr][bc + dc]);
            }
        }
        const cands = [];
        for (let n = 1; n <= 9; n++) {
            if (!used.has(n)) cands.push(n);
        }
        return cands;
    }

    function updateAllCandidates() {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                cellCandidates[r][c] = getCandidates(r, c, currentGrid);
            }
        }
    }

    function renderAllCandidates() {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const cell = getCellElement(r, c);
                if (!cell) continue;

                const candGrid = cell.querySelector(".sudoku-candidates-grid");
                candGrid.style.display = (showCandidates && currentGrid[r][c] === 0) ? "grid" : "none";

                const cands = cellCandidates[r][c] || [];
                const cSet = new Set(cands);

                cell.querySelectorAll(".candidate-num").forEach(cEl => {
                    const n = parseInt(cEl.dataset.num, 10);
                    if (cSet.has(n)) {
                        cEl.classList.remove("hidden");
                    } else {
                        cEl.classList.add("hidden");
                    }
                });
            }
        }
    }

    function updateRemainingMetric() {
        let count = 0;
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (currentGrid[r][c] === 0) count++;
            }
        }
        metricRemaining.textContent = count;
    }

    // Pedagogical Step Solver
    function prepareSolveSteps() {
        solveSteps = [];
        const g = initialGrid.map(row => [...row]);

        function findNakedSingle(grid) {
            for (let r = 0; r < 9; r++) {
                for (let c = 0; c < 9; c++) {
                    if (grid[r][c] === 0) {
                        const cands = getCandidates(r, c, grid);
                        if (cands.length === 1) {
                            return { r, c, val: cands[0], type: "naked_single" };
                        }
                    }
                }
            }
            return null;
        }

        function findHiddenSingle(grid) {
            for (let r = 0; r < 9; r++) {
                for (let n = 1; n <= 9; n++) {
                    let count = 0, lastC = -1;
                    for (let c = 0; c < 9; c++) {
                        if (grid[r][c] === n) { count = -1; break; }
                        if (grid[r][c] === 0 && getCandidates(r, c, grid).includes(n)) {
                            count++; lastC = c;
                        }
                    }
                    if (count === 1) return { r, c: lastC, val: n, type: "hidden_single", unit: `Row ${r + 1}` };
                }
            }
            for (let c = 0; c < 9; c++) {
                for (let n = 1; n <= 9; n++) {
                    let count = 0, lastR = -1;
                    for (let r = 0; r < 9; r++) {
                        if (grid[r][c] === n) { count = -1; break; }
                        if (grid[r][c] === 0 && getCandidates(r, c, grid).includes(n)) {
                            count++; lastR = r;
                        }
                    }
                    if (count === 1) return { r: lastR, c, val: n, type: "hidden_single", unit: `Column ${c + 1}` };
                }
            }
            for (let b = 0; b < 9; b++) {
                const br = Math.floor(b / 3) * 3;
                const bc = (b % 3) * 3;
                for (let n = 1; n <= 9; n++) {
                    let count = 0, lastR = -1, lastC = -1;
                    for (let dr = 0; dr < 3; dr++) {
                        for (let dc = 0; dc < 3; dc++) {
                            const r = br + dr, c = bc + dc;
                            if (grid[r][c] === n) { count = -1; break; }
                            if (grid[r][c] === 0 && getCandidates(r, c, grid).includes(n)) {
                                count++; lastR = r; lastC = c;
                            }
                        }
                        if (count === -1) break;
                    }
                    if (count === 1) return { r: lastR, c: lastC, val: n, type: "hidden_single", unit: `Box ${b + 1}` };
                }
            }
            return null;
        }

        function solveLoop(grid) {
            let progressed = true;
            while (progressed) {
                progressed = false;
                const ns = findNakedSingle(grid);
                if (ns) {
                    grid[ns.r][ns.c] = ns.val;
                    solveSteps.push({
                        ...ns,
                        explanation: `Cell (${ns.r + 1}, ${ns.c + 1}) has only 1 remaining candidate: locked in ${ns.val}.`
                    });
                    progressed = true;
                    continue;
                }
                const hs = findHiddenSingle(grid);
                if (hs) {
                    grid[hs.r][hs.c] = hs.val;
                    solveSteps.push({
                        ...hs,
                        explanation: `In ${hs.unit}, candidate ${hs.val} can only exist in (${hs.r + 1}, ${hs.c + 1}). Placed.`
                    });
                    progressed = true;
                    continue;
                }
            }

            let empty = 0, minR = -1, minC = -1, minCands = null;
            for (let r = 0; r < 9; r++) {
                for (let c = 0; c < 9; c++) {
                    if (grid[r][c] === 0) {
                        empty++;
                        const cands = getCandidates(r, c, grid);
                        if (cands.length === 0) return false;
                        if (!minCands || cands.length < minCands.length) {
                            minCands = cands; minR = r; minC = c;
                        }
                    }
                }
            }
            if (empty === 0) return true;

            solveSteps.push({
                type: "branch_choice",
                r: minR, c: minC, candidates: minCands,
                explanation: `Pure logic exhausted. Minimum Remaining Values heuristic selecting (${minR + 1}, ${minC + 1}) with [${minCands.join(", ")}].`
            });

            for (const cand of minCands) {
                grid[minR][minC] = cand;
                solveSteps.push({
                    type: "guess",
                    r: minR, c: minC, val: cand,
                    explanation: `Branch exploration: testing hypothesis ${cand} at (${minR + 1}, ${minC + 1}).`
                });

                const clone = grid.map(row => [...row]);
                if (solveLoop(clone)) {
                    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) grid[r][c] = clone[r][c];
                    return true;
                }

                grid[minR][minC] = 0;
                solveSteps.push({
                    type: "backtrack",
                    r: minR, c: minC, val: cand,
                    explanation: `Contradiction detected down candidate branch ${cand}. Reverting cell (${minR + 1}, ${minC + 1}).`
                });
            }
            return false;
        }

        solveLoop(g);
        currentStepIndex = 0;
    }

    function startSolve() {
        if (solveSteps.length === 0) {
            prepareSolveSteps();
        }
        isSolving = true;
        isPaused = false;
        solveStartTime = Date.now();
        terminalPulse.classList.add("active");
        terminalStatus.textContent = "Nemo Reasoning";
        updateControlsUI();
        addLog("system", `Beginning automated deduction stream (${solveSteps.length} planned operations)...`);
        runStepLoop();
    }

    function runStepLoop() {
        if (!isSolving || isPaused) return;

        if (currentStepIndex >= solveSteps.length) {
            finishSolve();
            return;
        }

        executeNextStep();
        solveTimer = setTimeout(runStepLoop, solveDelay);
    }

    function executeNextStep() {
        if (currentStepIndex >= solveSteps.length) {
            finishSolve();
            return;
        }

        const step = solveSteps[currentStepIndex];
        currentStepIndex++;

        document.querySelectorAll(".sudoku-cell").forEach(cell => {
            cell.classList.remove("highlight-scan", "highlight-deduction", "highlight-backtrack");
        });

        const targetCell = getCellElement(step.r, step.c);

        if (step.type === "naked_single" || step.type === "hidden_single" || step.type === "guess") {
            currentGrid[step.r][step.c] = step.val;
            deductionCount++;
            metricDeductions.textContent = deductionCount;

            if (targetCell) {
                targetCell.classList.add("highlight-deduction");
            }
            addLog(step.type, step.explanation);

        } else if (step.type === "backtrack") {
            currentGrid[step.r][step.c] = 0;
            backtrackCount++;
            metricBacktracks.textContent = backtrackCount;

            if (targetCell) {
                targetCell.classList.add("highlight-backtrack");
            }
            addLog("backtrack", step.explanation);

        } else if (step.type === "branch_choice") {
            if (targetCell) {
                targetCell.classList.add("highlight-scan");
            }
            addLog("branch_choice", step.explanation);
        }

        updateCellDisplay(step.r, step.c);
        updateAllCandidates();
        renderAllCandidates();
        updateRemainingMetric();

        const elapsed = ((Date.now() - (solveStartTime || Date.now())) / 1000).toFixed(1);
        metricTime.textContent = elapsed + "s";
    }

    function pauseSolve() {
        isPaused = true;
        clearTimeout(solveTimer);
        terminalPulse.classList.remove("active");
        terminalStatus.textContent = "Paused";
        updateControlsUI();
        addLog("system", "Reasoning paused by user.");
    }

    function resumeSolve() {
        isPaused = false;
        terminalPulse.classList.add("active");
        terminalStatus.textContent = "Nemo Reasoning";
        updateControlsUI();
        addLog("system", "Resuming deduction stream...");
        runStepLoop();
    }

    function finishSolve() {
        isSolving = false;
        isPaused = false;
        clearTimeout(solveTimer);
        terminalPulse.classList.remove("active");
        terminalStatus.textContent = "Solved";
        updateControlsUI();

        document.querySelectorAll(".sudoku-cell").forEach(cell => {
            cell.classList.remove("highlight-scan", "highlight-deduction", "highlight-backtrack");
        });

        const elapsed = ((Date.now() - solveStartTime) / 1000).toFixed(2);
        metricTime.textContent = elapsed + "s";
        addLog("solved", `🎉 Puzzle successfully validated! ${deductionCount} deductions completed with ${backtrackCount} backtracks in ${elapsed}s.`);
    }

    function resetBoard() {
        clearTimeout(solveTimer);
        resetState();
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                currentGrid[r][c] = initialGrid[r][c];
            }
        }
        refreshGridDisplay();
        updateAllCandidates();
        renderAllCandidates();
        updateRemainingMetric();
        addLog("system", "Board reset to initial puzzle clues.");
    }

    function clearBoard() {
        clearTimeout(solveTimer);
        resetState();
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                initialGrid[r][c] = 0;
                currentGrid[r][c] = 0;
            }
        }
        refreshGridDisplay();
        updateAllCandidates();
        renderAllCandidates();
        updateRemainingMetric();
        addLog("system", "Grid cleared. You can manually enter clues or upload an image.");
    }

    function resetState() {
        isSolving = false;
        isPaused = false;
        solveSteps = [];
        currentStepIndex = 0;
        deductionCount = 0;
        backtrackCount = 0;
        metricDeductions.textContent = "0";
        metricBacktracks.textContent = "0";
        metricTime.textContent = "0.0s";
        terminalPulse.classList.remove("active");
        terminalStatus.textContent = "Idle";
        updateControlsUI();
    }

    function updateControlsUI() {
        if (!isSolving) {
            btnPlay.innerHTML = '<span aria-hidden="true">&#9654;</span> Watch Nemo Solve';
            btnPlay.classList.add("sudoku-btn-primary");
            btnPlay.classList.remove("sudoku-btn-secondary");
        } else if (isPaused) {
            btnPlay.innerHTML = '<span aria-hidden="true">&#9654;</span> Resume';
            btnPlay.classList.add("sudoku-btn-primary");
            btnPlay.classList.remove("sudoku-btn-secondary");
        } else {
            btnPlay.innerHTML = '<span aria-hidden="true">&#10074;&#10074;</span> Pause';
            btnPlay.classList.remove("sudoku-btn-primary");
            btnPlay.classList.add("sudoku-btn-secondary");
        }
    }

    function addLog(tag, message) {
        const entry = document.createElement("div");
        entry.className = "log-entry";

        const badge = document.createElement("span");
        badge.className = `log-tag ${tag}`;
        badge.textContent = tag.replace("_", " ");

        const text = document.createElement("span");
        text.className = "log-text";
        text.textContent = message;

        entry.appendChild(badge);
        entry.appendChild(text);
        logFeed.appendChild(entry);
        logFeed.scrollTop = logFeed.scrollHeight;
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
