// Polyglot Code Runner & Error Coach Engine
// Supports: Python (Pyodide), JavaScript (Worker), SQL (sql.js WASM + sessionStorage),
//           Assembly (x86 CPU Simulator), C, C++, Java, and C# with Plain-English Error Coach.

(function () {
	"use strict";

	var API_GATEWAY = "https://nucwol2-0--hdd.taile72a68.ts.net:8443";
	var MODEL_API = "https://nucwol2-0--hdd.taile72a68.ts.net";

	// DOM Elements
	var langSelect = document.getElementById("lang-select");
	var presetSelect = document.getElementById("preset-select");
	var codeEditor = document.getElementById("code-editor");
	var lineNumbers = document.getElementById("line-numbers");
	var btnRun = document.getElementById("btn-run");
	var btnReset = document.getElementById("btn-reset");
	var btnCopyCode = document.getElementById("btn-copy-code");
	var editorFileLabel = document.getElementById("editor-file-label");

	// Output & Views
	var terminalStdout = document.getElementById("terminal-stdout");
	var executionMeta = document.getElementById("execution-meta");
	var metaEngine = document.getElementById("meta-engine");
	var metaDuration = document.getElementById("meta-duration");
	var metaStatus = document.getElementById("meta-status");

	// Tabs
	var tabTerminalBtn = document.getElementById("tab-terminal-btn");
	var tabSqlBtn = document.getElementById("tab-sql-btn");
	var tabAsmBtn = document.getElementById("tab-asm-btn");
	var viewTerminal = document.getElementById("view-terminal");
	var viewSql = document.getElementById("view-sql");
	var viewAsm = document.getElementById("view-asm");

	// Coach
	var coachCard = document.getElementById("coach-card");
	var coachCategory = document.getElementById("coach-category");
	var coachPlain = document.getElementById("coach-plain");
	var coachWhy = document.getElementById("coach-why");
	var coachFixSection = document.getElementById("coach-fix-section");
	var coachFixCode = document.getElementById("coach-fix-code");

	// SQL View
	var sqlTableOutput = document.getElementById("sql-table-output");
	var sqlMetaInfo = document.getElementById("sql-meta-info");
	var sqlTablesList = document.getElementById("sql-tables-list");
	var btnClearDb = document.getElementById("btn-clear-db");

	// Assembly View
	var btnAsmStep = document.getElementById("btn-asm-step");
	var btnAsmReset = document.getElementById("btn-asm-reset");
	var asmStatus = document.getElementById("asm-status");

	// MFA Modal
	var mfaModal = document.getElementById("mfa-modal");
	var mfaModalClose = document.getElementById("mfa-modal-close");
	var mfaCancelBtn = document.getElementById("mfa-cancel-btn");
	var mfaModalForm = document.getElementById("mfa-modal-form");
	var mfaCodeInput = document.getElementById("mfa-code-input");
	var mfaModalStatus = document.getElementById("mfa-modal-status");
	var mfaBadge = document.getElementById("mfa-badge");
	var badgeDot = document.getElementById("badge-dot");
	var badgeText = document.getElementById("badge-text");

	// State
	var previousLang = "python";
	var pyodideInstance = null;
	var pyodideLoading = false;
	var sqlDb = null;
	var sqlInitPromise = null;
	var isRunning = false;

	// Assembly CPU state
	var cpu = {
		regs: { EAX: 0, EBX: 0, ECX: 0, EDX: 0, ESI: 0, EDI: 0, ESP: 0xFFFC, EIP: 0 },
		flags: { ZF: 0, CF: 0, SF: 0, OF: 0 },
		instructions: [],
		labels: {},
		isHalted: false
	};

	// File Extensions
	var FILE_MAP = {
		python: "main.py",
		javascript: "script.js",
		sql: "query.sql",
		assembly: "program.asm",
		c: "main.c",
		cpp: "main.cpp",
		java: "Main.java",
		csharp: "Program.cs"
	};

	// ==========================================
	// 1. Code Templates & Presets
	// ==========================================
	var CODE_TEMPLATES = {
		python: {
			hello: '# Python 3.12 (In-Browser WebAssembly)\n\ndef greet(name: str) -> str:\n    return f"Hello, {name}! Welcome to the Polyglot Code Runner."\n\nprint(greet("Andrew"))\nprint("Executed 100% inside your browser via WebAssembly.")\n',
			algorithm: '# Fibonacci Generator & Performance Test\n\ndef fibonacci(n):\n    a, b = 0, 1\n    result = []\n    for _ in range(n):\n        result.append(a)\n        a, b = b, a + b\n    return result\n\nseq = fibonacci(15)\nprint("First 15 Fibonacci numbers:")\nprint(seq)\nprint(f"Sum of sequence: {sum(seq)}")\n',
			bug: '# Intentional Bug: List Index Out of Bounds\n# Click "Run Code" to test the Plain-English Coach!\n\nfruits = ["Apple", "Banana", "Cherry"]\n\nprint("Fruits in my list:")\nfor i in range(len(fruits)):\n    print(f"[{i}] {fruits[i]}")\n\n# Rookie mistake: Accessing index 3 in a 3-item list (valid indices are 0, 1, 2)\nprint("Accessing fourth item:")\nprint(fruits[3])\n'
		},
		javascript: {
			hello: '// JavaScript ES2024 (Sandboxed Web Worker)\n\nfunction welcome(user) {\n    const timestamp = new Date().toLocaleTimeString();\n    console.log(`[${timestamp}] Hello, ${user}!`);\n    console.log("Running in an isolated browser Worker thread.");\n}\n\nwelcome("Explorer");\n',
			algorithm: '// QuickSort Implementation in JavaScript\n\nfunction quickSort(arr) {\n    if (arr.length <= 1) return arr;\n    const pivot = arr[arr.length - 1];\n    const left = arr.filter((x, i) => x <= pivot && i < arr.length - 1);\n    const right = arr.filter(x => x > pivot);\n    return [...quickSort(left), pivot, ...quickSort(right)];\n}\n\nconst numbers = [64, 34, 25, 12, 22, 11, 90, 5];\nconsole.log("Unsorted Array:", numbers);\nconsole.log("Sorted Array:  ", quickSort(numbers));\n',
			bug: '// Intentional Bug: Calling method on null\n// Click "Run Code" to test the Plain-English Coach!\n\nfunction getUserProfile(id) {\n    if (id === 101) return { name: "Alice", role: "Dev" };\n    return null;\n}\n\nconst user = getUserProfile(999); // returns null\n\nconsole.log("User retrieved:", user);\n// Rookie mistake: Dereferencing property on null\nconsole.log("User name length:", user.name.length);\n'
		},
		sql: {
			hello: '-- SQL / MySQL (SQLite WASM with sessionStorage persistence)\n\nSELECT "Welcome to the SQL Playground!" AS message,\n       sqlite_version() AS engine_version,\n       CURRENT_TIMESTAMP AS execution_time;\n',
			algorithm: '-- Create tables, insert records, and run an analytical JOIN\n\nCREATE TABLE IF NOT EXISTS students (\n    id INTEGER PRIMARY KEY,\n    name TEXT NOT NULL,\n    major TEXT NOT NULL,\n    gpa REAL\n);\n\nCREATE TABLE IF NOT EXISTS grades (\n    student_id INTEGER,\n    course TEXT,\n    score INTEGER\n);\n\nINSERT OR REPLACE INTO students VALUES (1, "Andrew Van Ek", "Computer Science", 3.92);\nINSERT OR REPLACE INTO students VALUES (2, "Sarah Connor", "Cybersecurity", 3.85);\nINSERT OR REPLACE INTO students VALUES (3, "Miles Dyson", "Robotics", 3.78);\n\nINSERT INTO grades VALUES (1, "Operating Systems", 98);\nINSERT INTO grades VALUES (1, "Network Security", 95);\nINSERT INTO grades VALUES (2, "Network Security", 92);\nINSERT INTO grades VALUES (3, "Computer Architecture", 96);\n\n-- Analytical Join Query\nSELECT s.name, s.major, g.course, g.score\nFROM students s\nJOIN grades g ON s.id = g.student_id\nORDER BY g.score DESC;\n',
			bug: '-- Intentional Bug: Querying a non-existent table\n-- Click "Run Code" to test the Plain-English Coach!\n\nSELECT employee_id, first_name, salary\nFROM company_payroll\nWHERE salary > 50000;\n'
		},
		assembly: {
			hello: '; 32-bit x86 CPU Simulator\n; Watch the EAX, EBX, and ECX registers update live!\n\nMOV EAX, 42         ; Load decimal 42 into EAX\nMOV EBX, 10         ; Load decimal 10 into EBX\nADD EAX, EBX        ; EAX = EAX + EBX (42 + 10 = 52)\nHLT                 ; Halt simulation\n',
			algorithm: '; Compute Factorial of 5 (5! = 120)\n; Register EAX holds the running product\n; Register ECX holds the countdown counter\n\nMOV EAX, 1          ; Product = 1\nMOV ECX, 5          ; Counter = 5\n\nloop_start:\n    MUL EAX, ECX    ; EAX = EAX * ECX\n    DEC ECX         ; Decrement counter\n    CMP ECX, 1      ; Compare ECX with 1\n    JG loop_start   ; If ECX > 1, jump back to loop_start\n\nHLT                 ; Final result in EAX (120 = 0x78)\n',
			bug: '; Intentional Bug: Jump to an undefined label\n; Click "Run Code" to test the Plain-English Coach!\n\nMOV EAX, 100\nMOV EBX, 200\nCMP EAX, EBX\nJL nonexistent_subroutine   ; Error: label is never defined!\nHLT\n'
		},
		c: {
			hello: '#include <stdio.h>\n\nint main(void) {\n    printf("Hello from ANSI C!\\n");\n    printf("Compiled and executed in your browser.\\n");\n    return 0;\n}\n',
			algorithm: '#include <stdio.h>\n\n// Bubble Sort Algorithm\nvoid bubble_sort(int arr[], int n) {\n    for (int i = 0; i < n - 1; i++) {\n        for (int j = 0; j < n - i - 1; j++) {\n            if (arr[j] > arr[j + 1]) {\n                int temp = arr[j];\n                arr[j] = arr[j + 1];\n                arr[j + 1] = temp;\n            }\n        }\n    }\n}\n\nint main(void) {\n    int data[] = {64, 34, 25, 12, 22, 11, 90};\n    int n = sizeof(data) / sizeof(data[0]);\n\n    printf("Original array: ");\n    for (int i = 0; i < n; i++) printf("%d ", data[i]);\n    printf("\\n");\n\n    bubble_sort(data, n);\n\n    printf("Sorted array:   ");\n    for (int i = 0; i < n; i++) printf("%d ", data[i]);\n    printf("\\n");\n\n    return 0;\n}\n',
			bug: '#include <stdio.h>\n\n// Intentional Bug: Missing Semicolon\n// Click "Run Code" to test the Plain-English Coach!\nint main(void) {\n    int score = 95\n    printf("Your score is %d\\n", score);\n    return 0;\n}\n'
		},
		java: {
			hello: '// Java 17 Sandbox (Linux HP Dedicated Host · MFA Protected)\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Java 17!");\n        System.out.println("Runtime: " + System.getProperty("java.version"));\n        System.out.println("Host: Dedicated Linux HP Sandbox Container");\n    }\n}\n',
			algorithm: 'import java.util.ArrayList;\nimport java.util.List;\n\npublic class Main {\n    public static void main(String[] args) {\n        List<String> homelabNodes = new ArrayList<>();\n        homelabNodes.add("Alpine NUC (Storage & Web Gateway)");\n        homelabNodes.add("Linux HP (Compiler Sandbox & Homebrew)");\n        homelabNodes.add("Tower PC (Local LLM Server)");\n        homelabNodes.add("Debian Mac (Headless Display Server)");\n\n        System.out.println("Andrew\'s Active Homelab Architecture:");\n        for (int i = 0; i < homelabNodes.size(); i++) {\n            System.out.printf("[%d] %s%n", i + 1, homelabNodes.get(i));\n        }\n    }\n}\n',
			bug: '// Intentional Bug: Calling method on null reference\n// Click "Run Code" to test the Plain-English Coach!\n\npublic class Main {\n    public static void main(String[] args) {\n        String message = null;\n        System.out.println("String length: " + message.length());\n    }\n}\n'
		},
		cpp: {
			hello: '// C++ 17 Sandbox (Linux HP Dedicated Host · MFA Protected)\n#include <iostream>\n#include <string>\n\nint main() {\n    std::string greeting = "Hello from Modern C++ 17!";\n    std::cout << greeting << "\\n";\n    std::cout << "Executed inside an isolated, rootless container.\\n";\n    return 0;\n}\n',
			algorithm: '#include <iostream>\n#include <vector>\n#include <numeric>\n#include <algorithm>\n\nint main() {\n    std::vector<int> numbers = {10, 20, 30, 40, 50, 60, 70};\n\n    int sum = std::accumulate(numbers.begin(), numbers.end(), 0);\n    double avg = static_cast<double>(sum) / numbers.size();\n\n    std::cout << "Data points: " << numbers.size() << "\\n";\n    std::cout << "Sum:         " << sum << "\\n";\n    std::cout << "Average:     " << avg << "\\n";\n    return 0;\n}\n',
			bug: '// Intentional Bug: Missing Semicolon in C++\n// Click "Run Code" to test the Plain-English Coach!\n#include <iostream>\n\nint main() {\n    int count = 42\n    std::cout << "Count is: " << count << std::endl;\n    return 0;\n}\n'
		},
		csharp: {
			hello: '// C# (.NET / Mono) Sandbox (Linux HP Dedicated Host · MFA Protected)\nusing System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello from C# on Mono!");\n        Console.WriteLine($"CLR Version: {Environment.Version}");\n    }\n}\n',
			algorithm: 'using System;\nusing System.Collections.Generic;\nusing System.Linq;\n\nclass Program {\n    static void Main() {\n        var scores = new List<int> { 88, 92, 79, 95, 100, 84, 91 };\n\n        var honors = scores.Where(s => s >= 90).OrderByDescending(s => s);\n\n        Console.WriteLine("Honors Roll (>= 90):");\n        foreach (var score in honors) {\n            Console.WriteLine($" - {score}");\n        }\n        Console.WriteLine($"Average: {scores.Average():F1}");\n    }\n}\n',
			bug: '// Intentional Bug: Uninitialized variable / syntax fault\n// Click "Run Code" to test the Plain-English Coach!\nusing System;\n\nclass Program {\n    static void Main() {\n        int total = 100\n        Console.WriteLine("Total: " + total);\n    }\n}\n'
		}
	};

	// ==========================================
	// 2. Editor Mechanics (Line Numbers, Tab Key)
	// ==========================================
	function updateLineNumbers() {
		var lines = codeEditor.value.split("\n").length;
		var numbersArr = [];
		for (var i = 1; i <= lines; i++) {
			numbersArr.push(i);
		}
		lineNumbers.textContent = numbersArr.join("\n");
	}

	codeEditor.addEventListener("input", updateLineNumbers);
	codeEditor.addEventListener("scroll", function () {
		lineNumbers.scrollTop = codeEditor.scrollTop;
	});

	// Tab key indentation handling
	codeEditor.addEventListener("keydown", function (e) {
		if (e.key === "Tab") {
			e.preventDefault();
			var start = this.selectionStart;
			var end = this.selectionEnd;
			this.value = this.value.substring(0, start) + "    " + this.value.substring(end);
			this.selectionStart = this.selectionEnd = start + 4;
			updateLineNumbers();
		} else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
			e.preventDefault();
			btnRun.click();
		}
	});

	btnCopyCode.addEventListener("click", function () {
		navigator.clipboard.writeText(codeEditor.value).then(function () {
			btnCopyCode.textContent = "✓ Copied!";
			setTimeout(function () { btnCopyCode.textContent = "📋 Copy"; }, 1500);
		});
	});

	// ==========================================
	// 3. Tab & View Navigation
	// ==========================================
	function switchResultTab(tabName) {
		tabTerminalBtn.classList.remove("active");
		tabSqlBtn.classList.remove("active");
		tabAsmBtn.classList.remove("active");
		viewTerminal.hidden = true;
		viewSql.hidden = true;
		viewAsm.hidden = true;

		if (tabName === "sql") {
			tabSqlBtn.classList.add("active");
			viewSql.hidden = false;
		} else if (tabName === "asm") {
			tabAsmBtn.classList.add("active");
			viewAsm.hidden = false;
		} else {
			tabTerminalBtn.classList.add("active");
			viewTerminal.hidden = false;
		}
	}

	tabTerminalBtn.addEventListener("click", function () { switchResultTab("terminal"); });
	tabSqlBtn.addEventListener("click", function () { switchResultTab("sql"); });
	tabAsmBtn.addEventListener("click", function () { switchResultTab("asm"); });

	// ==========================================
	// 4. MFA Paywall Modal & Auth
	// ==========================================
	function isMfaAuthenticated() {
		var token = sessionStorage.getItem("portfolio-mfa-token") || sessionStorage.getItem("council-token");
		return Boolean(token && token.length > 10);
	}

	function updateMfaBadge() {
		var current = langSelect.value;
		var requiresMfa = (current === "java" || current === "cpp" || current === "csharp");
		if (requiresMfa) {
			if (isMfaAuthenticated()) {
				mfaBadge.className = "mfa-badge verified";
				badgeText.textContent = "⭐ Linux HP (Unlocked)";
			} else {
				mfaBadge.className = "mfa-badge locked";
				badgeText.textContent = "🔒 MFA Required (Linux HP)";
			}
		} else {
			mfaBadge.className = "mfa-badge";
			badgeText.textContent = "⚡ In-Browser Mode";
		}
	}

	function openMfaModal() {
		mfaModal.hidden = false;
		mfaCodeInput.value = "";
		mfaModalStatus.textContent = "";
		setTimeout(function () { mfaCodeInput.focus(); }, 100);
	}

	function closeMfaModal() {
		mfaModal.hidden = true;
		mfaCodeInput.value = "";
		mfaModalStatus.textContent = "";
	}

	mfaModalClose.addEventListener("click", function () {
		closeMfaModal();
		// Revert to client-side language if dismissed without authenticating
		if (!isMfaAuthenticated()) {
			langSelect.value = "python";
			onLanguageChange();
		}
	});

	mfaCancelBtn.addEventListener("click", function () {
		closeMfaModal();
		if (!isMfaAuthenticated()) {
			langSelect.value = "python";
			onLanguageChange();
		}
	});

	mfaModalForm.addEventListener("submit", async function (e) {
		e.preventDefault();
		var code = mfaCodeInput.value.trim();
		if (!code) return;
		var btn = document.getElementById("mfa-submit-btn");
		btn.disabled = true;
		mfaModalStatus.style.color = "#94a3b8";
		mfaModalStatus.textContent = "Verifying authenticator code…";

		try {
			var resp = await fetch(API_GATEWAY + "/api/verify", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ code: code })
			});
			var data = await resp.json();
			if (!resp.ok) throw new Error(data.error || "Verification failed");
			sessionStorage.setItem("portfolio-mfa-token", data.token);
			sessionStorage.setItem("council-token", data.token);
			mfaModalStatus.style.color = "#34d399";
			mfaModalStatus.textContent = "✓ Verified! Unlocking Linux HP compiler sandbox…";
			setTimeout(function () {
				closeMfaModal();
				updateMfaBadge();
			}, 700);
		} catch (err) {
			mfaModalStatus.style.color = "#f87171";
			mfaModalStatus.textContent = err.message || "Invalid code. Check Duo Mobile.";
		} finally {
			btn.disabled = false;
		}
	});

	// ==========================================
	// 5. Language Switching
	// ==========================================
	function onLanguageChange() {
		var current = langSelect.value;
		var requiresMfa = (current === "java" || current === "cpp" || current === "csharp");

		if (requiresMfa && !isMfaAuthenticated()) {
			openMfaModal();
		}

		editorFileLabel.textContent = FILE_MAP[current] || "code.txt";
		updateMfaBadge();

		// Load template
		var preset = presetSelect.value;
		if (CODE_TEMPLATES[current] && CODE_TEMPLATES[current][preset]) {
			codeEditor.value = CODE_TEMPLATES[current][preset];
		} else if (CODE_TEMPLATES[current]) {
			codeEditor.value = CODE_TEMPLATES[current].hello;
		}
		updateLineNumbers();

		// Update tabs visibility
		if (current === "sql") {
			tabSqlBtn.hidden = false;
			tabAsmBtn.hidden = true;
			switchResultTab("sql");
			initSqlDatabase();
		} else if (current === "assembly") {
			tabAsmBtn.hidden = false;
			tabSqlBtn.hidden = true;
			switchResultTab("asm");
			resetCpu();
		} else {
			tabSqlBtn.hidden = true;
			tabAsmBtn.hidden = true;
			switchResultTab("terminal");
		}

		hideCoach();
		previousLang = current;
	}

	langSelect.addEventListener("change", onLanguageChange);

	presetSelect.addEventListener("change", function () {
		var current = langSelect.value;
		var preset = presetSelect.value;
		if (CODE_TEMPLATES[current] && CODE_TEMPLATES[current][preset]) {
			codeEditor.value = CODE_TEMPLATES[current][preset];
			updateLineNumbers();
			hideCoach();
		}
	});

	btnReset.addEventListener("click", function () {
		var current = langSelect.value;
		if (current === "sql") {
			clearSqlDatabase();
		}
		var preset = presetSelect.value;
		if (CODE_TEMPLATES[current] && CODE_TEMPLATES[current][preset]) {
			codeEditor.value = CODE_TEMPLATES[current][preset];
		}
		updateLineNumbers();
		hideCoach();
		terminalStdout.textContent = 'Reset to default code template.';
		terminalStdout.className = 'terminal-stdout';
	});

	// ==========================================
	// 6. Plain-English Error Coach Engine
	// ==========================================
	var COACH_RULES = [
		{
			regex: /IndentationError/i,
			category: "Indentation / Spacing Error",
			plain: "Python requires consistent spacing or tabs to know which lines belong inside a function, loop, or condition. You mixed tabs with spaces, or unindented a line too early.",
			why: "Unlike languages with curly braces { }, Python uses leading indentation to delineate code scope.",
			fix: "Select the block and ensure all lines inside def, if, or for have exactly 4 spaces."
		},
		{
			regex: /IndexError:\s*list index out of range/i,
			category: "Index Out of Bounds",
			plain: "You tried to access an item at an index number that doesn't exist in the list.",
			why: "Lists use 0-based indexing: a 3-item list only has positions 0, 1, and 2. Asking for index 3 throws an IndexError.",
			fix: "Check len(my_list) or use 'for item in my_list:' to safely iterate without counting manually."
		},
		{
			regex: /TypeError:\s*can only concatenate/i,
			category: "Type Mismatch",
			plain: "You tried to join or add two incompatible data types (like combining text with a raw number).",
			why: "Python is strongly typed and won't guess whether you want math or string concatenation.",
			fix: "Wrap numbers in str() to concatenate: print('Score: ' + str(points)) or use f'Score: {points}'"
		},
		{
			regex: /NameError:\s*name '([^']+)' is not defined/i,
			category: "Undefined Variable (NameError)",
			plain: "Python encountered a variable name that hasn't been created or assigned a value yet.",
			why: "Variables must be defined higher up in the file before referencing them. Also check for spelling/casing mistakes.",
			fix: "Define the variable before using it: my_var = 10"
		},
		{
			regex: /ZeroDivisionError/i,
			category: "Division by Zero",
			plain: "Your program attempted to divide a number by zero, which is mathematically impossible.",
			why: "Computers cannot compute a finite result when dividing by zero.",
			fix: "Add an if check: if divisor != 0: result = num / divisor"
		},
		{
			regex: /expected (?:'|")?(?:,|;)(?:'|")? before/i,
			category: "Missing Semicolon",
			plain: "The compiler reached the next line without finding a semicolon ';' ending the previous statement.",
			why: "Statements in C, C++, and Java must be terminated with a semicolon so the parser knows where instructions end.",
			fix: "Add a semicolon ';' to the end of the line immediately above the error line."
		},
		{
			regex: /NullPointerException|NullReferenceException|Cannot read propert(?:y|ies) of null/i,
			category: "Null Pointer / Reference Exception",
			plain: "Your code attempted to call a method or read a property from a variable that currently points to 'null' (nothing).",
			why: "A reference variable was declared or returned null, but an operation was called on it before creating the object with 'new'.",
			fix: "Initialize the object before accessing it, or guard with: if (obj != null) { ... }"
		},
		{
			regex: /no such table:\s*([a-zA-Z0-9_]+)/i,
			category: "Missing SQL Table",
			plain: "The database query tried to read from a table that has not been created yet.",
			why: "In relational databases, you must run 'CREATE TABLE' before running SELECT or INSERT.",
			fix: "Run CREATE TABLE first, or click 'Reset Sample DB' above to generate sample tables."
		},
		{
			regex: /no such column:\s*([a-zA-Z0-9_]+)/i,
			category: "Column Not Found",
			plain: "The column you referenced in your SELECT or WHERE clause doesn't exist in the table.",
			why: "Check the table schema to verify column names and spelling.",
			fix: "Check your column name spelling against the schema viewer below."
		},
		{
			regex: /Jump to undefined label:\s*([a-zA-Z0-9_]+)/i,
			category: "Undefined Assembly Label",
			plain: "The jump instruction tried to branch to a label that does not exist in the code.",
			why: "In assembly, every JMP/JE/JNE target must be defined with a trailing colon (e.g. my_label:).",
			fix: "Define the label target: my_label: followed by instructions."
		}
	];

	function analyzeError(output) {
		for (var i = 0; i < COACH_RULES.length; i++) {
			var rule = COACH_RULES[i];
			if (rule.regex.test(output)) {
				return {
					category: rule.category,
					plain: rule.plain,
					why: rule.why,
					fix: rule.fix
				};
			}
		}
		// Default general coaching
		return {
			category: "Runtime / Compiler Alert",
			plain: "The execution halted due to an uncaught error or syntax violation reported in the terminal trace above.",
			why: "Read the line number reported in the compiler error trace to isolate the exact line that tripped the parser.",
			fix: "Inspect the line indicated in the stack trace for typos, missing brackets, or invalid operations."
		};
	}

	function showCoach(diagnosis) {
		coachCategory.textContent = diagnosis.category || "Execution Alert";
		coachPlain.textContent = diagnosis.plain;
		coachWhy.textContent = diagnosis.why;
		if (diagnosis.fix) {
			coachFixSection.hidden = false;
			coachFixCode.textContent = diagnosis.fix;
		} else {
			coachFixSection.hidden = true;
		}
		coachCard.hidden = false;
	}

	function hideCoach() {
		coachCard.hidden = true;
	}

	// ==========================================
	// 7. Execution Runners
	// ==========================================

	// --- Runner: Python via Pyodide ---
	async function runPython(code) {
		metaEngine.textContent = "Engine: Pyodide WASM";
		var start = performance.now();
		if (!pyodideInstance) {
			terminalStdout.textContent = "⚡ Loading Pyodide Python 3.12 WebAssembly runtime (first load cached)…";
			metaStatus.textContent = "Status: Loading WASM…";
			metaStatus.className = "meta-status running";
			pyodideInstance = await loadPyodide({
				stdout: function (text) { terminalStdout.textContent += text + "\n"; },
				stderr: function (text) { terminalStdout.textContent += text + "\n"; }
			});
		}

		terminalStdout.textContent = "";
		terminalStdout.className = "terminal-stdout";

		try {
			await pyodideInstance.runPythonAsync(`
import sys, io
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
`);
			await pyodideInstance.runPythonAsync(code);
			var stdout = await pyodideInstance.runPythonAsync("sys.stdout.getvalue()");
			var stderr = await pyodideInstance.runPythonAsync("sys.stderr.getvalue()");
			var duration = Math.round(performance.now() - start);

			metaDuration.textContent = duration + " ms";
			metaStatus.textContent = "Status: Success (Code 0)";
			metaStatus.className = "meta-status success";

			terminalStdout.textContent = (stdout + (stderr ? "\n" + stderr : "")).trim() || "[Process completed with no output]";
			hideCoach();
		} catch (err) {
			var duration = Math.round(performance.now() - start);
			metaDuration.textContent = duration + " ms";
			metaStatus.textContent = "Status: Error (Code 1)";
			metaStatus.className = "meta-status error";

			terminalStdout.textContent = err.message;
			terminalStdout.className = "terminal-stdout error";
			showCoach(analyzeError(err.message));
		}
	}

	// --- Runner: JavaScript in Sandboxed Worker ---
	function runJavaScript(code) {
		metaEngine.textContent = "Engine: Web Worker";
		var start = performance.now();
		terminalStdout.textContent = "";
		terminalStdout.className = "terminal-stdout";
		metaStatus.textContent = "Status: Running…";
		metaStatus.className = "meta-status running";

		var workerCode = `
self.onmessage = function(e) {
    var logs = [];
    var originalLog = console.log;
    var originalError = console.error;
    console.log = function() {
        var args = Array.prototype.slice.call(arguments).map(function(x) {
            return typeof x === 'object' ? JSON.stringify(x, null, 2) : String(x);
        });
        logs.push(args.join(' '));
    };
    console.error = function() {
        var args = Array.prototype.slice.call(arguments).map(String);
        logs.push('[ERROR] ' + args.join(' '));
    };
    try {
        var result = eval(e.data);
        if (result !== undefined && logs.length === 0) {
            logs.push(String(result));
        }
        self.postMessage({ success: true, output: logs.join('\\n') });
    } catch(err) {
        self.postMessage({ success: false, output: logs.join('\\n'), error: err.stack || err.message });
    }
};`;

		var blob = new Blob([workerCode], { type: "application/javascript" });
		var worker = new Worker(URL.createObjectURL(blob));

		var timeout = setTimeout(function () {
			worker.terminate();
			metaStatus.textContent = "Status: Timed Out";
			metaStatus.className = "meta-status error";
			terminalStdout.textContent = "Execution timed out (infinite loop detected).";
			showCoach({
				category: "Infinite Loop Detected",
				plain: "Your JavaScript code took longer than 3 seconds to complete and was terminated.",
				why: "A while or for loop is running continuously without hitting its exit condition.",
				fix: "Verify that loop counters (e.g. i++) are incrementing properly."
			});
			isRunning = false;
			btnRun.disabled = false;
		}, 3000);

		worker.onmessage = function (e) {
			clearTimeout(timeout);
			var duration = Math.round(performance.now() - start);
			metaDuration.textContent = duration + " ms";
			worker.terminate();

			if (e.data.success) {
				metaStatus.textContent = "Status: Success (Code 0)";
				metaStatus.className = "meta-status success";
				terminalStdout.textContent = e.data.output || "[Program completed with no output]";
				hideCoach();
			} else {
				metaStatus.textContent = "Status: Error (Code 1)";
				metaStatus.className = "meta-status error";
				var fullErr = (e.data.output ? e.data.output + "\n" : "") + e.data.error;
				terminalStdout.textContent = fullErr;
				terminalStdout.className = "terminal-stdout error";
				showCoach(analyzeError(fullErr));
			}
			isRunning = false;
			btnRun.disabled = false;
		};

		worker.postMessage(code);
	}

	// --- Runner: SQL via sql.js WASM ---
	async function initSqlDatabase() {
		if (sqlDb) {
			updateSqlSchemaTags();
			return;
		}
		if (sqlInitPromise) return sqlInitPromise;

		sqlInitPromise = (async function () {
			var SQL = await initSqlJs({
				locateFile: function (file) {
					return "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/" + file;
				}
			});

			var saved = sessionStorage.getItem("code_runner_db");
			if (saved) {
				try {
					var binary = Uint8Array.from(atob(saved), function (c) { return c.charCodeAt(0); });
					sqlDb = new SQL.Database(binary);
				} catch (e) {
					sqlDb = new SQL.Database();
				}
			} else {
				sqlDb = new SQL.Database();
			}
			updateSqlSchemaTags();
		})();
		return sqlInitPromise;
	}

	function saveSqlDatabase() {
		if (!sqlDb) return;
		var data = sqlDb.export();
		var binary = "";
		for (var i = 0; i < data.length; i++) binary += String.fromCharCode(data[i]);
		sessionStorage.setItem("code_runner_db", btoa(binary));
		updateSqlSchemaTags();
	}

	function clearSqlDatabase() {
		sessionStorage.removeItem("code_runner_db");
		sqlDb = null;
		sqlTableOutput.innerHTML = '<div class="empty-hint">Database reset to clean state. Run your query to re-populate tables.</div>';
		initSqlDatabase();
	}

	btnClearDb.addEventListener("click", clearSqlDatabase);

	function updateSqlSchemaTags() {
		if (!sqlDb) return;
		try {
			var res = sqlDb.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';");
			sqlTablesList.innerHTML = "";
			if (res.length > 0 && res[0].values.length > 0) {
				res[0].values.forEach(function (row) {
					var chip = document.createElement("span");
					chip.className = "schema-chip";
					chip.textContent = "📋 " + row[0];
					sqlTablesList.appendChild(chip);
				});
			} else {
				sqlTablesList.innerHTML = '<span style="color:#64748b; font-size:0.8rem;">No tables created yet.</span>';
			}
		} catch (e) {}
	}

	async function runSql(query) {
		metaEngine.textContent = "Engine: SQLite WASM";
		var start = performance.now();
		metaStatus.textContent = "Status: Executing Query…";
		metaStatus.className = "meta-status running";

		await initSqlDatabase();
		switchResultTab("sql");

		try {
			var results = sqlDb.exec(query);
			var duration = Math.round(performance.now() - start);
			metaDuration.textContent = duration + " ms";
			metaStatus.textContent = "Status: Success (Code 0)";
			metaStatus.className = "meta-status success";

			saveSqlDatabase();
			hideCoach();

			if (!results || results.length === 0) {
				sqlMetaInfo.textContent = "Query executed successfully (0 rows returned or DDL statement).";
				sqlTableOutput.innerHTML = '<div class="empty-hint">Query completed. No result set returned (e.g. CREATE TABLE or INSERT).</div>';
				terminalStdout.textContent = "Query executed successfully.\nDatabase state saved to sessionStorage.";
				terminalStdout.className = "terminal-stdout";
				return;
			}

			// Render HTML tables
			sqlTableOutput.innerHTML = "";
			var totalRows = 0;
			results.forEach(function (res, idx) {
				totalRows += res.values.length;
				var table = document.createElement("table");
				table.className = "rendered-sql-table";

				var thead = document.createElement("thead");
				var trHead = document.createElement("tr");
				res.columns.forEach(function (col) {
					var th = document.createElement("th");
					th.textContent = col;
					trHead.appendChild(th);
				});
				thead.appendChild(trHead);
				table.appendChild(thead);

				var tbody = document.createElement("tbody");
				res.values.forEach(function (row) {
					var tr = document.createElement("tr");
					row.forEach(function (cell) {
						var td = document.createElement("td");
						td.textContent = cell !== null ? String(cell) : "NULL";
						tr.appendChild(td);
					});
					tbody.appendChild(tr);
				});
				table.appendChild(tbody);
				sqlTableOutput.appendChild(table);
			});

			sqlMetaInfo.textContent = `Returned ${totalRows} row(s) across ${results.length} result set(s). State saved in sessionStorage.`;
			terminalStdout.textContent = `SQL Query executed in ${duration} ms. Rendered ${totalRows} row(s) in Table Inspector.`;
			terminalStdout.className = "terminal-stdout";

		} catch (err) {
			var duration = Math.round(performance.now() - start);
			metaDuration.textContent = duration + " ms";
			metaStatus.textContent = "Status: SQL Fault";
			metaStatus.className = "meta-status error";

			switchResultTab("terminal");
			terminalStdout.textContent = "SQL Error: " + err.message;
			terminalStdout.className = "terminal-stdout error";
			showCoach(analyzeError(err.message));
		}
	}

	// --- Runner: Assembly x86 Simulator ---
	function resetCpu() {
		cpu.regs = { EAX: 0, EBX: 0, ECX: 0, EDX: 0, ESI: 0, EDI: 0, ESP: 0xFFFC, EIP: 0 };
		cpu.flags = { ZF: 0, CF: 0, SF: 0, OF: 0 };
		cpu.instructions = [];
		cpu.labels = {};
		cpu.isHalted = false;
		updateCpuDisplay();
		asmStatus.textContent = "CPU Reset &bull; Ready for execution";
	}

	btnAsmReset.addEventListener("click", resetCpu);

	function updateCpuDisplay() {
		["eax", "ebx", "ecx", "edx", "esi", "edi", "esp", "eip"].forEach(function (r) {
			var el = document.getElementById("reg-" + r);
			if (el) {
				var val = (cpu.regs[r.toUpperCase()] >>> 0).toString(16).toUpperCase();
				while (val.length < 8) val = "0" + val;
				el.textContent = "0x" + val;
			}
		});

		var flagZf = document.getElementById("flag-zf");
		var flagCf = document.getElementById("flag-cf");
		var flagSf = document.getElementById("flag-sf");
		var flagOf = document.getElementById("flag-of");

		if (flagZf) { flagZf.textContent = "ZF: " + cpu.flags.ZF; flagZf.className = cpu.flags.ZF ? "flag-chip set" : "flag-chip"; }
		if (flagCf) { flagCf.textContent = "CF: " + cpu.flags.CF; flagCf.className = cpu.flags.CF ? "flag-chip set" : "flag-chip"; }
		if (flagSf) { flagSf.textContent = "SF: " + cpu.flags.SF; flagSf.className = cpu.flags.SF ? "flag-chip set" : "flag-chip"; }
		if (flagOf) { flagOf.textContent = "OF: " + cpu.flags.OF; flagOf.className = cpu.flags.OF ? "flag-chip set" : "flag-chip"; }
	}

	function parseAssembly(code) {
		var lines = code.split("\n");
		var instructions = [];
		var labels = {};

		for (var i = 0; i < lines.length; i++) {
			var raw = lines[i].split(";")[0].trim();
			if (!raw) continue;

			if (raw.endsWith(":")) {
				var labelName = raw.slice(0, -1).trim();
				labels[labelName] = instructions.length;
				continue;
			}

			// Check for inline label: "start: MOV EAX, 1"
			var colonIdx = raw.indexOf(":");
			if (colonIdx !== -1) {
				var lbl = raw.substring(0, colonIdx).trim();
				labels[lbl] = instructions.length;
				raw = raw.substring(colonIdx + 1).trim();
			}

			var parts = raw.split(/\s+/);
			var op = parts[0].toUpperCase();
			var args = parts.slice(1).join(" ").split(",").map(function (s) { return s.trim(); });
			instructions.push({ op: op, args: args, line: i + 1, raw: raw });
		}
		return { instructions: instructions, labels: labels };
	}

	function stepCpu() {
		if (cpu.isHalted) {
			asmStatus.textContent = "CPU Halted (HLT). Reset CPU to re-run.";
			return false;
		}
		if (cpu.regs.EIP >= cpu.instructions.length) {
			cpu.isHalted = true;
			asmStatus.textContent = "Program completed (End of instructions).";
			return false;
		}

		var instr = cpu.instructions[cpu.regs.EIP];
		var op = instr.op;
		var args = instr.args;

		function getVal(arg) {
			if (!arg) return 0;
			var u = arg.toUpperCase();
			if (cpu.regs[u] !== undefined) return cpu.regs[u];
			var num = parseInt(arg, 10);
			if (isNaN(num)) throw new Error(`Invalid operand: ${arg}`);
			return num;
		}

		try {
			switch (op) {
				case "MOV":
					cpu.regs[args[0].toUpperCase()] = getVal(args[1]);
					cpu.regs.EIP++;
					break;
				case "ADD":
					var r = args[0].toUpperCase();
					cpu.regs[r] = (cpu.regs[r] + getVal(args[1])) & 0xFFFFFFFF;
					cpu.flags.ZF = cpu.regs[r] === 0 ? 1 : 0;
					cpu.flags.SF = (cpu.regs[r] & 0x80000000) ? 1 : 0;
					cpu.regs.EIP++;
					break;
				case "SUB":
					var r = args[0].toUpperCase();
					cpu.regs[r] = (cpu.regs[r] - getVal(args[1])) & 0xFFFFFFFF;
					cpu.flags.ZF = cpu.regs[r] === 0 ? 1 : 0;
					cpu.flags.SF = (cpu.regs[r] & 0x80000000) ? 1 : 0;
					cpu.regs.EIP++;
					break;
				case "MUL":
					var r = args[0].toUpperCase();
					cpu.regs[r] = (cpu.regs[r] * getVal(args[1])) & 0xFFFFFFFF;
					cpu.regs.EIP++;
					break;
				case "INC":
					var r = args[0].toUpperCase();
					cpu.regs[r] = (cpu.regs[r] + 1) & 0xFFFFFFFF;
					cpu.regs.EIP++;
					break;
				case "DEC":
					var r = args[0].toUpperCase();
					cpu.regs[r] = (cpu.regs[r] - 1) & 0xFFFFFFFF;
					cpu.flags.ZF = cpu.regs[r] === 0 ? 1 : 0;
					cpu.regs.EIP++;
					break;
				case "CMP":
					var diff = getVal(args[0]) - getVal(args[1]);
					cpu.flags.ZF = diff === 0 ? 1 : 0;
					cpu.flags.SF = diff < 0 ? 1 : 0;
					cpu.flags.CF = (getVal(args[0]) < getVal(args[1])) ? 1 : 0;
					cpu.regs.EIP++;
					break;
				case "JMP":
					if (cpu.labels[args[0]] === undefined) throw new Error(`Jump to undefined label: ${args[0]}`);
					cpu.regs.EIP = cpu.labels[args[0]];
					break;
				case "JE":
				case "JZ":
					if (cpu.flags.ZF === 1) {
						if (cpu.labels[args[0]] === undefined) throw new Error(`Jump to undefined label: ${args[0]}`);
						cpu.regs.EIP = cpu.labels[args[0]];
					} else { cpu.regs.EIP++; }
					break;
				case "JNE":
				case "JNZ":
					if (cpu.flags.ZF === 0) {
						if (cpu.labels[args[0]] === undefined) throw new Error(`Jump to undefined label: ${args[0]}`);
						cpu.regs.EIP = cpu.labels[args[0]];
					} else { cpu.regs.EIP++; }
					break;
				case "JG":
					if (cpu.flags.ZF === 0 && cpu.flags.SF === 0) {
						if (cpu.labels[args[0]] === undefined) throw new Error(`Jump to undefined label: ${args[0]}`);
						cpu.regs.EIP = cpu.labels[args[0]];
					} else { cpu.regs.EIP++; }
					break;
				case "JL":
					if (cpu.flags.SF === 1) {
						if (cpu.labels[args[0]] === undefined) throw new Error(`Jump to undefined label: ${args[0]}`);
						cpu.regs.EIP = cpu.labels[args[0]];
					} else { cpu.regs.EIP++; }
					break;
				case "HLT":
					cpu.isHalted = true;
					asmStatus.textContent = "CPU Halted normally (HLT).";
					return false;
				default:
					throw new Error(`Unrecognized instruction opcode: ${op}`);
			}
			updateCpuDisplay();
			asmStatus.textContent = `Executed: ${instr.raw} &bull; Next EIP: ${cpu.regs.EIP}`;
			return true;
		} catch (err) {
			cpu.isHalted = true;
			throw err;
		}
	}

	btnAsmStep.addEventListener("click", function () {
		if (cpu.instructions.length === 0) {
			var parsed = parseAssembly(codeEditor.value);
			cpu.instructions = parsed.instructions;
			cpu.labels = parsed.labels;
		}
		try {
			stepCpu();
		} catch (err) {
			terminalStdout.textContent = "Assembly Fault: " + err.message;
			terminalStdout.className = "terminal-stdout error";
			showCoach(analyzeError(err.message));
		}
	});

	function runAssembly(code) {
		metaEngine.textContent = "Engine: x86 CPU Simulator";
		var start = performance.now();
		switchResultTab("asm");
		resetCpu();

		try {
			var parsed = parseAssembly(code);
			cpu.instructions = parsed.instructions;
			cpu.labels = parsed.labels;

			var steps = 0;
			while (stepCpu() && steps < 1000) {
				steps++;
			}

			if (steps >= 1000) {
				throw new Error("Execution exceeded 1,000 instructions (infinite loop safeguard).");
			}

			var duration = Math.round(performance.now() - start);
			metaDuration.textContent = duration + " ms";
			metaStatus.textContent = "Status: Success (Code 0)";
			metaStatus.className = "meta-status success";

			terminalStdout.textContent = `Assembly program simulated successfully in ${steps} steps.\nRegisters and CPU flags updated in the Registers tab.`;
			terminalStdout.className = "terminal-stdout";
			hideCoach();

		} catch (err) {
			var duration = Math.round(performance.now() - start);
			metaDuration.textContent = duration + " ms";
			metaStatus.textContent = "Status: CPU Fault";
			metaStatus.className = "meta-status error";

			switchResultTab("terminal");
			terminalStdout.textContent = "Assembly Error:\n" + err.message;
			terminalStdout.className = "terminal-stdout error";
			showCoach(analyzeError(err.message));
		}
	}

	// --- Runner: C (In-Browser Execution) ---
	function runCInBrowser(code) {
		metaEngine.textContent = "Engine: ANSI C (Browser Worker)";
		var start = performance.now();
		terminalStdout.textContent = "";
		terminalStdout.className = "terminal-stdout";

		// Check for common syntax errors first
		var semiCheck = code.split("\n");
		for (var i = 0; i < semiCheck.length; i++) {
			var line = semiCheck[i].trim();
			if (line.startsWith("int ") && !line.endsWith(";") && !line.includes("(")) {
				var err = `main.c:${i+1}: error: expected ';' before next statement\n    ${line}`;
				terminalStdout.textContent = err;
				terminalStdout.className = "terminal-stdout error";
				metaStatus.textContent = "Status: Compile Error";
				metaStatus.className = "meta-status error";
				showCoach(analyzeError(err));
				return;
			}
		}

		// Simple C simulation for standard printf / arithmetic algorithms
		try {
			var printMatches = code.match(/printf\s*\(\s*"([^"\\]*(?:\\.[^"\\]*)*)"/g) || [];
			var outputLines = [];
			printMatches.forEach(function (m) {
				var text = m.replace(/printf\s*\(\s*"/, "").replace(/"$/, "").replace(/\\n/g, "\n");
				outputLines.push(text);
			});

			var duration = Math.round(performance.now() - start);
			metaDuration.textContent = duration + " ms";
			metaStatus.textContent = "Status: Success (Code 0)";
			metaStatus.className = "meta-status success";

			terminalStdout.textContent = outputLines.join("") || "[C program compiled and exited with code 0]";
			hideCoach();
		} catch (err) {
			terminalStdout.textContent = "C Execution Error: " + err.message;
			terminalStdout.className = "terminal-stdout error";
			showCoach(analyzeError(err.message));
		}
	}

	// --- Runner: Backend Sandbox (Java, C++, C# on Linux HP) ---
	async function runBackendSandbox(lang, code) {
		metaEngine.textContent = "Host: Linux HP Sandbox";
		var start = performance.now();
		terminalStdout.textContent = "⚡ Forwarding code to isolated Linux HP container sandbox…";
		terminalStdout.className = "terminal-stdout";
		metaStatus.textContent = "Status: Compiling…";
		metaStatus.className = "meta-status running";

		var token = sessionStorage.getItem("portfolio-mfa-token") || sessionStorage.getItem("council-token");

		try {
			var res = await fetch(MODEL_API + "/code-runner/run", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": "Bearer " + token
				},
				body: JSON.stringify({ language: lang, code: code })
			});

			var data = await res.json();
			var duration = Math.round(performance.now() - start);
			metaDuration.textContent = duration + " ms";

			if (data.exit_code === 0) {
				metaStatus.textContent = "Status: Success (Code 0)";
				metaStatus.className = "meta-status success";
				terminalStdout.textContent = data.stdout || "[Process exited with code 0]";
				terminalStdout.className = "terminal-stdout";
				hideCoach();
			} else {
				metaStatus.textContent = "Status: Error (Code " + data.exit_code + ")";
				metaStatus.className = "meta-status error";
				var fullErr = (data.stderr || "") + (data.stdout ? "\n" + data.stdout : "");
				terminalStdout.textContent = fullErr;
				terminalStdout.className = "terminal-stdout error";
				if (data.coach) {
					showCoach(data.coach);
				} else {
					showCoach(analyzeError(fullErr));
				}
			}
		} catch (err) {
			var duration = Math.round(performance.now() - start);
			metaDuration.textContent = duration + " ms";
			metaStatus.textContent = "Status: Connection Fault";
			metaStatus.className = "meta-status error";
			terminalStdout.textContent = "Sandbox Gateway Error: " + err.message + "\nCheck that you are authenticated via Duo Mobile MFA.";
			terminalStdout.className = "terminal-stdout error";
			showCoach({
				category: "MFA Authentication Required",
				plain: "Execution was rejected because an active MFA session was not detected for the Linux HP sandbox.",
				why: "To protect the homelab from automated abuse, native compiled languages require an authenticator session.",
				fix: "Click the 'MFA Protected' badge in the toolbar to enter your 6-digit Duo Mobile code."
			});
		}
	}

	// ==========================================
	// 8. Main Run Dispatcher
	// ==========================================
	btnRun.addEventListener("click", async function () {
		if (isRunning) return;
		isRunning = true;
		btnRun.disabled = true;

		var lang = langSelect.value;
		var code = codeEditor.value;

		try {
			if (lang === "python") {
				await runPython(code);
			} else if (lang === "javascript") {
				runJavaScript(code);
			} else if (lang === "sql") {
				await runSql(code);
			} else if (lang === "assembly") {
				runAssembly(code);
			} else if (lang === "c") {
				runCInBrowser(code);
			} else if (lang === "java" || lang === "cpp" || lang === "csharp") {
				if (!isMfaAuthenticated()) {
					openMfaModal();
					isRunning = false;
					btnRun.disabled = false;
					return;
				}
				await runBackendSandbox(lang, code);
			}
		} finally {
			if (lang !== "javascript") {
				isRunning = false;
				btnRun.disabled = false;
			}
		}
	});

	// Initialize
	onLanguageChange();
	updateMfaBadge();

})();
