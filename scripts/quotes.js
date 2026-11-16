(function () {
	'use strict';

	var HOMELAB_QUOTES = [
		{
			id: 'if-it-isnt-broke',
			quote: "If it isn't broke, do fix it.",
			category: 'Philosophy & Mindset',
			context: 'The foundational engineering philosophy behind continuously optimizing, stress-testing, and upgrading stable homelab systems before failure strikes.',
			projectTitle: 'Andrew Van Ek &mdash; Homelab Philosophy',
			projectHref: 'index.html'
		},
		{
			id: 'thermal-100-deg',
			quote: 'May your temperatures be 100 degrees Fahrenheit, not 100 degrees CPU.',
			category: 'Thermals & Hardware',
			context: 'Born during an intensive heatsink overhaul, Arctic MX-4 repaste, and fan airflow optimization on an overheating laptop.',
			projectTitle: 'HP Laptop Cooling Refresh: Thermal Interface Replacement',
			projectHref: 'projects.html#hp-thermal-refresh-title'
		},
		{
			id: 'adguard-magicdns',
			quote: "It's not DNS. There's no way it's DNS. It was DNS.",
			category: 'Networking & DNS',
			context: "When an encrypted DoH profile reports 'Device not protected' because a mesh VPN silently seized resolver slot #1 with priority order 100400.",
			projectTitle: 'Distraction-Free Workstation Filtering: AdGuard Cloud DNS & Tailscale Coexistence',
			projectHref: 'projects.html#adguard-dns-focus-profile-title'
		},
		{
			id: 'slideshow-usb-curse',
			quote: 'A USB SATA enclosure never disconnects... except five minutes before guests arrive for dinner.',
			category: 'Storage & Recovery',
			context: 'An external Sabrent SATA drive mysteriously reset its SCSI bus from /dev/sdc1 to /dev/sdd1, inspiring a persistent 15-minute kernel watchdog.',
			projectTitle: 'Intranet Gathering Slideshow, TLS & Recovery',
			projectHref: 'projects.html#slideshow-party-intranet-title'
		},
		{
			id: 'nuc-grub-cursor',
			quote: "A server isn't bricked as long as GRUB still blinks its cursor at you.",
			category: 'Storage & Recovery',
			context: 'Rescuing a critical headless Intel NUC after an initramfs corruption using live USB forensics, WSL2 disk mounting, and manual kernel recovery.',
			projectTitle: 'Headless Intel NUC Alpine Storage Recovery',
			projectHref: 'projects.html#intel-nuc-alpine-storage-recovery-title'
		},
		{
			id: 'lenovo-swollen-battery',
			quote: 'Never underestimate a stripped screw guarding a swollen lithium battery.',
			category: 'Thermals & Hardware',
			context: 'Happened while tearing down a Lenovo IdeaPad 2 11 to safely extract the motherboard and daughterboards. (The 2011 MacBook Pro battery was happily fine).',
			projectTitle: '2011 MacBook Pro Battery Removal & Hardware Isolation',
			projectHref: 'projects.html#macbook-2011-battery-removal-title'
		},
		{
			id: 'samsung-code-43',
			quote: 'The USB set address request failed, but engineer optimism remains persistent across reboots.',
			category: 'Legacy & Embedded',
			context: 'Navigating Windows Plug-and-Play Code 43 dropouts, 2014 OEM drivers, and micro-USB cable swaps while preparing a Samsung Galaxy S4 Mini for rooting.',
			projectTitle: 'Samsung Galaxy S4 Mini (SCH-I435): USB Troubleshooting',
			projectHref: 'projects.html#samsung-i435-rooting-title'
		},
		{
			id: 'qualcomm-diag-puzzle',
			quote: 'A flip phone without a carrier contract is just an embedded puzzle waiting for Qualcomm DIAG mode.',
			category: 'Legacy & Embedded',
			context: 'Sideloading BREW games and extracting decade-old family photos from an LG Accolade and Samsung Intensity II over raw serial AT diagnostics.',
			projectTitle: 'LG Accolade (VX5600): Qualcomm DIAG Exploitation & BREW Sideloading',
			projectHref: 'projects.html#lg-vx5600-brew-reversing-title'
		},
		{
			id: 'malware-undo-button',
			quote: 'Always snapshot before you detonate. The undo button is the truest virtue in malware analysis.',
			category: 'Security & Forensics',
			context: 'Detonating vintage worms, screen lockers, and ransomware in an isolated virtualized sandbox without letting packets leak to the physical LAN.',
			projectTitle: 'Windows XP Malware Lab: Offline VM Setup & Snapshot Recovery',
			projectHref: 'projects.html#windows-xp-malware-lab-title'
		},
		{
			id: 'bedroom-radiator-llm',
			quote: 'Why pay monthly cloud GPU fees when your bedroom radiator can stream 9B parameter tokens?',
			category: 'AI & Local Models',
			context: 'Deploying persistent GLM-4-9B quantized inference across a private Tailscale mesh streaming directly from local <span class="tech-term" data-term="homelab-silicon">homelab silicon</span>.',
			projectTitle: 'Persistent Homelab LLM Inference & Private Tailscale Mesh Streaming',
			projectHref: 'projects.html#glm4-tailscale-homelab-title'
		},
		{
			id: 'interstate-printer-enlightenment',
			quote: 'If you can ping your desk printer from an interstate rest stop over an encrypted WireGuard tunnel, you have achieved enlightenment.',
			category: 'Networking & DNS',
			context: 'Relaying raw CUPS IPP printing protocols over an Alpine Linux Tailscale reverse proxy without exposing ports to the public Internet.',
			projectTitle: 'Secure Out-of-Network Printing & Device Reverse Proxy via Tailscale',
			projectHref: 'projects.html#tailscale-printer-relay-title'
		},
		{
			id: 'bluefruit-clock-cycles',
			quote: "If your microcontroller isn't simultaneously blinking RGB NeoPixels and mining Duino-Coin, you're wasting clock cycles.",
			category: 'Fleet Mining',
			context: 'Coupling environmental temperature telemetry with AVR micro-mining alongside an Intel NUC cluster.',
			projectTitle: 'Circuit Playground Bluefruit: Live Room Telemetry & Duino-Coin',
			projectHref: 'projects.html#bluefruit-room-telemetry-title'
		},
		{
			id: 'drive-c-archaeology',
			quote: 'Drive C: never actually runs out of space; it merely accumulates forgotten cache archives.',
			category: 'Storage & Recovery',
			context: 'Executing precision filesystem forensics to liberate 65+ GB of trapped installer caches, shadow logs, and temp staging trees on Windows (<span class="tech-term" data-term="cache-archive">cache archives</span>).',
			projectTitle: 'Autonomous Drive C Forensics & Precision Reclamation',
			projectHref: 'projects.html#internal-drive-c-forensics-title'
		},
		{
			id: 'fleet-fan-curve-song',
			quote: "The fan curve doesn't whine; it sings the harmonious song of fleet hash rate.",
			category: 'Fleet Mining',
			context: 'Tuning custom workload intensities across M1 Apple Silicon, Intel Core i7 workstations, and AMD Ryzen laptops under MoneroOcean stratum telemetry.',
			projectTitle: 'Multi-Rig Stratum Worker Telemetry & Rig Disambiguation',
			projectHref: 'maintenance.html#macbook-air-m1-moneroocean-worker-naming-and-rig-telemetry'
		},
		{
			id: 'heatsink-cpu-lift',
			quote: 'May your heatsinks lift cleanly and not take the CPU with them.',
			category: 'Thermals & Hardware',
			context: 'A prayer for anyone who has ever pried up an AMD or laptop heatsink only to find the socketed CPU vacuum-glued directly to the copper heatpipe. (Courtesy of Microsoft 365 Copilot & Andrew Van Ek)',
			projectTitle: 'HP Laptop Cooling Refresh: Thermal Interface Replacement',
			projectHref: 'projects.html#hp-thermal-refresh-title'
		},
		{
			id: 'thermal-pad-origins',
			quote: 'May every thermal pad stay in one piece long enough for you to figure out where it came from.',
			category: 'Thermals & Hardware',
			context: 'Dedicated to the mysterious crumbling blue and pink VRM pads that tear in half when separating the vapor chamber from the motherboard. (Courtesy of Microsoft 365 Copilot & Andrew Van Ek)',
			projectTitle: 'HP Laptop Cooling Refresh: Thermal Interface Replacement',
			projectHref: 'projects.html#hp-thermal-refresh-title'
		},
		{
			id: 'ptm7950-perfect-contact',
			quote: 'May your PTM7950 make perfect contact on the first mount.',
			category: 'Thermals & Hardware',
			context: 'A tribute to the delicate art of peeling microscopic plastic backing film off <span class="tech-term" data-term="ptm7950">PTM7950 phase-change material</span> without ripping the pad before screw torquedown. (Courtesy of Microsoft 365 Copilot & Andrew Van Ek)',
			projectTitle: 'HP Laptop Cooling Refresh: Thermal Interface Replacement',
			projectHref: 'projects.html#hp-thermal-refresh-title'
		},
		{
			id: 'idle-temps-cool-fans-quiet',
			quote: 'May your idle temps be cool, your fans be quiet, and your benchmarks be stable.',
			category: 'Thermals & Hardware',
			context: 'The ultimate trifecta of homelab bliss after repasting copper heatsinks and stress-testing Cinebench loops with zero thermal throttling. (Courtesy of Microsoft 365 Copilot & Andrew Van Ek)',
			projectTitle: 'HP Laptop Cooling Refresh: Thermal Interface Replacement',
			projectHref: 'projects.html#hp-thermal-refresh-title'
		},
		{
			id: 'ribbon-cable-beneath-keyboard',
			quote: 'May not a single ribbon cable be forgotten beneath the keyboard.',
			category: 'Thermals & Hardware',
			context: 'Because snapping all 36 plastic chassis clips back together only to discover the trackpad or keyboard ribbon cable is trapped underneath the board is true pain. (Courtesy of Microsoft 365 Copilot & Andrew Van Ek)',
			projectTitle: 'HP Laptop Cooling Refresh & MacBook Hardware Teardowns',
			projectHref: 'projects.html#hp-thermal-refresh-title'
		},
		{
			id: 'workstation-screw-surplus',
			quote: 'A workstation taken apart in two hours shall be reassembled in six. A workstation taken apart in six hours shall still somehow have one screw left over.',
			category: 'Thermals & Hardware',
			context: 'The unwritten law of hardware repair: no matter how meticulously you organize your magnetic screw trays, the chassis always claims a surplus tribute. (Courtesy of Microsoft 365 Copilot & Andrew Van Ek)',
			projectTitle: 'HP ZBook Fury & Hardware Teardowns',
			projectHref: 'projects.html#hp-thermal-refresh-title'
		},
		{
			id: 'fury-performance-not-temps',
			quote: 'May your Fury be furious only in performance, never in temperatures.',
			category: 'Thermals & Hardware',
			context: 'Dedicated to the HP ZBook Fury Mobile Workstation (FREEHPGAMER) pushing max multi-threaded compute while keeping its dual vapor chamber chill. (Courtesy of Microsoft 365 Copilot & Andrew Van Ek)',
			projectTitle: 'HP ZBook Fury MoneroOcean Stratum Worker Telemetry',
			projectHref: 'maintenance.html#hp-zbook-fury-moneroocean-worker-naming-and-rig-telemetry'
		},
		{
			id: 'thanksgiving-turkey-troubleshooting',
			quote: 'May Thanksgiving bring more turkey than troubleshooting.',
			category: 'Philosophy & Mindset',
			context: 'The ultimate holiday homelab blessing for IT specialists and homelabbers tasked with family tech support between dinner courses. (Courtesy of Microsoft 365 Copilot & Andrew Van Ek)',
			projectTitle: 'Intranet Gathering Slideshow & Homelab Platforms',
			projectHref: 'projects.html#slideshow-party-intranet-title'
		},
		{
			id: 'connector-satisfying-click',
			quote: 'May every connector click satisfyingly into place.',
			category: 'Thermals & Hardware',
			context: 'That sublime, unmistakable tactile snap when an internal motherboard socket, battery harness, or front panel cable locks in securely on the first try. (Courtesy of Microsoft 365 Copilot & Andrew Van Ek)',
			projectTitle: 'MacBook & Lenovo Teardowns: Power Isolation',
			projectHref: 'projects.html#macbook-2011-battery-removal-title'
		},
		{
			id: 'three-disassemblies-cable',
			quote: 'The first disassembly builds confidence. The second disassembly builds skill. The third disassembly exists because you forgot a cable.',
			category: 'Thermals & Hardware',
			context: 'The universal three-stage cycle of laptop maintenance known to every engineer who has had to reopen a fully snapped chassis to plug in a trapped trackpad lead. (Courtesy of Microsoft 365 Copilot & Andrew Van Ek)',
			projectTitle: 'HP Laptop Cooling Refresh & Chassis Maintenance',
			projectHref: 'projects.html#hp-thermal-refresh-title'
		},
		{
			id: 'ptm7950-schrodinger-spread',
			quote: 'May your PTM7950 spread perfectly despite your inability to actually see it spread.',
			category: 'Thermals & Hardware',
			context: 'The Schrödinger’s thermal paste paradox: you torque down the heatsink, turn on the machine, and can only trust the thermodynamics working unseen beneath the copper. (Courtesy of Microsoft 365 Copilot & Andrew Van Ek)',
			projectTitle: 'HP Laptop Cooling Refresh: Thermal Interface Replacement',
			projectHref: 'projects.html#hp-thermal-refresh-title'
		},
		{
			id: 'never-hear-noise-before',
			quote: 'And may you never hear the words: “Huh... it wasn't making that noise before.”',
			category: 'Philosophy & Mindset',
			context: 'The seven most terrifying words in systems engineering, usually whispered immediately after pressing the power button following a routine hardware overhaul. (Courtesy of Microsoft 365 Copilot & Andrew Van Ek)',
			projectTitle: 'Headless Intel NUC & Fleet Diagnostics',
			projectHref: 'projects.html#intel-nuc-alpine-storage-recovery-title'
		},
		{
			id: 'avahi-mdns-local',
			quote: 'You can take the engineer out of the LAN, but you cannot stop Avahi mDNS from claiming .local.',
			category: 'Networking & DNS',
			context: 'Circumventing <span class="tech-term" data-term="doh-private-relay">Apple iOS DoH proxy redirects</span> by broadcasting zero-configuration Multicast DNS to claim the <span class="tech-term" data-term="dot-local-domain">.local domain</span>.',
			projectTitle: 'Intranet Gathering Slideshow, TLS, Facial Moderation & Avahi mDNS',
			projectHref: 'projects.html#slideshow-party-intranet-title'
		}
	];

	function showToast(msg) {
		var existing = document.getElementById('quote-toast');
		if (!existing) {
			existing = document.createElement('div');
			existing.id = 'quote-toast';
			existing.className = 'quote-toast';
			document.body.appendChild(existing);
		}
		existing.textContent = msg;
		existing.classList.add('show');
		setTimeout(function () {
			existing.classList.remove('show');
		}, 2200);
	}

	function copyToClipboard(text) {
		if (navigator.clipboard && navigator.clipboard.writeText) {
			navigator.clipboard.writeText(text).then(function () {
				showToast('Quote copied to clipboard! 📋');
			}).catch(function () {
				fallbackCopy(text);
			});
		} else {
			fallbackCopy(text);
		}
	}

	function fallbackCopy(text) {
		var ta = document.createElement('textarea');
		ta.value = text;
		ta.style.position = 'fixed';
		ta.style.left = '-9999px';
		document.body.appendChild(ta);
		ta.select();
		try {
			document.execCommand('copy');
			showToast('Quote copied to clipboard! 📋');
		} catch (e) {
			showToast('Failed to copy');
		}
		document.body.removeChild(ta);
	}

	// 1. Quotes Page Logic
	function initQuotesPage() {
		var featQuote = document.getElementById('featured-quote-text');
		var featContext = document.getElementById('featured-quote-context');
		var featCategory = document.getElementById('featured-quote-category');
		var featLink = document.getElementById('featured-project-link');
		var rollBtn = document.getElementById('roll-proverb-btn');
		var copyFeatBtn = document.getElementById('copy-featured-btn');
		var grid = document.getElementById('quotes-grid');
		var filterPills = document.querySelectorAll('.quotes-filter-pills .filter-pill');
		var countBadge = document.getElementById('quotes-count-badge');

		if (!grid) return;

		var currentFeatIndex = 1; // Start on the signature thermal quote

		function setFeatured(index) {
			currentFeatIndex = index;
			var item = HOMELAB_QUOTES[index];
			if (featQuote) featQuote.textContent = '“' + item.quote + '”';
			if (featContext) featContext.innerHTML = item.context;
			if (featCategory) featCategory.textContent = item.category;
			if (featLink) {
				featLink.href = item.projectHref;
				featLink.innerHTML = 'View Project: ' + item.projectTitle + ' &rarr;';
			}
			if (window.initTechAnalogies) {
				window.initTechAnalogies();
			}
		}

		if (rollBtn) {
			rollBtn.addEventListener('click', function () {
				var nextIndex;
				do {
					nextIndex = Math.floor(Math.random() * HOMELAB_QUOTES.length);
				} while (nextIndex === currentFeatIndex && HOMELAB_QUOTES.length > 1);
				setFeatured(nextIndex);
			});
		}

		if (copyFeatBtn) {
			copyFeatBtn.addEventListener('click', function () {
				var item = HOMELAB_QUOTES[currentFeatIndex];
				copyToClipboard('“' + item.quote + '” — ' + item.projectTitle);
			});
		}

		function renderGrid(filterCategory) {
			grid.innerHTML = '';
			var count = 0;

			HOMELAB_QUOTES.forEach(function (item) {
				if (filterCategory && filterCategory !== 'all' && item.category !== filterCategory) {
					return;
				}
				count++;

				var card = document.createElement('article');
				card.className = 'quote-card';
				card.setAttribute('data-category', item.category);

				var header = document.createElement('div');
				header.className = 'quote-card-header';
				var catTag = document.createElement('span');
				catTag.className = 'quote-category-tag';
				catTag.textContent = item.category;
				header.appendChild(catTag);

				var copyBtn = document.createElement('button');
				copyBtn.type = 'button';
				copyBtn.className = 'quote-copy-btn';
				copyBtn.setAttribute('title', 'Copy quote');
				copyBtn.setAttribute('aria-label', 'Copy quote');
				copyBtn.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
				copyBtn.addEventListener('click', function () {
					copyToClipboard('“' + item.quote + '” — ' + item.projectTitle);
				});
				header.appendChild(copyBtn);

				var body = document.createElement('div');
				body.className = 'quote-card-body';
				var bq = document.createElement('blockquote');
				bq.textContent = '“' + item.quote + '”';
				var ctx = document.createElement('p');
				ctx.className = 'quote-card-context';
				ctx.innerHTML = item.context;
				body.appendChild(bq);
				body.appendChild(ctx);

				var footer = document.createElement('div');
				footer.className = 'quote-card-footer';
				var link = document.createElement('a');
				link.className = 'quote-card-link';
				link.href = item.projectHref;
				link.innerHTML = 'View Project &rarr;';
				footer.appendChild(link);

				card.appendChild(header);
				card.appendChild(body);
				card.appendChild(footer);

				grid.appendChild(card);
			});

			if (countBadge) {
				countBadge.textContent = 'Showing ' + count + ' of ' + HOMELAB_QUOTES.length + ' proverbs';
			}

			if (window.initTechAnalogies) {
				window.initTechAnalogies();
			}
		}

		filterPills.forEach(function (pill) {
			pill.addEventListener('click', function () {
				filterPills.forEach(function (p) { p.classList.remove('active'); });
				pill.classList.add('active');
				var filter = pill.getAttribute('data-filter');
				renderGrid(filter);
			});
		});

		// Initial setup
		setFeatured(1); // Signature thermal quote
		renderGrid('all');
	}

	// 2. Homepage Header Slogan Randomizer (Sleek, Compact, Zero Wasted Space!)
	function initHeroQuote() {
		var sloganEl = document.getElementById('hero-quote-text');
		var authorEl = document.getElementById('hero-quote-author');
		var diceBtn = document.getElementById('hero-quote-dice-btn');

		if (!sloganEl) return;

		var currentHeroIndex = 0; // Starts on "If it isn't broke, do fix it."

		function rotateHeroQuote(idx) {
			currentHeroIndex = idx;
			var item = HOMELAB_QUOTES[idx];
			sloganEl.textContent = '“' + item.quote + '”';
			if (authorEl) {
				if (item.id === 'if-it-isnt-broke') {
					authorEl.innerHTML = '&ndash; Andrew Van Ek';
				} else {
					authorEl.innerHTML = '&ndash; <a href="' + item.projectHref + '" style="color: inherit; text-decoration: underline;" title="' + item.projectTitle + '">' + item.category + '</a>';
				}
			}
		}

		function rollRandomHero() {
			var nextIdx;
			do {
				nextIdx = Math.floor(Math.random() * HOMELAB_QUOTES.length);
			} while (nextIdx === currentHeroIndex && HOMELAB_QUOTES.length > 1);
			rotateHeroQuote(nextIdx);
		}

		if (diceBtn) {
			diceBtn.addEventListener('click', function (e) {
				e.preventDefault();
				rollRandomHero();
			});
		}

		sloganEl.style.cursor = 'pointer';
		sloganEl.addEventListener('click', function () {
			rollRandomHero();
		});
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', function () {
			initQuotesPage();
			initHeroQuote();
		});
	} else {
		initQuotesPage();
		initHeroQuote();
	}
})();
