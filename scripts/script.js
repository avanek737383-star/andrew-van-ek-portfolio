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
			'<button class="portfolio-chat-toggle" type="button" aria-expanded="false" aria-controls="portfolio-chat-panel">Ask Nemo</button>',
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
				var panel = document.querySelector(".portfolio-chat-panel");
				var input = document.getElementById("portfolio-chat-input");
				var wrapper = document.querySelector(".portfolio-chat");

				if (wrapper) wrapper.hidden = false;
				if (panel) panel.hidden = false;
				if (toggle) {
					toggle.hidden = true;
					toggle.setAttribute("aria-expanded", "true");
				}
				try { localStorage.setItem("nemo_chat_open", "true"); } catch (err) {}
				if (input) {
					setTimeout(function () {
						try { input.focus({ preventScroll: true }); } catch (err) { input.focus(); }
					}, 150);
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

	function initWeatherWidget() {
		var weatherSec = document.getElementById("home-weather-section");
		if (!weatherSec) return;

		var DEFAULT_LOC = {
			name: "Cupertino, CA",
			isDefault: true,
			lat: 37.3230,
			lon: -122.0322
		};

		var currentUnit = localStorage.getItem("portfolio_weather_unit") || "F";
		var currentLoc = DEFAULT_LOC;
		var savedLoc = localStorage.getItem("portfolio_weather_loc");
		if (savedLoc) {
			try {
				var parsed = JSON.parse(savedLoc);
				if (parsed && typeof parsed.lat === "number" && typeof parsed.lon === "number") {
					currentLoc = parsed;
				}
			} catch (e) {}
		}

		var cityLabel = document.getElementById("weather-city-label");
		var cityTag = document.getElementById("weather-loc-tag");
		var geoBtn = document.getElementById("weather-geo-btn");
		var geoBtnText = document.getElementById("weather-geo-btn-text");
		var unitToggle = document.getElementById("weather-unit-toggle");
		var unitFLabel = document.getElementById("unit-f-label");
		var unitCLabel = document.getElementById("unit-c-label");

		var currentTempEl = document.getElementById("weather-current-temp");
		var currentConditionEl = document.getElementById("weather-current-condition");
		var currentFeelsEl = document.getElementById("weather-current-feels");
		var currentIconEl = document.getElementById("weather-current-icon");
		var currentHiLowEl = document.getElementById("weather-current-hilow");
		var currentHumidityEl = document.getElementById("weather-current-humidity");
		var currentWindEl = document.getElementById("weather-current-wind");
		var currentPrecipEl = document.getElementById("weather-current-precip");

		var hourlyTrack = document.getElementById("weather-hourly-track");
		var dailyList = document.getElementById("weather-daily-list");

		var tabs = document.querySelectorAll(".weather-tab");
		var slides = document.querySelectorAll(".weather-slide");
		var dots = document.querySelectorAll(".weather-dot");
		var carousel = document.getElementById("weather-carousel");

		function updateLocationUI() {
			if (cityLabel) cityLabel.textContent = currentLoc.name;
			if (cityTag) {
				cityTag.textContent = currentLoc.isDefault ? "Default" : "Local";
				cityTag.style.color = currentLoc.isDefault ? "#0284c7" : "#10b981";
				cityTag.style.background = currentLoc.isDefault ? "#e0f2fe" : "#d1fae5";
			}
			if (geoBtnText) {
				geoBtnText.textContent = currentLoc.isDefault ? "Use My Location" : "Reset to Cupertino";
			}
		}

		function updateUnitUI() {
			if (unitFLabel && unitCLabel) {
				if (currentUnit === "F") {
					unitFLabel.classList.add("active");
					unitCLabel.classList.remove("active");
				} else {
					unitFLabel.classList.remove("active");
					unitCLabel.classList.add("active");
				}
			}
		}

		function getWeatherInfo(code, isDay) {
			if (code === 0) return { label: isDay ? "Clear Sky" : "Clear Night", icon: isDay ? "sun" : "moon" };
			if (code === 1 || code === 2) return { label: "Partly Cloudy", icon: isDay ? "partly-cloudy" : "cloudy-night" };
			if (code === 3) return { label: "Overcast", icon: "cloudy" };
			if (code === 45 || code === 48) return { label: "Foggy", icon: "fog" };
			if (code >= 51 && code <= 57) return { label: "Drizzle", icon: "drizzle" };
			if (code >= 61 && code <= 67) return { label: "Rain", icon: "rain" };
			if (code >= 71 && code <= 77) return { label: "Snow", icon: "snow" };
			if (code >= 80 && code <= 82) return { label: "Rain Showers", icon: "rain" };
			if (code >= 85 && code <= 86) return { label: "Snow Showers", icon: "snow" };
			if (code >= 95) return { label: "Thunderstorm", icon: "thunderstorm" };
			return { label: "Fair", icon: "sun" };
		}

		function getWeatherIconSvg(iconName, size) {
			size = size || 48;
			switch(iconName) {
				case "sun":
					return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 64 64" class="weather-svg-icon svg-sun" aria-hidden="true">' +
						'<circle cx="32" cy="32" r="14" fill="#f59e0b"/>' +
						'<g stroke="#fbbf24" stroke-width="3" stroke-linecap="round">' +
						'<line x1="32" y1="6" x2="32" y2="12"/>' +
						'<line x1="32" y1="52" x2="32" y2="58"/>' +
						'<line x1="6" y1="32" x2="12" y2="32"/>' +
						'<line x1="52" y1="32" x2="58" y2="32"/>' +
						'<line x1="13.6" y1="13.6" x2="17.8" y2="17.8"/>' +
						'<line x1="46.2" y1="46.2" x2="50.4" y2="50.4"/>' +
						'<line x1="13.6" y1="50.4" x2="17.8" y2="46.2"/>' +
						'<line x1="46.2" y1="17.8" x2="50.4" y2="13.6"/>' +
						'</g></svg>';
				case "moon":
					return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 64 64" class="weather-svg-icon svg-moon" aria-hidden="true">' +
						'<path d="M 40 12 A 22 22 0 1 1 20 48 A 18 18 0 0 0 40 12 Z" fill="#38bdf8" stroke="#7dd3fc" stroke-width="1.5"/>' +
						'<circle cx="48" cy="18" r="1.5" fill="#e0f2fe"/><circle cx="52" cy="30" r="1" fill="#e0f2fe"/>' +
						'</svg>';
				case "partly-cloudy":
					return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 64 64" class="weather-svg-icon svg-partly-cloudy" aria-hidden="true">' +
						'<circle cx="26" cy="24" r="11" fill="#f59e0b"/>' +
						'<g stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round">' +
						'<line x1="26" y1="6" x2="26" y2="10"/>' +
						'<line x1="12" y1="24" x2="16" y2="24"/>' +
						'<line x1="15" y1="13" x2="18" y2="16"/>' +
						'<line x1="37" y1="13" x2="34" y2="16"/>' +
						'</g>' +
						'<path d="M 24 48 A 12 12 0 0 1 24 28 A 15 15 0 0 1 48 26 A 11 11 0 0 1 56 40 A 9 9 0 0 1 52 48 Z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>' +
						'</svg>';
				case "cloudy-night":
					return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 64 64" class="weather-svg-icon svg-cloudy-night" aria-hidden="true">' +
						'<path d="M 32 10 A 14 14 0 1 1 18 32 A 12 12 0 0 0 32 10 Z" fill="#38bdf8"/>' +
						'<path d="M 22 48 A 10 10 0 0 1 22 30 A 13 13 0 0 1 46 28 A 10 10 0 0 1 54 40 A 8 8 0 0 1 50 48 Z" fill="#cbd5e1" stroke="#64748b" stroke-width="1.5"/>' +
						'</svg>';
				case "cloudy":
					return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 64 64" class="weather-svg-icon svg-cloudy" aria-hidden="true">' +
						'<path d="M 18 38 A 10 10 0 0 1 26 22 A 14 14 0 0 1 48 24 A 10 10 0 0 1 54 36 A 8 8 0 0 1 50 44 L 18 44 A 6 6 0 0 1 18 38 Z" fill="#94a3b8"/>' +
						'<path d="M 14 48 A 9 9 0 0 1 20 34 A 13 13 0 0 1 42 34 A 9 9 0 0 1 48 44 A 7 7 0 0 1 44 50 L 14 50 A 5 5 0 0 1 14 48 Z" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="1.5"/>' +
						'</svg>';
				case "fog":
					return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 64 64" class="weather-svg-icon svg-fog" aria-hidden="true">' +
						'<path d="M 16 30 A 10 10 0 0 1 24 16 A 14 14 0 0 1 44 18 A 9 9 0 0 1 50 28 Z" fill="#94a3b8" opacity="0.6"/>' +
						'<line x1="12" y1="36" x2="52" y2="36" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>' +
						'<line x1="16" y1="42" x2="48" y2="42" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>' +
						'<line x1="20" y1="48" x2="44" y2="48" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>' +
						'</svg>';
				case "drizzle":
					return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 64 64" class="weather-svg-icon svg-drizzle" aria-hidden="true">' +
						'<path d="M 16 36 A 9 9 0 0 1 22 22 A 13 13 0 0 1 44 22 A 9 9 0 0 1 50 32 A 7 7 0 0 1 46 38 L 16 38 Z" fill="#94a3b8"/>' +
						'<line x1="22" y1="44" x2="20" y2="50" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round"/>' +
						'<line x1="32" y1="44" x2="30" y2="50" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round"/>' +
						'<line x1="42" y1="44" x2="40" y2="50" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round"/>' +
						'</svg>';
				case "rain":
					return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 64 64" class="weather-svg-icon svg-rain" aria-hidden="true">' +
						'<path d="M 16 32 A 10 10 0 0 1 24 18 A 14 14 0 0 1 46 18 A 10 10 0 0 1 52 30 A 8 8 0 0 1 48 36 L 16 36 Z" fill="#475569"/>' +
						'<line x1="20" y1="42" x2="16" y2="52" stroke="#0284c7" stroke-width="3" stroke-linecap="round"/>' +
						'<line x1="30" y1="42" x2="26" y2="52" stroke="#0284c7" stroke-width="3" stroke-linecap="round"/>' +
						'<line x1="40" y1="42" x2="36" y2="52" stroke="#0284c7" stroke-width="3" stroke-linecap="round"/>' +
						'<line x1="50" y1="42" x2="46" y2="52" stroke="#0284c7" stroke-width="3" stroke-linecap="round"/>' +
						'</svg>';
				case "snow":
					return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 64 64" class="weather-svg-icon svg-snow" aria-hidden="true">' +
						'<path d="M 16 32 A 10 10 0 0 1 24 18 A 14 14 0 0 1 46 18 A 10 10 0 0 1 52 30 A 8 8 0 0 1 48 36 L 16 36 Z" fill="#64748b"/>' +
						'<circle cx="20" cy="46" r="2" fill="#e0f2fe"/><circle cx="32" cy="48" r="2" fill="#e0f2fe"/><circle cx="44" cy="46" r="2" fill="#e0f2fe"/>' +
						'<circle cx="26" cy="54" r="1.5" fill="#e0f2fe"/><circle cx="38" cy="54" r="1.5" fill="#e0f2fe"/>' +
						'</svg>';
				case "thunderstorm":
					return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 64 64" class="weather-svg-icon svg-thunderstorm" aria-hidden="true">' +
						'<path d="M 16 30 A 10 10 0 0 1 24 16 A 14 14 0 0 1 46 16 A 10 10 0 0 1 52 28 A 8 8 0 0 1 48 34 L 16 34 Z" fill="#1e293b"/>' +
						'<polygon points="34,34 26,45 32,45 28,56 40,43 33,43" fill="#facc15" stroke="#eab308" stroke-width="1"/>' +
						'</svg>';
				default:
					return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 64 64" class="weather-svg-icon" aria-hidden="true">' +
						'<circle cx="32" cy="32" r="12" fill="#f59e0b"/>' +
						'</svg>';
			}
		}

		async function fetchWeather() {
			try {
				var tempUnitParam = currentUnit === "F" ? "fahrenheit" : "celsius";
				var windUnitParam = currentUnit === "F" ? "mph" : "kmh";
				var precipUnitParam = currentUnit === "F" ? "inch" : "mm";

				var url = "https://api.open-meteo.com/v1/forecast?latitude=" + currentLoc.lat +
					"&longitude=" + currentLoc.lon +
					"&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,is_day" +
					"&hourly=temperature_2m,precipitation_probability,weather_code,is_day" +
					"&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max" +
					"&temperature_unit=" + tempUnitParam +
					"&wind_speed_unit=" + windUnitParam +
					"&precipitation_unit=" + precipUnitParam +
					"&timezone=auto";

				var res = await fetch(url);
				if (!res.ok) return;
				var data = await res.json();
				if (!data || !data.current) return;

				var current = data.current;
				var hourly = data.hourly;
				var daily = data.daily;

				// 1. Current Hero
				var curTemp = Math.round(current.temperature_2m);
				if (currentTempEl) currentTempEl.textContent = curTemp + "°";
				var curFeels = Math.round(current.apparent_temperature);
				if (currentFeelsEl) currentFeelsEl.textContent = "Feels like " + curFeels + "°" + currentUnit;

				var weatherInfo = getWeatherInfo(current.weather_code, current.is_day);
				if (currentConditionEl) currentConditionEl.textContent = weatherInfo.label;
				if (currentIconEl) currentIconEl.innerHTML = getWeatherIconSvg(weatherInfo.icon, 72);

				// Parameters
				var todayHigh = Math.round(daily.temperature_2m_max[0]);
				var todayLow = Math.round(daily.temperature_2m_min[0]);
				if (currentHiLowEl) currentHiLowEl.textContent = "H: " + todayHigh + "° • L: " + todayLow + "°";

				if (currentHumidityEl) currentHumidityEl.textContent = current.relative_humidity_2m + "%";
				if (currentWindEl) currentWindEl.textContent = Math.round(current.wind_speed_10m) + (currentUnit === "F" ? " mph" : " km/h");
				if (currentPrecipEl) currentPrecipEl.textContent = current.precipitation.toFixed(1) + (currentUnit === "F" ? " in" : " mm");

				// 2. 24-Hour Hourly Timeline
				if (hourlyTrack && hourly && hourly.time) {
					var nowIso = current.time.slice(0, 13);
					var startIdx = hourly.time.findIndex(function(t) { return t.slice(0, 13) === nowIso; });
					if (startIdx === -1) startIdx = 0;

					var hourlyHtml = "";
					var endIdx = Math.min(hourly.time.length, startIdx + 24);
					for (var i = startIdx; i < endIdx; i++) {
						var tStr = hourly.time[i];
						var hourNum = parseInt(tStr.slice(11, 13), 10);
						var ampm = hourNum >= 12 ? "PM" : "AM";
						var displayHour = hourNum % 12;
						if (displayHour === 0) displayHour = 12;
						var timeLabel = (i === startIdx) ? "Now" : (displayHour + " " + ampm);

						var hTemp = Math.round(hourly.temperature_2m[i]);
						var hCode = hourly.weather_code[i];
						var hIsDay = hourly.is_day ? hourly.is_day[i] : 1;
						var hInfo = getWeatherInfo(hCode, hIsDay);
						var hPrecip = hourly.precipitation_probability ? hourly.precipitation_probability[i] : 0;

						hourlyHtml += '<div class="weather-hourly-pill">' +
							'<span class="weather-hourly-time">' + timeLabel + '</span>' +
							'<div class="weather-hourly-icon">' + getWeatherIconSvg(hInfo.icon, 30) + '</div>' +
							'<strong class="weather-hourly-temp">' + hTemp + '°</strong>' +
							'<span class="weather-hourly-precip">' + (hPrecip > 0 ? ('💧 ' + hPrecip + '%') : '&nbsp;') + '</span>' +
							'</div>';
					}
					hourlyTrack.innerHTML = hourlyHtml;
				}

				// 3. 7-Day Extended Outlook
				if (dailyList && daily && daily.time) {
					var weekMin = Math.min.apply(null, daily.temperature_2m_min);
					var weekMax = Math.max.apply(null, daily.temperature_2m_max);
					var tempSpan = Math.max(1, weekMax - weekMin);

					var dailyHtml = "";
					var dayCount = Math.min(7, daily.time.length);
					var dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

					for (var d = 0; d < dayCount; d++) {
						var dDate = new Date(daily.time[d] + "T12:00:00");
						var dayName = (d === 0) ? "Today" : dayNames[dDate.getDay()];
						var dCode = daily.weather_code[d];
						var dInfo = getWeatherInfo(dCode, 1);
						var dMin = Math.round(daily.temperature_2m_min[d]);
						var dMax = Math.round(daily.temperature_2m_max[d]);
						var dPrecip = daily.precipitation_probability_max ? daily.precipitation_probability_max[d] : 0;

						var leftPct = Math.round(((dMin - weekMin) / tempSpan) * 100);
						var widthPct = Math.max(12, Math.round(((dMax - dMin) / tempSpan) * 100));

						dailyHtml += '<div class="weather-daily-row">' +
							'<strong class="weather-daily-day">' + dayName + '</strong>' +
							'<div class="weather-daily-condition">' +
							'<div class="weather-daily-icon">' + getWeatherIconSvg(dInfo.icon, 22) + '</div>' +
							'<span>' + dInfo.label + '</span>' +
							'</div>' +
							'<span class="weather-daily-precip">' + (dPrecip > 0 ? ('💧 ' + dPrecip + '%') : '') + '</span>' +
							'<span class="weather-daily-min">' + dMin + '°</span>' +
							'<div class="weather-daily-bar-track">' +
							'<div class="weather-daily-bar-fill" style="margin-left:' + leftPct + '%; width:' + widthPct + '%;"></div>' +
							'</div>' +
							'<strong class="weather-daily-max">' + dMax + '°</strong>' +
							'</div>';
					}
					dailyList.innerHTML = dailyHtml;
				}
			} catch (e) {}
		}

		// Tab and slide switching
		function setActiveSlide(index) {
			tabs.forEach(function(t, i) {
				var isActive = (i === index);
				t.classList.toggle("active", isActive);
				t.setAttribute("aria-selected", isActive ? "true" : "false");
			});
			slides.forEach(function(s, i) {
				s.classList.toggle("active", i === index);
			});
			dots.forEach(function(d, i) {
				d.classList.toggle("active", i === index);
			});

			if (carousel && window.innerWidth <= 860) {
				carousel.scrollTo({
					left: index * carousel.offsetWidth,
					behavior: "smooth"
				});
			}
		}

		tabs.forEach(function(tab, idx) {
			tab.addEventListener("click", function() {
				setActiveSlide(idx);
			});
		});

		dots.forEach(function(dot, idx) {
			dot.addEventListener("click", function() {
				setActiveSlide(idx);
			});
		});

		if (carousel) {
			var isScrolling = null;
			carousel.addEventListener("scroll", function() {
				if (window.innerWidth > 860) return;
				window.clearTimeout(isScrolling);
				isScrolling = setTimeout(function() {
					var slideWidth = carousel.offsetWidth || 1;
					var activeIdx = Math.round(carousel.scrollLeft / slideWidth);
					activeIdx = Math.max(0, Math.min(2, activeIdx));
					dots.forEach(function(d, i) {
						d.classList.toggle("active", i === activeIdx);
					});
					tabs.forEach(function(t, i) {
						var isActive = (i === activeIdx);
						t.classList.toggle("active", isActive);
						t.setAttribute("aria-selected", isActive ? "true" : "false");
					});
				}, 60);
			});
		}

		// Geolocation toggle & reverse geocode
		if (geoBtn) {
			geoBtn.addEventListener("click", function() {
				if (!currentLoc.isDefault) {
					// Reset to Cupertino
					currentLoc = DEFAULT_LOC;
					localStorage.removeItem("portfolio_weather_loc");
					updateLocationUI();
					fetchWeather();
					return;
				}

				if (!navigator.geolocation) {
					alert("Geolocation is not supported by your browser.");
					return;
				}

				if (geoBtnText) geoBtnText.textContent = "Locating...";

				navigator.geolocation.getCurrentPosition(
					async function(pos) {
						var lat = pos.coords.latitude;
						var lon = pos.coords.longitude;
						var cityName = "Local Coordinates";

						try {
							var geoUrl = "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=" + lat + "&longitude=" + lon + "&localityLanguage=en";
							var geoRes = await fetch(geoUrl);
							if (geoRes.ok) {
								var geoData = await geoRes.json();
								var city = geoData.locality || geoData.city || geoData.principalSubdivision;
								var state = geoData.principalSubdivisionCode ? geoData.principalSubdivisionCode.split("-").pop() : (geoData.countryCode || "");
								if (city) {
									cityName = city + (state ? (", " + state) : "");
								}
							}
						} catch(err) {}

						currentLoc = {
							name: cityName,
							isDefault: false,
							lat: lat,
							lon: lon
						};
						localStorage.setItem("portfolio_weather_loc", JSON.stringify(currentLoc));
						updateLocationUI();
						fetchWeather();
					},
					function(err) {
						updateLocationUI();
						if (cityTag) {
							cityTag.textContent = "Denied";
							cityTag.style.color = "#ef4444";
							cityTag.style.background = "#fee2e2";
							setTimeout(function() {
								updateLocationUI();
							}, 3500);
						}
					},
					{ timeout: 10000, maximumAge: 300000 }
				);
			});
		}

		// Unit toggle (°F / °C)
		if (unitToggle) {
			unitToggle.addEventListener("click", function() {
				currentUnit = currentUnit === "F" ? "C" : "F";
				localStorage.setItem("portfolio_weather_unit", currentUnit);
				updateUnitUI();
				fetchWeather();
			});
		}

		updateLocationUI();
		updateUnitUI();
		fetchWeather();
		window.setInterval(fetchWeather, 300000); // 5 min interval
	}

	
	function initPageLoadTachometer() {
		var cluster = document.getElementById("home-tachometer-cluster");
		if (!cluster) return;

		var needle = document.getElementById("tach-needle-group");
		var curDisplay = document.getElementById("tach-current-ms");
		var recDisplay = document.getElementById("tach-record-ms");
		var statusBadge = document.getElementById("tach-status-badge");
		var newRecordBadge = document.getElementById("tach-new-record-badge");
		var countDisplay = document.getElementById("tach-visits-count");
		var revBtn = document.getElementById("tach-rev-btn");

		var STORAGE_RECORD_KEY = "vanek_tach_fastest_record_ms";
		var STORAGE_COUNT_KEY = "vanek_tach_load_count";

		var savedRecord = parseInt(localStorage.getItem(STORAGE_RECORD_KEY), 10);
		var visitCount = parseInt(localStorage.getItem(STORAGE_COUNT_KEY), 10) || 0;
		visitCount += 1;
		localStorage.setItem(STORAGE_COUNT_KEY, visitCount);
		if (countDisplay) countDisplay.textContent = visitCount;

		if (savedRecord && !isNaN(savedRecord) && savedRecord > 0) {
			if (recDisplay) recDisplay.textContent = savedRecord + " ms";
		} else {
			if (recDisplay) recDisplay.textContent = "-- ms";
		}

		function mapMsToDegrees(ms) {
			// Sweep from -110deg (0 ms) to +110deg (1500+ ms)
			var maxMs = 1500;
			var clamped = Math.max(0, Math.min(ms, maxMs));
			var pct = clamped / maxMs;
			return -110 + (pct * 220);
		}

		function applySpeedReading(ms, isInteractive) {
			var deg = mapMsToDegrees(ms);
			if (needle) {
				needle.style.transform = "rotate(" + deg + "deg)";
			}
			if (curDisplay) {
				curDisplay.textContent = ms;
			}

			if (statusBadge) {
				statusBadge.className = "tach-badge";
				if (ms <= 300) {
					statusBadge.classList.add("zone-green");
					statusBadge.textContent = "⚡ Blazing Fast (" + ms + "ms)";
				} else if (ms <= 750) {
					statusBadge.classList.add("zone-yellow");
					statusBadge.textContent = "🚀 Optimal Response (" + ms + "ms)";
				} else {
					statusBadge.classList.add("zone-red");
					statusBadge.textContent = "⚠️ Heavy Traffic (" + ms + "ms)";
				}
			}

			var currentBest = parseInt(localStorage.getItem(STORAGE_RECORD_KEY), 10);
			if (!currentBest || isNaN(currentBest) || ms < currentBest) {
				localStorage.setItem(STORAGE_RECORD_KEY, ms);
				if (recDisplay) recDisplay.textContent = ms + " ms";
				if (newRecordBadge) {
					newRecordBadge.hidden = false;
				}
			} else {
				if (newRecordBadge && !isInteractive) newRecordBadge.hidden = true;
			}
		}

		function measurePageLoad() {
			var loadMs = 0;
			try {
				var navEntries = window.performance && performance.getEntriesByType ? performance.getEntriesByType("navigation") : [];
				if (navEntries && navEntries.length > 0) {
					var nav = navEntries[0];
					if (nav.loadEventEnd > 0) {
						loadMs = Math.round(nav.loadEventEnd - nav.startTime);
					} else if (nav.domContentLoadedEventEnd > 0) {
						loadMs = Math.round(nav.domContentLoadedEventEnd - nav.startTime);
					} else if (nav.responseEnd > 0) {
						loadMs = Math.round(nav.responseEnd - nav.startTime);
					}
				}
				if (loadMs <= 0 && window.performance && performance.timing) {
					var t = performance.timing;
					if (t.loadEventEnd > 0) {
						loadMs = Math.max(1, Math.round(t.loadEventEnd - t.navigationStart));
					} else if (t.domContentLoadedEventEnd > 0) {
						loadMs = Math.max(1, Math.round(t.domContentLoadedEventEnd - t.navigationStart));
					}
				}
			} catch (e) {}

			if (loadMs <= 0) {
				loadMs = Math.round(performance.now());
			}

			setTimeout(function() {
				applySpeedReading(loadMs, false);
			}, 300);
		}

		if (document.readyState === "complete") {
			setTimeout(measurePageLoad, 100);
		} else {
			window.addEventListener("load", function() {
				setTimeout(measurePageLoad, 100);
			});
		}

		if (revBtn) {
			revBtn.addEventListener("click", function() {
				revBtn.disabled = true;
				if (newRecordBadge) newRecordBadge.hidden = true;
				if (needle) {
					needle.style.transform = "rotate(105deg)";
				}
				var start = performance.now();
				fetch(window.location.href + "?tach=" + Date.now(), { method: "HEAD", cache: "no-store" })
					.then(function() {
						var pingMs = Math.max(8, Math.round(performance.now() - start));
						setTimeout(function() {
							applySpeedReading(pingMs, true);
							revBtn.disabled = false;
						}, 350);
					})
					.catch(function() {
						var fallbackMs = Math.max(15, Math.round(performance.now() - start));
						setTimeout(function() {
							applySpeedReading(fallbackMs, true);
							revBtn.disabled = false;
						}, 350);
					});
			});
		}
	}

	
	function initOsTracker() {
		var tracker = document.getElementById("home-os-tracker");
		if (!tracker) return;

		var dateEl = document.getElementById("os-tracker-timestamp");
		if (dateEl) {
			var now = new Date();
			dateEl.textContent = now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
		}

		// Fetch live kernel releases from kernel.org API
		try {
			fetch("https://www.kernel.org/releases.json", { cache: "default" })
				.then(function (res) { return res.json(); })
				.then(function (data) {
					if (data && data.latest_stable && data.latest_stable.version) {
						var linuxVer = document.getElementById("os-ver-linux");
						var channel = document.getElementById("os-linux-channel");
						if (linuxVer) linuxVer.textContent = "v" + data.latest_stable.version;
						if (channel) channel.textContent = "Latest Stable (kernel.org)";
					}
				})
				.catch(function () {});
		} catch (e) {}
	}

	
	function initCockpitCluster() {
		// 1. Tachometer Controller
		initCockpitCluster();

		// 2. Analog Odometer Drum Roll Controller
		initAnalogOdometer();

		// 3. Tailscale Speedometer Latency Controller
		initTailscaleSpeedometer();
	}

	function initAnalogOdometer() {
		var odoGroup = document.getElementById("odometer-drum-group");
		if (!odoGroup) return;

		// Total corpus count: 1,673 documents (649 GVSU KB + 1024 OneDrive class files)
		var targetCount = 1673;
		var str = String(targetCount).padStart(6, "0"); // "001673"
		
		// Animate rolling up each digit with mechanical delay
		var digitIds = ["odo-d5", "odo-d4", "odo-d3", "odo-d2", "odo-d1", "odo-d0"];
		digitIds.forEach(function (id, idx) {
			var el = document.getElementById(id);
			if (el) {
				var finalDigit = str[idx];
				// Start at 0, then roll into target digit
				el.textContent = "0";
				setTimeout(function () {
					el.style.transform = "translateY(-6px)";
					setTimeout(function () {
						el.textContent = finalDigit;
						el.style.transform = "translateY(0)";
					}, 180 + (idx * 60));
				}, 200 + (idx * 80));
			}
		});
	}

	function initTailscaleSpeedometer() {
		var needle = document.getElementById("speedo-needle-group");
		var mphDisplay = document.getElementById("speedo-mph-val");
		var msDisplay = document.getElementById("speedo-ms-display");
		var statusBadge = document.getElementById("speedo-status-badge");
		var testBtn = document.getElementById("speedo-test-btn");
		var arcActive = document.getElementById("speedo-arc-active");

		if (!mphDisplay) return;

		function mapMphToDegrees(mph) {
			// Sweep from -110deg (0 MPH) to +110deg (120 MPH)
			var maxMph = 120;
			var clamped = Math.max(0, Math.min(mph, maxMph));
			var pct = clamped / maxMph;
			return -110 + (pct * 220);
		}

		function pingToMph(pingMs) {
			// Sub-15ms = 115-120 MPH (Autobahn speed)
			// 25ms = ~90 MPH
			// 50ms = ~70 MPH
			// 100ms = ~45 MPH
			// 250ms+ = ~20-25 MPH
			if (pingMs <= 10) return 120;
			var speed = Math.round(120 * Math.pow(10 / Math.max(10, pingMs), 0.42));
			return Math.max(8, Math.min(120, speed));
		}

		function applySpeedoReading(pingMs) {
			var mph = pingToMph(pingMs);
			var deg = mapMphToDegrees(mph);

			if (needle) {
				needle.style.transform = "rotate(" + deg + "deg)";
			}
			if (mphDisplay) {
				mphDisplay.textContent = mph;
			}
			if (msDisplay) {
				msDisplay.textContent = pingMs + " ms RTT";
			}
			if (statusBadge) {
				if (mph >= 85) {
					statusBadge.textContent = "⚡ Line-Rate (" + mph + " MPH)";
					statusBadge.style.color = "#047857";
					statusBadge.style.background = "#d1fae5";
				} else if (mph >= 50) {
					statusBadge.textContent = "🚀 High Speed (" + mph + " MPH)";
					statusBadge.style.color = "#0284c7";
					statusBadge.style.background = "#e0f2fe";
				} else {
					statusBadge.textContent = "Cruising (" + mph + " MPH)";
					statusBadge.style.color = "#b45309";
					statusBadge.style.background = "#fef3c7";
				}
			}
		}

		function testMeshLatency() {
			var start = performance.now();
			var testUrl = "https://nucwol2-0--hdd.taile72a68.ts.net/website-chat/stats?t=" + Date.now();
			
			// Initial rev needle
			if (needle) needle.style.transform = "rotate(-110deg)";

			var controller = new AbortController();
			var timeoutId = setTimeout(function () { controller.abort(); }, 4000);

			fetch(testUrl, { method: "GET", cache: "no-store", signal: controller.signal })
				.then(function (res) {
					clearTimeout(timeoutId);
					var rtt = Math.max(8, Math.round(performance.now() - start));
					setTimeout(function () { applySpeedoReading(rtt); }, 200);
				})
				.catch(function () {
					clearTimeout(timeoutId);
					// Fallback probe against origin
					var fallbackStart = performance.now();
					fetch(window.location.origin + "/favicon.ico?p=" + Date.now(), { method: "HEAD", cache: "no-store" })
						.then(function () {
							var rtt = Math.max(12, Math.round(performance.now() - fallbackStart));
							setTimeout(function () { applySpeedoReading(rtt); }, 200);
						})
						.catch(function () {
							setTimeout(function () { applySpeedoReading(45); }, 200);
						});
				});
		}

		// Initial benchmark after page settles
		setTimeout(testMeshLatency, 400);

		if (testBtn) {
			testBtn.addEventListener("click", function () {
				testBtn.disabled = true;
				if (needle) needle.style.transform = "rotate(100deg)";
				setTimeout(function () {
					testMeshLatency();
					testBtn.disabled = false;
				}, 300);
			});
		}
	}

	function initialize() {
		createResponsiveNavigation();
		createContactTools();
		createChat();
		initHomeTelemetry();
		initTrafficGeo();
		initWeatherWidget();
		initTechAnalogies();
		initCockpitCluster();
		initOsTracker();
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", initialize);
	} else {
		initialize();
	}
}());
