// Shared portfolio interactions

(function () {
	"use strict";

	var apiUrl = "https://nucwol2-0--hdd.taile72a68.ts.net/website-chat";
	var statusUrl = "https://nucwol2-0--hdd.taile72a68.ts.net/website-chat/stats";
	var waiting = false;

	function createResponsiveNavigation() {
		var nav = document.querySelector("nav.tablet-desktop");
		if (!nav) return;
		var menu = nav.querySelector("ul");
		if (!menu) return;
		menu.id = "site-navigation";

		var button = document.createElement("button");
		button.className = "nav-toggle";
		button.type = "button";
		button.setAttribute("aria-expanded", "false");
		button.setAttribute("aria-controls", menu.id);
		button.innerHTML = '<span class="nav-toggle-icon" aria-hidden="true"><i></i><i></i><i></i></span><span>Menu</span>';
		nav.insertBefore(button, menu);

		function setOpen(open) {
			nav.classList.toggle("nav-open", open);
			button.setAttribute("aria-expanded", String(open));
		}

		button.addEventListener("click", function () {
			setOpen(!nav.classList.contains("nav-open"));
		});
		menu.addEventListener("click", function (event) {
			if (event.target.closest("a")) setOpen(false);
		});
		document.addEventListener("click", function (event) {
			if (!nav.contains(event.target)) setOpen(false);
		});
		document.addEventListener("keydown", function (event) {
			if (event.key === "Escape" && nav.classList.contains("nav-open")) {
				setOpen(false);
				button.focus();
			}
		});
		window.addEventListener("resize", function () {
			if (window.innerWidth > 1024) setOpen(false);
		});
	}

	function createContactTools() {
		var copyButton = document.querySelector("[data-copy-email]");
		if (!copyButton) return;
		copyButton.addEventListener("click", async function () {
			var original = copyButton.textContent;
			var email = copyButton.getAttribute("data-copy-email");
			try {
				if (navigator.clipboard && window.isSecureContext) {
					await navigator.clipboard.writeText(email);
				} else {
					var temporary = document.createElement("textarea");
					temporary.value = email;
					temporary.setAttribute("readonly", "");
					temporary.style.position = "fixed";
					temporary.style.opacity = "0";
					document.body.appendChild(temporary);
					temporary.select();
					if (!document.execCommand("copy")) throw new Error("Copy failed");
					document.body.removeChild(temporary);
				}
				copyButton.textContent = "Copied";
			} catch (error) {
				window.prompt("Copy this email address:", email);
				copyButton.textContent = "Select and copy";
			}
			window.setTimeout(function () {
				copyButton.textContent = original;
			}, 1800);
		});
	}

	var STORAGE_KEY = "nemo_chat_history";
	var STORAGE_OPEN_KEY = "nemo_chat_open";
	var STORAGE_PENDING_KEY = "nemo_chat_pending";
	var DEFAULT_WELCOME = "Hi! I'm Nemo, Andrew's local AI. Ask me about Andrew's experience, skills, or this local-AI project.";

	function createChat() {
		var wrapper = document.createElement("aside");
		wrapper.className = "portfolio-chat";
		wrapper.hidden = true;
		wrapper.innerHTML = [
			'<button class="portfolio-chat-toggle" type="button" aria-expanded="false" aria-controls="portfolio-chat-panel">Ask Nemo (Local AI)</button>',
			'<section id="portfolio-chat-panel" class="portfolio-chat-panel" aria-label="Portfolio AI assistant" hidden>',
			'  <header class="portfolio-chat-header">',
			'    <div><strong>Nemo · Andrew\'s Local AI</strong><span>NVIDIA Nemotron 3 Nano 4B · privately hosted</span></div>',
			'    <div class="portfolio-chat-controls">',
			'      <button class="portfolio-chat-clear" type="button" aria-label="Clear chat" title="Clear chat history">Clear</button>',
			'      <button class="portfolio-chat-close" type="button" aria-label="Close chat">&times;</button>',
			'    </div>',
			'  </header>',
			'  <div class="portfolio-chat-messages" role="log" aria-live="polite"></div>',
			'  <form class="portfolio-chat-form">',
			'    <label class="sr-only" for="portfolio-chat-input">Message</label>',
			'    <textarea id="portfolio-chat-input" rows="1" maxlength="1000" autocomplete="off" placeholder="Ask about Andrew..." aria-describedby="portfolio-chat-help" required></textarea>',
			'    <button type="submit">Send</button>',
			'  </form>',
			'  <p id="portfolio-chat-help" class="portfolio-chat-note">Enter to send · Shift+Enter for a new line.<br>Portfolio questions only. 5 messages/minute per IP.<br>Prompts are logged privately for abuse review; avoid sharing sensitive information.</p>',
			'</section>'
		].join("");
		document.body.appendChild(wrapper);

		var toggle = wrapper.querySelector(".portfolio-chat-toggle");
		var panel = wrapper.querySelector(".portfolio-chat-panel");
		var close = wrapper.querySelector(".portfolio-chat-close");
		var clear = wrapper.querySelector(".portfolio-chat-clear");
		var form = wrapper.querySelector(".portfolio-chat-form");
		var input = wrapper.querySelector("#portfolio-chat-input");
		var messages = wrapper.querySelector(".portfolio-chat-messages");
		var initialCheckDone = false;

		function getSavedHistory() {
			try {
				var raw = localStorage.getItem(STORAGE_KEY);
				if (raw) {
					var parsed = JSON.parse(raw);
					if (Array.isArray(parsed) && parsed.length > 0) return parsed;
				}
			} catch (e) {}
			return null;
		}

		function saveHistory(list) {
			try {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
			} catch (e) {}
		}

		function recordMessage(text, role, isError) {
			var hist = getSavedHistory() || [{ role: "assistant", text: DEFAULT_WELCOME }];
			hist.push({ role: role, text: text, error: Boolean(isError) });
			saveHistory(hist);
		}

		function setOpen(open, shouldFocus) {
			panel.hidden = !open;
			toggle.hidden = open;
			toggle.setAttribute("aria-expanded", String(open));
			try {
				localStorage.setItem(STORAGE_OPEN_KEY, String(open));
			} catch (e) {}
			if (open) {
				messages.scrollTop = messages.scrollHeight;
				if (shouldFocus) {
					try {
						input.focus({ preventScroll: true });
					} catch (error) {
						input.focus();
					}
				}
			}
		}

		async function checkAvailability() {
			try {
				var response = await fetch(statusUrl, { cache: "no-store" });
				var data = await response.json();
				var available = response.ok && data.status === "online";
				wrapper.hidden = !available;
				if (!available) {
					panel.hidden = true;
					toggle.hidden = true;
				} else if (!initialCheckDone) {
					var wasOpen = false;
					try {
						wasOpen = localStorage.getItem(STORAGE_OPEN_KEY) === "true";
					} catch (e) {}
					if (wasOpen) setOpen(true, false);
				}
			} catch (error) {
				wrapper.hidden = true;
				panel.hidden = true;
				toggle.hidden = true;
			} finally {
				initialCheckDone = true;
			}
		}

		function replyParagraphs(text) {
			return String(text).replace(/\r\n?/g, "\n").trim().split(/\n\s*\n/).flatMap(function (block) {
				if (block.includes("\n") || block.length < 240 || !window.Intl || !Intl.Segmenter) return [block];
				var segments = Array.from(new Intl.Segmenter("en", { granularity: "sentence" }).segment(block), function (part) { return part.segment; });
				var paragraphs = [], group = "", count = 0;
				segments.forEach(function (sentence) {
					group += sentence;
					count++;
					if (count >= 2 || group.length >= 280) {
						paragraphs.push(group.trim()); group = ""; count = 0;
					}
				});
				if (group.trim()) paragraphs.push(group.trim());
				return paragraphs;
			});
		}

		function renderMessage(message, text, role, isPending) {
			message.replaceChildren();
			var sender = document.createElement("div");
			sender.className = "chat-sender";
			sender.textContent = role === "user" ? "You" : "Nemo";
			message.appendChild(sender);

			var content = document.createElement("div");
			content.className = "chat-content";

			if (isPending) {
				var thinking = document.createElement("div");
				thinking.className = "chat-thinking";
				thinking.innerHTML = '<span class="chat-thinking-label">Nemo is thinking</span><span class="chat-dots" aria-hidden="true"><span class="chat-dot"></span><span class="chat-dot"></span><span class="chat-dot"></span></span>';
				content.appendChild(thinking);
			} else if (role !== "assistant") {
				content.textContent = text;
			} else {
				replyParagraphs(text).forEach(function (paragraph) {
					var part = document.createElement("p");
					part.className = "chat-paragraph";
					part.textContent = paragraph;
					content.appendChild(part);
				});
			}
			message.appendChild(content);
		}

		function addMessage(text, role, isPending) {
			var message = document.createElement("div");
			message.className = "chat-message chat-" + role;
			renderMessage(message, text, role, isPending);
			messages.appendChild(message);
			messages.scrollTop = messages.scrollHeight;
			return message;
		}

		function renderHistory() {
			messages.replaceChildren();
			var hist = getSavedHistory();
			if (!hist || hist.length === 0) {
				addMessage(DEFAULT_WELCOME, "assistant", false);
			} else {
				hist.forEach(function (item) {
					var m = addMessage(item.text, item.role, false);
					if (item.error) m.classList.add("chat-error");
				});
			}
			messages.scrollTop = messages.scrollHeight;
		}

		function resizeInput() {
			input.style.height = "auto";
			var newHeight = Math.min(input.scrollHeight, 140);
			input.style.height = newHeight + "px";
			input.style.overflowY = input.scrollHeight > 140 ? "auto" : "hidden";
		}
		input.addEventListener("input", resizeInput);
		input.addEventListener("keydown", function (event) {
			if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
				event.preventDefault();
				form.requestSubmit();
			}
		});

		toggle.addEventListener("click", function () {
			setOpen(panel.hidden, true);
		});
		close.addEventListener("click", function () {
			setOpen(false, false);
			toggle.focus();
		});
		clear.addEventListener("click", function () {
			try {
				localStorage.removeItem(STORAGE_KEY);
			} catch (e) {}
			renderHistory();
			input.focus();
		});

		async function processPrompt(text, existingPendingEl) {
			waiting = true;
			form.querySelector("button").disabled = true;
			var pending = existingPendingEl || addMessage("", "assistant", true);

			try {
				var response = await fetch(apiUrl, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ message: text })
				});
				var data = await response.json();
				if (!response.ok) throw new Error(data.error || "The assistant is unavailable.");
				renderMessage(pending, data.reply, "assistant", false);
				recordMessage(data.reply, "assistant", false);
				try { localStorage.removeItem(STORAGE_PENDING_KEY); } catch (e) {}
			} catch (error) {
				var errMsg = error.message || "The local assistant is temporarily offline.";
				renderMessage(pending, errMsg, "assistant", false);
				pending.classList.add("chat-error");
				recordMessage(errMsg, "assistant", true);
				try { localStorage.removeItem(STORAGE_PENDING_KEY); } catch (e) {}
			} finally {
				waiting = false;
				form.querySelector("button").disabled = false;
				input.focus();
				messages.scrollTop = messages.scrollHeight;
			}
		}

		form.addEventListener("submit", async function (event) {
			event.preventDefault();
			if (waiting) return;
			var text = input.value.trim();
			if (!text) return;

			addMessage(text, "user");
			recordMessage(text, "user", false);
			input.value = "";
			resizeInput();
			try {
				localStorage.setItem(STORAGE_PENDING_KEY, JSON.stringify({ prompt: text, at: Date.now() }));
			} catch (e) {}
			await processPrompt(text);
		});

		function checkPendingPrompt() {
			try {
				var raw = localStorage.getItem(STORAGE_PENDING_KEY);
				if (!raw) return;
				var item = JSON.parse(raw);
				if (item && item.prompt && (Date.now() - item.at < 90000)) {
					setOpen(true, false);
					var hist = getSavedHistory() || [];
					var last = hist[hist.length - 1];
					if (!last || last.role !== "assistant") {
						var pending = addMessage("", "assistant", true);
						processPrompt(item.prompt, pending);
					} else {
						localStorage.removeItem(STORAGE_PENDING_KEY);
					}
				} else {
					localStorage.removeItem(STORAGE_PENDING_KEY);
				}
			} catch (e) {}
		}

		renderHistory();
		checkPendingPrompt();
		checkAvailability();
		window.setInterval(checkAvailability, 30000);
	}

	function initHomeTelemetry() {
		var tokenEl = document.getElementById("stat-tokens");
		var promptEl = document.getElementById("stat-prompts");
		var trafficEl = document.getElementById("stat-traffic");
		var boincEl = document.getElementById("stat-boinc");
		var chatBtn = document.getElementById("telemetry-open-chat");
		if (!tokenEl && !promptEl && !trafficEl && !boincEl && !chatBtn) return;

		if (chatBtn) {
			chatBtn.addEventListener("click", function (e) {
				e.preventDefault();
				var toggle = document.querySelector(".portfolio-chat-toggle");
				if (toggle && !toggle.hidden) {
					toggle.click();
				} else {
					window.location.href = "council.html";
				}
			});
		}

		async function refreshStats() {
			try {
				var res = await fetch(statusUrl, { cache: "no-store" });
				if (res.ok) {
					var data = await res.json();
					if (data.chat) {
						if (promptEl && typeof data.chat.requests === "number") {
							promptEl.textContent = (118 + data.chat.requests).toLocaleString();
						}
						if (tokenEl && typeof data.chat.last_tokens_per_second === "number") {
							var sub = document.getElementById("stat-tokens-sub");
							if (sub) sub.textContent = data.chat.last_tokens_per_second + " tok/s · Local GPU";
						}
					}
				}
			} catch (e) {}

			try {
				var nucRes = await fetch("https://nucwol2-0--hdd.taile72a68.ts.net/website-chat/nuc-stats", { cache: "no-store" });
				if (nucRes.ok) {
					var nucData = await nucRes.json();
					if (nucData.nuc && trafficEl && typeof nucData.nuc.uptime_seconds === "number") {
						var days = Math.floor(nucData.nuc.uptime_seconds / 86400);
						var subTraffic = document.getElementById("stat-traffic-sub");
						if (subTraffic) subTraffic.textContent = days + "d uptime · Alpine edge relay";
					}
				}
			} catch (e) {}
		}

		refreshStats();
		window.setInterval(refreshStats, 30000);
	}

	var TECH_ANALOGIES = {
		"photo-profile": {"title": "Automatic photo settings", "analogy": "Like a camera preset matched to the film you loaded: turning every dial up can make the picture look worse.", "techFact": "This installed Realistic Vision Hyper model is designed for low guidance and few sampling steps. The fixed profile uses CFG 2, six steps, DPM++ 2M SDE, and Karras scheduling."},
		"live-network-speed": {"title": "Live upload and download speed", "analogy": "A speedometer for the traffic flowing right now, rather than a test of how fast the road could go.", "techFact": "Mbps means megabits per second: eight megabits equal one megabyte. This monitor measures current traffic on the default internet interface. Idle readings can be near zero even on a fast connection."},
		"memory-temperature": {"title": "Memory-proximity temperature", "analogy": "A thermometer near the memory chips, giving a useful nearby reading rather than pretending every RAM module has its own probe.", "techFact": "This machine exposes the Apple SMC TM0P memory-proximity sensor. The panel converts its Celsius reading to Fahrenheit."},
		"ram-swap-usage": {"title": "Combined RAM and swap usage", "analogy": "The space used on your desk plus the overflow drawer underneath it.", "techFact": "The panel combines physical memory and swap capacity, subtracting available RAM and free swap to estimate the total actively occupied space."},
		"browser-crash": {"title": "Browser startup crash", "analogy": "The browser trips while opening its front door, before it can show a usable window.", "techFact": "SIGSEGV is a segmentation fault: the process accessed memory it was not allowed to use. Repeated startup faults can come from a software regression or an incompatible graphics/system library."},
		"fixed-resolution": {"title": "Fixed image resolution", "analogy": "Using one reliable wallpaper template every time instead of re-measuring the canvas before each painting.", "techFact": "1920×1080 is a 16:9 Full HD output. Locking the dimensions removes a repeated choice from the generator interface and backend."},
		"browser-session": {"title": "Keeping the browser independent", "analogy": "Putting the browser on its own power switch, so turning off the image generator does not switch off the browser too.", "techFact": "The launcher starts the browser with setsid in a separate process session. Ctrl+C reaches the terminal process group and stops the model server without signaling the detached browser."},
		"homebrew": {"title": "Homebrew on Linux", "analogy": "Another app shelf with its own update button, alongside the apps managed by Debian.", "techFact": "Homebrew is a package manager. This Linux installation belongs to the brew account and is updated separately from Debian packages."},
		"usb-persistence": {"title": "Saving Slax changes to USB", "analogy": "Saving the document and waiting for the USB activity to finish before walking away.", "techFact": "Slax stores these changes in its USB-backed persistent filesystem. Flushing asks the operating system to write pending data to storage; it does not replace a reboot verification."},
		"gigabit-ethernet": {
			title: "Gigabit Ethernet (1 Gbps)",
			analogy: "A dedicated multi-lane private highway directly connecting two buildings with a 1,000 mph speed limit. Unlike Wi-Fi (which acts like shouting across a noisy, crowded cafeteria), Ethernet is a physical cord completely immune to walls, weather, or radio interference.",
			techFact: "A physical wired standard delivering up to 1,000 Megabits (~125 MB) per second with continuous sub-millisecond local latency."
		},
		"tailscale": {
			title: "Tailscale Mesh VPN",
			analogy: "An encrypted walkie-talkie channel that lets all your personal devices talk directly to each other from anywhere in the world as if they were sitting in the same living room—without needing to leave your front door unlocked or open holes in your home router.",
			techFact: "A zero-config peer-to-peer overlay network built on WireGuard that securely links devices across NATs and firewalls."
		},
		"wake-on-lan": {
			title: "Wake-on-LAN (WoL)",
			analogy: "Tossing a small pebble at your friend's bedroom window at night to wake them up only when you need them, saving electricity instead of keeping them standing outside with the lights on 24/7.",
			techFact: "A network broadcast packet containing a 'magic packet' (target MAC address) that prompts a sleeping motherboard to power up remotely."
		},
		"unmanaged-switch": {
			title: "Unmanaged Network Switch",
			analogy: "A heavy-duty power strip, but for internet cables instead of power plugs. You plug one internet cord into the wall, and suddenly you have 5 or 8 fast wired jacks to plug servers and PCs into—with zero setup or menus needed.",
			techFact: "A plug-and-play Layer-2 hardware device that inspects MAC addresses to direct network frames between local ports at full wire speed."
		},
		"subnet-router": {
			title: "Subnet Router",
			analogy: "A designated concierge standing at the entrance of a private apartment building. Once you call the concierge on your secure phone line, they can walk over and deliver messages to any apartment down the hallway that doesn't have an outside mailbox.",
			techFact: "A designated gateway device on a VPN that exposes an entire physical local subnet (like 192.168.0.0/24) to remote nodes without installing VPN clients on each peripheral."
		},
		"boinc": {
			title: "BOINC Distributed Science",
			analogy: "A 10-million-piece puzzle. Instead of one scientist sitting in a lab trying to assemble it alone over 50 years, thousands of volunteers worldwide each solve 5 puzzle pieces in the background while their computers are sitting idle.",
			techFact: "An open-source grid computing framework that harnesses idle CPU and GPU compute cycles from volunteer computers globally to analyze scientific datasets (like pulsar gamma rays)."
		},
		"geysermc": {
			title: "GeyserMC Protocol Bridge",
			analogy: "An instantaneous real-time translator sitting between a Spanish speaker (Bedrock edition on phones and tablets) and an English speaker (Java edition on PCs), letting them play together in the same world as if they spoke the same language.",
			techFact: "A proxy bridge translating Minecraft Bedrock UDP packets (RakNet gaming protocol) into Minecraft Java TCP packets on the fly."
		},
		"stft": {
			title: "Short-Time Fourier Transform (STFT)",
			analogy: "A high-speed digital camera that takes rapid snapshots of a complex song 60 times a second and instantly writes out the exact musical notes being played—separating the heavy kick bass, melodic piano chords, and vocal highs.",
			techFact: "A digital signal processing algorithm that breaks continuous audio signals into overlapping time windows to calculate frequency spectrums over time."
		},
		"ram-disk": {
			title: "RAM Disk",
			analogy: "Laying all your active project folders out across a massive, spotless desk instead of walking to the filing cabinet in the basement every time you need to read a page. It is blindingly fast, but anything not put away is wiped clean when you go home.",
			techFact: "A virtual storage volume mounted in high-speed system RAM, delivering read/write throughput exceeding 5,000 MB/s, but volatile upon system reboot."
		},
		"reverse-proxy": {
			title: "Reverse Proxy Gateway",
			analogy: "A security receptionist in the lobby of a high-rise. Visitors tell the receptionist what they need, the receptionist walks to the back office, gets the answer from the staff, and hands it back—keeping the private offices safe and locked.",
			techFact: "An intermediary server that receives external requests, terminates SSL, enforces security policies, and routes traffic to backend applications."
		},
		"cat6": {
			title: "Cat6 Ethernet Cabling",
			analogy: "A thick, well-insulated copper pipe with internal plastic dividers that prevent wires from talking over each other (crosstalk), allowing clean high-speed traffic even when running right alongside electrical cords.",
			techFact: "Twisted-pair cabling rated up to 250 MHz frequency and 10 Gbps speeds with tighter twists and physical spline separation to minimize electromagnetic crosstalk."
		},
		"cat5e": {
			title: "Cat5e Ethernet Cabling",
			analogy: "A reliable two-lane paved road that comfortably handles 60 mph traffic for everyday driving over reasonable distances, perfect for standard peripherals and accessories.",
			techFact: "Enhanced Category 5 twisted-pair cable rated up to 100 MHz, reliably delivering 1 Gbps Ethernet up to 100 meters."
		},
		"nemotron": {
			title: "Local AI Language Model (Nemotron)",
			analogy: "Having an expert technical assistant living locally in your own office who knows your entire resume by heart and answers immediately—without ever having to call an expensive outsourced call center that logs and records your conversations.",
			techFact: "A 4-billion parameter language model running on local hardware (NVIDIA RTX GPU) using quantized neural network weights to perform private inference on-premise."
		},
		"quantization": {
			title: "Model Quantization (4-Bit)",
			analogy: "Converting an uncompressed, massive 100 GB movie file into a crisp, high-definition compressed file. It takes up 75% less storage on your hard drive, yet looks virtually identical to the human eye.",
			techFact: "Reducing the mathematical precision of neural network weights from 16-bit floating point down to 4-bit integers, drastically lowering RAM usage while preserving reasoning capability."
		},
		"openrc": {
			title: "OpenRC Service Manager",
			analogy: "The pre-flight checklist and flight control system on an airplane. The moment you turn the key, it boots up all engines and sensors in the exact correct sequence, and immediately restarts any system that ever hiccups.",
			techFact: "A lightweight, dependency-based init system used by Linux distributions like Alpine to manage background daemons, boot services, and runlevels."
		},
		"musl": {
			title: "Musl libc vs Glibc",
			analogy: "A minimalist hiking multitool that has only the essential screwdrivers and blades you actually need, weighing 2 ounces, compared to a giant 50-pound mechanic's toolbox with every specialty socket ever made.",
			techFact: "A compact, clean C standard library standard in Alpine Linux, prioritizing simplicity, lightweight memory usage, and security over legacy binary bloat."
		},
		"jailbreak": {
			title: "Jailbreaking (iOS / Devices)",
			analogy: "Getting the master key to your own house after the previous owner told you that you were only allowed to enter the living room and were forbidden from painting the walls.",
			techFact: "Exploiting security flaws in a closed operating system kernel to disable mandatory code signing and sandbox restrictions, granting root administrative access."
		},
		"plc-hmi": {
			title: "Industrial Automation (PLC & HMI)",
			analogy: "An automated car's engine computer and steering wheel. The PLC is the rugged computer under the hood making split-second decisions (like firing fuel injectors), while the HMI is the touchscreen dashboard allowing the human driver to tap buttons and see speed.",
			techFact: "Programmable Logic Controllers (hard real-time industrial microcomputers) coupled with Human-Machine Interfaces (operator touchscreens and SCADA visual controls)."
		},
		"vnc": {
			title: "Virtual Network Computing (VNC)",
			analogy: "A secure, private live video feed of your home TV screen paired with an invisible wireless mouse that lets you control your living room computer while sitting at a diner three towns over.",
			techFact: "A graphical desktop-sharing system based on the Remote Framebuffer (RFB) protocol to transmit display updates, keyboard strokes, and mouse clicks across a network."
		},
		"docker": {
			title: "Docker Containerization",
			analogy: "Standardized steel shipping containers. Everything an application needs to run (code, libraries, configuration) is sealed inside the container, so it can be dropped onto any computer in the world and run exactly the same.",
			techFact: "OS-level virtualization using Linux cgroups and namespaces to isolate processes and their dependencies into immutable software images."
		},
		"socat": {
			title: "Socat Bidirectional Relay",
			analogy: "A heavy-duty brass pipe fitting connecting two water hoses together across a fence, allowing water to flow freely back and forth between two properties without anyone having to rebuild the plumbing.",
			techFact: "A versatile command-line utility that creates two bidirectional byte streams and transfers data between sockets, ports, or files."
		},
		"playit": {
			title: "Playit.gg Zero-Config Tunnel",
			analogy: "A secure private shipping tunnel under the mountain that delivers your game packets directly to your friends anywhere on Earth, without you having to knock holes through your home's security fence.",
			techFact: "A global tunnel agent establishing outbound encrypted connections to anycast edge proxies, forwarding public game traffic to internal LAN IP addresses without router port-forwarding."
		},
		"uefi-db": {
			title: "UEFI Signature Database Update",
			analogy: "Like updating the security guard's badge scanner at the front gate so newer trusted operating systems can pass through safely, without having to change the locks or shut down the building.",
			techFact: "An update to the UEFI Signature Database ('db') stored in non-volatile motherboard NVRAM, allowing newer cryptographically signed bootloaders and Option ROMs to be verified during Secure Boot."
		},
		"staging-updates": {
			title: "Staging Updates Without Rebooting",
			analogy: "Like delivery boxes placed right by your doorway the night before: they are unpacked and ready to go into the rooms whenever you next decide to walk through the door, without forcing you to pause what you're doing right now.",
			techFact: "Firmware and software updates are downloaded and written to non-volatile staging memory or disk locations, ready to take effect on the next system restart without causing immediate downtime."
		},
		"apk-package-manager": {
			title: "Alpine Package Manager (apk)",
			analogy: "A lightning-fast pit crew that swaps out worn or outdated parts (like graphics drivers or security certificates) with fresh replacements in seconds while keeping the car's engine running.",
			techFact: "Alpine Linux's package manager (apk) downloads, verifies cryptographic checksums, and installs pre-compiled binary packages and libraries while preserving existing system configuration files."
		}
	};

	function initTechAnalogies() {
		var terms = document.querySelectorAll(".tech-term");
		if (!terms.length) return;

		var tooltip = document.getElementById("tech-tooltip");
		if (!tooltip) {
			tooltip = document.createElement("div");
			tooltip.id = "tech-tooltip";
			tooltip.className = "tech-tooltip";
			tooltip.setAttribute("role", "tooltip");
			tooltip.setAttribute("aria-hidden", "true");
			tooltip.innerHTML = [
				'<div class="tech-tooltip-header">',
				'  <div class="tech-tooltip-title-wrap">',
				'    <span class="tech-tooltip-icon" aria-hidden="true">&#128161;</span>',
				'    <strong class="tech-tooltip-title"></strong>',
				'  </div>',
				'  <span class="tech-tooltip-pill">Analogy</span>',
				'</div>',
				'<div class="tech-tooltip-analogy-box">',
				'  <span class="tech-tooltip-label">Think of it like:</span>',
				'  <p class="tech-tooltip-text"></p>',
				'</div>',
				'<div class="tech-tooltip-fact-box">',
				'  <span class="tech-tooltip-fact-label">In tech terms:</span>',
				'  <p class="tech-tooltip-fact"></p>',
				'</div>'
			].join("");
			document.body.appendChild(tooltip);
		}

		var tipTitle = tooltip.querySelector(".tech-tooltip-title");
		var tipText = tooltip.querySelector(".tech-tooltip-text");
		var tipFact = tooltip.querySelector(".tech-tooltip-fact");

		var modal = document.getElementById("tech-modal");
		if (!modal) {
			modal = document.createElement("div");
			modal.id = "tech-modal";
			modal.className = "tech-modal-overlay";
			modal.setAttribute("role", "dialog");
			modal.setAttribute("aria-modal", "true");
			modal.setAttribute("aria-hidden", "true");
			modal.hidden = true;
			modal.innerHTML = [
				'<div class="tech-modal-backdrop" aria-hidden="true"></div>',
				'<div class="tech-modal-dialog">',
				'  <div class="tech-modal-header">',
				'    <div class="tech-modal-title-group">',
				'      <span class="tech-modal-icon" aria-hidden="true">&#128161;</span>',
				'      <h3 class="tech-modal-title"></h3>',
				'    </div>',
				'    <button type="button" class="tech-modal-close" aria-label="Close dialog">&times;</button>',
				'  </div>',
				'  <div class="tech-modal-body">',
				'    <div class="tech-modal-analogy-box">',
				'      <strong class="tech-modal-label">Think of it like:</strong>',
				'      <p class="tech-modal-text"></p>',
				'    </div>',
				'    <div class="tech-modal-fact-box">',
				'      <strong class="tech-modal-fact-label">In tech terms:</strong>',
				'      <p class="tech-modal-fact"></p>',
				'    </div>',
				'  </div>',
				'  <div class="tech-modal-footer">',
				'    <button type="button" class="tech-modal-btn-dismiss">Got it! Return to content</button>',
				'  </div>',
				'</div>'
			].join("");
			document.body.appendChild(modal);
		}

		var modalTitle = modal.querySelector(".tech-modal-title");
		var modalText = modal.querySelector(".tech-modal-text");
		var modalFact = modal.querySelector(".tech-modal-fact");
		var modalClose = modal.querySelector(".tech-modal-close");
		var modalDismiss = modal.querySelector(".tech-modal-btn-dismiss");
		var modalBackdrop = modal.querySelector(".tech-modal-backdrop");

		var activeTarget = null;
		var hideTimer = null;

		function getEntry(el) {
			var key = el.getAttribute("data-term");
			if (!key) {
				var txt = (el.textContent || "").trim().toLowerCase();
				for (var k in TECH_ANALOGIES) {
					if (txt.indexOf(k) !== -1 || k.indexOf(txt) !== -1) {
						key = k;
						break;
					}
				}
			}
			return TECH_ANALOGIES[key] || null;
		}

		function showTooltip(el) {
			var entry = getEntry(el);
			if (!entry) return;

			clearTimeout(hideTimer);
			activeTarget = el;

			tipTitle.textContent = entry.title;
			tipText.textContent = entry.analogy;
			tipFact.textContent = entry.techFact;

			tooltip.classList.add("visible");
			tooltip.setAttribute("aria-hidden", "false");

			var rect = el.getBoundingClientRect();
			var tipWidth = tooltip.offsetWidth;
			var tipHeight = tooltip.offsetHeight;

			var top = rect.top + window.scrollY - tipHeight - 12;
			if (rect.top - tipHeight < 14) {
				top = rect.bottom + window.scrollY + 12;
			}

			var left = rect.left + window.scrollX + (rect.width / 2) - (tipWidth / 2);
			var maxLeft = window.innerWidth - tipWidth - 14;
			if (left < 14) left = 14;
			if (left > maxLeft) left = maxLeft;

			tooltip.style.top = Math.max(8, top) + "px";
			tooltip.style.left = left + "px";
		}

		function scheduleHide() {
			clearTimeout(hideTimer);
			hideTimer = setTimeout(function () {
				tooltip.classList.remove("visible");
				tooltip.setAttribute("aria-hidden", "true");
				activeTarget = null;
			}, 200);
		}

		function cancelHide() {
			clearTimeout(hideTimer);
		}

		tooltip.addEventListener("mouseenter", cancelHide);
		tooltip.addEventListener("mouseleave", scheduleHide);

		function openModal(el) {
			var entry = getEntry(el);
			if (!entry) return;

			tooltip.classList.remove("visible");
			tooltip.setAttribute("aria-hidden", "true");

			modalTitle.textContent = entry.title;
			modalText.textContent = entry.analogy;
			modalFact.textContent = entry.techFact;

			modal.hidden = false;
			modal.setAttribute("aria-hidden", "false");
			requestAnimationFrame(function () {
				modal.classList.add("open");
				modalClose.focus();
			});
			activeTarget = el;
		}

		function closeModal() {
			modal.classList.remove("open");
			modal.setAttribute("aria-hidden", "true");
			setTimeout(function () {
				modal.hidden = true;
				if (activeTarget && typeof activeTarget.focus === "function") {
					activeTarget.focus();
				}
			}, 200);
		}

		modalClose.addEventListener("click", closeModal);
		modalDismiss.addEventListener("click", closeModal);
		modalBackdrop.addEventListener("click", closeModal);

		document.addEventListener("keydown", function (e) {
			if (e.key === "Escape") {
				if (!modal.hidden) closeModal();
				else scheduleHide();
			}
		});

		terms.forEach(function (el) {
			if (!el.getAttribute("tabindex") && el.tagName !== "BUTTON" && el.tagName !== "A") {
				el.setAttribute("tabindex", "0");
				el.setAttribute("role", "button");
			}
			el.setAttribute("aria-haspopup", "dialog");

			el.addEventListener("mouseenter", function () {
				if (window.matchMedia("(hover: hover)").matches) {
					showTooltip(el);
				}
			});

			el.addEventListener("mouseleave", function () {
				if (window.matchMedia("(hover: hover)").matches) {
					scheduleHide();
				}
			});

			el.addEventListener("focus", function () {
				if (window.matchMedia("(hover: hover)").matches) {
					showTooltip(el);
				}
			});

			el.addEventListener("blur", function () {
				scheduleHide();
			});

			el.addEventListener("click", function (e) {
				e.preventDefault();
				openModal(el);
			});

			el.addEventListener("keydown", function (e) {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					openModal(el);
				}
			});
		});
	}


	function initTrafficGeo() {
		var geoTotalEl = document.getElementById("geo-total-visitors");
		if (!geoTotalEl) return;

		var centerVal = document.getElementById("donut-center-val");
		var centerSub = document.getElementById("donut-center-sub");
		var breakdownItems = document.querySelectorAll(".geo-breakdown-item");
		var donutSlices = document.querySelectorAll(".donut-slice");
		var geoLands = document.querySelectorAll(".geo-land");
		var svgMap = document.querySelector(".geo-svg-map");
		var resetBtn = document.getElementById("geo-map-reset-btn");
		var overlayResetBtn = document.getElementById("geo-map-overlay-reset");
		var geoMapStatus = document.getElementById("geo-map-status");

		var DEFAULT_VIEWBOX = [0, 15, 1000, 420];
		var REGION_VIEWBOXES = {
			"North America": [25, 15, 500, 210],
			"Europe": [340, 20, 381, 160],
			"Asia-Pacific": [420, 90, 702, 295],
			"Latin America": [50, 195, 524, 220],
			"Other / Unassigned": [255, 140, 607, 255]
		};

		var selectedRegion = null;
		var currentVb = DEFAULT_VIEWBOX.slice();
		var animId = null;

		function normalizeRegion(r) {
			if (!r) return "";
			var s = r.toLowerCase();
			if (s.indexOf("north") !== -1) return "North America";
			if (s.indexOf("europ") !== -1) return "Europe";
			if (s.indexOf("asia") !== -1 || s.indexOf("apac") !== -1) return "Asia-Pacific";
			if (s.indexOf("latin") !== -1 || s.indexOf("south") !== -1) return "Latin America";
			if (s.indexOf("other") !== -1 || s.indexOf("africa") !== -1 || s.indexOf("unassigned") !== -1) return "Other / Unassigned";
			return r;
		}

		function getSliceForRegion(normName) {
			return Array.from(donutSlices).find(function (s) {
				return normalizeRegion(s.getAttribute("data-region")) === normName;
			});
		}

		function animateViewBox(toVb, duration) {
			if (!svgMap) return;
			duration = duration || 450;
			if (animId) cancelAnimationFrame(animId);
			var startVb = currentVb.slice();
			var startTime = performance.now();

			function step(now) {
				var elapsed = now - startTime;
				var progress = Math.min(1, elapsed / duration);
				var ease = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;

				var cur = [
					startVb[0] + (toVb[0] - startVb[0]) * ease,
					startVb[1] + (toVb[1] - startVb[1]) * ease,
					startVb[2] + (toVb[2] - startVb[2]) * ease,
					startVb[3] + (toVb[3] - startVb[3]) * ease
				];
				currentVb = cur;
				svgMap.setAttribute("viewBox", cur[0].toFixed(2) + " " + cur[1].toFixed(2) + " " + cur[2].toFixed(2) + " " + cur[3].toFixed(2));

				if (progress < 1) {
					animId = requestAnimationFrame(step);
				} else {
					currentVb = toVb.slice();
					svgMap.setAttribute("viewBox", toVb.join(" "));
					animId = null;
				}
			}
			animId = requestAnimationFrame(step);
		}

		function highlightRegion(rawRegionName, optPct, optCount) {
			var normName = normalizeRegion(rawRegionName);
			var slice = getSliceForRegion(normName);
			var pct = optPct || (slice ? slice.getAttribute("data-pct") : "");
			var count = optCount || (slice ? slice.getAttribute("data-count") : "");

			if (centerVal && pct) centerVal.textContent = pct;
			if (centerSub) centerSub.textContent = normName === "Other / Unassigned" ? "Other / Africa" : normName;

			donutSlices.forEach(function (s) {
				if (normalizeRegion(s.getAttribute("data-region")) === normName) {
					s.classList.remove("dimmed");
					s.classList.add("hovered");
					s.style.opacity = "1";
				} else {
					s.classList.remove("hovered");
					s.classList.add("dimmed");
					s.style.opacity = "0.32";
				}
			});

			breakdownItems.forEach(function (b) {
				if (normalizeRegion(b.getAttribute("data-region")) === normName) {
					b.classList.add("active");
				} else {
					b.classList.remove("active");
				}
			});

			geoLands.forEach(function (l) {
				if (normalizeRegion(l.getAttribute("data-region")) === normName) {
					l.classList.add("land-hovered");
					l.classList.remove("land-dimmed");
				} else {
					l.classList.remove("land-hovered");
					l.classList.add("land-dimmed");
				}
			});
		}

		function applySelectedRegion(normName) {
			var slice = getSliceForRegion(normName);
			var pct = slice ? slice.getAttribute("data-pct") : "";
			var count = slice ? slice.getAttribute("data-count") : "";

			if (centerVal && pct) centerVal.textContent = pct;
			if (centerSub) centerSub.textContent = normName === "Other / Unassigned" ? "Other / Africa" : normName;

			donutSlices.forEach(function (s) {
				if (normalizeRegion(s.getAttribute("data-region")) === normName) {
					s.classList.remove("dimmed", "hovered");
					s.classList.add("expanded");
					s.style.opacity = "1";
				} else {
					s.classList.remove("expanded", "hovered");
					s.classList.add("dimmed");
					s.style.opacity = "0.32";
				}
			});

			breakdownItems.forEach(function (b) {
				if (normalizeRegion(b.getAttribute("data-region")) === normName) {
					b.classList.add("active");
				} else {
					b.classList.remove("active");
				}
			});

			geoLands.forEach(function (l) {
				if (normalizeRegion(l.getAttribute("data-region")) === normName) {
					l.classList.add("zoomed-active");
					l.classList.remove("land-dimmed", "land-hovered");
				} else {
					l.classList.remove("zoomed-active", "land-hovered");
					l.classList.add("land-dimmed");
				}
			});

			if (resetBtn) resetBtn.style.display = "inline-flex";
			if (overlayResetBtn) overlayResetBtn.style.display = "inline-flex";
			if (geoMapStatus) geoMapStatus.textContent = "Zoomed: " + (normName === "Other / Unassigned" ? "Other / Africa" : normName);
		}

		function resetHighlight() {
			if (selectedRegion) {
				applySelectedRegion(selectedRegion);
				return;
			}

			if (centerVal) centerVal.textContent = "100%";
			if (centerSub) centerSub.textContent = "Global";

			donutSlices.forEach(function (s) {
				s.classList.remove("dimmed", "hovered", "expanded");
				s.style.opacity = "1";
			});

			breakdownItems.forEach(function (b) {
				b.classList.remove("active");
			});

			geoLands.forEach(function (l) {
				l.classList.remove("land-hovered", "land-dimmed", "zoomed-active");
			});
		}

		function selectRegion(rawRegionName) {
			var normName = normalizeRegion(rawRegionName);
			if (selectedRegion === normName) {
				resetView();
				return;
			}

			selectedRegion = normName;
			applySelectedRegion(normName);

			var targetVb = REGION_VIEWBOXES[normName] || DEFAULT_VIEWBOX;
			animateViewBox(targetVb, 450);
		}

		function resetView() {
			selectedRegion = null;
			animateViewBox(DEFAULT_VIEWBOX, 420);

			if (resetBtn) resetBtn.style.display = "none";
			if (overlayResetBtn) overlayResetBtn.style.display = "none";
			if (geoMapStatus) geoMapStatus.textContent = "Natural Earth 110m Ingest";

			resetHighlight();
		}

		donutSlices.forEach(function (slice) {
			slice.addEventListener("mouseenter", function () {
				highlightRegion(slice.getAttribute("data-region"), slice.getAttribute("data-pct"), slice.getAttribute("data-count"));
			});
			slice.addEventListener("mouseleave", resetHighlight);
			slice.addEventListener("click", function (e) {
				e.stopPropagation();
				selectRegion(slice.getAttribute("data-region"));
			});
		});

		breakdownItems.forEach(function (item) {
			item.addEventListener("mouseenter", function () {
				var region = item.getAttribute("data-region");
				var slice = getSliceForRegion(normalizeRegion(region));
				highlightRegion(region, slice ? slice.getAttribute("data-pct") : "", slice ? slice.getAttribute("data-count") : "");
			});
			item.addEventListener("mouseleave", resetHighlight);
			item.addEventListener("click", function (e) {
				e.stopPropagation();
				selectRegion(item.getAttribute("data-region"));
			});
		});

		geoLands.forEach(function (land) {
			land.addEventListener("mouseenter", function () {
				highlightRegion(land.getAttribute("data-region"));
			});
			land.addEventListener("mouseleave", resetHighlight);
			land.addEventListener("click", function (e) {
				e.stopPropagation();
				selectRegion(land.getAttribute("data-region"));
			});
		});

		if (resetBtn) {
			resetBtn.addEventListener("click", function (e) {
				e.stopPropagation();
				resetView();
			});
		}

		if (overlayResetBtn) {
			overlayResetBtn.addEventListener("click", function (e) {
				e.stopPropagation();
				resetView();
			});
		}

		if (svgMap) {
			svgMap.addEventListener("click", function (e) {
				if (e.target.closest(".geo-land")) return;
				if (selectedRegion) {
					resetView();
				}
			});
		}

		document.addEventListener("keydown", function (e) {
			if (e.key === "Escape" && selectedRegion) {
				resetView();
			}
		});

		function makeDonutSlice(cx, cy, r_in, r_out, start_deg, end_deg, gap_deg) {
			gap_deg = gap_deg || 2.0;
			var s = (start_deg + gap_deg / 2) * (Math.PI / 180);
			var e = (end_deg - gap_deg / 2) * (Math.PI / 180);
			var large_arc = (end_deg - start_deg - gap_deg) > 180 ? 1 : 0;
			var x1 = cx + r_out * Math.cos(s);
			var y1 = cy + r_out * Math.sin(s);
			var x2 = cx + r_out * Math.cos(e);
			var y2 = cy + r_out * Math.sin(e);
			var x3 = cx + r_in * Math.cos(e);
			var y3 = cy + r_in * Math.sin(e);
			var x4 = cx + r_in * Math.cos(s);
			var y4 = cy + r_in * Math.sin(s);
			return "M " + x1.toFixed(2) + " " + y1.toFixed(2) +
				" A " + r_out + " " + r_out + " 0 " + large_arc + " 1 " + x2.toFixed(2) + " " + y2.toFixed(2) +
				" L " + x3.toFixed(2) + " " + y3.toFixed(2) +
				" A " + r_in + " " + r_in + " 0 " + large_arc + " 0 " + x4.toFixed(2) + " " + y4.toFixed(2) + " Z";
		}

		async function refreshGeo() {
			try {
				var res = await fetch("https://nucwol2-0--hdd.taile72a68.ts.net/website-chat/traffic-geo", { cache: "no-store" });
				if (!res.ok) return;
				var data = await res.json();
				if (!data || !data.regions || typeof data.total !== "number") return;

				var total = data.total;
				geoTotalEl.textContent = total.toLocaleString() + " Total Sessions";

				var regions = data.regions;
				var naCount = regions["North America"] || 0;
				var euCount = regions["Europe"] || 0;
				var apacCount = regions["Asia-Pacific"] || 0;
				var latamCount = regions["Latin America"] || 0;
				var otherCount = regions["Other"] || 0;

				var naPct = total > 0 ? Math.round((naCount / total) * 100) : 0;
				var euPct = total > 0 ? Math.round((euCount / total) * 100) : 0;
				var apacPct = total > 0 ? Math.round((apacCount / total) * 100) : 0;
				var latamPct = total > 0 ? Math.round((latamCount / total) * 100) : 0;
				var otherPct = Math.max(0, 100 - (naPct + euPct + apacPct + latamPct));

				var statNa = document.getElementById("stat-geo-na");
				if (statNa) statNa.innerHTML = naPct + '% <small style="font-weight:400;color:#64748b;">(' + naCount + ')</small>';
				var statEu = document.getElementById("stat-geo-eu");
				if (statEu) statEu.innerHTML = euPct + '% <small style="font-weight:400;color:#64748b;">(' + euCount + ')</small>';
				var statApac = document.getElementById("stat-geo-apac");
				if (statApac) statApac.innerHTML = apacPct + '% <small style="font-weight:400;color:#64748b;">(' + apacCount + ')</small>';
				var statLatam = document.getElementById("stat-geo-latam");
				if (statLatam) statLatam.innerHTML = latamPct + '% <small style="font-weight:400;color:#64748b;">(' + latamCount + ')</small>';
				var statOther = document.getElementById("stat-geo-other");
				if (statOther) statOther.innerHTML = otherPct + '% <small style="font-weight:400;color:#64748b;">(' + otherCount + ')</small>';

				var sliceDefs = [
					{ id: "donut-slice-na", pct: naPct, count: naCount, region: "North America" },
					{ id: "donut-slice-eu", pct: euPct, count: euCount, region: "Europe" },
					{ id: "donut-slice-apac", pct: apacPct, count: apacCount, region: "Asia-Pacific" },
					{ id: "donut-slice-latam", pct: latamPct, count: latamCount, region: "Latin America" },
					{ id: "donut-slice-other", pct: otherPct, count: otherCount, region: "Other / Unassigned" }
				];

				var currentAngle = -90;
				sliceDefs.forEach(function (item) {
					var el = document.getElementById(item.id);
					if (!el) return;
					var sliceSpan = (item.pct / 100) * 360;
					if (sliceSpan < 1) sliceSpan = 1;
					var nextAngle = currentAngle + sliceSpan;
					el.setAttribute("d", makeDonutSlice(85, 85, 46, 68, currentAngle, nextAngle, 2.0));
					el.setAttribute("data-pct", item.pct + "%");
					el.setAttribute("data-count", item.count);
					currentAngle = nextAngle;
				});

				if (selectedRegion) {
					applySelectedRegion(selectedRegion);
				}
			} catch (e) {}
		}

		refreshGeo();
		window.setInterval(refreshGeo, 45000);
	}

	function initialize() {
		createResponsiveNavigation();
		createContactTools();
		createChat();
		initHomeTelemetry();
		initTrafficGeo();
		initTechAnalogies();
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", initialize);
	} else {
		initialize();
	}
}());
