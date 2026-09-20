// Shared portfolio interactions

function hamburger() {
	var menu = document.getElementById("menu-links");
	if (!menu) return;
	if (menu.style.display === "block") {
		menu.style.display = "none";
	} else {
		menu.style.display = "block";
		menu.style.backgroundColor = "#e2eae2";
	}
}

(function () {
	"use strict";

	var apiUrl = "https://nucwol2-0--hdd.taile72a68.ts.net/website-chat";
	var history = [];
	var waiting = false;

	function createChat() {
		var wrapper = document.createElement("aside");
		wrapper.className = "portfolio-chat";
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
			if (open) input.focus();
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
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", createChat);
	} else {
		createChat();
	}
}());
