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

		// Mobile header bar with Menu toggle on left and search bar on right
		var mobileHeader = nav.querySelector(".nav-mobile-header");
		var button;
		if (!mobileHeader) {
			mobileHeader = document.createElement("div");
			mobileHeader.className = "nav-mobile-header";

			button = document.createElement("button");
			button.className = "nav-toggle";
			button.type = "button";
			button.setAttribute("aria-expanded", "false");
			button.setAttribute("aria-controls", menu.id);
			button.innerHTML = '<span class="nav-toggle-icon" aria-hidden="true"><i></i><i></i><i></i></span><span>Menu</span>';
			mobileHeader.appendChild(button);

			var searchWrap = document.createElement("div");
			searchWrap.className = "nav-mobile-search-wrap";
			searchWrap.innerHTML = '<form class="nav-mobile-search-form" action="search.html" method="GET" role="search">' +
				'<input type="search" name="q" placeholder="Search site..." class="nav-mobile-search-input" aria-label="Search entire website" autocomplete="off" />' +
				'<button type="submit" class="nav-mobile-search-btn" aria-label="Submit search">' +
					'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>' +
				'</button>' +
			'</form>';
			mobileHeader.appendChild(searchWrap);

			nav.insertBefore(mobileHeader, menu);
		} else {
			button = mobileHeader.querySelector(".nav-toggle");
		}

		var searchInput = mobileHeader.querySelector(".nav-mobile-search-input");
		if (searchInput) {
			searchInput.addEventListener("focus", function () {
				if (nav.classList.contains("nav-open")) {
					setOpen(false);
				}
			});
		}

		var searchForm = mobileHeader.querySelector(".nav-mobile-search-form");
		if (searchForm) {
			searchForm.addEventListener("submit", function (e) {
				var query = (searchInput ? searchInput.value : "").trim();
				if (!query) {
					e.preventDefault();
					if (window.location.pathname.endsWith("search.html")) {
						var pageInput = document.getElementById("search-page-input");
						if (pageInput) pageInput.focus();
					} else if (typeof window.openSpotlightModal === "function") {
						window.openSpotlightModal();
					} else {
						var trigger = document.getElementById("nav-search-trigger");
						if (trigger) trigger.click();
					}
				}
			});
		}

		function closeAllDropdowns() {
			nav.querySelectorAll(".nav-item-dropdown.dropdown-open").forEach(function (el) {
				el.classList.remove("dropdown-open");
				var t = el.querySelector(".nav-dropdown-toggle");
				if (t) t.setAttribute("aria-expanded", "false");
			});
		}

		function setOpen(open) {
			nav.classList.toggle("nav-open", open);
			button.setAttribute("aria-expanded", String(open));
			if (!open) {
				closeAllDropdowns();
			} else {
				lastScrollY = window.scrollY;
			}
		}

		button.addEventListener("click", function () {
			setOpen(!nav.classList.contains("nav-open"));
		});

		// Wire up dropdown buttons for click / touch
		var dropdownToggles = nav.querySelectorAll(".nav-dropdown-toggle");
		dropdownToggles.forEach(function (toggle) {
			toggle.addEventListener("click", function (e) {
				e.stopPropagation();
				var parentItem = toggle.closest(".nav-item-dropdown");
				if (!parentItem) return;
				var wasOpen = parentItem.classList.contains("dropdown-open");

				// Close other dropdowns
				nav.querySelectorAll(".nav-item-dropdown.dropdown-open").forEach(function (other) {
					if (other !== parentItem) {
						other.classList.remove("dropdown-open");
						var otherBtn = other.querySelector(".nav-dropdown-toggle");
						if (otherBtn) otherBtn.setAttribute("aria-expanded", "false");
					}
				});

				parentItem.classList.toggle("dropdown-open", !wasOpen);
				toggle.setAttribute("aria-expanded", String(!wasOpen));
				if (!wasOpen && window.innerWidth <= 1024) {
					setTimeout(function () {
						toggle.scrollIntoView({ behavior: "smooth", block: "nearest" });
					}, 50);
				}
			});
		});

		// Mark dropdown toggle as active if a child link is aria-current="page"
		nav.querySelectorAll(".nav-item-dropdown").forEach(function (dropdown) {
			if (dropdown.querySelector('[aria-current="page"]')) {
				var toggle = dropdown.querySelector(".nav-dropdown-toggle");
				if (toggle) {
					toggle.classList.add("nav-dropdown-active");
				}
			}
		});

		menu.addEventListener("click", function (event) {
			if (event.target.closest("a")) {
				setOpen(false);
			}
		});

		document.addEventListener("click", function (event) {
			if (!nav.contains(event.target)) {
				setOpen(false);
				closeAllDropdowns();
			}
		});

		document.addEventListener("keydown", function (event) {
			if (event.key === "Escape") {
				setOpen(false);
				closeAllDropdowns();
				button.focus();
			}
		});

		// Auto-collapse mobile drawer if the page is scrolled (ignore when interacting inside nav drawer)
		var navInteracting = false;
		nav.addEventListener("touchstart", function () {
			navInteracting = true;
		}, { passive: true });
		nav.addEventListener("touchend", function () {
			setTimeout(function () { navInteracting = false; }, 400);
		}, { passive: true });
		nav.addEventListener("touchcancel", function () {
			navInteracting = false;
		}, { passive: true });

		var lastScrollY = window.scrollY;
		window.addEventListener("scroll", function () {
			if (nav.classList.contains("nav-open")) {
				if (!navInteracting && Math.abs(window.scrollY - lastScrollY) > 30) {
					setOpen(false);
				}
			}
			lastScrollY = window.scrollY;
		}, { passive: true });

		window.addEventListener("resize", function () {
			if (window.innerWidth > 1024) {
				setOpen(false);
				closeAllDropdowns();
			}
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
		// 1. Phone AI Voice Hotline Widget (Fixed Lower-Left on all screens)
		var phoneWrapper = document.createElement("aside");
		phoneWrapper.className = "portfolio-phone";
		phoneWrapper.id = "portfolio-phone";
		phoneWrapper.hidden = true;
		phoneWrapper.innerHTML = [
			'<button class="portfolio-phone-toggle" type="button" aria-expanded="false" aria-controls="portfolio-phone-panel" title="Call AI Telephone Hotline (+1 912-915-3851)" aria-label="Call Nemo AI Voice Hotline (+1 912-915-3851)">',
			'  <span class="phone-toggle-icon" aria-hidden="true">📞</span>',
			'  <span class="phone-toggle-label">+1 (912) 915-3851 · AI Hotline</span>',
			'</button>',
			'<section id="portfolio-phone-panel" class="portfolio-phone-panel" aria-label="Voice AI Telephone Hotline" hidden>',
			'  <header class="portfolio-phone-header">',
			'    <div class="phone-header-title">',
			'      <strong>📞 Voice AI Hotline · Talk to Nemo</strong>',
			'      <span>Direct telephony bridge to local Llama 3.2 3B Instruct Abliterated</span>',
			'    </div>',
			'    <div class="portfolio-chat-controls">',
			'      <button class="portfolio-phone-close" type="button" aria-label="Close hotline tutorial">&times;</button>',
			'    </div>',
			'  </header>',
			'  <div class="portfolio-phone-body">',
			'    <div class="phone-number-banner">',
			'      <div class="phone-banner-digits">+1 (912) 915-3851</div>',
			'      <div class="phone-banner-actions">',
			'        <a href="tel:+19129153851" class="phone-action-btn phone-action-call">Call Hotline 📞</a>',
			'        <button type="button" class="phone-action-btn phone-action-copy" id="phone-copy-btn">Copy Number 📋</button>',
			'      </div>',
			'    </div>',
			'    <div class="phone-tutorial-section">',
			'      <h4 class="phone-tutorial-title">Quick Voice Tutorial &amp; How It Works</h4>',
			'      <ol class="phone-tutorial-steps">',
			'        <li><strong>Dial From Any Phone:</strong> Call from your mobile carrier, landline, or VoIP. No special app or user registration is required.</li>',
			'        <li><strong>PIN-Free Instant Connection:</strong> Calls connect directly into Andrew\'s homelab Twilio PSTN gateway without prompting for a security code or PIN.</li>',
			'        <li><strong>Speak Aloud Naturally:</strong> Twilio streams your audio with real-time speech transcription. The local PC GPU (Llama 3.2 3B Instruct Abliterated) generates general-purpose spoken answers and reads them aloud.</li>',
			'        <li><strong>Hang Up When Finished:</strong> When you\'re done conversing, simply hang up your phone. No trigger phrases like &ldquo;goodbye&rdquo; or &ldquo;exit&rdquo; are needed.</li>',
			'      </ol>',
			'      <div class="phone-guardrails-box">',
			'        <strong>⚡ Live Operating Guardrails:</strong>',
			'        <ul>',
			'          <li>5-minute session limit per call</li>',
			'          <li>1 call per 15 minutes per caller ID</li>',
			'          <li>30-minute GPU memory idle-unload timer</li>',
			'          <li>Automatic friendly deferral if host GPU is saturated by training</li>',
			'        </ul>',
			'      </div>',
			'    </div>',
			'  </div>',
			'</section>'
		].join("");
		document.body.appendChild(phoneWrapper);

		// 2. AI Chatbot Widget (Fixed Lower-Right on all screens)
		var chatWrapper = document.createElement("aside");
		chatWrapper.className = "portfolio-chat";
		chatWrapper.id = "portfolio-chat";
		chatWrapper.hidden = true;
		chatWrapper.innerHTML = [
			'<div class="chat-toggle-container">',
			'  <div class="chat-toggle-hint" aria-hidden="true">Ask Nemo AI</div>',
			'  <button class="portfolio-chat-toggle" type="button" aria-expanded="false" aria-controls="portfolio-chat-panel" title="Chat with Nemo AI" aria-label="Chat with Nemo, Andrew\'s Local AI">',
			'    <span class="chat-toggle-text">Ask Nemo</span>',
			'    <span class="chat-toggle-icon" aria-hidden="true">🤖</span>',
			'    <span class="chat-toggle-badge" aria-hidden="true">AI</span>',
			'  </button>',
			'</div>',
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
		document.body.appendChild(chatWrapper);

		var chatToggle = chatWrapper.querySelector(".portfolio-chat-toggle");
		var chatPanel = chatWrapper.querySelector(".portfolio-chat-panel");
		var chatClose = chatWrapper.querySelector(".portfolio-chat-close");
		var chatHint = chatWrapper.querySelector(".chat-toggle-hint");
		var clear = chatWrapper.querySelector(".portfolio-chat-clear");
		var form = chatWrapper.querySelector(".portfolio-chat-form");
		var input = chatWrapper.querySelector("#portfolio-chat-input");
		var messages = chatWrapper.querySelector(".portfolio-chat-messages");

		var phoneToggle = phoneWrapper.querySelector(".portfolio-phone-toggle");
		var phonePanel = phoneWrapper.querySelector(".portfolio-phone-panel");
		var phoneClose = phoneWrapper.querySelector(".portfolio-phone-close");
		var phoneCopyBtn = phoneWrapper.querySelector("#phone-copy-btn");

		var initialCheckDone = false;

		function setPhoneOpen(open) {
			if (!phonePanel) return;
			phonePanel.hidden = !open;
			phoneToggle.hidden = open;
			phoneToggle.setAttribute("aria-expanded", String(open));
			if (open) {
				setChatOpen(false, false);
			}
		}

		function setChatOpen(open, shouldFocus) {
			if (!chatPanel) return;
			chatPanel.hidden = !open;
			chatToggle.hidden = open;
			if (chatHint && open) chatHint.style.display = "none";
			chatToggle.setAttribute("aria-expanded", String(open));
			try {
				localStorage.setItem(STORAGE_OPEN_KEY, String(open));
			} catch (e) {}
			if (open) {
				setPhoneOpen(false);
				messages.scrollTop = messages.scrollHeight;
				if (shouldFocus) {
					setTimeout(function () {
						try { input.focus({ preventScroll: true }); } catch (error) { input.focus(); }
					}, 150);
				}
			}
		}

		phoneToggle.addEventListener("click", function () {
			setPhoneOpen(phonePanel.hidden);
		});

		phoneClose.addEventListener("click", function () {
			setPhoneOpen(false);
		});

		chatToggle.addEventListener("click", function () {
			setChatOpen(chatPanel.hidden, true);
		});

		chatClose.addEventListener("click", function () {
			setChatOpen(false, false);
		});

		// Auto-fade mobile hint after 7 seconds
		if (chatHint) {
			setTimeout(function () {
				chatHint.classList.add("fade-out");
				setTimeout(function () {
					if (chatHint.parentNode) chatHint.style.display = "none";
				}, 600);
			}, 7000);
		}

		if (phoneCopyBtn) {
			phoneCopyBtn.addEventListener("click", function () {
				try {
					navigator.clipboard.writeText("+19129153851").then(function () {
						phoneCopyBtn.textContent = "Copied! ✓";
						setTimeout(function () {
							phoneCopyBtn.textContent = "Copy Number 📋";
						}, 2000);
					});
				} catch (e) {
					phoneCopyBtn.textContent = "+1 (912) 915-3851";
				}
			});
		}

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
			setChatOpen(open, shouldFocus);
		}

		async function checkAvailability() {
			try {
				var response = await fetch(statusUrl, { cache: "no-store" });
				var data = await response.json();
				var available = response.ok && data.status === "online";
				chatWrapper.hidden = !available;
				phoneWrapper.hidden = !available;
				if (!available) {
					chatPanel.hidden = true;
					chatToggle.hidden = true;
					phonePanel.hidden = true;
					phoneToggle.hidden = true;
				} else if (!initialCheckDone) {
					phoneToggle.hidden = false;
					chatToggle.hidden = false;
					var wasOpen = false;
					try {
						wasOpen = localStorage.getItem(STORAGE_OPEN_KEY) === "true";
					} catch (e) {}
					if (wasOpen) setChatOpen(true, false);
				}
			} catch (error) {
				chatWrapper.hidden = true;
				phoneWrapper.hidden = true;
				chatPanel.hidden = true;
				chatToggle.hidden = true;
				phonePanel.hidden = true;
				phoneToggle.hidden = true;
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
				if (chatBtn.disabled) return;
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
					if (chatBtn) {
						chatBtn.disabled = false;
						chatBtn.textContent = "Chat with Nemo →";
						chatBtn.style.opacity = "";
						chatBtn.style.cursor = "";
					}
					if (data.chat) {
						if (promptEl && typeof data.chat.requests === "number") {
							promptEl.textContent = (118 + data.chat.requests).toLocaleString();
						}
						if (tokenEl && typeof data.chat.last_tokens_per_second === "number") {
							var sub = document.getElementById("stat-tokens-sub");
							if (sub) sub.textContent = data.chat.last_tokens_per_second + " tok/s · Local GPU";
						}
					}
				} else {
					if (chatBtn) {
						chatBtn.disabled = true;
						chatBtn.textContent = "AI Node Busy · Training";
						chatBtn.style.opacity = "0.55";
						chatBtn.style.cursor = "not-allowed";
					}
				}
			} catch (e) {
				if (chatBtn) {
					chatBtn.disabled = true;
					chatBtn.textContent = "AI Node Offline";
					chatBtn.style.opacity = "0.55";
					chatBtn.style.cursor = "not-allowed";
				}
			}

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
		"training-bias": {
			title: "Training Bias (Skewed Practice Material)",
			analogy: "Teaching an apprentice chef how to cook for a restaurant, but only ever giving them recipes for frosted birthday cakes—when a customer suddenly orders a steak and baked potato, the chef gets confused and pours sugar and vanilla frosting all over the beef.",
			techFact: "When an AI model is trained mostly on examples from one specific demographic or background, it makes inaccurate, erratic predictions whenever it encounters anyone outside that group."
		},
		"word-embeddings": {
			title: "Vector Embeddings (The Kitchen Spice Rack)",
			analogy: "Organizing an enormous spice cabinet by flavor: sweet baking spices like cinnamon, nutmeg, and allspice live right next to each other on the top shelf, while garlic powder, dried oregano, and crushed red pepper sit together on the savory rack. If you reach for a random jar near cinnamon, you are almost guaranteed to pull out something sweet.",
			techFact: "High-dimensional coordinate maps where computers convert words or tokens into numbers. Concepts used in similar contexts sit near each other in geometric vector space."
		},
		"disparate-impact": {
			title: "Disparate Impact (Unfair Passing Rates / The 80% Rule)",
			analogy: "A bowling alley requiring every single bowler to reach a hand-dryer mounted 7 feet high before they can step onto a lane. On paper, it sounds like one universal rule for everyone—in practice, it quietly locks out almost every child under age 12, even though height has zero connection to throwing a strike.",
			techFact: "A legal and statistical benchmark: if the approval rate for a protected demographic group is less than 80% (four-fifths) of the highest-performing group's rate, the algorithm is flagged for systemic disparate impact."
		},
		"equal-opportunity-diff": {
			title: "Equal Opportunity Difference",
			analogy: "Two students who studied the exact same 20 hours for a driving exam driving the identical test route. One tester passes their student with flying colors, while the other tester fails theirs for taking an extra two seconds to parallel park.",
			techFact: "Measures whether equally qualified candidates from different demographic groups have the exact same True Positive probability of being approved by the model."
		},
		"smote-resampling": {
			title: "SMOTE (Balancing Empty Shelves)",
			analogy: "A school history teacher noticing their textbook has 40 chapters about ancient Rome and only half a page about ancient Peru. To keep students from thinking Peru never existed, the teacher writes extra study guides and class handouts so students spend equal time learning both civilizations.",
			techFact: "Synthetic Minority Over-sampling Technique: creates synthetic, realistic variations between existing underrepresented data points to prevent algorithms from ignoring minority groups."
		},
		"decision-threshold": {
			title: "Decision Threshold (The Pass/Fail Line)",
			analogy: "Setting the high jump crossbar at track tryouts: lower the bar to 2 feet and virtually everyone makes the team (including folks who cannot jump); raise the bar to 7 feet and you turn away championship athletes having a slightly windy day.",
			techFact: "The numerical confidence cutoff (such as 0.50 or 0.65) where a model divides predictions into 'Approved' vs 'Rejected'. Shifting this line directly re-balances false alarms against missed opportunities."
		},
		"demographic-parity": {
			title: "Demographic Parity (Equal Representation)",
			analogy: "Handing out concert backstage passes equally across every row in the stadium, rather than letting the front row monopolize every single lanyard.",
			techFact: "Requires that the overall approval percentage is equal across demographic groups, regardless of differences in historical qualification base rates."
		},
		"nullspace-debiasing": {
			title: "Nullspace Debiasing (The Blind Audition Curtain)",
			analogy: "Grading symphony orchestra tryouts from behind an opaque cloth curtain: judges can hear the musician's tempo, pitch, tone, and musicality with crystal clarity, but they cannot see their age, gender, clothing, or pedigree.",
			techFact: "Mathematically projects embedding vectors into a subspace perpendicular to identified bias axes, erasing demographic associations without degrading the core semantic meaning of words."
		},
				"websocket-keepalive": {
			title: "WebSocket Keepalive Ping-Pong Heartbeat",
			analogy: "A busy bank teller shouting 'Are you still in line?' every 20 seconds while you are heads-down filling out a detailed deposit slip. If you are too focused on writing and do not shout back 'Yes, still here!' in time, the teller assumes you walked out, shreds your ticket, and calls the next customer. Having a dedicated listener thread is like having an assistant standing right next to you who instantly shouts 'Still here!' the moment the teller asks, so you never lose your place.",
			techFact: "RFC 6455 requires clients to reply to server Ping control frames (opcode 0x9) with matching Pong frames (opcode 0xA). If unanswered within the server timeout, the connection is forcefully severed with keepalive ping timeout."
		},
		"hashing-accuracy": {
			title: "Cryptographic Hashing Accuracy & Stale Shares",
			analogy: "A student solving a math test where every single equation is answered 100% correctly, but the classroom clock runs 5 minutes fast. Even though every answer is mathematically flawless, the proctor marks 40% of the exam papers as disqualified simply because the bell rang before the paper hit the turn-in basket.",
			techFact: "Mining pools only credit shares returned before the job expiration or socket timeout. Delayed submissions result in stale or rejected shares even if the computed mathematical nonce is completely valid."
		},
		"single-core-starvation": {
			title: "Single-Core CPU UI Starvation",
			analogy: "A one-person neighborhood bakery where the lone baker has to knead dough in the back kitchen and ring up customers at the cash register. If they start kneading a massive batch of bread and refuse to look up for 30 minutes, customers standing at the counter assume the shop is abandoned and walk out.",
			techFact: "On single-core processors without hyperthreading, a CPU-bound compute loop starves the operating system event loop, freezing user interface rendering, touch inputs, and background network sockets."
		},
		"event-loop-yielding": {
			title: "Event-Loop Yielding (Chunked setTimeout)",
			analogy: "That same lone baker rolling exactly 5 dinner rolls, pausing for 2 seconds to smile and greet whoever just walked through the front door, and then rolling the next 5 rolls—getting all the bread baked without ignoring a single customer.",
			techFact: "Breaking intense cryptographic computation into discrete batches and yielding control via setTimeout allows the browser's single thread to service rendering, garbage collection, and keepalive network packets."
		},
		"reverse-proxy-gateway": {
			title: "Reverse Proxy Bridge",
			analogy: "A multilingual hotel concierge standing between a vintage traveler who only writes letters with fountain pens in 19th-century Latin, and a modern airport check-in desk that only scans encrypted digital boarding passes on smartphones. The concierge takes the handwritten letter, stamps it with the hotel's certified seal, sends an official wire dispatch to the airline, and hands the traveler their confirmed paper boarding pass.",
			techFact: "A reverse proxy accepts connections from internal or legacy clients, handles TLS termination, authentication, or protocol translation, and forwards requests to modern upstream servers."
		},
		"kolka-difficulty": {
			title: "Kolka Difficulty Balancing",
			analogy: "A community Pinewood Derby race where inspectors weigh each wooden car before it hits the track. If an adult enters a car with a hidden rocket engine, the judges make them pull a miniature 50-pound iron sled so that the 8-year-old kids with regular wooden cars still have a completely fair and fun chance to compete.",
			techFact: "Duino-Coin's Kolka reward system dynamically adjusts mining difficulty and reward multipliers based on device performance and submission speed to prevent high-powered machines from crowding out low-power microcontrollers."
		},
"duino-mining": {
			title: "Duino-Coin (Micro-Scale Hardware Mining)",
			analogy: "A group of friends earning tiny copper pennies by solving mini crossword puzzles on cheap pocket notepads, rather than needing an entire factory of industrial laser printers to print currency.",
			techFact: "An accessible, low-power cryptocurrency designed to be mined on microcontrollers, vintage smartphones, and mobile devices using lightweight SHA-1 algorithms without heavy electrical draw."
		},
		"diskless-ram": {
			title: "Diskless RAM Overlay (Running on Pure Memory)",
			analogy: "Working entirely on a clean dry-erase whiteboard rather than carving words into a brittle stone slab: you can write, erase, and draw at lightning speed, and if the power cuts out, you just wipe the board clean without cracking any stone.",
			techFact: "Operating system runtimes (like custom Slax Linux) that load entirely into physical RAM memory from a USB flash drive. The system operates completely without spinning mechanical hard drives, immune to disk wear or filesystem corruption."
		},

		"cache-archive": {
			title: "Cache Archives & Temporary Clutter",
			analogy: "Buying groceries and saving every single brown paper grocery bag and plastic takeout container in your kitchen cabinet 'just in case'—eventually, the cabinets are bursting and you have no room for actual food.",
			techFact: "Programs save temporary installer files, download caches, and crash logs to speed up repeated tasks. Over months, these hidden archives quietly hoard tens of gigabytes of your primary drive until manually cleared out."
		},
		"dot-local-domain": {
			title: ".local Domain (Multicast Network Discovery)",
			analogy: "Calling out someone's nickname across the dinner table to pass the salt, instead of hiring a postal carrier to drive an envelope across town and back.",
			techFact: "The .local top-level domain uses Multicast DNS (mDNS) to discover devices directly on your physical home Wi-Fi without needing an external public DNS server or domain registrar."
		},
		"doh-private-relay": {
			title: "Apple DoH & iCloud Private Relay",
			analogy: "Writing a note to your next-door neighbor, but handing it to an armored courier who drives it 50 miles away to a private post office before bringing it right back to your street—keeping your local neighborhood mailman completely out of the loop.",
			techFact: "DNS-over-HTTPS (DoH) and Apple's Private Relay encrypt domain lookups and route them through Apple proxy relays. While great for privacy on public Wi-Fi, it unintentionally bypasses local home network DNS servers like AdGuard Home."
		},
		"homelab-silicon": {
			title: "Local Silicon vs. Cloud Renting",
			analogy: "Baking fresh bread in your own kitchen oven with your own flour and pans, rather than ordering delivery slices from an industrial bakery across the country.",
			techFact: "Computer processors (CPUs, GPUs, and Apple M-series chips) are manufactured out of etched semiconductor silicon wafers. 'Running on local silicon' means computing directly on physical hardware in your room rather than renting someone else's server in the cloud."
		},
		"ptm7950": {
			title: "Honeywell PTM7950 Phase-Change Material",
			analogy: "A chilled butter pad that stays solid and neat on your plate while you slice it, but melts into smooth liquid the second it touches hot toast to fill every single nook and cranny.",
			techFact: "PTM7950 is an advanced polymer phase-change material that transitions from solid to liquid at 45°C. It creates flawless thermal contact between a hot processor and a copper heatsink without pumping out, leaking, or drying out over time."
		},
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
				"encrypted-mesh": {
			title: "Encrypted Mesh Network (Tailscale / WireGuard)",
			analogy: "Think of an invisible, private underground tunnel connecting only your own personal devices. Even if your phone is in a coffee shop in Chicago, your laptop is in a hotel, and your server is in your home in Michigan, they whisper to each other through scrambled codes that no outsider, ISP, or hacker can intercept or eavesdrop on.",
			techFact: "A peer-to-peer overlay network built on modern WireGuard cryptography (ChaCha20-Poly1305 authentication). Nodes establish direct, authenticated UDP links across NATs and firewalls without routing traffic through vulnerable public ports."
		},
		"confusion-matrix": {
			title: "Confusion Matrix (Decision Tally Sheet)",
			analogy: "Like an automated optical quality-control scanner inspecting smartphones on an assembly line: it doesn't just grade whether the camera was 'right or wrong', it breaks down every single decision into four specific piles—catching real cracked screens before shipping (True Positives), waving through flawless phones to packaging (True Negatives), sounding false alarms on a harmless speck of dust (False Positives), and loose buttons that accidentally slipped past (False Negatives).",
			techFact: "A 2x2 contingency table tabulating True Positives (TP), False Positives (FP), True Negatives (TN), and False Negatives (FN) to expose classification blindspots."
		},
		"precision-score": {
			title: "Precision (The 'Wolf Cry / Trust' Score)",
			analogy: "Like a spam filter: when it flags an email as Spam, how often is it truly junk versus accidentally throwing away an urgent note from your boss? High precision means when the AI sounds an alarm, you can bet money it's right.",
			techFact: "TP / (TP + FP). Measures the ratio of true positive outcomes among all positive predictions made by the model."
		},
		"recall-score": {
			title: "Recall / Sensitivity (The 'Safety Net / Catch' Score)",
			analogy: "Like a smoke detector in your home: out of all the fires that could break out, how many does the detector successfully catch without sleeping through a single one? High recall means virtually nothing slips past.",
			techFact: "TP / (TP + FN). Also known as the True Positive Rate (TPR), measuring the proportion of actual positives that were correctly discovered."
		},
		"specificity-score": {
			title: "Specificity (The 'Calm Guard Dog' Score)",
			analogy: "Like a well-trained guard dog: out of all the harmless neighborhood mail carriers who walk past the house, how good is the dog at staying calm and NOT barking? High specificity means low false alarms.",
			techFact: "TN / (TN + FP). The True Negative Rate (TNR), evaluating how effectively a classifier avoids incorrectly flagging negative instances."
		},
		"f1-score": {
			title: "F1-Score (The Balanced Gold Standard)",
			analogy: "Like evaluating a baseball hitter by both home runs AND avoiding strikeouts: a player who only steps up to bat once a season and hits one home run has a 1.000 average, but is useless to the team. The F1-score prevents the AI from cheating by taking the harmonic mean of aggressive catching (Recall) and cautious accuracy (Precision).",
			techFact: "Harmonic mean 2 * (Precision * Recall) / (Precision + Recall). Punishes extreme imbalances between false positives and false negatives."
		},
		"mcc-score": {
			title: "Matthews Correlation Coefficient (The 'No-Cheating' Report Card)",
			analogy: "Like a test grader that penalizes blind guessing: even if a true/false exam is 95% 'True' and a lazy student writes 'True' on every single answer, MCC gives them a 0. It runs on a scale from -1.0 to +1.0, where 0 is random guessing and +1.0 is a 100% genuine psychic.",
			techFact: "Balanced correlation coefficient taking all four quadrants of the confusion matrix into account; robust against severe class imbalances."
		},
		"shannon-entropy": {
			title: "Shannon Information Entropy (The 'Surprise / Chaos' Meter)",
			analogy: "Like the weather forecast in the Sahara desert versus Michigan in April: predicting sunshine in the Sahara has zero surprise (0 bits entropy). But predicting Michigan weather has maximum chaos and high surprise (~1.0 bit entropy). High entropy means the coin flips are pure wild chaos; low entropy means there is an obvious pattern.",
			techFact: "H(X) = - sum(p * log2(p)). Formulated by Claude Shannon in 1948 to quantify fundamental uncertainty in information theory, capped at 1.0 bit for fair coins."
		},
		"bce-loss": {
			title: "Binary Cross-Entropy Loss (The 'Shock & Penalty' Score)",
			analogy: "Like betting money with your friends: if you bet $100 with supreme confidence that a coin will land Heads, and it lands Tails, you lose your shirt (huge loss penalty). But if you say 'I think it might be Heads, but I'm only 52% sure', the penalty for missing is gentle. Loss measures how shocked and punished the AI is when its predictions miss reality.",
			techFact: "L = - [y * log(yHat) + (1-y) * log(1 - yHat)]. The foundational logarithmic loss function for training binary classification neural networks."
		},
		"snr-db": {
			title: "Signal-to-Noise Ratio (The 'Car Radio in a Tunnel' Test)",
			analogy: "Like driving your car through a tunnel while listening to your favorite radio station: when the music is clear, SNR is high (clean signal). As static and fuzz creep in, you can still hum the melody until the static completely overpowers the music (0 dB). This test proves our AI still hears the coin pattern through 20% static!",
			techFact: "Decibel ratio 10 * log10(Signal / Noise). Quantifies how much useful underlying pattern remains audible over corrupt random distortion."
		},
		"empirical-win-rate": {
			title: "Empirical Win-Rate (Actual Track Record)",
			analogy: "Like a baseball hitter's batting average in real regular-season games versus their theoretical batting average in batting cages. Rather than guessing based on theory, empirical win-rate tallies the exact percentage of coin flips the AI actually predicted correctly during live interactive tosses.",
			techFact: "The observed ratio of successful classifications to total trials: Win Rate = (True Positives + True Negatives) / Total Flips. Measures real-world model accuracy against the 50.0% null hypothesis baseline."
		},
		"noise-injected": {
			title: "Noise Injected (Static / Distortion Rate)",
			analogy: "Like turning up static on an old FM car radio or having someone whisper random wrong numbers while you're tallying bills. At 0%, the sequence is crystal-clear; at 50%, it becomes pure white noise where half the records have been scrambled into garbage.",
			techFact: "The percentage rate (from 0% clean to 50% pure white noise) at which ground-truth binary trial labels in the sequence are randomly flipped or corrupted before feeding them into the neural classifier."
		},
		"noise-perturbation": {
			title: "Noise Perturbation (The 'Stress-Test Shaking' Drill)",
			analogy: "Like testing an airplane's wings in an extreme turbulence wind tunnel, or having a quarterback practice throwing while defenders bump into him. It deliberately shakes and distorts the input data to ensure the AI doesn't fall apart when conditions get messy.",
			techFact: "The deliberate introduction of random errors, jitter, or label-flipping into input sequences to evaluate model robustness, generalization stability, and degradation thresholds under non-ideal conditions."
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
		},
		"webassembly": {
			title: "WebAssembly (WASM)",
			analogy: "Think of standard JavaScript like an interpreter reading a foreign book out loud sentence by sentence, while WebAssembly is like having the book pre-printed in machine code that your computer's CPU reads and executes directly at near-instant, lightning speed.",
			techFact: "A low-level binary code format (WASM) executed by modern web browsers in a sandboxed runtime at near-native speed, allowing heavy C, C++, and C# game engines to run on the web."
		},
		"cors-protocol": {
			title: "Cross-Origin Security & Protocol Boundaries (CORS)",
			analogy: "A strict security guard at an office building with a strict clipboard. If a web page asks to pull raw binary data directly off your hard drive (file://), the guard blocks it on the spot unless the request comes through an official HTTP front door with verified credentials.",
			techFact: "A browser security boundary preventing client-side scripts from streaming binary assets across different origins or the local file:// protocol without a valid HTTP server response."
		},
		"content-encoding": {
			title: "HTTP Content-Encoding (Brotli & Gzip)",
			analogy: "Receiving a vacuum-sealed travel bag in the mail. If the box has a prominent label saying 'Vacuum Packed' (the Content-Encoding header), you know to open the valve to expand it. Without that label, you try to read the wrinkled, compressed lump as-is and it makes zero sense.",
			techFact: "An HTTP response header informing the browser that a payload was compressed on the server (using Gzip or Brotli), signaling the client to decompress the binary stream before execution."
		},
		"emscripten": {
			title: "Emscripten Compiler Toolchain",
			analogy: "A high-tech adapter kit that takes an engine engineered for a gas racecar (Unity in C# and C++) and rebuilds it so it fits seamlessly inside an electric vehicle (the web browser), translating hardware steering and pedals into web canvas clicks and keyboard events.",
			techFact: "An LLVM-to-WebAssembly compiler toolchain that compiles C and C++ codebases into WebAssembly, WebGL, and JavaScript glue code."
		},
		"windows-sandbox": {
			title: "Windows Sandbox (Ephemeral Hypervisor)",
			analogy: "A disposable hazmat testing room made of unbreakable glass: you bring in volatile chemicals to observe their reactions, and the moment you close the door, the entire room incinerates itself clean without a single molecule leaking into your home.",
			techFact: "A lightweight, ephemeral virtual machine built on Microsoft Hyper-V virtualization and kernel isolation. Every session boots from a clean Windows snapshot and completely discards all state, registry changes, and memory upon exit."
		},
		"ransomware": {
			title: "Cryptographic Ransomware",
			analogy: "A burglar who slips into your office library, puts unbreakable military-grade combination padlocks on every single filing cabinet and book, throws away the keys, and leaves a demand note for the combinations.",
			techFact: "Malicious software that traverses local and network storage volumes, systematically encrypting user files, databases, and system binaries using asymmetric (RSA/AES) cryptography and deleting volume shadow copies."
		},
		"screen-locker": {
			title: "Screen Locker & Winlocker",
			analogy: "An aggressive intruder who chains your front doorway from the outside and refuses to unlock it until you pay a toll, even though your furniture and personal belongings inside are completely untouched.",
			techFact: "A non-destructive class of malware that hooks low-level keyboard/mouse events, replaces the desktop shell (explorer.exe), or renders a topmost borderless window to prevent user interaction until an unlock key or fee is provided."
		},
		"polymorphic-virus": {
			title: "Polymorphic File Infector",
			analogy: "A master of disguise who changes clothes, wigs, glasses, and gait every time they walk into a bank so static security camera facial recognition never matches their picture, even though their mission remains identical.",
			techFact: "Malicious code that mutates its internal binary signature, decryption routines, or instruction sequences with every infection cycle while preserving its core payload, evading traditional hash-based antivirus signatures."
		},
		"smartscreen": {
			title: "Windows Defender SmartScreen",
			analogy: "A sharp security guard at the building lobby who checks a global digital guest registry before letting any unknown delivery inside; if a package has no verified sender or reputation, the guard raises a red barrier and halts entry.",
			techFact: "A cloud-powered reputation service integrated into Windows that checks downloaded executable signatures and hashes against global Microsoft telemetry to warn users before launching untrusted binaries."
		},
		"fork-bomb": {
			title: "UI Fork Bomb (Process Spawner)",
			analogy: "A magical trick mirror box where touching one reflection causes two more to sprout, and touching either of those spawns four more, quickly filling the room until everyone is squeezed against the walls and can't breathe.",
			techFact: "A process that recursively duplicates itself or loops dialog box creation exponentially, consuming memory, GDI handles, and window message queues until the operating system shell locks up."
		},
		"rogue-antivirus": {
			title: "Rogue Antivirus & Scareware",
			analogy: "A phony mechanic who peers under your car's hood, points to harmless road dust on an air filter, panics that your engine will explode in 30 seconds, and demands $300 on the spot for a magic potion to fix a fake problem.",
			techFact: "Deceptive software that impersonates legitimate antivirus programs, simulates file scanning animations, and reports fabricated malware infections to frighten victims into paying for fraudulent software or installing spyware."
		},
		"volume-shadow-copies": {
			title: "Volume Shadow Copies (VSS)",
			analogy: "An automatic background time-machine camera that takes invisible snapshots of all your files before major changes, allowing you to instantly roll back to yesterday's exact photo if a document gets ruined.",
			techFact: "A Windows storage service (VSS) that creates differential point-in-time backup snapshots of disk volumes, enabling fast system restores and file version rollbacks."
		},
		"wasm-memory-heap": {
			title: "WebAssembly Linear Memory Heap (TOTAL_MEMORY)",
			analogy: "Reserving a dedicated block of parking spots in a garage for your crew before the road trip begins. If you only reserve room for compact cars (256 MB) but your team shows up with loaded trucks (500 MB), the gate won't open; but reserve too much, and the whole garage locks up.",
			techFact: "The contiguous linear memory buffer allocated by the browser for a WebAssembly module, defining the maximum memory heap available for textures, physics, and game variables."
		},
		"banking-trojan": {
			title: "Banking Trojan (e.g. DanaBot)",
			analogy: "Like an undercover identity thief who slips behind the bank teller desk, watching your hands as you enter your PIN and forging your signature before you even finish the transaction.",
			techFact: "A modular malware family designed to capture web banking credentials, inject rogue HTML forms into financial portals, and intercept multi-factor authentication tokens."
		},
		"byovd": {
			title: "BYOVD (Bring Your Own Vulnerable Driver)",
			analogy: "Like an intruder who can't pick a military vault's lock, so they find an old, legally certified maintenance master key that had a known design defect, carrying it inside to unlock the security vault with official permission.",
			techFact: "Bring Your Own Vulnerable Driver is an evasion attack where threat actors drop legitimate, cryptographically signed third-party kernel drivers with known flaws to bypass Windows kernel driver signing and disable security defenses."
		},
		"hvci": {
			title: "HVCI (Hypervisor-Protected Code Integrity)",
			analogy: "Like an armed guard stationed inside an isolated bulletproof checkpoint who scrutinizes the digital hologram on every single worker badge before opening the door to the machine room.",
			techFact: "Hypervisor-protected Code Integrity runs kernel mode validation inside an isolated Virtual Secure Mode (VSM), ensuring only cryptographically verified code executes in the OS kernel."
		},
		"chroot": {
			title: "Chroot Jail / Container Userland",
			analogy: "Like renting a room in a building and changing the lock on that single door so the tenant can never see the hallway or any other apartment in the complex.",
			techFact: "A chroot changes the perceived root directory (/) for an isolated process tree, preventing it from reading or modifying system files outside that sandbox folder."
		},
		"selinux": {
			title: "SELinux (Security-Enhanced Linux)",
			analogy: "Like an unbending corporate compliance officer who checks a thick binder of department rulebooks before letting anyone touch a filing cabinet—even if you're the building owner (root), if the rule isn't written down, you're denied.",
			techFact: "Security-Enhanced Linux implements Mandatory Access Control (MAC) via kernel security policies, confining processes and file contexts even when run by the root user."
		},
		"smb": {
			title: "SMB (Server Message Block)",
			analogy: "Like an inter-office motorized file cart that rolls between desks on the same floor, allowing coworkers to view and modify shared folders as if they were sitting on their own desk.",
			techFact: "SMB is an application-layer network protocol primarily used by Windows and Samba for sharing files, printers, and serial ports over a local TCP/IP network (port 445)."
		},

		"rsat": {
			title: "RSAT (Remote Server Administration Tools)",
			analogy: "Like a universal management remote that lets building superintendents adjust lights, keycards, and elevator permissions across all company skyscrapers right from their living room sofa.",
			techFact: "RSAT provides administrative consoles (Active Directory Users & Computers, Group Policy, DNS) enabling IT engineers to manage Windows Server roles remotely from a client workstation."
		},
		"sodimm": {
			title: "SO-DIMM RAM Module",
			analogy: "Like the physical surface area of your workbench: the wider your desk, the more active tools and blueprints you can keep within arm's reach simultaneously before having to put them away into filing drawers (the hard drive).",
			techFact: "Small Outline Dual In-line Memory Modules are compact RAM boards designed for laptops and mini-PCs, providing high-speed volatile scratchpad storage directly accessible by the CPU memory controller."
		},
		"proot": {
			title: "PRoot (Unprivileged Chroot Emulator)",
			analogy: "Like wearing augmented-reality glasses that trick your software into believing it's running inside a completely different operating system without needing permission from the landlord.",
			techFact: "PRoot uses the ptrace system call to intercept and rewrite filesystem calls in user space, emulating chroot, mount, and root permissions on unrooted Android devices."
		},
		"sysmon": {
			title: "Microsoft Sysmon (System Monitor)",
			analogy: "Like a high-speed black-box flight recorder installed in your computer's engine room, logging every single ignition spark, door opening, and wire connection with a timestamp.",
			techFact: "Sysmon is a Windows system service and device driver that monitors and logs detailed system activity (process creation, network connections, file changes) to the Windows Event Log."
		},
		"conky": {
			title: "Conky System Monitor",
			analogy: "Like a transparent fighter-jet heads-up display (HUD) projected directly onto your windshield, showing fuel levels, engine RPM, and temperature without blocking your view of the road.",
			techFact: "Conky is a lightweight, highly configurable desktop system telemetry monitor for X11/Wayland that renders live CPU, RAM, network, and storage stats directly on the root desktop window."
		},
		"busybox": {
			title: "BusyBox (The Swiss Army Knife of Embedded Linux)",
			analogy: "Like a pocket multi-tool that combines a screwdriver, pliers, scissors, and bottle opener all into one tiny folding handle instead of carrying an entire 50-pound mechanics toolbox.",
			techFact: "BusyBox combines tiny versions of many standard UNIX utilities into a single multi-call binary, extensively used in embedded devices, initramfs, and Alpine Linux."
		},
		"x11vnc": {
			title: "X11VNC Desktop Server",
			analogy: "Like a live high-definition security camera pointing at your desk display paired with an electronic mirror that lets you reach in through the glass from another room to move the mouse and type.",
			techFact: "X11VNC is a VNC server that shares an existing X11 desktop display rather than creating an artificial virtual framebuffer, allowing real-time remote GUI interaction."
		},
		"ssms": {
			title: "Microsoft SQL Server Management Studio (SSMS)",
			analogy: "Like the master control desk of a giant digital library that lets researchers query millions of catalog card drawers, re-index shelves, and inspect visitor permissions with precision commands.",
			techFact: "SSMS is an integrated environment for configuring, managing, and administering all components within Microsoft SQL Server, featuring graphical query design, execution plans, and Transact-SQL (T-SQL) editors."
		},
		"fat32-vs-ntfs": {
			title: "FAT32 vs. NTFS Filesystems",
			analogy: "Like an open spiral-bound notebook that any kid can write in with no locks (FAT32) versus a biometric security binder with per-page authorization stamps and an automatic paper-jam rewind journal (NTFS).",
			techFact: "FAT32 is a legacy filesystem with universal device compatibility but a 4GB file size limit and no Access Control Lists (ACLs); NTFS provides journaled reliability, file permissions, and multi-terabyte volume scaling."
		},
		"bitlocker": {
			title: "BitLocker Drive Encryption",
			analogy: "Like putting all contents of a metal shipping crate into an unbreakable digital cipher safe that scrambles into meaningless static the second it is unplugged from the authorized truck.",
			techFact: "BitLocker provides full-volume encryption using AES-128 or AES-256 with TPM hardware key binding, protecting offline data from unauthorized drive extraction."
		},
		"john-the-ripper": {
			title: "John the Ripper (Hash Cracking Suite)",
			analogy: "Like a rapid-fire master locksmith who feeds thousands of known key patterns into a mysterious lock in fractions of a second to discover which exact key cuts produced the lock.",
			techFact: "John the Ripper is an open-source password security auditing tool that tests dictionary wordlists and rule permutations against cryptographic hash algorithms (MD5, SHA, NTLM) to identify weak passwords."
		},
		"gdi": {
			title: "Windows GDI (Graphics Device Interface)",
			analogy: "Like the mechanical drawing arm inside an architect's drafting desk that draws lines, shapes, and text onto the computer screen on command.",
			techFact: "GDI is the legacy 2D graphics subsystem in Windows responsible for rendering lines, curves, fonts, and bitmaps to display devices and printers."
		},
		"aduc": {
			title: "Active Directory Users & Computers (ADUC)",
			analogy: "Like the central HR filing room for an entire 10,000-person corporation, where employee badges, job titles, department access cards, and password resets are all maintained.",
			techFact: "ADUC is the primary MMC snap-in for managing Active Directory Domain Services (AD DS) objects, including user accounts, security groups, organizational units (OUs), and computer join states."
		},
		"rdp": {
			title: "RDP (Remote Desktop Protocol)",
			analogy: "Like an ultra-long virtual monitor cable and wireless keyboard receiver stretching across the country, letting you interact with an office PC as if you were sitting right in front of it.",
			techFact: "RDP is a proprietary Microsoft network protocol running on TCP port 3389 that provides graphical user interface remote management with display caching and input redirection."
		},
		"forensics-disk-image": {
			title: "Forensic Disk Image (E01 / Raw DD)",
			analogy: "Like creating an exact molecular wax cast of a physical key or crime scene footprint before examining it, so the original evidence is never altered or contaminated.",
			techFact: "A bit-stream forensic disk image copies every single sector (allocated and unallocated) along with cryptographic hash verification (MD5/SHA1) to preserve chain of custody."
		},
		"thermal-paste": {
			title: "Thermal Interface Material (TIM / Heatsink Paste)",
			analogy: "Like spreading a thin layer of heat-conducting butter between two rough cast-iron pans pressed together, squeezing out every microscopic pocket of trapped air so heat flows freely.",
			techFact: "Thermal paste fills microscopic air voids between the CPU integrated heat spreader (IHS) and the heatsink baseplate, replacing poorly conducting air with high-conductivity compound."
		},
		"cloud-vm": {
			title: "Cloud Virtual Machine (Azure / GCP)",
			analogy: "Like renting a fully furnished apartment on the 40th floor of a giant skyscraper for an afternoon, using its power and high-speed elevator, and checking out when your work is done.",
			techFact: "Cloud VMs run on hypervisor-managed enterprise server clusters (Azure Hyper-V, GCP KVM), providing elastically provisioned virtual CPUs, RAM, and storage on demand."
		},
		"phone-link": {
			title: "Microsoft Phone Link (Cross-Device Integration)",
			analogy: "Like a mirrored display window on your desk monitor that relays notifications, photos, and calls from the smartphone in your coat pocket without needing to pull it out.",
			techFact: "Microsoft Phone Link uses Bluetooth and Wi-Fi Direct/LAN tunnels to synchronize SMS messages, push notifications, and calls between mobile devices and Windows."
		},
		"odata": {
			title: "OData (Open Data Protocol)",
			analogy: "Like a universal restaurant ordering form where you can check specific boxes to filter out onions, sort dishes by price, and only receive the exact side orders you asked for in a neat package.",
			techFact: "OData defines a standard set of best practices for building and consuming RESTful APIs, enabling clients to query and filter relational datasets using URL parameters ($filter, $select, $orderby)."
		},
		"uefi-firmware": {
			title: "UEFI / BIOS Firmware",
			analogy: "Like the computer's biological brainstem: before the conscious mind (the operating system) wakes up, it handles breathing, checks heartbeats, and tests all limbs to verify the body is alive.",
			techFact: "Unified Extensible Firmware Interface (UEFI) is low-level platform code stored in non-volatile flash ROM that initializes hardware components and hands control to the OS bootloader."
		},
		"mfa": {
			title: "Multi-Factor Authentication (MFA / 2FA)",
			analogy: "Like entering a bank vault that requires both a physical brass key that you carry in your pocket AND a unique one-time SMS or fingerprint scan from the security guard at the door.",
			techFact: "MFA verifies digital identity by requiring two or more distinct credential categories: something you know (password), something you have (phone/token), or something you are (biometrics)."
		},
		"powershell": {
			title: "PowerShell (Object-Oriented Automation)",
			analogy: "Like an intelligent factory conveyor belt that passes actual complete parts (rich data objects) between workers, rather than just shouting raw text numbers down the hallway.",
			techFact: "PowerShell is Microsoft's cross-platform automation shell that passes structured .NET objects between cmdlets rather than unformatted text streams."
		},
		"active-directory": {
			title: "Active Directory (Enterprise Identity Service)",
			analogy: "Like a master corporate credential registry that issues a single photo ID badge granting access to every office room, elevator, and printer across 50 company buildings.",
			techFact: "Active Directory Domain Services (AD DS) provides centralized user identity, Kerberos authentication, and Group Policy management across enterprise domains."
		},
		"ssh": {
			title: "SSH (Secure Shell Protocol)",
			analogy: "Like an encrypted private phone line connecting your keyboard directly to a remote server, ensuring that no eavesdropper on the local network can read passwords or keystrokes.",
			techFact: "SSH is a cryptographic network protocol operating on TCP port 22 for secure remote administration and encrypted command execution."
		},
		"dwdm": {
			title: "DWDM (Dense Wavelength Division Multiplexing)",
			analogy: "Shining dozens of flashlights of completely different rainbow colors down the exact same hollow glass tube at the same moment. Even though they travel together down the same pipe, each color beam never gets mixed up and can be separated cleanly at the other end.",
			techFact: "DWDM (Dense Wavelength Division Multiplexing) packs up to 96+ distinct optical wavelengths (colors of light) into a single hair-thin glass strand, scaling deep-sea subsea cables to transport hundreds of Terabits per second across oceans."
		},
		"subsea-fiber": {
			title: "Subsea Optical Fiber Cable",
			analogy: "A heavy garden hose wrapped in thick steel armor and waterproof tar laying across thousands of miles of pitch-black ocean floor, carrying microscopic laser pulses back and forth between continents at nearly the speed of light.",
			techFact: "Submarine telecommunications cables span over 1.4 million kilometers across ocean seabeds, carrying over 99% of all international intercontinental data traffic using silica glass fiber pairs."
		},
		"ixp": {
			title: "Internet Exchange Point (IXP)",
			analogy: "A giant international airport terminal where dozens of different airlines park their planes at adjacent gates, allowing passengers to switch flights by walking across the hallway rather than flying to another city first.",
			techFact: "An Internet Exchange Point (IXP) is a physical data center facility where Internet Service Providers (ISPs), CDNs, and backbone carriers connect their autonomous systems together directly via BGP peering without paying third-party transit fees."
		},
		"cable-landing-station": {
			title: "Cable Landing Station (CLS)",
			analogy: "The coastal ferry dock where giant ocean car carriers pull up to shore, offloading thousands of vehicles directly onto the coastal highway system.",
			techFact: "A Cable Landing Station (CLS) is a hardened terrestrial shore facility where undersea submarine cables emerge from the ocean bed, housing high-voltage power feed equipment (PFE) and optical terminal transmission equipment (SLTE)."
		},
		"bgp-peering": {
			title: "BGP Peering (Border Gateway Protocol)",
			analogy: "Two major courier companies agreeing to open an interior doorway between their adjacent sorting warehouses, so they can hand packages directly to each other instead of buying retail postage stamps.",
			techFact: "Border Gateway Protocol (BGP) is the routing protocol of the global internet. Peering allows two independent network autonomous systems (AS) to exchange routing prefixes and traffic directly on equal settlement-free terms."
		},
		"beach-manhole": {
			title: "Beach Manhole (BMH)",
			analogy: "The underground concrete cellar hatch right near the tide line where heavy reinforced outdoor storm pipes transition into lightweight indoor household plumbing.",
			techFact: "A Beach Manhole (BMH) is a reinforced concrete chamber built just above the high-water shoreline where heavily armored wet-plant ocean cables are anchored, spliced, and transitioned into lighter terrestrial duct cables heading inland."
		},
		"power-feed-equipment": {
			title: "Power Feed Equipment (PFE)",
			analogy: "An ultra-high-voltage power plant on shore pumping thousands of volts down a single continuous copper wire buried in the seabed, keeping emergency water pumps running along thousands of miles of underwater pipeline.",
			techFact: "Power Feed Equipment (PFE) delivers constant direct current (typically up to 10,000–15,000 Volts DC at ~1 Ampere) through the cable's internal copper conductor to power underwater optical repeaters stationed every 50–100 km across the ocean."
		},
		"dark-fiber": {
			title: "Dark Fiber",
			analogy: "Building an 8-lane concrete highway through the countryside but leaving 6 lanes unpainted with no toll booths open yet, ready to be used the second traffic surges in future years.",
			techFact: "Dark fiber refers to unlit optical fiber strands laid in the ground or seabed that currently have no laser transmitters or receivers attached, providing reserve capacity for future network expansion without digging up new cables."
		},
		"tbps": {
			title: "Tbps (Terabits Per Second)",
			analogy: "Water flowing through a pipe so massive that an entire Olympic swimming pool's worth of water pours through every single second.",
			techFact: "One Terabit per second (1 Tbps) equals 1,000 Gigabits per second, or 1,000,000,000,000 bits per second—enough capacity to stream hundreds of thousands of simultaneous 4K HDR movies concurrently."
		},
		"tier-1-carrier": {
			title: "Tier 1 Transit Carrier",
			analogy: "The global railroad owner that owns all the primary coast-to-coast transcontinental rail tracks: they never have to pay a toll to anyone else to run their trains, while every local commuter train must pay them for track access.",
			techFact: "A Tier 1 network is an Internet Service Provider (ISP) with a global reach that can reach every other network on the internet entirely through settlement-free peering agreements without paying for upstream IP transit."
		},
		"subsea-repeater": {
			title: "Subsea Optical Repeater (EDFA)",
			analogy: "Relay runners stationed every few miles along a 100-mile mountain trail, grabbing the baton from an exhausted runner and sprinting forward at full speed so momentum is never lost.",
			techFact: "Subsea optical repeaters use Erbium-Doped Fiber Amplifiers (EDFA) placed every 50 to 90 km along the seabed to re-amplify decaying laser signals optically without converting photons into electrical signals."
		},
		"optical-transit-arc": {
			title: "Optical Transit Arc",
			analogy: "A non-stop express bullet train shuttling between two major capitals on a dedicated elevated monorail without making a single intermediate stop.",
			techFact: "High-capacity point-to-point optical wavelength circuits running between core Tier 1 data centers, routing tens of Terabits of intercontinental traffic over pre-provisioned photonic paths."
		},
		"webgl": {
			title: "WebGL 3D Planetary Graphics",
			analogy: "An architect spinning a glowing, physical miniature globe on a display pedestal in a showroom, letting you walk around and zoom into any corner with your own eyes.",
			techFact: "WebGL (Web Graphics Library) is a JavaScript API for rendering high-performance 2D and 3D computer graphics inside any standard web browser using the device's hardware graphics card (GPU) without third-party plugins."
		},
		"telegeography": {
			title: "TeleGeography Telecom Cartography",
			analogy: "An international oceanographic atlas that meticulously maps every underwater shipping lane, lighthouse, and port across all seven seas.",
			techFact: "TeleGeography is the industry-standard telecommunications market research and cartography firm that tracks global submarine cables, landing stations, bandwidth pricing, and international fiber routes."
		},
	
		"fast-pair-uuid": {
			title: "Fast Pair UUID 0xFE2C (Bluetooth Handshake Badge)",
			analogy: "Think of it like wearing a bright yellow backstage VIP wristband at a concert: the bouncers (your phone) immediately recognize the wristband from across the room and wave you right through the door without demanding your passport or making you fill out a 3-page visitor log.",
			techFact: "A registered 16-bit Bluetooth Low Energy service identifier. Accessories broadcast this short code so nearby Android and compatible devices immediately display an automatic one-tap connection card with the accessory's picture and name."
		},
		"bluetooth-classic-a2dp": {
			title: "Bluetooth Classic & A2DP (The Firehose Audio Highway)",
			analogy: "Think of it like a heavy firehose pumping gallons of water per second into a swimming pool: it is unbeatable for blasting rich, continuous high-quality stereo sound, but the hose is thick, heavy, and drains the battery reservoir rapidly.",
			techFact: "Advanced Audio Distribution Profile on Bluetooth Classic: streams uncompressed or high-bitrate audio (SBC, AAC, LDAC) at 250-990 kbps over dedicated radio channels, requiring continuous radio power."
		},
		"bluetooth-low-energy": {
			title: "Bluetooth Low Energy / BLE (The Pocket Walkie-Talkie)",
			analogy: "Think of it like tapping someone on the shoulder once every ten minutes to whisper 'Left battery 85%' or 'Switch to Noise Cancelling': it consumes almost zero electrical power, but cannot stream a continuous song.",
			techFact: "A low-power 2.4 GHz radio specification optimized for transmitting small attribute packets intermittently. Devices run for months on coin-cell batteries while sleeping 99% of the time."
		},
		"corebluetooth": {
			title: "Apple CoreBluetooth (The Strict Courthouse Guard)",
			analogy: "Think of it like a courthouse security checkpoint with a metal detector: if a visitor doesn't have an approved, pre-authorized plastic visitor badge pinned to their jacket, the guard turns them away at the front door without even asking for their name.",
			techFact: "Apple's native iOS framework for managing BLE peripherals. It aggressively filters scan results and strips device names unless an app explicitly requests approved service UUIDs or initiates open discovery."
		},
		"web-bluetooth-api": {
			title: "Web Bluetooth API (Browser Hardware Bridge)",
			analogy: "Think of it like a website for a smart lightbulb being able to reach right out through your computer monitor, walk into your living room, and twist the bulb on without requiring you to download an app from an app store.",
			techFact: "A standardized W3C browser interface allowing web applications to directly scan, pair, read, and write GATT characteristics to local Bluetooth Low Energy peripherals using client-side JavaScript."
		},
		"gatt-services": {
			title: "GATT (The Labeled Tool Pegboard)",
			analogy: "Think of it like a well-organized garage workbench where every tool has its own labeled outline on the wall: Hammer goes on Hook #1, Screwdriver on Hook #2. Any mechanic walking into the garage knows exactly where to reach without rummaging.",
			techFact: "Generic Attribute Profile: the hierarchical structure of Bluetooth Low Energy, grouping related parameters into standardized Services and Characteristics identified by 16-bit or 128-bit UUIDs."
		},
		"tailscale-serve": {
			title: "Tailscale Serve (The Private Intercom Tube)",
			analogy: "Think of it like a private pneumatic delivery tube connecting your basement hobby shop straight to your nightstand: completely hidden and inaccessible to anyone walking down the street outside, but instantly serving private tools inside your own home.",
			techFact: "A Tailscale feature that routes local port traffic through private WireGuard tunnels, automatically provisioning and terminating valid public Let's Encrypt TLS certificates for your tailnet domain."
		},
		"wii-optical-disc": {
			title: "Wii Optical Disc (Proprietary Encrypted Media)",
			analogy: "Think of it like a vinyl record with grooves cut in a reverse spiral and stamped with a secret wax stamp: normal record players scrape and skip off the edge, but a custom needle reads the hidden grooves flawlessly.",
			techFact: "A proprietary DVD-based optical media format engineered by Panasonic and Nintendo for the Wii console. It incorporates physical disc burst cutting areas and hardware-encrypted partition blocks."
		},
		"aes-128-cbc": {
			title: "AES-128-CBC (The Interlocking Padlocks)",
			analogy: "Think of it like a chain of 100 padlocks where each lock can only be opened if you use the key AND the exact scrap of metal that fell out of the previous lock: you cannot tamper with Lock #40 without breaking every single lock after it.",
			techFact: "Advanced Encryption Standard in Cipher Block Chaining mode: an algorithm where each 128-bit block of plain data is blended (XORed) with the previous encrypted block before transformation, ensuring identical patterns become completely randomized."
		},
		"fst-filesystem": {
			title: "Nintendo FST (The Secret Game Index Card)",
			analogy: "Think of it like a treasure map index scribbled in secret code in a captain's notebook: instead of searching every island, the captain looks at Line 12 to find the exact compass bearing and depth of the treasure chest.",
			techFact: "A compact binary directory table used in GameCube and Wii optical disc images, mapping string filename offsets directly to sector clusters and byte lengths on the disc."
		},
		"brstm": {
			title: "Nintendo BRSTM (Looping Studio Master)",
			analogy: "Think of it like a vintage magnetic tape cassette with the ends spliced together in an endless circle: the console plays the intro once, and then seamlessly loops the middle battle theme for four hours without a single audible seam or pause.",
			techFact: "Binary Revolution Stream: Nintendo's proprietary audio container for Wii and GameCube titles. It pairs ADPCM audio streams with precise start/end sample markers for gapless runtime music looping."
		},
		"adpcm-thp": {
			title: "ADPCM (Difference Sound Recorder)",
			analogy: "Think of it like hiking up a rocky hill and only recording how many inches you stepped up or down from your last step, rather than measuring your total elevation from sea level each second: it cuts the size of your notepad by 75%.",
			techFact: "Adaptive Differential Pulse Code Modulation used in THP video/audio: compresses audio by quantizing the delta between consecutive waveform samples rather than storing absolute 16-bit linear PCM numbers."
		},
		"thread-pool-executor": {
			title: "ThreadPoolExecutor (The Multi-Chef Kitchen)",
			analogy: "Think of it like a busy pizzeria kitchen with 16 identical pizza ovens and 16 line cooks: instead of baking one personal pizza at a time and waiting 10 minutes for each, all 16 cooks slide their pizzas into all 16 ovens at the exact same second.",
			techFact: "A Python concurrency manager from concurrent.futures that maintains a pool of worker threads, asynchronously distributing batches of execution jobs across available CPU cores."
		},
		"id3-metadata": {
			title: "ID3 Metadata Tags (Digital Album Liner Notes)",
			analogy: "Think of it like laser-engraving the band name, album title, track number, and cover art directly onto the shiny surface of an audio CD so your car's dashboard screen displays the song title the second you insert the disc.",
			techFact: "A standardized metadata container format stored at the beginning or end of MP3 audio files, containing structured text fields (TIT2 title, TPE1 artist, TALB album, TRCK track number) and embedded artwork."
		},
		"bathymetry": {
			title: "Bathymetry (Underwater Topography)",
			analogy: "Think of it like draining all the water out of a lake and driving a 4x4 truck across the dry mud: bathymetry is the map of all the underwater valleys, steep cliffs, flat plateaus, and deep trenches hidden beneath the waves.",
			techFact: "The measurement and mapping of water depth in oceans, seas, and lakes. Depths are surveyed via echo sounders (sonar) or lidar to produce isobath depth contour vectors."
		},
		"screen-wake-lock": {
			title: "Screen Wake Lock (The Constant Finger on the Glass)",
			analogy: "Think of it like politely resting your index finger on your phone's power button while steering a boat at night, keeping the flashlight from turning off so you don't crash into a pier while your hands are busy.",
			techFact: "A modern Web API (navigator.wakeLock) that prevents the host mobile device or desktop operating system from dimming the display, entering sleep mode, or locking the screen."
		},
		"dead-reckoning": {
			title: "Dead Reckoning (Blindfolded Step Counting)",
			analogy: "Think of it like closing your eyes in your bedroom, taking 10 steps forward, turning 90 degrees right, and taking 5 steps: even without seeing the room, you can calculate that you are standing right in front of your closet.",
			techFact: "A navigational process that calculates one's current position and heading by estimating the direction, speed, and elapsed time traveled from a previously known fix without relying solely on external GPS satellites."
		},
		"free-space-path-loss": {
			title: "Free-Space Path Loss / FSPL (The Flashlight in Fog)",
			analogy: "Think of it like shining a small pocket flashlight across an enormous soccer field: the beam is blindingly bright an inch from the lens, but spreads out thin and dim by the time it reaches the goal line 100 yards away.",
			techFact: "The mathematical attenuation of an electromagnetic radio wave as it radiates through open space, proportional to the square of the distance and the square of the radio frequency."
		},
		"sgp4-sdp4": {
			title: "SGP4/SDP4 (Planetary Orbit Clockwork)",
			analogy: "Think of it like knowing the exact speed and swing of a giant grandfather clock pendulum: by timing one swing, you can calculate with pinpoint accuracy where the brass pendulum will be at 3:15 PM next Thursday.",
			techFact: "Simplified General Perturbations models: analytical mathematical equations that calculate orbital state vectors (position and velocity) of near-Earth satellites at any given second using NORAD two-line elements (TLE)."
		},
		"exif-metadata": {
			title: "EXIF Metadata (The Camera's Black Box)",
			analogy: "Think of it like a receipt printed on the back of every photograph listing the exact camera model, lens shutter speed, f-stop aperture, timestamp, and GPS coordinates where the photographer was standing.",
			techFact: "Exchangeable Image File Format: a specification embedded in JPEG and TIFF headers that logs camera serial numbers, focal length, exposure time, ISO speed, and date/time."
		},
		"apple-silicon-mps": {
			title: "Apple Silicon Metal (MPS Acceleration)",
			analogy: "Instead of hiring a single world-class mathematician to do thousands of simple additions one by one with a pencil, handing the calculation sheets to a stadium full of 2,000 high school students who all solve their one assigned math problem at the exact same second.",
			techFact: "Apple's low-level graphics and neural compute framework. Executes high-volume matrix multiplication in parallel across the Mac's integrated GPU cores rather than sequential CPU execution."
		},
		"autoregressive-chaining": {
			title: "Autoregressive Continuation Chaining",
			analogy: "A group storytelling game around a campfire where each person is only allowed to speak three sentences at a time, but they must listen carefully to the last three words whispered by the person before them so the story stays on the exact same plot.",
			techFact: "Generating audio piece-by-piece where each new second of sound uses the immediate preceding seconds as acoustic context, ensuring continuous key, tempo, and rhythm across boundaries."
		},
		"autoregressive-drift": {
			title: "Autoregressive Drift (Compounding Token Degradation)",
			analogy: "The children's game of 'Telephone' or photocopying a photocopy of a photocopy 20 times in a row. By the twentieth copy, tiny invisible specks of dust from the glass turn into huge dark smudges and the text becomes completely unreadable.",
			techFact: "When a neural network repeatedly predicts future tokens based on its own past imperfect guesses, tiny mathematical rounding errors compound exponentially, eventually dissolving the music into chaotic metallic static."
		},
		"unified-memory-architecture": {
			title: "Unified Memory Architecture (The Shared Kitchen Island)",
			analogy: "A head chef (CPU) and a pastry decorator (GPU) working at the exact same giant wooden kitchen table. When the chef finishes rolling the dough, they don't pack it into a cooler, load it onto a delivery van, and ship it across town to the decorator's kitchen—the decorator simply reaches across the table and starts piping the icing immediately.",
			techFact: "Apple Silicon packages the CPU, GPU, and Neural Engine with a single high-bandwidth memory pool, eliminating the latency and power cost of copying gigabytes of AI model weights across PCIe buses."
		},
		"diffusion-transformer": {
			title: "Diffusion Transformer (The Marble Sculptor)",
			analogy: "A master stone sculptor starting with an ugly, rough slab of jagged white marble. Instead of building a statue out of clay piece by piece, they start with total chaos, squint at the stone, and gently chisel away tiny chips of unwanted dust layer by layer until a smooth, gorgeous musical melody emerges.",
			techFact: "A generative AI architecture that synthesizes audio or images by starting with pure Gaussian random static and iteratively refining it into coherent sound guided by text prompts and transformer attention."
		},
		"torchsde": {
			title: "Stochastic Differential Equations (torchsde)",
			analogy: "Steering a kayak down a rushing mountain river full of swirling eddies and crosswinds: you have a general map pointing downstream toward the lake, but at every single paddle stroke you must calculate random water splashes and wind gusts to keep the boat glide smooth and upright.",
			techFact: "A mathematical solver library in PyTorch that integrates differential equations influenced by random noise, enabling high-quality multi-step diffusion sampling for audio synthesis."
		},
		"neural-audio-codec": {
			title: "Neural Audio Codec (The Shorthand Stenographer)",
			analogy: "A court stenographer who doesn't write down every single letter of the English alphabet, but uses a special custom shorthand keyboard where a single key combination represents an entire 10-word legal phrase, letting them capture an hour-long trial in a tiny pocket notebook.",
			techFact: "A deep-learning audio compressor (such as Meta's EnCodec) that condenses raw waveforms into compact integer tokens (codebooks) and decompresses them back into audible sound with minimal file size."
		},
		"context-window": {
			title: "Context Window (The Short-Term Working Memory)",
			analogy: "An air traffic controller's desktop whiteboard that only has room to write down the call signs of the last 10 airplanes. The moment an 11th plane calls on the radio, the controller must erase the very first flight from the board to make room for the new one.",
			techFact: "The maximum sequence length an attention mechanism can examine simultaneously. In MusicGen, 2,048 tokens at 50 tokens/second enforces an absolute hard acoustic ceiling of ~40.96 seconds of memory."
		},
		"equal-power-crossfade": {
			title: "Equal-Power Crossfading (The Seamless Relay Handoff)",
			analogy: "Two Olympic sprinters passing a baton: the incoming runner doesn't drop to a dead stop while the next runner starts from a standstill (which would cause a dip in race momentum). Instead, both runners sprint at top speed side-by-side for 20 meters so the baton never loses a single mile-per-hour of forward energy.",
			techFact: "Blending two audio waveforms using circular sine and cosine curves (cos²(t) + sin²(t) = 1.0) so the perceived acoustic sound pressure level remains mathematically constant with no dip in volume at the seam."
		},
		"de-harshing-filter": {
			title: "De-Harshing Notch Filter (The Glare Shield)",
			analogy: "Wearing specialized shooting glasses at an outdoor archery range that tint out only the harsh glare of neon green fluorescent lights while keeping the entire rest of the landscape in bright, natural, vivid color.",
			techFact: "Targeted bell parametric EQ filters that carve out specific narrow resonant frequencies (such as 3.8 kHz, 7.5 kHz, and 11 kHz) where digital compression artifacts cause ear-piercing metallic whistling."
		},
		"haas-spatializer": {
			title: "Haas Spatializer (The Living Room Acoustic Illusion)",
			analogy: "Snapping your fingers in a large cathedral: your left ear hears the snap direct from your thumb, while your right ear hears the exact same snap 15 milliseconds later bouncing off the stone wall on your right, instantly tricking your brain into knowing you are in a massive, spacious room.",
			techFact: "A psychoacoustic trick that delays one stereo channel by 10 to 20 milliseconds relative to the other, creating a wide, immersive three-dimensional stereo image from a mono audio track without phase cancellation."
		},
		"gated-model": {
			title: "Gated Model Authentication (The VIP Membership Badge)",
			analogy: "Entering a private woodworking workshop where the master carpenter lets anyone use their high-end industrial power tools for free, but you must first sign a safety waiver at the front desk and scan your digital badge at the turnstile.",
			techFact: "A Hugging Face repository where weights are restricted until a registered user signs the creator's community license terms and presents an authorized API access token (HF_TOKEN) on download."
		},
		"transient-cold-start": {
			title: "Transient Cold-Start Clicks & Micro-Fades",
			analogy: "Dropping a vinyl record needle straight down onto a spinning turntable with the speakers turned to maximum volume: you get a loud, startling 'THUMP' pop. A micro-fade is like gently raising the volume fader with your fingertips over a third of a second right as the needle meets the groove.",
			techFact: "A 0.3-second linear volume ramp applied to the beginning of generated audio to prevent the loudspeaker cone from violently jumping from zero to high amplitude, eliminating initial pop clicks."
		},
		"true-peak-limiter": {
			title: "True-Peak Limiter & Loudness Normalization",
			analogy: "The low ceiling bar hanging over a parking garage entrance: any car under 7 feet passes right through untouched, but if a lifted truck comes barreling through, the bar gently pushes down on the truck's roof so it can never smash into the concrete beams above.",
			techFact: "A mastering processor that caps audio peaks below 0 dBFS (-1.0 dB True-Peak) to prevent digital inter-sample clipping on smartphone speakers and DACs, while locking overall loudness to streaming standards (-14 LUFS)."
		},
		"shell-environment-isolation": {
			title: "Shell Environment Isolation (.env Ingestion)",
			analogy: "Entering a sterile medical cleanroom: you cannot bring the dust, lint, or sandwich wrappers from your pockets into the operating theater—the air shower blows everything away so you start completely clean. Loading a .env file is like having a designated locked medicine cabinet inside the cleanroom that holds exactly the sterile tools you need.",
			techFact: "macOS launches .command desktop shortcuts in a fresh, isolated subshell that ignores variables exported in other open terminal windows. Sourcing a local .env file explicitly restores required environment variables."
		},
		"safetensors": {
			title: "Safetensors Format (The Transparent Storage Bin)",
			analogy: "Storing screws, bolts, and washers in clear, transparent plastic organizer bins with labeled compartments, instead of baking all your hardware into a giant solid block of wax that you have to melt with a blowtorch every time you want to see what's inside.",
			techFact: "A secure, modern tensor storage format designed by Hugging Face. Stores raw model weights in a simple contiguous memory layout that prevents malicious code execution and loads in seconds via memory-mapping."
		},
		"cas-chunking": {
			title: "Content-Addressable Storage (CAS Chunking)",
			analogy: "Ordering an encyclopedia where each individual volume has a unique fingerprint stamped on the spine: 10 mail trucks deliver different chapters at the exact same time to your porch, and you only slide the books onto your shelf once the delivery of every chapter is verified.",
			techFact: "Splitting large model checkpoint files into independent content-hashed binary blocks downloaded concurrently via parallel HTTP range requests and assembled on disk."
		},
		"mmap-zero-copy": {
			title: "Zero-Copy Memory Mapping (Reading Direct from the Shelf)",
			analogy: "Opening a giant dictionary while it is still resting on the library shelf and reading the page with your own eyes, rather than photocopying the entire 2,000-page book onto loose paper and carrying the giant stack over to your desk before you can read a single definition.",
			techFact: "An OS virtual memory mechanism that maps a file on disk directly into the application's virtual address space, allowing instant read access without copying gigabytes into RAM."
		},
		"midi-delta-time": {
			title: "MIDI Delta-Time (The Stopwatch Between Notes)",
			analogy: "A musical conductor telling a drummer: 'Don't look at the clock on the wall—just count 3 heartbeats after the singer stops, and then hit the cymbal.' If you accidentally erase the 3 heartbeats of silence from the instructions, the drummer hits the cymbal while the singer is still mid-word.",
			techFact: "Standard MIDI files record elapsed ticks between successive events rather than absolute wall-clock times. Discarding skipped events without preserving their delta times causes subsequent notes to collapse forward prematurely."
		},
		"stem-separation": {
			title: "Audio Stem Separation (Unbaking a Cake)",
			analogy: "Taking a fully baked chocolate cake and somehow magically pulling out the raw cocoa powder, pure white sugar, cracked eggs, and melted butter back into four separate glass bowls on the counter.",
			techFact: "Using deep neural networks to isolate mixed stereo music tracks into individual discrete audio stems: isolated vocals, drums, bassline, and other accompaniment."
		},
		"soundfonts": {
			title: "SoundFonts & FluidSynth (The Digital Player Piano)",
			analogy: "An old-fashioned mechanical player piano that uses a paper roll with punched holes. The paper roll doesn't make any sound by itself—it just tells the piano's felt hammers exactly which physical metal strings to strike and how hard to hit them.",
			techFact: "A SoundFont (.sf2) contains digital recordings of real acoustic instruments at various pitches and velocities. Software synths (like FluidSynth) read MIDI instructions and trigger the matching samples."
		},
		"tls-bad-request": {
			title: "TLS 400 Handshake Rejection (Secret Spy Code at the Drive-Thru)",
			analogy: "Walking up to an old-school fast-food drive-thru microphone and reciting a heavily scrambled military cipher. The worker inside only speaks plain English, hears deafening static noise, and shouts back: 'I have no idea what you just said, try again in plain speech!'",
			techFact: "When an encrypted HTTPS client attempts to initiate an SSL/TLS cryptographic handshake against a plaintext HTTP server, the server fails to parse the binary byte stream and rejects the request with HTTP 400 Bad Request."
		},
		"watch-chunking": {
			title: "watchOS HTTP Chunking & Content-Length (The Waiter Who Never Leaves)",
			analogy: "A waiter bringing a glass of water to your table, but refusing to say 'Here you go' or walk away. Instead, he just stands frozen staring at you with the pitcher in his hand because nobody ever told him the glass was finished being filled.",
			techFact: "Without an explicit Content-Length header or Connection: close signal, the watchOS URLSession networking stack keeps the socket connection open indefinitely waiting for more data bytes, causing the client execution spinner to freeze."
		},
		"window-focus": {
			title: "Window Focus Stealing (Writing in the Wrong Notebook)",
			analogy: "Sitting at your desk with two open notebooks side-by-side. You intend to take notes in your presentation folder on the right, but your pen is resting on your open phone screen on the left, so every letter you scribble is completely lost.",
			techFact: "macOS System Events key codes are delivered strictly to the process owning active frontmost window focus. If an auxiliary app or iPhone Mirroring has focus, keystrokes are discarded rather than reaching the presentation software."
		},
		"wearable-complication": {
			title: "Hardware Wearable Complication (The Secret Podium Buzzer)",
			analogy: "A game show host who has a small, discreet button hidden under the edge of the wooden podium. Rather than walking over to the big scoreboard to manually flip a card, they casually rest their hand on the wood and click the button while looking straight at the audience.",
			techFact: "A watchOS complication is a dedicated interactive widget embedded on a primary watch face, providing single-tap direct execution of background shortcuts without navigating the watch application launcher."
		},
		"bonjour-mdns": {
			title: "Zero-Config Bonjour mDNS (Shouting a Name Across the Room)",
			analogy: "Calling your best friend across a crowded cafeteria by shouting their nickname, rather than looking up their current street address and mailing them a formal letter every single time they move to a new table.",
			techFact: "Multicast DNS (mDNS / Bonjour) resolves human-friendly local hostnames (like .local) directly to dynamic IP addresses across local network subnets without requiring a centralized DNS server."
		},
		"caffeinate-display-lock": {
			title: "Caffeinate Display Sleep Lock (Propping the Eyelids Open)",
			analogy: "Handing someone a massive mug of hot coffee while they study late for an exam, gently propping their eyelids wide open so they don't accidentally doze off right in the middle of an important sentence.",
			techFact: "The macOS caffeinate utility creates IOKit power-management assertions that prevent display dimming, idle timeouts, or system sleep while presentation software is actively running."
		},
		"applescript-system-events": {
			title: "AppleScript System Events (The Invisible Robot Keyboard)",
			analogy: "An invisible invisible-ink robot sitting right in front of your laptop keyboard that instantly taps physical arrow keys for you the exact millisecond you send it a radio signal.",
			techFact: "A macOS automation subsystem enabling background processes to synthesize hardware keyboard scan codes and control native graphical user interfaces without physical keyboard input."
		},
		"melodic-thresholding": {
			title: "Melodic Onset Thresholding (The Discerning Ear)",
			analogy: "A choir director listening to a rehearsal who completely ignores the singer's deep breath intakes, throat clearings, and shoe scuffs on the floor, and only writes down notes on the sheet music when a true, resonant vocal singing pitch begins.",
			techFact: "Mathematical confidence filters in audio-to-MIDI converters (such as Spotify Basic Pitch) that require energy and pitch probabilities to cross strict thresholds before registering a note onset."
		}

	};

	function initTechAnalogies() {
		window.initTechAnalogies = initTechAnalogies;
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

		if (!tooltip._analogyListeners) {
			tooltip._analogyListeners = true;
			tooltip.addEventListener("mouseenter", cancelHide);
			tooltip.addEventListener("mouseleave", scheduleHide);
		}

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

		if (!modal._analogyListeners) {
			modal._analogyListeners = true;
			modalClose.addEventListener("click", closeModal);
			modalDismiss.addEventListener("click", closeModal);
			modalBackdrop.addEventListener("click", closeModal);

			document.addEventListener("keydown", function (e) {
				if (e.key === "Escape") {
					if (!modal.hidden) closeModal();
					else scheduleHide();
				}
			});
		}

		terms.forEach(function (el) {
			if (el.getAttribute("data-analogy-bound")) return;
			el.setAttribute("data-analogy-bound", "true");
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
				var geoUrl = "https://nucwol2-0--hdd.taile72a68.ts.net/website-chat/traffic-geo";
				var sessionReported = false;
				try {
					sessionReported = !!sessionStorage.getItem("portfolio_geo_reported");
				} catch (e) {}

				if (!sessionReported) {
					try {
						var traceRes = await fetch("/cdn-cgi/trace", { cache: "no-store" });
						if (traceRes.ok) {
							var traceTxt = await traceRes.text();
							var match = traceTxt.match(/^loc=([A-Za-z]{2})$/m);
							if (match && match[1]) {
								var visitorLoc = match[1].toUpperCase();
								geoUrl += "?loc=" + encodeURIComponent(visitorLoc) + "&session=1";
								try {
									sessionStorage.setItem("portfolio_geo_reported", visitorLoc);
								} catch (e) {}
							}
						}
					} catch (e) {}
				}

				var res = await fetch(geoUrl, { cache: "no-store" });
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

		
		// Swipe and drag support for weather carousel
		if (carousel) {
			var touchStartX = 0;
			var touchStartY = 0;
			var isDragging = false;
			var currentActiveIndex = 0;

			carousel.addEventListener("touchstart", function(e) {
				if (e.touches && e.touches.length === 1) {
					touchStartX = e.touches[0].clientX;
					touchStartY = e.touches[0].clientY;
				}
			}, { passive: true });

			carousel.addEventListener("touchend", function(e) {
				if (!touchStartX) return;
				var touchEndX = e.changedTouches[0].clientX;
				var touchEndY = e.changedTouches[0].clientY;
				var diffX = touchEndX - touchStartX;
				var diffY = touchEndY - touchStartY;

				if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
					// Read active slide index
					slides.forEach(function(s, idx) {
						if (s.classList.contains("active")) currentActiveIndex = idx;
					});
					if (diffX < 0) {
						setActiveSlide(Math.min(2, currentActiveIndex + 1));
					} else {
						setActiveSlide(Math.max(0, currentActiveIndex - 1));
					}
				}
				touchStartX = 0;
				touchStartY = 0;
			}, { passive: true });

			carousel.addEventListener("mousedown", function(e) {
				if (e.target.closest("button") || e.target.closest("a")) return;
				isDragging = true;
				touchStartX = e.clientX;
				touchStartY = e.clientY;
			});

			window.addEventListener("mouseup", function(e) {
				if (!isDragging) return;
				isDragging = false;
				var diffX = e.clientX - touchStartX;
				var diffY = e.clientY - touchStartY;
				if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
					slides.forEach(function(s, idx) {
						if (s.classList.contains("active")) currentActiveIndex = idx;
					});
					if (diffX < 0) {
						setActiveSlide(Math.min(2, currentActiveIndex + 1));
					} else {
						setActiveSlide(Math.max(0, currentActiveIndex - 1));
					}
				}
				touchStartX = 0;
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
		var cluster = document.getElementById("home-instrument-cluster") || document.getElementById("home-tachometer-cluster");
		if (!cluster) return;

		var needle = document.getElementById("tach-needle-group");
		var mphDisplay = document.getElementById("tach-mph-val");
		var curDisplay = document.getElementById("tach-current-ms");
		var distDisplay = document.getElementById("tach-dist-val");
		var lightDisplay = document.getElementById("tach-light-pct");
		var recDisplay = document.getElementById("tach-record-ms");
		var statusBadge = document.getElementById("tach-status-badge");
		var newRecordBadge = document.getElementById("tach-new-record-badge");
		var countDisplay = document.getElementById("tach-visits-count");
		var revBtn = document.getElementById("tach-rev-btn");

		var STORAGE_RECORD_KEY = "vanek_tach_fastest_record_ms";
		var STORAGE_COUNT_KEY = "vanek_tach_load_count";
		var DIST_MILES = 2485; // Continental fiber round-trip loop in miles

		var savedRecord = parseInt(localStorage.getItem(STORAGE_RECORD_KEY), 10);
		var visitCount = parseInt(localStorage.getItem(STORAGE_COUNT_KEY), 10) || 0;
		visitCount += 1;
		localStorage.setItem(STORAGE_COUNT_KEY, visitCount);
		if (countDisplay) countDisplay.textContent = visitCount;

		if (savedRecord && !isNaN(savedRecord) && savedRecord > 0) {
			var initSec = Math.max(0.004, savedRecord / 1000);
			var initMph = Math.round(DIST_MILES / (initSec / 3600));
			var initMillionMph = Math.min(670, Math.max(8, Math.round(initMph / 1000000)));
			if (recDisplay) recDisplay.textContent = initMillionMph + "M MPH (" + savedRecord + " ms)";
		} else {
			if (recDisplay) recDisplay.textContent = "-- M MPH";
		}

		function mapMphToDegrees(millionMph) {
			// Sweep from -110deg (0 M MPH) to +110deg (600M+ MPH)
			var maxMph = 600;
			var clamped = Math.max(0, Math.min(millionMph, maxMph));
			var pct = clamped / maxMph;
			return -110 + (pct * 220);
		}

		function applySpeedReading(ms, isInteractive) {
			var elapsedSec = Math.max(0.004, ms / 1000);
			var speedMph = Math.round(DIST_MILES / (elapsedSec / 3600));
			// Physical speed of light c = 670,616,629 MPH; typical silica glass fiber velocity is ~67% c (~449,300,000 MPH)
			var millionMph = Math.min(670, Math.max(8, Math.round(speedMph / 1000000)));
			var pctLight = Math.min(99, Math.max(5, Math.round((speedMph / 670616629) * 100)));

			var deg = mapMphToDegrees(millionMph);
			if (needle) {
				needle.style.transform = "rotate(" + deg + "deg)";
			}
			if (mphDisplay) {
				mphDisplay.textContent = millionMph;
			}
			if (curDisplay) {
				curDisplay.textContent = ms + " ms";
			}
			if (distDisplay) {
				distDisplay.textContent = "~" + DIST_MILES.toLocaleString() + " miles";
			}
			if (lightDisplay) {
				lightDisplay.textContent = pctLight + "% c";
			}

			if (statusBadge) {
				statusBadge.className = "tach-badge";
				if (ms <= 25 || millionMph >= 350) {
					statusBadge.classList.add("zone-green");
					statusBadge.textContent = "⚡ " + pctLight + "% Light Speed (" + millionMph + "M MPH)";
				} else if (ms <= 100 || millionMph >= 90) {
					statusBadge.classList.add("zone-yellow");
					statusBadge.textContent = "🚀 High Velocity (" + millionMph + "M MPH)";
				} else {
					statusBadge.classList.add("zone-red");
					statusBadge.textContent = "⚠️ Cruising (" + millionMph + "M MPH)";
				}
			}

			var currentBest = parseInt(localStorage.getItem(STORAGE_RECORD_KEY), 10);
			if (!currentBest || isNaN(currentBest) || ms < currentBest) {
				localStorage.setItem(STORAGE_RECORD_KEY, ms);
				if (recDisplay) recDisplay.textContent = millionMph + "M MPH (" + ms + " ms)";
				if (newRecordBadge) {
					newRecordBadge.hidden = false;
				}
			} else {
				var recSec = Math.max(0.004, currentBest / 1000);
				var recMph = Math.round(DIST_MILES / (recSec / 3600));
				var recMillionMph = Math.min(670, Math.max(8, Math.round(recMph / 1000000)));
				if (recDisplay) recDisplay.textContent = recMillionMph + "M MPH (" + currentBest + " ms)";
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
				if (revBtn.disabled) return;
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
						}, 350);
					})
					.catch(function() {
						var fallbackMs = Math.max(15, Math.round(performance.now() - start));
						setTimeout(function() {
							applySpeedReading(fallbackMs, true);
						}, 350);
					});

				var cooldown = 3;
				revBtn.textContent = "Revving (" + cooldown + "s)";
				var timer = setInterval(function () {
					cooldown--;
					if (cooldown <= 0) {
						clearInterval(timer);
						revBtn.disabled = false;
						revBtn.textContent = "Rev Dial";
					} else {
						revBtn.textContent = "Revving (" + cooldown + "s)";
					}
				}, 1000);
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
		initPageLoadTachometer();

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
			if (arcActive) {
				var fraction = Math.max(0, Math.min(1, mph / 120));
				var offset = Math.round(288 * (1 - fraction));
				arcActive.style.strokeDashoffset = String(offset);
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
				if (testBtn.disabled) return;
				testBtn.disabled = true;
				if (needle) needle.style.transform = "rotate(100deg)";
				setTimeout(function () {
					testMeshLatency();
				}, 200);

				var cooldown = 4;
				testBtn.textContent = "Cooldown (" + cooldown + "s)";
				var timer = setInterval(function () {
					cooldown--;
					if (cooldown <= 0) {
						clearInterval(timer);
						testBtn.disabled = false;
						testBtn.textContent = "Ping Mesh";
					} else {
						testBtn.textContent = "Cooldown (" + cooldown + "s)";
					}
				}, 1000);
			});
		}
	}

	
	// ==========================================================================
	// Interactive Navbar: Fluid Plasma Wave Aura (Electric Glow)
	// ==========================================================================
	function initNavPlasmaWaves() {
		var nav = document.querySelector("nav.tablet-desktop");
		if (!nav) return;

		// Clean up any old canvas if present
		var oldCanvas = document.getElementById("nav-kinetic-canvas");
		if (oldCanvas && oldCanvas.parentNode) {
			oldCanvas.parentNode.removeChild(oldCanvas);
		}

		var canvas = document.createElement("canvas");
		canvas.id = "nav-plasma-canvas";
		canvas.className = "nav-plasma-canvas";
		canvas.setAttribute("aria-hidden", "true");
		canvas.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;overflow:hidden;";
		nav.insertBefore(canvas, nav.firstChild);

		var ctx = canvas.getContext("2d");
		if (!ctx) return;

		var width = 0;
		var height = 0;
		var plasmaX = 300;
		var plasmaY = 28;
		var currentX = plasmaX;
		var currentY = plasmaY;
		var hasInteracted = false;
		var isWindowActive = true;

		function resizeCanvas() {
			var rect = nav.getBoundingClientRect();
			width = rect.width;
			// Constrain height on mobile so drawer expansion never stretches canvas
			var isNavOpen = nav.classList.contains("nav-open");
			height = isNavOpen ? 56 : (rect.height || 56);
			canvas.width = width;
			canvas.height = height;
			if (!hasInteracted) {
				plasmaX = width / 2;
				plasmaY = height / 2;
				currentX = plasmaX;
				currentY = plasmaY;
			}
		}

		resizeCanvas();
		window.addEventListener("resize", resizeCanvas, { passive: true });

		// Desktop mouse movement
		nav.addEventListener("mousemove", function (e) {
			var rect = nav.getBoundingClientRect();
			plasmaX = e.clientX - rect.left;
			plasmaY = Math.min(e.clientY - rect.top, 56);
			hasInteracted = true;
		});

		// Mobile touch handling: tracks finger smoothly and REMEMBERS last location on release
		nav.addEventListener("touchstart", function (e) {
			if (e.touches && e.touches[0]) {
				var rect = nav.getBoundingClientRect();
				plasmaX = e.touches[0].clientX - rect.left;
				plasmaY = Math.min(e.touches[0].clientY - rect.top, 56);
				hasInteracted = true;
			}
		}, { passive: true });

		nav.addEventListener("touchmove", function (e) {
			if (e.touches && e.touches[0]) {
				var rect = nav.getBoundingClientRect();
				plasmaX = e.touches[0].clientX - rect.left;
				plasmaY = Math.min(e.touches[0].clientY - rect.top, 56);
				hasInteracted = true;
			}
		}, { passive: true });

		// On touchend: does NOT scatter! Remembers plasmaX and plasmaY right where the finger left off.

		document.addEventListener("visibilitychange", function () {
			isWindowActive = !document.hidden;
		});

		// Smooth 60fps Plasma Animation Loop
		function renderPlasma() {
			if (!isWindowActive) {
				requestAnimationFrame(renderPlasma);
				return;
			}

			// Fluid lerp tracking
			currentX += (plasmaX - currentX) * 0.08;
			currentY += (plasmaY - currentY) * 0.08;

			ctx.clearRect(0, 0, width, height);

			var t = performance.now() * 0.0022;

			// 1. Ambient Radial Plasma Core Glow
			var coreRadius = 140;
			var grad = ctx.createRadialGradient(currentX, currentY, 0, currentX, currentY, coreRadius);
			grad.addColorStop(0, "rgba(56, 189, 248, 0.35)"); // electric cyan
			grad.addColorStop(0.35, "rgba(139, 92, 246, 0.22)"); // plasma violet
			grad.addColorStop(0.7, "rgba(2, 132, 199, 0.10)"); // sapphire blue
			grad.addColorStop(1, "rgba(2, 132, 199, 0)"); // transparent

			ctx.fillStyle = grad;
			ctx.beginPath();
			ctx.arc(currentX, currentY, coreRadius, 0, Math.PI * 2);
			ctx.fill();

			// 2. Harmonic Undulating Plasma Wave Rings (Cyan, Violet, Emerald)
			var rings = [
				{ baseR: 26, speed: 2.2, color: "rgba(56, 189, 248, 0.55)", width: 1.6 },
				{ baseR: 54, speed: 1.6, color: "rgba(168, 85, 247, 0.40)", width: 1.3 },
				{ baseR: 88, speed: 1.2, color: "rgba(16, 185, 129, 0.25)", width: 1.0 }
			];

			for (var r = 0; r < rings.length; r++) {
				var ring = rings[r];
				var pulse = 1 + 0.12 * Math.sin(t * 1.8 + r * 1.4);
				var rEff = ring.baseR * pulse;

				ctx.beginPath();
				var steps = 36;
				for (var s = 0; s <= steps; s++) {
					var angle = (s / steps) * Math.PI * 2;
					var distortion = 3.5 * Math.sin(5 * angle + t * ring.speed + r) + 2.0 * Math.cos(3 * angle - t * 1.5);
					var radius = rEff + distortion;
					var px = currentX + Math.cos(angle) * radius;
					var py = currentY + Math.sin(angle) * radius;
					if (s === 0) {
						ctx.moveTo(px, py);
					} else {
						ctx.lineTo(px, py);
					}
				}
				ctx.closePath();
				ctx.strokeStyle = ring.color;
				ctx.lineWidth = ring.width;
				ctx.stroke();
			}

			// 3. Subtle Horizontal Energy Wave Filament along top/bottom
			ctx.beginPath();
			var filamentY = height - 1;
			ctx.moveTo(0, filamentY);
			for (var x = 0; x <= width; x += 15) {
				var dist = Math.abs(x - currentX);
				var influence = Math.exp(-Math.pow(dist / 140, 2));
				var waveY = filamentY - (2.5 * Math.sin(x * 0.04 + t * 2.5) * influence);
				ctx.lineTo(x, waveY);
			}
			ctx.strokeStyle = "rgba(56, 189, 248, 0.35)";
			ctx.lineWidth = 1.0;
			ctx.stroke();

			requestAnimationFrame(renderPlasma);
		}

		requestAnimationFrame(renderPlasma);
	}

	
	/* ==========================================================================
	   Precision Moving Analog Station Clock (EST / EDT)
	   ========================================================================== */
	function initEstAnalogClock() {
		var hourHand = document.getElementById("clock-hand-hour");
		var minHand = document.getElementById("clock-hand-minute");
		var secHand = document.getElementById("clock-hand-second");
		var digitalEl = document.getElementById("clock-digital-time");
		if (!hourHand || !minHand || !secHand) return;

		var clockContainer = document.getElementById("home-est-clock");
		if (clockContainer) {
			clockContainer.setAttribute("role", "button");
			clockContainer.setAttribute("tabindex", "0");
			clockContainer.addEventListener("click", function () {
				window.location.href = "clock.html";
			});
			clockContainer.addEventListener("keydown", function (e) {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					window.location.href = "clock.html";
				}
			});
		}

		var timeFormatter = null;
		try {
			timeFormatter = new Intl.DateTimeFormat("en-US", {
				timeZone: "America/New_York",
				hour: "numeric",
				minute: "2-digit",
				second: "2-digit",
				hour12: true,
				timeZoneName: "short"
			});
		} catch (e) {}

		var lastDigitalSec = -1;

		function renderClock() {
			var now = new Date();
			// Compute time in Eastern Timezone (America/New_York handles daylight savings cleanly)
			var estStr = now.toLocaleString("en-US", { timeZone: "America/New_York" });
			var estDate = new Date(estStr);

			var h = estDate.getHours();
			var m = estDate.getMinutes();
			var s = estDate.getSeconds();
			var ms = now.getMilliseconds();

			// Continuous smooth mechanical sweep
			var secAngle = (s + ms / 1000) * 6; // 6 deg per sec
			var minAngle = (m + s / 60) * 6;
			var hourAngle = ((h % 12) + m / 60) * 30;

			hourHand.setAttribute("transform", "rotate(" + hourAngle.toFixed(2) + " 50 50)");
			minHand.setAttribute("transform", "rotate(" + minAngle.toFixed(2) + " 50 50)");
			secHand.setAttribute("transform", "rotate(" + secAngle.toFixed(2) + " 50 50)");

			if (digitalEl && s !== lastDigitalSec) {
				lastDigitalSec = s;
				if (timeFormatter) {
					digitalEl.textContent = timeFormatter.format(now);
				} else {
					var h12 = h % 12 || 12;
					var ampm = h >= 12 ? "PM" : "AM";
					var pad = function (n) { return n < 10 ? "0" + n : "" + n; };
					digitalEl.textContent = h12 + ":" + pad(m) + ":" + pad(s) + " " + ampm + " EST";
				}
			}

			requestAnimationFrame(renderClock);
		}

		requestAnimationFrame(renderClock);
	}

	/* ==========================================================================
	   Global Internet Velocity & Continental Radar Console
	   ========================================================================== */
	function initGlobalInternetRadar() {
		var radarSection = document.getElementById("global-internet-radar");
		if (!radarSection) return;

		var RADAR_DEFAULT_VIEWBOX = [0, 15, 1000, 420];
		var RADAR_REGION_VIEWBOXES = {
			"North America": [30, 20, 490, 210],
			"Europe": [360, 25, 360, 165],
			"Asia-Pacific": [480, 75, 480, 240],
			"Latin America": [150, 170, 420, 230],
			"Africa / Middle East": [380, 110, 360, 240],
			"Oceania": [680, 230, 300, 180]
		};

		var currentRadarVb = RADAR_DEFAULT_VIEWBOX.slice();
		var radarAnimId = null;
		var svgRadarMap = radarSection.querySelector(".radar-svg-map");
		var radarResetBtn = document.getElementById("radar-map-reset-btn");
		var radarOverlayResetBtn = document.getElementById("radar-map-overlay-reset");
		var isZoomed = false;

		function animateRadarViewBox(toVb, duration) {
			if (!svgRadarMap) return;
			duration = duration || 450;
			if (radarAnimId) cancelAnimationFrame(radarAnimId);
			var startVb = currentRadarVb.slice();
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
				currentRadarVb = cur;
				svgRadarMap.setAttribute("viewBox", cur[0].toFixed(2) + " " + cur[1].toFixed(2) + " " + cur[2].toFixed(2) + " " + cur[3].toFixed(2));

				if (progress < 1) {
					radarAnimId = requestAnimationFrame(step);
				} else {
					currentRadarVb = toVb.slice();
					svgRadarMap.setAttribute("viewBox", toVb.join(" "));
					radarAnimId = null;
				}
			}
			radarAnimId = requestAnimationFrame(step);
		}

		function resetRadarView() {
			isZoomed = false;
			animateRadarViewBox(RADAR_DEFAULT_VIEWBOX, 400);
			if (radarResetBtn) radarResetBtn.style.display = "none";
			if (radarOverlayResetBtn) radarOverlayResetBtn.style.display = "none";
		}

		if (radarResetBtn) radarResetBtn.addEventListener("click", resetRadarView);
		if (radarOverlayResetBtn) radarOverlayResetBtn.addEventListener("click", resetRadarView);

		var CONTINENTS_DATA = {
			"North America": {
				flag: "🇺🇸 🇨🇦",
				subhead: "UTC-4 to UTC-8 • 580M Population",
				dl: 262.4,
				ul: 46.2,
				rtt: 16.2,
				ipv6: 54.2,
				status: "High Density Tier-1 Ingress",
				beaconHost: "https://1.1.1.1/cdn-cgi/trace",
				distKm: 1200,
				peak: "Evening Streaming Peak (19:00 - 23:00 EST)",
				color: "#0284c7"
			},
			"Europe": {
				flag: "🇪🇺 🇬🇧",
				subhead: "UTC+0 to UTC+3 • 745M Population",
				dl: 204.8,
				ul: 68.4,
				rtt: 22.4,
				ipv6: 49.8,
				status: "Symmetric FTTH & Dense IXP Fabric",
				beaconHost: "https://www.cloudflare.com/cdn-cgi/trace",
				distKm: 6500,
				peak: "Late Night Transition / Low Idle",
				color: "#10b981"
			},
			"Asia-Pacific": {
				flag: "🇯🇵 🇸🇬 🇦🇺",
				subhead: "UTC+7 to UTC+11 • 4.3B Population",
				dl: 178.6,
				ul: 54.1,
				rtt: 31.8,
				ipv6: 42.1,
				status: "Massive Subsea Terabit Interconnects",
				beaconHost: "https://cdnjs.cloudflare.com/robots.txt",
				distKm: 10500,
				peak: "Early Morning Regional Traffic Rising",
				color: "#f59e0b"
			},
			"Latin America": {
				flag: "🇧🇷 🇨🇱 🇲🇽",
				subhead: "UTC-3 to UTC-6 • 660M Population",
				dl: 84.2,
				ul: 32.8,
				rtt: 48.5,
				ipv6: 38.6,
				status: "Rapid Coastal Fiber Expansion",
				beaconHost: "https://1.0.0.1/cdn-cgi/trace",
				distKm: 7800,
				peak: "Evening Peak Across Brasilia / Santiago",
				color: "#8b5cf6"
			},
			"Africa / Middle East": {
				flag: "🇿🇦 🇦🇪 🇳🇬",
				subhead: "UTC+1 to UTC+4 • 1.8B Population",
				dl: 46.5,
				ul: 18.2,
				rtt: 64.2,
				ipv6: 19.4,
				status: "2Africa & Equiano Subsea Trunking Online",
				beaconHost: "https://1.1.1.1/cdn-cgi/trace",
				distKm: 11000,
				peak: "Deep Night Low / Data Center Maintenance",
				color: "#ec4899"
			},
			"Oceania": {
				flag: "🇦🇺 🇳🇿",
				subhead: "UTC+10 to UTC+12 • 45M Population",
				dl: 142.1,
				ul: 28.5,
				rtt: 38.2,
				ipv6: 36.2,
				status: "Trans-Pacific Subsea Links",
				beaconHost: "https://1.0.0.1/cdn-cgi/trace",
				distKm: 14800,
				peak: "Midday Business & High Enterprise Load",
				color: "#14b8a6"
			}
		};

		var activeRegion = "North America";
		var liveGeoData = null;

		var flagEl = document.getElementById("inspector-flag");
		var titleEl = document.getElementById("inspector-title");
		var subheadEl = document.getElementById("inspector-subhead");
		var dlValEl = document.getElementById("meter-dl-val");
		var dlFillEl = document.getElementById("meter-dl-fill");
		var ulValEl = document.getElementById("meter-ul-val");
		var ulFillEl = document.getElementById("meter-ul-fill");
		var rttValEl = document.getElementById("pill-rtt-val");
		var ipv6ValEl = document.getElementById("pill-ipv6-val");
		var visitsValEl = document.getElementById("pill-visits-val");
		var peakValEl = document.getElementById("pill-peak-val");
		var sessionsEl = document.getElementById("radar-global-sessions");
		var probeBtn = document.getElementById("radar-probe-btn");
		var probeResultEl = document.getElementById("radar-probe-result");

		function renderRegion(reg, optZoom) {
			activeRegion = reg;
			if (optZoom) {
				var targetVb = RADAR_REGION_VIEWBOXES[reg] || RADAR_DEFAULT_VIEWBOX;
				isZoomed = true;
				animateRadarViewBox(targetVb, 450);
				if (radarResetBtn) radarResetBtn.style.display = "inline-flex";
				if (radarOverlayResetBtn) radarOverlayResetBtn.style.display = "inline-flex";
			}
			var data = CONTINENTS_DATA[reg] || CONTINENTS_DATA["North America"];

			if (flagEl) flagEl.textContent = data.flag;
			if (titleEl) titleEl.textContent = reg;
			if (subheadEl) subheadEl.textContent = data.subhead;

			if (dlValEl) dlValEl.textContent = data.dl.toFixed(1) + " Mbps";
			if (dlFillEl) dlFillEl.style.width = Math.min(100, Math.round((data.dl / 300) * 100)) + "%";

			if (ulValEl) ulValEl.textContent = data.ul.toFixed(1) + " Mbps";
			if (ulFillEl) ulFillEl.style.width = Math.min(100, Math.round((data.ul / 100) * 100)) + "%";

			if (rttValEl) {
				var rtMiles = Math.round((data.distKm * 2) * 0.621371);
				var estMph = Math.round(rtMiles / ((data.rtt / 1000) / 3600));
				var mMph = (estMph / 1000000).toFixed(0);
				rttValEl.textContent = "~" + mMph + "M MPH (" + data.rtt.toFixed(0) + "ms)";
			}
			if (ipv6ValEl) ipv6ValEl.textContent = data.ipv6.toFixed(1) + "%";
			if (peakValEl) peakValEl.textContent = data.peak;

			// Check portfolio visits for this region
			var visitsCount = 0;
			if (liveGeoData && liveGeoData.regions) {
				if (reg === "North America") visitsCount = liveGeoData.regions["North America"] || 0;
				else if (reg === "Europe") visitsCount = liveGeoData.regions["Europe"] || 0;
				else if (reg === "Asia-Pacific") visitsCount = liveGeoData.regions["Asia-Pacific"] || 0;
				else if (reg === "Latin America") visitsCount = liveGeoData.regions["Latin America"] || 0;
				else visitsCount = liveGeoData.regions["Other"] || 0;
			}
			if (visitsValEl) {
				visitsValEl.textContent = visitsCount > 0 ? visitsCount + " Sessions" : "Syncing...";
			}

			// Update tabs
			var tabs = radarSection.querySelectorAll(".radar-tab-btn");
			tabs.forEach(function (tab) {
				var t = tab.getAttribute("data-tab");
				if (t === reg) {
					tab.classList.add("active");
					tab.setAttribute("aria-selected", "true");
				} else {
					tab.classList.remove("active");
					tab.setAttribute("aria-selected", "false");
				}
			});

			// Update map land highlights
			var lands = radarSection.querySelectorAll(".radar-land");
			lands.forEach(function (land) {
				var lr = land.getAttribute("data-region");
				if (lr === reg) {
					land.classList.add("radar-land-active");
				} else {
					land.classList.remove("radar-land-active");
				}
			});

			// Reset probe result hint
			if (probeResultEl) {
				probeResultEl.innerHTML = '<span class="probe-ready-hint">Ready to probe ' + reg + ' Anycast edge. Click &ldquo;Run Edge Ping&rdquo;.</span>';
			}
		}

		// Wire up Tab Clicks (with smooth zoom)
		var tabs = radarSection.querySelectorAll(".radar-tab-btn");
		tabs.forEach(function (tab) {
			tab.addEventListener("click", function () {
				var targetReg = tab.getAttribute("data-tab");
				if (targetReg) renderRegion(targetReg, true);
			});
		});

		// Wire up Map Land Clicks (with smooth zoom)
		var lands = radarSection.querySelectorAll(".radar-land");
		lands.forEach(function (land) {
			land.addEventListener("click", function () {
				var targetReg = land.getAttribute("data-region");
				if (targetReg) renderRegion(targetReg, true);
			});
		});

		// Wire up IXP Node Clicks (with smooth zoom)
		var ixpNodes = radarSection.querySelectorAll(".ixp-node");
		ixpNodes.forEach(function (node) {
			node.addEventListener("click", function () {
				var targetReg = node.getAttribute("data-region");
				if (targetReg) renderRegion(targetReg, true);
			});
		});

		// Live In-Browser Edge Ping Probe Handler
		if (probeBtn) {
			probeBtn.addEventListener("click", async function () {
				probeBtn.disabled = true;
				probeBtn.textContent = "Probing...";
				if (probeResultEl) {
					probeResultEl.innerHTML = '<span style="color:#38bdf8;">⚡ Dispatching TLS handshake packet to ' + activeRegion + ' edge...</span>';
				}

				var data = CONTINENTS_DATA[activeRegion] || CONTINENTS_DATA["North America"];
				var beaconUrl = data.beaconHost;
				var t0 = performance.now();
				try {
					await fetch(beaconUrl, {
						cache: "no-store",
						mode: "no-cors",
						signal: AbortSignal.timeout ? AbortSignal.timeout(4000) : undefined
					});
				} catch (e) {}
				var t1 = performance.now();
				var elapsed = Math.round(t1 - t0);
				if (elapsed <= 0) elapsed = 14;

				// Signal velocity calculations in Miles Per Hour (MPH)
				var distKm = data.distKm || 2000;
				var roundTripMiles = Math.round((distKm * 2) * 0.621371);
				var elapsedSeconds = Math.max(0.005, elapsed / 1000);
				var speedMph = Math.round(roundTripMiles / (elapsedSeconds / 3600));
				var millionMph = (speedMph / 1000000).toFixed(1);
				var pctLight = Math.min(98, Math.max(35, Math.round((speedMph / 670616629) * 100)));

				if (probeResultEl) {
					probeResultEl.innerHTML =
						'<div style="display:flex;flex-direction:column;gap:5px;">' +
							'<div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;">' +
								'<span class="probe-metric-highlight" style="font-size:1.05rem;color:#38bdf8;">🚀 Signal Speed: ' + millionMph + ' Million MPH</span>' +
								'<span style="font-size:0.75rem;color:#10b981;font-weight:700;">(' + pctLight + '% the speed of light!)</span>' +
							'</div>' +
							'<span style="font-size:0.73rem;color:#cbd5e1;line-height:1.4;">' +
								'Your connection beamed a data pulse across <strong>' + roundTripMiles.toLocaleString() + ' miles</strong> of glass fiber to ' + activeRegion + ' and back in <strong>' + elapsed + ' milliseconds</strong>.' +
							'</span>' +
						'</div>';
				}
				probeBtn.disabled = false;
				probeBtn.textContent = "Re-Probe Edge";
			});
		}

		// Dynamically Sync Live Visitor Footprint from NUC Gateway
		async function syncLiveVisitorStats() {
			try {
				var res = await fetch("https://nucwol2-0--hdd.taile72a68.ts.net/website-chat/traffic-geo", { cache: "no-store" });
				if (!res.ok) return;
				var json = await res.json();
				if (!json || typeof json.total !== "number") return;
				liveGeoData = json;
				if (sessionsEl) {
					sessionsEl.textContent = json.total.toLocaleString() + " Global Sessions Logged";
				}
				renderRegion(activeRegion);
			} catch (e) {}
		}

		renderRegion("North America");
		syncLiveVisitorStats();
		window.setInterval(syncLiveVisitorStats, 45000);
	}

	
	/* ==========================================================================
	   Dedicated Desk Clock & Screen Wake Lock Controller (clock.html)
	   ========================================================================== */
	function initDedicatedDeskClock() {
		var deskCard = document.getElementById("desk-clock-card");
		if (!deskCard) return;

		var hourHand = document.getElementById("big-hand-hour");
		var minHand = document.getElementById("big-hand-minute");
		var secHand = document.getElementById("big-hand-second");
		var dateEl = document.getElementById("desk-clock-date");
		var timeValEl = document.getElementById("desk-clock-time");
		var ampmEl = document.getElementById("desk-clock-ampm");
		var zoneEl = document.getElementById("desk-clock-zone");
		var offsetEl = document.getElementById("desk-clock-offset");
		var dialTzEl = document.getElementById("big-dial-tz");

		var wakeBtn = document.getElementById("wake-lock-toggle");
		var wakeIcon = document.getElementById("wake-icon");
		var wakeLabel = document.getElementById("wake-label");
		var wakeHint = document.getElementById("wake-status-hint");

		var dimmerBtn = document.getElementById("dimmer-toggle");
		var tzBtn = document.getElementById("tz-toggle");
		var tzLabel = document.getElementById("tz-label");
		var fsBtn = document.getElementById("fullscreen-toggle");

		// Timezone modes: "est", "local", "utc"
		var tzModes = ["est", "local", "utc"];
		var tzIndex = 0;

		// 1. Screen Wake Lock Implementation
		var wakeLockObj = null;

		async function acquireWakeLock() {
			if ("wakeLock" in navigator) {
				try {
					wakeLockObj = await navigator.wakeLock.request("screen");
					wakeLockObj.addEventListener("release", function () {
						wakeLockObj = null;
						updateWakeUI(false);
					});
					updateWakeUI(true);
				} catch (err) {
					console.warn("Wake lock request failed:", err);
					updateWakeUI(false, "Device battery saver blocked wake lock");
				}
			} else {
				updateWakeUI(false, "Wake Lock API not supported on this browser");
			}
		}

		async function releaseWakeLock() {
			if (wakeLockObj) {
				try {
					await wakeLockObj.release();
				} catch (e) {}
				wakeLockObj = null;
				updateWakeUI(false);
			}
		}

		function updateWakeUI(active, errMsg) {
			if (active) {
				if (wakeBtn) {
					wakeBtn.classList.add("wake-active");
					wakeBtn.setAttribute("aria-pressed", "true");
				}
				if (wakeIcon) wakeIcon.textContent = "🔆";
				if (wakeLabel) wakeLabel.textContent = "Always Keep Screen Awake: ON";
				if (wakeHint) wakeHint.innerHTML = '<span style="color:#059669;font-weight:700;">🔆 Screen Wake Lock is ACTIVE.</span> Display will remain fully illuminated without sleeping or timing out.';
			} else {
				if (wakeBtn) {
					wakeBtn.classList.remove("wake-active");
					wakeBtn.setAttribute("aria-pressed", "false");
				}
				if (wakeIcon) wakeIcon.textContent = "💤";
				if (wakeLabel) wakeLabel.textContent = "Always Keep Screen Awake: OFF";
				if (wakeHint) {
					wakeHint.textContent = errMsg || "Display will follow device's normal screen timeout. Tap to keep screen illuminated indefinitely.";
				}
			}
		}

		if (wakeBtn) {
			wakeBtn.addEventListener("click", function () {
				if (wakeLockObj) {
					releaseWakeLock();
				} else {
					acquireWakeLock();
				}
			});
		}

		// Re-acquire lock if user switches away and returns
		document.addEventListener("visibilitychange", function () {
			if (wakeLockObj !== null && document.visibilityState === "visible") {
				acquireWakeLock();
			}
		});

		// 2. Nightstand Dimmer Mode
		if (dimmerBtn) {
			dimmerBtn.addEventListener("click", function () {
				deskCard.classList.toggle("dimmer-active");
				var isActive = deskCard.classList.contains("dimmer-active");
				dimmerBtn.setAttribute("aria-pressed", String(isActive));
			});
		}

		// 3. Timezone Cycle
		if (tzBtn) {
			tzBtn.addEventListener("click", function () {
				tzIndex = (tzIndex + 1) % tzModes.length;
				var curMode = tzModes[tzIndex];
				if (curMode === "est") {
					tzLabel.textContent = "EST (Homelab)";
					if (dialTzEl) dialTzEl.textContent = "EASTERN TIME • MICHIGAN";
				} else if (curMode === "local") {
					tzLabel.textContent = "Local Device Time";
					if (dialTzEl) dialTzEl.textContent = "LOCAL DEVICE TIME";
				} else {
					tzLabel.textContent = "UTC (Universal)";
					if (dialTzEl) dialTzEl.textContent = "COORDINATED UNIVERSAL TIME";
				}
			});
		}

		// 4. Fullscreen
		if (fsBtn) {
			fsBtn.addEventListener("click", function () {
				if (!document.fullscreenElement) {
					document.documentElement.requestFullscreen().catch(function () {});
				} else {
					document.exitFullscreen().catch(function () {});
				}
			});
		}

		// 5. Continuous Clock Render Loop
		function renderDeskClock() {
			var now = new Date();
			var curMode = tzModes[tzIndex];
			var targetTz = curMode === "est" ? "America/New_York" : (curMode === "utc" ? "UTC" : undefined);

			var dateObj;
			if (targetTz) {
				var str = now.toLocaleString("en-US", { timeZone: targetTz });
				dateObj = new Date(str);
			} else {
				dateObj = now;
			}

			var h = dateObj.getHours();
			var m = dateObj.getMinutes();
			var s = dateObj.getSeconds();
			var ms = now.getMilliseconds();

			// 60fps mechanical sweep
			var secAngle = (s + ms / 1000) * 6;
			var minAngle = (m + s / 60) * 6;
			var hourAngle = ((h % 12) + m / 60) * 30;

			if (hourHand) hourHand.setAttribute("transform", "rotate(" + hourAngle.toFixed(2) + " 100 100)");
			if (minHand) minHand.setAttribute("transform", "rotate(" + minAngle.toFixed(2) + " 100 100)");
			if (secHand) secHand.setAttribute("transform", "rotate(" + secAngle.toFixed(2) + " 100 100)");

			// Digital Readouts
			if (timeValEl) {
				var h12 = h % 12 || 12;
				var pad = function (n) { return n < 10 ? "0" + n : "" + n; };
				timeValEl.textContent = pad(h12) + ":" + pad(m) + ":" + pad(s);
				if (ampmEl) ampmEl.textContent = h >= 12 ? "PM" : "AM";
				if (zoneEl) zoneEl.textContent = curMode === "est" ? "EDT" : (curMode === "utc" ? "UTC" : "LOCAL");
			}

			if (dateEl) {
				var days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
				var months = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
				dateEl.textContent = days[dateObj.getDay()] + ", " + months[dateObj.getMonth()] + " " + dateObj.getDate() + ", " + dateObj.getFullYear();
			}

			requestAnimationFrame(renderDeskClock);
		}

		requestAnimationFrame(renderDeskClock);
	}

		function initAllEasterEggs() {
		var buffer = "";

		window.addEventListener("keydown", function (e) {
			// Suppress easter eggs when user is typing in form inputs, textareas, contenteditable elements, or chat
			var tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : "";
			if (tag === "input" || tag === "textarea" || (e.target && e.target.isContentEditable) ||
				(e.target && e.target.closest && e.target.closest(".portfolio-chat, .portfolio-phone, .portfolio-chat-panel, .portfolio-phone-panel, form, input, textarea"))) {
				return;
			}
			if (e.key && e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
				buffer = (buffer + e.key.toLowerCase()).slice(-10);
				if (buffer.endsWith("andrew")) {
					buffer = "";
					triggerFaviconExplosion();
				} else if (buffer.endsWith("apple")) {
					buffer = "";
					triggerAppleRain();
				} else if (buffer.endsWith("windows")) {
					buffer = "";
					triggerWindowsZoom();
				} else if (buffer.endsWith("android")) {
					buffer = "";
					triggerAndroidSurprise();
				} else if (buffer.endsWith("iphone")) {
					buffer = "";
					triggerIphoneEntrance();
				} else if (buffer.endsWith("500t")) {
					buffer = "";
					triggerAntigravity500TMilestone();
				}
			}
		});

		// 1. Andrew Favicon Radial Blast
		function triggerFaviconExplosion() {
			var numParticles = 46;
			var centerX = window.innerWidth / 2;
			var centerY = window.innerHeight / 2;

			var iconLink = document.querySelector("link[rel*='icon']");
			var iconSrc = (iconLink && iconLink.getAttribute("href")) || "favicon.ico";

			var container = document.createElement("div");
			container.className = "andrew-favicon-blast";
			container.style.position = "fixed";
			container.style.left = "0";
			container.style.top = "0";
			container.style.width = "100vw";
			container.style.height = "100vh";
			container.style.pointerEvents = "none";
			container.style.zIndex = "999999";
			container.style.overflow = "hidden";
			document.body.appendChild(container);

			var particles = [];

			for (var i = 0; i < numParticles; i++) {
				var img = document.createElement("img");
				img.src = iconSrc;
				img.alt = "";
				var size = 26 + Math.random() * 26;
				img.style.position = "absolute";
				img.style.width = size + "px";
				img.style.height = size + "px";
				img.style.left = (centerX - size / 2) + "px";
				img.style.top = (centerY - size / 2) + "px";
				img.style.willChange = "transform, opacity";
				img.style.filter = "drop-shadow(0 4px 10px rgba(0, 45, 90, 0.4))";
				container.appendChild(img);

				var angle = Math.random() * Math.PI * 2;
				var speed = 7 + Math.random() * 14;
				var vx = Math.cos(angle) * speed;
				var vy = Math.sin(angle) * speed - (4 + Math.random() * 4);
				var spin = (Math.random() - 0.5) * 22;

				particles.push({
					el: img,
					x: centerX - size / 2,
					y: centerY - size / 2,
					vx: vx,
					vy: vy,
					rotation: Math.random() * 360,
					spin: spin,
					opacity: 1,
					scale: 1,
					decay: 0.011 + Math.random() * 0.008
				});
			}

			var gravity = 0.42;

			function animate() {
				var alive = false;
				for (var j = 0; j < particles.length; j++) {
					var p = particles[j];
					p.x += p.vx;
					p.y += p.vy;
					p.vy += gravity;
					p.vx *= 0.985;
					p.rotation += p.spin;
					p.opacity -= p.decay;
					p.scale = Math.max(0.2, p.scale - 0.004);

					if (p.opacity > 0) {
						alive = true;
						p.el.style.transform = "translate3d(" + (p.x - centerX) + "px, " + (p.y - centerY) + "px, 0) rotate(" + p.rotation + "deg) scale(" + p.scale + ")";
						p.el.style.opacity = p.opacity;
					} else {
						p.el.style.opacity = "0";
					}
				}

				if (alive) {
					requestAnimationFrame(animate);
				} else {
					if (container.parentNode) container.parentNode.removeChild(container);
				}
			}

			requestAnimationFrame(animate);
		}

		// 2. Apple Emojis & 1984 Rain
		function triggerAppleRain() {
			var container = document.createElement("div");
			container.className = "apple-rain-overlay";
			container.style.position = "fixed";
			container.style.left = "0";
			container.style.top = "0";
			container.style.width = "100vw";
			container.style.height = "100vh";
			container.style.pointerEvents = "none";
			container.style.zIndex = "999999";
			container.style.overflow = "hidden";
			document.body.appendChild(container);

			var symbols = ["🍎", "🍏", "1984", "🍎", "🍏", "1984", "🍎"];
			var drops = [];
			var numDrops = 52;

			for (var i = 0; i < numDrops; i++) {
				var drop = document.createElement("div");
				var item = symbols[Math.floor(Math.random() * symbols.length)];
				drop.textContent = item;
				drop.style.position = "absolute";
				drop.style.left = (Math.random() * 95) + "vw";
				drop.style.top = (-40 - Math.random() * 60) + "px";
				drop.style.userSelect = "none";
				drop.style.willChange = "transform, opacity";

				if (item === "1984") {
					drop.style.fontFamily = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
					drop.style.fontWeight = "900";
					drop.style.fontSize = (16 + Math.random() * 18) + "px";
					drop.style.color = "#facc15";
					drop.style.textShadow = "0 0 8px rgba(250, 204, 21, 0.6)";
					drop.style.letterSpacing = "0.08em";
				} else {
					drop.style.fontSize = (24 + Math.random() * 26) + "px";
					drop.style.filter = "drop-shadow(0 4px 10px rgba(0,0,0,0.3))";
				}

				container.appendChild(drop);

				drops.push({
					el: drop,
					y: -40 - Math.random() * 80,
					speed: 3 + Math.random() * 6.5,
					drift: (Math.random() - 0.5) * 1.5,
					xDrift: 0,
					rot: (Math.random() - 0.5) * 20,
					rotSpeed: (Math.random() - 0.5) * 3,
					opacity: 1
				});
			}

			var startTime = performance.now();
			function fall(now) {
				var elapsed = (now - startTime) / 1000;
				var alive = false;
				for (var j = 0; j < drops.length; j++) {
					var d = drops[j];
					d.y += d.speed;
					d.xDrift += d.drift;
					d.rot += d.rotSpeed;

					if (d.y < window.innerHeight + 60 && elapsed < 5.5) {
						alive = true;
						var fade = elapsed > 4.2 ? Math.max(0, 1 - (elapsed - 4.2) / 1.3) : 1;
						d.el.style.transform = "translate3d(" + d.xDrift + "px, " + d.y + "px, 0) rotate(" + d.rot + "deg)";
						d.el.style.opacity = fade;
					} else {
						d.el.style.opacity = "0";
					}
				}

				if (alive) {
					requestAnimationFrame(fall);
				} else {
					if (container.parentNode) container.parentNode.removeChild(container);
				}
			}
			requestAnimationFrame(fall);
		}

		// 3. Windows 10 Logo Expanding & Fading
		function triggerWindowsZoom() {
			var overlay = document.createElement("div");
			overlay.className = "windows-zoom-overlay";
			overlay.style.position = "fixed";
			overlay.style.inset = "0";
			overlay.style.zIndex = "999999";
			overlay.style.pointerEvents = "none";
			overlay.style.display = "flex";
			overlay.style.alignItems = "center";
			overlay.style.justifyContent = "center";
			overlay.style.background = "rgba(0, 0, 0, 0.4)";
			overlay.style.backdropFilter = "blur(2px)";
			overlay.style.overflow = "hidden";
			overlay.style.transition = "opacity 0.4s ease-out";

			var svgWrapper = document.createElement("div");
			svgWrapper.style.transformOrigin = "center center";
			svgWrapper.style.willChange = "transform, opacity";

			svgWrapper.innerHTML = [
				'<svg viewBox="0 0 88 88" width="130" height="130" style="filter: drop-shadow(0 0 35px rgba(0, 164, 239, 0.95));">',
				'  <polygon points="0,12 36,7 36,42 0,42" fill="#00a4ef"/>',
				'  <polygon points="40,6 88,0 88,42 40,42" fill="#00a4ef"/>',
				'  <polygon points="0,46 36,46 36,81 0,76" fill="#00a4ef"/>',
				'  <polygon points="40,46 88,46 88,88 40,82" fill="#00a4ef"/>',
				'</svg>'
			].join("");

			overlay.appendChild(svgWrapper);
			document.body.appendChild(overlay);

			var startTime = performance.now();
			var duration = 3200; // ms

			function zoom(now) {
				var progress = (now - startTime) / duration;
				if (progress >= 1) {
					if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
					return;
				}

				// Exponential smooth scale from 0.1 to 32
				var scale = 0.1 + Math.pow(progress, 2.6) * 36;
				var opacity = 1;
				if (progress < 0.12) {
					opacity = progress / 0.12;
				} else if (progress > 0.72) {
					opacity = Math.max(0, 1 - (progress - 0.72) / 0.28);
				}

				svgWrapper.style.transform = "scale(" + scale.toFixed(3) + ")";
				svgWrapper.style.opacity = opacity.toFixed(3);
				overlay.style.background = "rgba(0, 0, 0, " + (0.45 * opacity).toFixed(3) + ")";

				requestAnimationFrame(zoom);
			}

			requestAnimationFrame(zoom);
		}

		// 4. Android Bugdroid Backflip & Sweet Desserts Celebration
		function triggerAndroidSurprise() {
			var container = document.createElement("div");
			container.className = "android-surprise-overlay";
			container.style.position = "fixed";
			container.style.inset = "0";
			container.style.zIndex = "999999";
			container.style.pointerEvents = "none";
			container.style.overflow = "hidden";

			// Bugdroid Character Element
			var droid = document.createElement("div");
			droid.style.position = "absolute";
			droid.style.bottom = "-160px";
			droid.style.left = "calc(50% - 60px)";
			droid.style.width = "120px";
			droid.style.height = "130px";
			droid.style.willChange = "transform, opacity";
			droid.style.textAlign = "center";

			// Clean Android Bugdroid SVG
			droid.innerHTML = [
				'<div class="android-speech-bubble" style="background:#0f172a; border:2px solid #3ddc84; border-radius:12px; padding:6px 12px; color:#3ddc84; font-family:sans-serif; font-weight:800; font-size:0.85rem; box-shadow:0 4px 14px rgba(61,220,132,0.4); margin-bottom:8px; white-space:nowrap; display:inline-block;">',
				'  Hello Android! 🤖 👋',
				'</div>',
				'<svg viewBox="0 0 100 105" width="100" height="105" style="filter: drop-shadow(0 6px 16px rgba(0,0,0,0.45));">',
				'  <!-- Antennae -->',
				'  <line x1="36" y1="20" x2="26" y2="6" stroke="#3ddc84" stroke-width="4.5" stroke-linecap="round"/>',
				'  <line x1="64" y1="20" x2="74" y2="6" stroke="#3ddc84" stroke-width="4.5" stroke-linecap="round"/>',
				'  <!-- Head -->',
				'  <path d="M 22 36 A 28 28 0 0 1 78 36 Z" fill="#3ddc84"/>',
				'  <!-- Eyes -->',
				'  <circle cx="38" cy="26" r="3.2" fill="#ffffff"/>',
				'  <circle cx="62" cy="26" r="3.2" fill="#ffffff"/>',
				'  <!-- Torso Body -->',
				'  <rect x="22" y="41" width="56" height="46" rx="6" fill="#3ddc84"/>',
				'  <!-- Left Arm -->',
				'  <rect x="8" y="43" width="9" height="34" rx="4.5" fill="#3ddc84"/>',
				'  <!-- Right Waving Arm -->',
				'  <rect x="83" y="32" width="9" height="34" rx="4.5" fill="#3ddc84" transform="rotate(-25 87 32)"/>',
				'  <!-- Legs -->',
				'  <rect x="33" y="90" width="9" height="15" rx="4.5" fill="#3ddc84"/>',
				'  <rect x="58" y="90" width="9" height="15" rx="4.5" fill="#3ddc84"/>',
				'</svg>'
			].join("");

			container.appendChild(droid);
			document.body.appendChild(container);

			var desserts = ["🧁", "🍩", "🍬", "🍦", "🍭", "🍫", "🍪", "🍡", "🧁", "🍩", "🍬"];
			var candies = [];

			function spawnDessertShower() {
				for (var k = 0; k < 28; k++) {
					var el = document.createElement("div");
					el.textContent = desserts[k % desserts.length];
					el.style.position = "absolute";
					el.style.left = (window.innerWidth / 2) + "px";
					el.style.bottom = "120px";
					el.style.fontSize = (22 + Math.random() * 18) + "px";
					el.style.userSelect = "none";
					el.style.willChange = "transform, opacity";
					container.appendChild(el);

					var angle = (Math.PI * 0.15) + (Math.random() * Math.PI * 0.7); // upward arc
					var speed = 7 + Math.random() * 11;
					candies.push({
						el: el,
						x: window.innerWidth / 2,
						y: window.innerHeight - 120,
						vx: Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1),
						vy: -Math.sin(angle) * speed,
						rot: Math.random() * 360,
						spin: (Math.random() - 0.5) * 16,
						opacity: 1
					});
				}
			}

			var startTime = performance.now();
			var popped = false;

			function animateDroid(now) {
				var t = (now - startTime) / 1000;

				// Phase 1: Pop up (0.0s - 0.8s)
				if (t < 0.8) {
					var p = t / 0.8;
					var ease = 1 - Math.pow(1 - p, 3);
					var y = -160 + ease * 200; // ends at bottom: 40px
					droid.style.transform = "translateY(" + (-y) + "px)";
				}
				// Phase 2: Energetic backflip and dessert burst (0.8s - 1.8s)
				else if (t < 1.8) {
					if (!popped) {
						popped = true;
						spawnDessertShower();
					}
					var flipP = (t - 0.8) / 1.0;
					var jumpY = Math.sin(flipP * Math.PI) * 90;
					var flipAngle = -flipP * 360;
					droid.style.transform = "translateY(" + (-200 - jumpY) + "px) rotate(" + flipAngle + "deg)";
				}
				// Phase 3: Happy pause and wave (1.8s - 2.8s)
				else if (t < 2.8) {
					droid.style.transform = "translateY(-200px) scale(" + (1 + Math.sin((t - 1.8) * 10) * 0.05) + ")";
				}
				// Phase 4: Slide back down (2.8s - 3.6s)
				else if (t < 3.6) {
					var exitP = (t - 2.8) / 0.8;
					var easeOut = Math.pow(exitP, 2);
					var yExit = 200 - easeOut * 240;
					droid.style.transform = "translateY(" + (-yExit) + "px)";
					droid.style.opacity = Math.max(0, 1 - exitP);
				}

				// Animate dessert candies
				for (var c = 0; c < candies.length; c++) {
					var item = candies[c];
					item.x += item.vx;
					item.y += item.vy;
					item.vy += 0.42; // gravity
					item.rot += item.spin;
					item.opacity -= 0.012;
					if (item.opacity > 0) {
						item.el.style.transform = "translate3d(" + (item.x - window.innerWidth / 2) + "px, " + (item.y - (window.innerHeight - 120)) + "px, 0) rotate(" + item.rot + "deg)";
						item.el.style.opacity = item.opacity;
					} else {
						item.el.style.opacity = "0";
					}
				}

				if (t < 3.8) {
					requestAnimationFrame(animateDroid);
				} else {
					if (container.parentNode) container.parentNode.removeChild(container);
				}
			}

			requestAnimationFrame(animateDroid);
		}

		// 5. iPhone 2007 Steve Jobs Keynote Entrance
		function triggerIphoneEntrance() {
			var overlay = document.createElement("div");
			overlay.className = "iphone-entrance-overlay";
			overlay.style.position = "fixed";
			overlay.style.inset = "0";
			overlay.style.zIndex = "999999";
			overlay.style.pointerEvents = "none";
			overlay.style.display = "flex";
			overlay.style.alignItems = "center";
			overlay.style.justifyContent = "center";
			overlay.style.background = "radial-gradient(circle at 50% 45%, rgba(15, 23, 42, 0.85) 0%, rgba(2, 6, 23, 0.94) 85%)";
			overlay.style.backdropFilter = "blur(4px)";
			overlay.style.overflow = "hidden";
			overlay.style.transition = "opacity 0.5s ease-out";

			var card = document.createElement("div");
			card.style.background = "rgba(15, 23, 42, 0.92)";
			card.style.border = "1px solid rgba(56, 189, 248, 0.4)";
			card.style.borderRadius = "20px";
			card.style.padding = "32px 36px";
			card.style.boxShadow = "0 25px 60px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.25)";
			card.style.textAlign = "center";
			card.style.maxWidth = "480px";
			card.style.width = "calc(100vw - 40px)";
			card.style.color = "#f8fafc";
			card.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif";
			card.style.willChange = "transform, opacity";

			card.innerHTML = [
				'<div style="font-size:0.75rem; font-weight:800; letter-spacing:0.12em; color:#facc15; text-transform:uppercase; margin-bottom:8px;">',
				'  January 9, 2007 &bull; Moscone Center, San Francisco',
				'</div>',
				'<div style="font-size:3.8rem; font-weight:900; line-height:1; letter-spacing:-0.03em; background:linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #94a3b8 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; margin-bottom:14px;">',
				'  2007',
				'</div>',
				'<div style="margin: 12px auto; display:flex; justify-content:center;">',
				'  <!-- Classic Original 2007 iPhone Silhouette -->',
				'  <svg viewBox="0 0 64 120" width="64" height="120" style="filter: drop-shadow(0 6px 18px rgba(56, 189, 248, 0.35));">',
				'    <!-- Aluminum & Glass Bezel -->',
				'    <rect x="2" y="2" width="60" height="116" rx="12" fill="#1e293b" stroke="#94a3b8" stroke-width="2.5"/>',
				'    <!-- Screen Glass -->',
				'    <rect x="7" y="18" width="50" height="78" rx="3" fill="#0284c7" fill-opacity="0.25" stroke="#38bdf8" stroke-width="1.2"/>',
				'    <!-- Speaker Earpiece -->',
				'    <line x1="26" y1="10" x2="38" y2="10" stroke="#cbd5e1" stroke-width="2.5" stroke-linecap="round"/>',
				'    <!-- Classic Circular Home Button -->',
				'    <circle cx="32" cy="105" r="5.5" fill="#0f172a" stroke="#cbd5e1" stroke-width="1.5"/>',
				'    <rect x="29.5" y="102.5" width="5" height="5" rx="1" fill="none" stroke="#94a3b8" stroke-width="0.9"/>',
				'  </svg>',
				'</div>',
				'<p style="font-size:1.05rem; font-weight:600; color:#f8fafc; margin:14px 0 6px; line-height:1.4;">',
				'  &ldquo;Every once in a while, a revolutionary product comes along that changes everything.&rdquo;',
				'</p>',
				'<div style="font-size:0.85rem; font-weight:700; color:#38bdf8; text-transform:uppercase; letter-spacing:0.08em; margin-top:8px;">',
				'  Apple Reinvents The Phone.',
				'</div>'
			].join("");

			overlay.appendChild(card);
			document.body.appendChild(overlay);

			var startTime = performance.now();
			var duration = 4400; // ms

			function animateIphone(now) {
				var t = (now - startTime) / 1000;

				// Glide in (0s - 0.7s)
				if (t < 0.7) {
					var p = t / 0.7;
					var ease = 1 - Math.pow(1 - p, 3);
					card.style.transform = "translateX(" + ((1 - ease) * 120) + "vw) scale(" + (0.85 + ease * 0.15) + ")";
					card.style.opacity = ease;
				}
				// Hold with subtle floating shimmer (0.7s - 3.6s)
				else if (t < 3.6) {
					var floatY = Math.sin((t - 0.7) * 2.5) * 4;
					card.style.transform = "translateY(" + floatY + "px) scale(1)";
					card.style.opacity = 1;
				}
				// Glide out to left and fade (3.6s - 4.4s)
				else if (t < 4.4) {
					var exitP = (t - 3.6) / 0.8;
					var exitEase = Math.pow(exitP, 2.5);
					card.style.transform = "translateX(" + (-exitEase * 120) + "vw) scale(" + (1 - exitEase * 0.15) + ")";
					card.style.opacity = Math.max(0, 1 - exitP);
					overlay.style.opacity = Math.max(0, 1 - exitP);
				} else {
					if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
					return;
				}

				requestAnimationFrame(animateIphone);
			}

			requestAnimationFrame(animateIphone);
		}

		// 6. Antigravity 500 Tasks Milestone Zero-G Confetti Explosion [500T]
		function triggerAntigravity500TMilestone() {
			// Web Audio celebratory celestial arpeggio
			try {
				var AudioCtx = window.AudioContext || window.webkitAudioContext;
				if (AudioCtx) {
					var actx = new AudioCtx();
					var arpeggio = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
					arpeggio.forEach(function (freq, idx) {
						var osc = actx.createOscillator();
						var gain = actx.createGain();
						osc.type = "sine";
						osc.frequency.setValueAtTime(freq, actx.currentTime + idx * 0.08);
						gain.gain.setValueAtTime(0, actx.currentTime + idx * 0.08);
						gain.gain.linearRampToValueAtTime(0.12, actx.currentTime + idx * 0.08 + 0.02);
						gain.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + idx * 0.08 + 0.7);
						osc.connect(gain);
						gain.connect(actx.destination);
						osc.start(actx.currentTime + idx * 0.08);
						osc.stop(actx.currentTime + idx * 0.08 + 0.75);
					});
				}
			} catch (e) {}

			var container = document.createElement("div");
			container.className = "antigravity-zero-g-blast";
			container.style.position = "fixed";
			container.style.left = "0";
			container.style.top = "0";
			container.style.width = "100vw";
			container.style.height = "100vh";
			container.style.pointerEvents = "none";
			container.style.zIndex = "9999999";
			container.style.overflow = "hidden";
			document.body.appendChild(container);

			// Milestone Neon HUD Banner
			var banner = document.createElement("div");
			banner.style.position = "fixed";
			banner.style.top = "28px";
			banner.style.left = "50%";
			banner.style.transform = "translateX(-50%) translateY(-25px) scale(0.9)";
			banner.style.background = "linear-gradient(135deg, rgba(15, 23, 42, 0.94), rgba(30, 41, 59, 0.94))";
			banner.style.border = "2px solid #38bdf8";
			banner.style.boxShadow = "0 0 40px rgba(56, 189, 248, 0.5), 0 0 15px rgba(168, 85, 247, 0.35)";
			banner.style.borderRadius = "14px";
			banner.style.padding = "14px 28px";
			banner.style.textAlign = "center";
			banner.style.color = "#f8fafc";
			banner.style.fontFamily = "system-ui, -apple-system, sans-serif";
			banner.style.pointerEvents = "none";
			banner.style.zIndex = "10000000";
			banner.style.opacity = "0";
			banner.style.transition = "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)";
			banner.innerHTML = '<div style="font-size:0.75rem; font-weight:800; letter-spacing:0.16em; color:#38bdf8; text-transform:uppercase; margin-bottom:3px;">🚀 500 Tasks Milestone Unlocked 🏆</div>' +
				'<div style="font-size:1.35rem; font-weight:900; background:linear-gradient(90deg, #38bdf8, #c084fc, #fbbf24); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">ANTIGRAVITY ZERO-G CONFETTI [500T]</div>' +
				'<div style="font-size:0.8rem; color:#94a3b8; margin-top:3px;">Celebrating 500+ documented homelab tasks across the fleet!</div>';
			container.appendChild(banner);

			setTimeout(function () {
				banner.style.opacity = "1";
				banner.style.transform = "translateX(-50%) translateY(0) scale(1)";
			}, 30);

			setTimeout(function () {
				banner.style.opacity = "0";
				banner.style.transform = "translateX(-50%) translateY(-20px) scale(0.95)";
			}, 4800);

			function createAgyBadgeSvg(size) {
				var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
				svg.setAttribute("viewBox", "0 0 100 100");
				svg.setAttribute("width", size);
				svg.setAttribute("height", size);
				svg.style.filter = "drop-shadow(0 0 10px rgba(56, 189, 248, 0.7))";
				svg.innerHTML = '<polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="#0f172a" stroke="#38bdf8" stroke-width="4" />' +
					'<polygon points="50,18 82,34 82,66 50,82 18,66 18,34" fill="rgba(30, 41, 59, 0.85)" stroke="#c084fc" stroke-width="2" />' +
					'<path d="M50 26 L68 56 L56 56 L56 70 L44 70 L44 56 L32 56 Z" fill="url(#agyG)" />' +
					'<defs><linearGradient id="agyG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#c084fc"/></linearGradient></defs>' +
					'<text x="50" y="88" font-family="monospace" font-size="11" font-weight="900" fill="#38bdf8" text-anchor="middle">AGY</text>';
				return svg;
			}

			function createMilestoneBadgeSvg(size) {
				var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
				svg.setAttribute("viewBox", "0 0 100 100");
				svg.setAttribute("width", size);
				svg.setAttribute("height", size);
				svg.style.filter = "drop-shadow(0 0 10px rgba(251, 191, 36, 0.75))";
				svg.innerHTML = '<circle cx="50" cy="50" r="44" fill="#1e293b" stroke="#fbbf24" stroke-width="5" />' +
					'<circle cx="50" cy="50" r="37" fill="rgba(15, 23, 42, 0.9)" stroke="#fef08a" stroke-dasharray="3,3" stroke-width="1.5" />' +
					'<text x="50" y="53" font-family="monospace" font-size="20" font-weight="900" fill="#fbbf24" text-anchor="middle">500T</text>' +
					'<text x="50" y="69" font-family="system-ui, sans-serif" font-size="8" font-weight="800" fill="#38bdf8" text-anchor="middle">TASKS</text>' +
					'<polygon points="50,14 52,19 57,19 53,22 55,27 50,24 45,27 47,22 43,19 48,19" fill="#fbbf24" />';
				return svg;
			}

			function createSparkleSvg(size, color) {
				var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
				svg.setAttribute("viewBox", "0 0 60 60");
				svg.setAttribute("width", size);
				svg.setAttribute("height", size);
				svg.style.filter = "drop-shadow(0 0 6px " + color + ")";
				svg.innerHTML = '<path d="M30 0 Q30 30 60 30 Q30 30 30 60 Q30 30 0 30 Q30 30 30 0 Z" fill="' + color + '" />';
				return svg;
			}

			var numParticles = 54;
			var centerX = window.innerWidth / 2;
			var centerY = window.innerHeight * 0.52;
			var particles = [];

			for (var i = 0; i < numParticles; i++) {
				var type = i % 3;
				var size = (type === 0) ? (34 + Math.random() * 22) : (type === 1) ? (32 + Math.random() * 20) : (18 + Math.random() * 16);
				var el;
				if (type === 0) {
					el = createAgyBadgeSvg(size);
				} else if (type === 1) {
					el = createMilestoneBadgeSvg(size);
				} else {
					var colors = ["#38bdf8", "#c084fc", "#fbbf24", "#34d399", "#f43f5e"];
					el = createSparkleSvg(size, colors[i % colors.length]);
				}
				el.style.position = "absolute";
				el.style.left = (centerX - size / 2) + "px";
				el.style.top = (centerY - size / 2) + "px";
				el.style.willChange = "transform, opacity";
				container.appendChild(el);

				var angle = Math.random() * Math.PI * 2;
				var speed = 3.0 + Math.random() * 9.0;
				var vx = Math.cos(angle) * speed;
				var vy = Math.sin(angle) * speed - (1.5 + Math.random() * 3.5);
				var spin = (Math.random() - 0.5) * 8.0;

				particles.push({
					el: el,
					x: centerX - size / 2,
					y: centerY - size / 2,
					vx: vx,
					vy: vy,
					rotation: Math.random() * 360,
					spin: spin,
					opacity: 1,
					scale: 0.3 + Math.random() * 0.7,
					wobble: Math.random() * Math.PI * 2,
					decay: 0.0035 + Math.random() * 0.003
				});
			}

			function animateZeroG() {
				var alive = false;
				for (var j = 0; j < particles.length; j++) {
					var p = particles[j];
					p.x += p.vx;
					p.y += p.vy;
					p.vx *= 0.988;
					p.vy *= 0.988;
					p.vy -= 0.038; // Anti-gravity upward buoyancy!
					p.x += Math.sin(p.wobble) * 0.4;
					p.wobble += 0.04;
					p.rotation += p.spin;
					p.opacity -= p.decay;
					p.scale = Math.min(1.15, p.scale + 0.02);

					if (p.opacity > 0) {
						alive = true;
						p.el.style.transform = "translate3d(" + (p.x - centerX) + "px, " + (p.y - centerY) + "px, 0) rotate(" + p.rotation + "deg) scale(" + p.scale + ")";
						p.el.style.opacity = p.opacity;
					} else {
						p.el.style.opacity = "0";
					}
				}

				if (alive) {
					requestAnimationFrame(animateZeroG);
				} else {
					if (container.parentNode) container.parentNode.removeChild(container);
				}
			}

			requestAnimationFrame(animateZeroG);
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
		initNavPlasmaWaves();
		initEstAnalogClock();
		initGlobalInternetRadar();
		initDedicatedDeskClock();
		initAllEasterEggs();
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", initialize);
	} else {
		initialize();
	}
}());
