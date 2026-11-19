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
			context: 'A troubleshooting maxim for anyone who has ever pried up an AMD or laptop heatsink only to find the socketed CPU vacuum-glued directly to the copper heatpipe.',
			projectTitle: 'HP Laptop Cooling Refresh: Thermal Interface Replacement',
			projectHref: 'projects.html#hp-thermal-refresh-title'
		},
		{
			id: 'thermal-pad-origins',
			quote: 'May every thermal pad stay in one piece long enough for you to figure out where it came from.',
			category: 'Thermals & Hardware',
			context: 'Dedicated to the mysterious crumbling blue and pink VRM pads that tear in half when separating the vapor chamber from the motherboard.',
			projectTitle: 'HP Laptop Cooling Refresh: Thermal Interface Replacement',
			projectHref: 'projects.html#hp-thermal-refresh-title'
		},
		{
			id: 'ptm7950-perfect-contact',
			quote: 'May your PTM7950 make perfect contact on the first mount.',
			category: 'Thermals & Hardware',
			context: 'A tribute to the delicate art of peeling microscopic plastic backing film off <span class="tech-term" data-term="ptm7950">PTM7950 phase-change material</span> without ripping the pad before screw torquedown.',
			projectTitle: 'HP Laptop Cooling Refresh: Thermal Interface Replacement',
			projectHref: 'projects.html#hp-thermal-refresh-title'
		},
		{
			id: 'idle-temps-cool-fans-quiet',
			quote: 'May your idle temps be cool, your fans be quiet, and your benchmarks be stable.',
			category: 'Thermals & Hardware',
			context: 'The ultimate trifecta of homelab bliss after repasting copper heatsinks and stress-testing Cinebench loops with zero thermal throttling.',
			projectTitle: 'HP Laptop Cooling Refresh: Thermal Interface Replacement',
			projectHref: 'projects.html#hp-thermal-refresh-title'
		},
		{
			id: 'ribbon-cable-beneath-keyboard',
			quote: 'May not a single ribbon cable be forgotten beneath the keyboard.',
			category: 'Thermals & Hardware',
			context: 'Because snapping all 36 plastic chassis clips back together only to discover the trackpad or keyboard ribbon cable is trapped underneath the board is true pain.',
			projectTitle: 'HP Laptop Cooling Refresh & MacBook Hardware Teardowns',
			projectHref: 'projects.html#hp-thermal-refresh-title'
		},
		{
			id: 'workstation-screw-surplus',
			quote: 'A workstation taken apart in two hours shall be reassembled in six. A workstation taken apart in six hours shall still somehow have one screw left over.',
			category: 'Thermals & Hardware',
			context: 'The unwritten law of hardware repair: no matter how meticulously you organize your magnetic screw trays, the chassis always claims a surplus tribute.',
			projectTitle: 'HP ZBook Fury & Hardware Teardowns',
			projectHref: 'projects.html#hp-thermal-refresh-title'
		},
		{
			id: 'fury-performance-not-temps',
			quote: 'May your Fury be furious only in performance, never in temperatures.',
			category: 'Thermals & Hardware',
			context: 'Dedicated to the HP ZBook Fury Mobile Workstation (FREEHPGAMER) pushing max multi-threaded compute while keeping its dual vapor chamber chill.',
			projectTitle: 'HP ZBook Fury MoneroOcean Stratum Worker Telemetry',
			projectHref: 'maintenance.html#hp-zbook-fury-moneroocean-worker-naming-and-rig-telemetry'
		},
		{
			id: 'thanksgiving-turkey-troubleshooting',
			quote: 'May Thanksgiving bring more turkey than troubleshooting.',
			category: 'Philosophy & Mindset',
			context: 'The ultimate holiday homelab blessing for IT specialists and homelabbers tasked with family tech support between dinner courses.',
			projectTitle: 'Intranet Gathering Slideshow & Homelab Platforms',
			projectHref: 'projects.html#slideshow-party-intranet-title'
		},
		{
			id: 'connector-satisfying-click',
			quote: 'May every connector click satisfyingly into place.',
			category: 'Thermals & Hardware',
			context: 'That sublime, unmistakable tactile snap when an internal motherboard socket, battery harness, or front panel cable locks in securely on the first try.',
			projectTitle: 'MacBook & Lenovo Teardowns: Power Isolation',
			projectHref: 'projects.html#macbook-2011-battery-removal-title'
		},
		{
			id: 'three-disassemblies-cable',
			quote: 'The first disassembly builds confidence. The second disassembly builds skill. The third disassembly exists because you forgot a cable.',
			category: 'Thermals & Hardware',
			context: 'The universal three-stage cycle of laptop maintenance known to every engineer who has had to reopen a fully snapped chassis to plug in a trapped trackpad lead.',
			projectTitle: 'HP Laptop Cooling Refresh & Chassis Maintenance',
			projectHref: 'projects.html#hp-thermal-refresh-title'
		},
		{
			id: 'ptm7950-schrodinger-spread',
			quote: 'May your PTM7950 spread perfectly despite your inability to actually see it spread.',
			category: 'Thermals & Hardware',
			context: 'The Schrödinger’s thermal paste paradox: you torque down the heatsink, turn on the machine, and can only trust the thermodynamics working unseen beneath the copper.',
			projectTitle: 'HP Laptop Cooling Refresh: Thermal Interface Replacement',
			projectHref: 'projects.html#hp-thermal-refresh-title'
		},
		{
			id: 'never-hear-noise-before',
			quote: "And may you never hear the words: “Huh... it wasn't making that noise before.”",
			category: 'Philosophy & Mindset',
			context: 'The seven most terrifying words in systems engineering, usually whispered immediately after pressing the power button following a routine hardware overhaul.',
			projectTitle: 'Headless Intel NUC & Fleet Diagnostics',
			projectHref: 'projects.html#intel-nuc-alpine-storage-recovery-title'
		},
		{
			id: 'gpa-vs-cpu-temps',
			quote: 'May your GPA rise faster than your CPU temperatures.',
			category: 'College & Computing',
			context: 'The ultimate survival proverb for engineering midterms, computer science finals, and all-night project compile marathons.',
			projectTitle: 'Career, Education & About Andrew Van Ek',
			projectHref: 'about.html'
		},
		{
			id: 'battery-swelling-theoretical',
			quote: 'May your battery swelling remain strictly theoretical.',
			category: 'Thermals & Hardware',
			context: 'Staring anxiously at your aluminum trackpad to confirm it still clicks, rather than morphing into a puffed-up lithium spicy pillow.',
			projectTitle: '2011 MacBook Pro Battery Removal & Hardware Isolation',
			projectHref: 'projects.html#macbook-2011-battery-removal-title'
		},
		{
			id: 'zoom-chrome-ram-exam',
			quote: 'May Zoom not crash during exams, and may Chrome consume only a reasonable amount of RAM.',
			category: 'College & Computing',
			context: 'Testing the limits of browser stability and unified memory while juggling lockdown exam browsers and 47 reference tabs.',
			projectTitle: 'GVSU IT Service Desk & Class Assistant Bot',
			projectHref: 'chat.html'
		},
		{
			id: 'm-series-efficiency-gaming-envy',
			quote: 'May your efficiency cores stay efficient, may your performance cores perform, and may every Windows gaming laptop owner begrudgingly admit: “Okay, that is actually pretty good battery life.”',
			category: 'Apple Silicon & Mining',
			context: 'Unplugging an M1 MacBook Air at 8:00 AM, taking notes in four lectures, compiling code, mining in the background, and still having 60% battery at sunset.',
			projectTitle: 'MacBook Air M1 MoneroOcean Stratum Worker Telemetry',
			projectHref: 'maintenance.html#macbook-air-m1-moneroocean-worker-naming-and-rig-telemetry'
		},
		{
			id: 'macbook-mining-and-activity-monitor',
			quote: 'May your MacBook be cool during class, hot during mining, silent during lectures, and loud during benchmarks—and may no professor ever glance over your shoulder at Activity Monitor and ask: “Why is your laptop utilizing 800% CPU?” Because some questions are best left unanswered.',
			category: 'Apple Silicon & Mining',
			context: 'Operating an Apple Silicon workstation that seamlessly shapeshifts between an obedient lecture notepad and an 8-core MoneroOcean stratum worker in the back row of class.',
			projectTitle: 'MacBook Air M1 MoneroOcean Stratum Worker Telemetry',
			projectHref: 'maintenance.html#macbook-air-m1-moneroocean-worker-naming-and-rig-telemetry'
		},
		{
			id: 'avahi-mdns-local',
			quote: 'You can take the engineer out of the LAN, but you cannot stop Avahi mDNS from claiming .local.',
			category: 'Networking & DNS',
			context: 'Circumventing <span class="tech-term" data-term="doh-private-relay">Apple iOS DoH proxy redirects</span> by broadcasting zero-configuration Multicast DNS to claim the <span class="tech-term" data-term="dot-local-domain">.local domain</span>.',
			projectTitle: 'Intranet Gathering Slideshow, TLS, Facial Moderation & Avahi mDNS',
			projectHref: 'projects.html#slideshow-party-intranet-title'
		}
,
		{
			id: 'button-click-user-expectation',
			quote: 'May every button click do exactly what the user expects, and not what the software intended.',
			category: 'Philosophy & Mindset',
			context: 'Bridging the timeless chasm between what a human intuitively expects an interface to do and what the software architecture assumed they wanted.',
			projectTitle: 'Andrew Van Ek &mdash; Homelab Philosophy',
			projectHref: 'about.html'
		},
		{
			id: 'customers-describe-only-what-matters',
			quote: 'May your customers describe only what matters to resolving their issue.',
			category: 'Philosophy & Mindset',
			context: 'Forged during marathon hour-plus support calls where ten minutes of diagnostic triage is preceded by fifty minutes determining whether to left-click or right-click.',
			projectTitle: 'Career, Education & About Andrew Van Ek',
			projectHref: 'about.html'
		},
		{
			id: 'impossible-problem-tomorrows-funny-story',
			quote: 'May every impossible problem become tomorrow’s funny story.',
			category: 'Philosophy & Mindset',
			context: 'The ultimate systems administration coping mechanism: knowing that today’s catastrophic, head-scratching downtime will eventually become tomorrow’s legendary team-chat war story.',
			projectTitle: 'Andrew Van Ek &mdash; Homelab Philosophy',
			projectHref: 'about.html'
		},
		{
			id: 'ambition-never-exceed-backup-plan',
			quote: 'May your ambition exceed your fear, but never exceed your backup plan.',
			category: 'Storage & Recovery',
			context: 'The cardinal rule of homelab engineering: dream big and experiment boldly, but never run a destructive terminal command without an offline snapshot and verified restore path.',
			projectTitle: 'Headless Intel NUC Alpine Storage Recovery',
			projectHref: 'projects.html#intel-nuc-alpine-storage-recovery-title'
		},
		{
			id: 'uptime-in-months-outages-in-seconds',
			quote: 'May your uptime be measured in months and your outages in seconds.',
			category: 'Storage & Recovery',
			context: 'The gold standard of homelab server resilience, automated daemon supervision, and rapid zero-downtime micro-maintenance.',
			projectTitle: 'Stats for Nerds & Homelab Telemetry',
			projectHref: 'stats.html'
		},
		{
			id: 'group-project-contain-group',
			quote: 'May your group project contain a group.',
			category: 'College & Computing',
			context: 'The universal engineering student wish for genuine collegiate collaboration where more than one person actually opens the repository, writes code, and submits commits.',
			projectTitle: 'Career, Education & About Andrew Van Ek',
			projectHref: 'about.html'
		},
		{
			id: 'workstation-cooler-than-room',
			quote: 'May your workstation remain cooler than the room it occupies.',
			category: 'Thermals & Hardware',
			context: 'Striving for thermodynamic defiance during all-day stress testing, multi-threaded rendering, and aggressive negative fan curve tuning.',
			projectTitle: 'HP Laptop Cooling Refresh: Thermal Interface Replacement',
			projectHref: 'projects.html#hp-thermal-refresh-title'
		},
		{
			id: 'laptop-mine-never-on-classroom-screen',
			quote: 'May your laptop mine only when appropriate and never when projected onto the classroom screen.',
			category: 'Apple Silicon & Mining',
			context: 'The cardinal rule of covert lecture-hall hash rate generation: background mining is fine, until you plug into HDMI and your 800% CPU terminal is mirrored on the 100-inch projector.',
			projectTitle: 'MacBook Air M1 MoneroOcean Stratum Worker Telemetry',
			projectHref: 'maintenance.html#macbook-air-m1-moneroocean-worker-naming-and-rig-telemetry'
		},
		{
			id: 'future-you-understand-present-you',
			quote: 'May future-you understand what present-you configured.',
			category: 'Philosophy & Mindset',
			context: 'The rationale behind clean shell comments, documented iptables chains, and self-documenting commit logs before technical amnesia inevitably strikes three months later.',
			projectTitle: 'Andrew Van Ek &mdash; Homelab Philosophy',
			projectHref: 'about.html'
		},
		{
			id: 'intel-nuc-faithful-grub-after-midnight',
			quote: 'May your Intel NUC remain faithful, and may GRUB never summon you after midnight.',
			category: 'Storage & Recovery',
			context: 'A tribute to headless mini-PCs humming quietly in closets that should never demand an emergency serial console or a rescue USB in the dead of night.',
			projectTitle: 'Headless Intel NUC Alpine Storage Recovery',
			projectHref: 'projects.html#intel-nuc-alpine-storage-recovery-title'
		},
		{
			id: 'reboot-login-prompt-not-adventure',
			quote: 'May every reboot return a login prompt rather than an adventure.',
			category: 'Storage & Recovery',
			context: 'Honoring the universal tension of typing "sudo reboot" over SSH on a critical remote box and waiting for ping responses rather than an emergency drive recovery.',
			projectTitle: 'Headless Intel NUC Alpine Storage Recovery',
			projectHref: 'projects.html#intel-nuc-alpine-storage-recovery-title'
		},
		{
			id: 'evening-maintenance-window-remain-evening',
			quote: 'May your evening maintenance window remain an evening maintenance window.',
			category: 'Philosophy & Mindset',
			context: 'A tribute to routine 8:00 PM "quick 15-minute package updates" that threaten to snowball into 4:00 AM kernel recompilations, broken package audits, and cold coffee.',
			projectTitle: 'Portfolio Infrastructure Maintenance Log',
			projectHref: 'maintenance.html'
		},
		{
			id: 'temps-low-voltages-steady-logs-boring',
			quote: 'May your temperatures remain low, your voltages remain steady, and your event logs remain boring.',
			category: 'Thermals & Hardware',
			context: 'The holy trinity of server peace of mind: cool copper heatsinks, clean wall power delivery, and a system event log completely devoid of kernel alerts or red error badges.',
			projectTitle: 'Dell Inspiron 3668 CPU Repaste & Thermal Audit',
			projectHref: 'maintenance.html'
		},
		{
			id: 'maintenance-window-reboot-not-research-project',
			quote: 'May every maintenance window end with a reboot and not a research project.',
			category: 'Philosophy & Mindset',
			context: 'The razor-thin line between an uneventful service restart and an involuntary six-hour deep dive into deprecated glibc headers, kernel source trees, and forgotten forum threads.',
			projectTitle: 'Portfolio Infrastructure Maintenance Log',
			projectHref: 'maintenance.html'
		},
		{
			id: 'no-system-inspire-wonder-why',
			quote: 'May no system ever inspire the words: “I wonder why it would do that.”',
			category: 'Philosophy & Mindset',
			context: 'Dedicated to all who have uttered the phrase, "Huh. I’ve never seen that before" right before losing an entire Saturday afternoon to an undocumented edge case.',
			projectTitle: 'Andrew Van Ek &mdash; Homelab Philosophy',
			projectHref: 'about.html'
		},
		{
			id: 'troubleshooting-known-issues-not-discoveries',
			quote: 'May your troubleshooting begin with known issues and not entirely new discoveries.',
			category: 'Philosophy & Mindset',
			context: 'Famous last words in systems administration: hoping against hope that the flashing red diagnostic light is a documented FAQ rather than an uncharted scientific breakthrough.',
			projectTitle: 'Homelab Diagnostics & Systems Administration',
			projectHref: 'maintenance.html'
		},
		{
			id: 'problem-solvable-by-ai-not-huh-weird',
			quote: 'May your problem be solvable by AI and not one of those issues that inspires AI to say: “Huh... that’s weird.”',
			category: 'AI & Local Models',
			context: 'Dedicated to accidental pioneers confronting bizarre driver collisions, obscure firmware panics, and edge cases so uncanny that even state-of-the-art LLMs pause in bewilderment.',
			projectTitle: 'Persistent Homelab LLM Inference & Private Tailscale Mesh Streaming',
			projectHref: 'projects.html#glm4-tailscale-homelab-title'
		},
		{
			id: 'error-message-age-window-ai',
			quote: 'May your error message be old enough for AI to recognize yet new enough for the fix to still exist.',
			category: 'AI & Local Models',
			context: 'Navigating the narrow golden window of computing history: a bug indexed well enough for AI to diagnose instantly, but not so ancient that the solution depends on a 404 dead link from 2008.',
			projectTitle: 'Code Runner & AI Coach Infrastructure',
			projectHref: 'code-runner.html'
		},
		{
			id: 'google-ai-neither-new-research-project',
			quote: 'If Google knows the answer, the problem is routine. If AI knows the answer, the problem is manageable. If neither knows the answer, congratulations on your new research project.',
			category: 'AI & Local Models',
			context: 'The three definitive tiers of modern technical problem-solving, inevitably culminating in you becoming the world’s reluctant leading authority on an obscure kernel flag.',
			projectTitle: 'AI Labs & Technical Troubleshooting',
			projectHref: 'lab.html'
		},
		{
			id: 'every-bug-already-known-somebody',
			quote: 'May every bug already be known to somebody else.',
			category: 'Philosophy & Mindset',
			context: 'The pure relief of searching a bizarre compiler error and finding an existing GitHub issue with a closed green badge and "Fixed in v2.4" waiting for you.',
			projectTitle: 'Andrew Van Ek &mdash; Engineering Discipline',
			projectHref: 'changelog.html'
		},
		{
			id: 'redundancy-actually-redundant',
			quote: 'May your redundancy actually be redundant.',
			category: 'Storage & Recovery',
			context: 'Striving for genuine high availability, independent failure domains, and verified failovers rather than discovering your primary and secondary systems share the exact same single point of failure.',
			projectTitle: 'Cross-Volume Archive Deduplication & Dual-Drive Mirroring',
			projectHref: 'projects.html#cloud-takeout-dedupe-mirror-title'
		},
		{
			id: 'refrigeration-units-cyber-warfare',
			quote: 'May your refrigeration units refrigerate and not participate in cyber warfare.',
			category: 'Security & Forensics',
			context: 'Inspired by the historic 2016 Dyn DNS DDoS outage and Mirai botnets, where millions of compromised smart devices, cameras, and networked appliances waged digital war instead of cooling food.',
			projectTitle: 'Scheduled App Traffic Filtering: AdGuard Home Dockerization',
			projectHref: 'projects.html#adguard-home-scheduled-traffic-filtering-title'
		},
		{
			id: 'outage-report-brief-service-interruption',
			quote: 'May your outage report contain the phrase "brief service interruption" and not "global event."',
			category: 'Philosophy & Mindset',
			context: 'The ultimate systems administration goal: keeping blast radiuses small, failovers automated, and post-mortems celebratory rather than waking up to a trending hashtag on social media.',
			projectTitle: 'Intranet Gathering Slideshow, TLS & Recovery',
			projectHref: 'projects.html#slideshow-party-intranet-title'
		},
		{
			id: 'succession-plan-before-successor-needed',
			quote: 'May your succession plan be discovered before your successor is needed.',
			category: 'Philosophy & Mindset',
			context: 'Inspired by high-stakes tech leadership dependency (the corporate NVIDIA CEO dilemma), advocating for comprehensive runbooks, documented architectures, and institutional knowledge transfer before a single point of failure occurs.',
			projectTitle: 'Making a Desktop Project Plan a Shared Team Workspace',
			projectHref: 'projects.html#teams-project-plan-collaboration-title'
		},
		{
			id: 'production-systems-never-try-it-live',
			quote: 'May your production systems never hear the phrase, "Let\'s try it live."',
			category: 'Philosophy & Mindset',
			context: 'The golden rule of infrastructure engineering and continuous deployment: test in sandbox, verify in staging, and leave live production unthreatened by impromptu guesswork.',
			projectTitle: 'Code Runner & AI Coach Infrastructure',
			projectHref: 'code-runner.html'
		}
	];

	var toastTimeout = null;
	function showToast(msg) {
		var existing = document.getElementById('quote-toast');
		if (!existing) {
			existing = document.createElement('div');
			existing.id = 'quote-toast';
			existing.className = 'quote-toast';
			existing.setAttribute('role', 'status');
			existing.setAttribute('aria-live', 'polite');
			document.body.appendChild(existing);
		}
		existing.textContent = msg;
		existing.classList.add('show');
		if (toastTimeout) {
			clearTimeout(toastTimeout);
		}
		toastTimeout = setTimeout(function () {
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
				var originalHtml = copyFeatBtn.innerHTML;
				copyFeatBtn.innerHTML = '<span>✓</span> Copied!';
				setTimeout(function () {
					copyFeatBtn.innerHTML = originalHtml;
				}, 1600);
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
					copyBtn.classList.add('copied');
					setTimeout(function () {
						copyBtn.classList.remove('copied');
					}, 1600);
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
			sloganEl.title = item.quote + ' (Click to roll another quote)';
			if (item.quote.length > 130) {
				sloganEl.classList.add('hero-quote-compact');
			} else {
				sloganEl.classList.remove('hero-quote-compact');
			}
			if (authorEl) {
				if (item.id === 'if-it-isnt-broke') {
					authorEl.innerHTML = '&ndash; <a href="about.html" style="color: inherit; text-decoration: underline;" title="About Andrew Van Ek">Andrew Van Ek</a>';
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
			if (diceBtn) {
				diceBtn.classList.remove('rolling');
				void diceBtn.offsetWidth;
				diceBtn.classList.add('rolling');
				setTimeout(function () {
					if (diceBtn) diceBtn.classList.remove('rolling');
				}, 220);
			}
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
