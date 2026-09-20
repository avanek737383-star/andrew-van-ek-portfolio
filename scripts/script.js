// Shared portfolio interactions

(function () {
	"use strict";

	var apiUrl = "https://nucwol2-0--hdd.taile72a68.ts.net/website-chat";
	var statusUrl = "https://nucwol2-0--hdd.taile72a68.ts.net/website-chat/stats";
	var history = [];
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
			if (window.innerWidth > 900) setOpen(false);
		});
	}

	function createContactTools() {
		var copyButton = document.querySelector("[data-copy-email]");
		if (!copyButton) return;
		copyButton.addEventListener("click", async function () {
			var original = copyButton.textContent;
			try {
				await navigator.clipboard.writeText(copyButton.getAttribute("data-copy-email"));
				copyButton.textContent = "Copied";
			} catch (error) {
				copyButton.textContent = "Copy unavailable";
			}
			window.setTimeout(function () {
				copyButton.textContent = original;
			}, 1800);
		});
	}

	function createChat() {
		var wrapper = document.createElement("aside");
		wrapper.className = "portfolio-chat";
		wrapper.hidden = true;
		wrapper.innerHTML = [
			'<button class="portfolio-chat-toggle" type="button" aria-expanded="false" aria-controls="portfolio-chat-panel">Ask my local AI</button>',
			'<section id="portfolio-chat-panel" class="portfolio-chat-panel" aria-label="Portfolio AI assistant" hidden>',
			'  <header class="portfolio-chat-header">',
			'    <div><strong>Andrew\'s Local AI</strong><span>Liquid LFM2.5 · privately hosted</span></div>',
			'    <button class="portfolio-chat-close" type="button" aria-label="Close chat">&times;</button>',
			'  </header>',
			'  <div class="portfolio-chat-messages" role="log" aria-live="polite">',
			'    <p class="chat-message chat-assistant">Hi! Ask me about Andrew\'s experience, skills, or this local-AI project.</p>',
			'  </div>',
			'  <form class="portfolio-chat-form">',
			'    <label class="sr-only" for="portfolio-chat-input">Message</label>',
			'    <input id="portfolio-chat-input" maxlength="1000" autocomplete="off" placeholder="Ask about Andrew..." required>',
			'    <button type="submit">Send</button>',
			'  </form>',
			'  <p class="portfolio-chat-note">Local AI responses may be inaccurate. 10 messages/minute.</p>',
			'</section>'
		].join("");
		document.body.appendChild(wrapper);

		var toggle = wrapper.querySelector(".portfolio-chat-toggle");
		var panel = wrapper.querySelector(".portfolio-chat-panel");
		var close = wrapper.querySelector(".portfolio-chat-close");
		var form = wrapper.querySelector(".portfolio-chat-form");
		var input = wrapper.querySelector("#portfolio-chat-input");
		var messages = wrapper.querySelector(".portfolio-chat-messages");

		function setOpen(open) {
			panel.hidden = !open;
			toggle.setAttribute("aria-expanded", String(open));
			if (open) {
				try {
					input.focus({ preventScroll: true });
				} catch (error) {
					input.focus();
				}
			}
		}

		async function checkAvailability() {
			try {
				var response = await fetch(statusUrl, { cache: "no-store" });
				var data = await response.json();
				var available = response.ok && data.status === "online";
				wrapper.hidden = !available;
				if (!available) setOpen(false);
			} catch (error) {
				wrapper.hidden = true;
				setOpen(false);
			}
		}

		function addMessage(text, role) {
			var message = document.createElement("p");
			message.className = "chat-message chat-" + role;
			message.textContent = text;
			messages.appendChild(message);
			messages.scrollTop = messages.scrollHeight;
			return message;
		}

		toggle.addEventListener("click", function () {
			setOpen(panel.hidden);
		});
		close.addEventListener("click", function () {
			setOpen(false);
			toggle.focus();
		});

		form.addEventListener("submit", async function (event) {
			event.preventDefault();
			if (waiting) return;
			var text = input.value.trim();
			if (!text) return;

			var requestHistory = history.slice(-8);
			addMessage(text, "user");
			history.push({ role: "user", content: text });
			input.value = "";
			waiting = true;
			form.querySelector("button").disabled = true;
			var pending = addMessage("Thinking locally…", "assistant");

			try {
				var response = await fetch(apiUrl, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ message: text, history: requestHistory })
				});
				var data = await response.json();
				if (!response.ok) throw new Error(data.error || "The assistant is unavailable.");
				pending.textContent = data.reply;
				history.push({ role: "assistant", content: data.reply });
			} catch (error) {
				pending.textContent = error.message || "The local assistant is temporarily offline.";
				pending.classList.add("chat-error");
			} finally {
				waiting = false;
				form.querySelector("button").disabled = false;
				input.focus();
				messages.scrollTop = messages.scrollHeight;
			}
		});

		checkAvailability();
		window.setInterval(checkAvailability, 30000);
	}

	function initialize() {
		createResponsiveNavigation();
		createContactTools();
		createChat();
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", initialize);
	} else {
		initialize();
	}
}());
