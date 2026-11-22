/* Fleet & Salvage Architecture Hub Interactivity */

document.addEventListener('DOMContentLoaded', () => {
	initNodeFleetData();
	initViewportInteractivity();
	initNodeFilter();
	initRoiCalculator();
});

// Telemetry & Hardware Node Dictionary (9 Nodes)
const FLEET_DATA = {
	'nuc': {
		tag: 'HL-NODE-06-NUC-CORE',
		title: 'Headless Intel NUC LAN Backbone',
		os: 'Alpine Linux 3.x (musl)',
		power: '~12.5 W',
		uptime: 'Middle Rack Tier (Always-On)',
		status: 'ONLINE',
		workloads: 'Central LAN AdGuard Home DNS sinkhole, Einstein@Home distributed astrophysics (Fermi LAT gamma-ray pulsar search), Tailscale WireGuard gateway.',
		salvage: 'Compact ultra-low-idle compute node running musl/busybox minimal userspace to maximize CPU cycles dedicated directly to Einstein@Home volunteer astrophysics pulsar search simulations and network-wide DNS filtering.',
		glpi: {
			tag: 'HL-NODE-06-NUC-CORE',
			cat: 'Core Compute / Infrastructure',
			state: 'In Production / Mission Critical',
			depr: '100% Amortized (Salvage Reclaim)',
			service: '2026-11-21 (Verified)',
			net: 'Gigabit LAN + Tailscale Mesh'
		}
	},
	's4mini': {
		tag: 'HL-NODE-01-S4MINI',
		title: 'Samsung Galaxy S4 Mini (SCH-I435)',
		os: 'Android 4.4.2 / WebKit ES5',
		power: '~1.8 W',
		uptime: 'Shelf 4 (Bottom Shelf) &middot; USB Host Connected',
		status: 'ONLINE',
		workloads: 'Dedicated 24/7 Duino-Coin web worker node running continuous WebKit multithreaded JavaScript hashing. Local telemetry monitoring web UI hosted on port 8097.',
		salvage: 'Sits directly on the bottom shelf alongside the 2011 Mac, plugged straight into the Mac via physical USB for continuous regulated host power and connection with screen keep-awake.',
		glpi: {
			tag: 'HL-NODE-01-S4MINI',
			cat: 'Mobile Silicon Reclamation',
			state: 'In Production / Dedicated Miner',
			depr: 'Zero Net Book Value ($0 Reclaim)',
			service: '2026-11-21 (USB Host Link Verified)',
			net: 'Wi-Fi 802.11n (Port 8097 Web UI)'
		}
	},
	'mbp2011': {
		tag: 'HL-NODE-03-MBP2011',
		title: 'Mid-2011 Mac (A1278) &middot; Bottom Shelf',
		os: 'Debian 12 Bookworm (Minimal)',
		power: '~18.5 W',
		uptime: 'Bottom Shelf Anchor (99.8%)',
		status: 'ONLINE',
		workloads: 'Batch CPU image generation queue processing, background cryptocurrency mining, automated build worker, and USB host provider for the Samsung S4 Mini.',
		salvage: 'Rescued 2011 Apple unibody anchoring the bottom shelf. Internal battery removed for continuous desk operation and safety (never swollen); repasted with industrial Honeywell PTM7950 phase-change material on copper heatsink.',
		glpi: {
			tag: 'HL-NODE-03-MBP2011',
			cat: 'Server / Compute Node & Host',
			state: 'In Production / Stable',
			depr: 'Salvaged Legacy Hardware',
			service: '2026-11-21 (PTM7950 & USB Host Audit)',
			net: 'Gigabit LAN (VLAN 10)'
		}
	},
	'ypgi1': {
		tag: 'HL-NODE-08-GALPLAYER',
		title: 'Samsung Galaxy Player (YP-GI1)',
		os: 'Android Lightweight WebKit',
		power: '~1.2 W',
		uptime: 'Wall Powered (Charging Strip)',
		status: 'ONLINE',
		workloads: 'Dedicated 24/7 Duino-Coin web worker hashing continuously over local Wi-Fi, contributing micro-scale crypto shares without electrical overhead.',
		salvage: 'Rescued vintage Samsung portable media player repurposed into permanent volunteer silicon. Plugged directly into wall AC power alongside the iPod Touch.',
		glpi: {
			tag: 'HL-NODE-08-GALPLAYER',
			cat: 'Mobile Silicon Reclamation',
			state: 'In Production / Companion Miner',
			depr: 'Zero Net Book Value ($0 Reclaim)',
			service: '2026-11-21 (AC Power Verified)',
			net: 'Wi-Fi 802.11b/g'
		}
	},
	'ipodtouch': {
		tag: 'HL-NODE-09-IPODTOUCH',
		title: 'Apple iPod Touch Miner',
		os: 'iOS WebKit Minimal Engine',
		power: '~1.4 W',
		uptime: 'Wall Powered (Charging Strip)',
		status: 'ONLINE',
		workloads: 'Continuous in-browser Duino-Coin JavaScript hashing engine executing 24/7 over local Wi-Fi.',
		salvage: 'Legacy Apple iPod Touch hardware diverted from electronics waste, mounted on the mobile charging dock running persistent mining loops on wall AC power.',
		glpi: {
			tag: 'HL-NODE-09-IPODTOUCH',
			cat: 'Mobile Silicon Reclamation',
			state: 'In Production / Companion Miner',
			depr: 'Zero Net Book Value ($0 Reclaim)',
			service: '2026-11-21 (AC Power Verified)',
			net: 'Wi-Fi 802.11b/g/n'
		}
	},
	'yoga': {
		tag: 'HL-NODE-02-YOGA-BB',
		title: 'Lenovo Yoga 2 11 Bare-Board Rig',
		os: 'Headless Linux x86_64',
		power: '~6.2 W',
		uptime: 'Shelf 3 (Bottom Shelf) &middot; Open Testbench',
		status: 'ONLINE',
		workloads: 'Continuous crypto mining and lightweight local utility daemon. Completely open-air testbench rig operating 24/7 on the bottom shelf tier cooled directly by the 5V USB blower fan.',
		salvage: 'Rescued from landfill after chassis fracture and puffed lithium battery. Motherboard and daughterboard extracted and bench-mounted in modular plastic cradle with a dedicated 5V USB cooling blower fan.',
		glpi: {
			tag: 'HL-NODE-02-YOGA-BB',
			cat: 'Open-Bench Compute',
			state: 'Active Testbench / Utility',
			depr: '100% Amortized E-Waste',
			service: '2026-11-21 (Thermal Fan Check)',
			net: 'Integrated LAN / USB Ethernet'
		}
	},
	'hp15': {
		tag: 'HL-NODE-04-HP15',
		title: 'HP Laptop 15 Workhorse (Free HP Laptop, not Fishbeck)',
		os: 'Linux Mint 21 (Cinnamon)',
		power: '~24.0 W',
		uptime: 'Shelf 2 (Middle Shelf) &middot; (98.9%)',
		status: 'ONLINE',
		workloads: 'Continuous local diffusion batch image generation running Realistic Vision 5.1 with LCM LoRA 4-step sampling, background mining, and persistent Rclone Google Drive cloud sync.',
		salvage: 'Repurposed domestic laptop. Configured with headless automated startup daemons and thermal-throttled thread concurrency limits for non-stop generative workflows.',
		glpi: {
			tag: 'HL-NODE-04-HP15',
			cat: 'AI Synthesis / Cloud Gateway',
			state: 'In Production / Media Node',
			depr: 'Repurposed Asset',
			service: '2026-11-21 (Rclone Sync Audit)',
			net: 'Wi-Fi 802.11ac + Rclone Daemon'
		}
	},
	'dell': {
		tag: 'HL-NODE-05-DELLTWR',
		title: 'HOMEDELL 2 (Dell Inspiron &middot; "Hopes & Dreams")',
		os: 'Custom Slax Linux (Live USB)',
		power: '~38.0 W',
		uptime: 'Shelf 2 (Middle Shelf) &middot; (97.6%)',
		status: 'ONLINE',
		workloads: 'Batch image generation and crypto mining operating entirely in RAM off a customized Slax USB live drive with persistence overlay. Zero spinning mechanical drive dependency.',
		salvage: 'Dell Inspiron 3668 desktop tower placed horizontally on its own dedicated shelf tier (Shelf 3). Booting 100% into RAM overlay to eliminate disk wear, avoid mechanical drive bottlenecks, and survive sudden power interrupts.',
		glpi: {
			tag: 'HL-NODE-05-DELLTWR',
			cat: 'Diskless RAM Compute',
			state: 'Active Experimental Rig',
			depr: 'Surplus Reclaim',
			service: '2026-11-21 (Slax Kernel Update)',
			net: 'Gigabit Onboard Ethernet'
		}
	},
	'onefive': {
		tag: 'HL-STOR-01-ONEFIVE',
		title: 'ONEFIVE Network Storage & Mac VM Target',
		os: 'Sabrent USB 3.0 SATA Enclosure / ext4',
		power: '~4.5 W',
		uptime: 'Shelf 1 (Top Shelf) &middot; USB 3.0 Bus',
		status: 'ONLINE',
		workloads: 'Direct central storage pool for fleet backups, image generation dataset staging, and mapped Y: drive target for macOS virtual machine workflows.',
		salvage: 'High-speed external enclosure housing repurposed high-capacity SATA media, persistent UUID mount to prevent drive lettering drifts during host reboots.',
		glpi: {
			tag: 'HL-STOR-01-ONEFIVE',
			cat: 'Direct Attached Storage / Backup Pool',
			state: 'In Production / Reliable',
			depr: 'Zero Net Book Value ($0 Reclaim)',
			service: '2026-11-21 (UUID & SMART Verified)',
			net: 'USB 3.0 SuperSpeed / LAN Share'
		}
	},
	'floppy': {
		tag: 'HL-PERIPH-01-FLOPPY',
		title: '3.5" USB Floppy Drive Reader & Optical Media Hub',
		os: 'USB Mass Storage Class (UFI)',
		power: '~1.5 W (Active Seek)',
		uptime: 'Shelf 2 (Upper-Middle Shelf) &middot; On Demand',
		status: 'STANDBY',
		workloads: 'Legacy magnetic diskette recovery, CIS retro media archiving, and CD/DVD physical digitization staging for class curriculum.',
		salvage: 'Vintage 3.5-inch USB floppy drive reader paired with retro optical CD storage spindle on the middle shelf for hands-on legacy media preservation.',
		glpi: {
			tag: 'HL-PERIPH-01-FLOPPY',
			cat: 'Legacy Media Forensics & Digitization',
			state: 'In Service / Functional',
			depr: 'Historical Peripheral Asset',
			service: '2026-11-21 (Head Cleaning & Alignment)',
			net: 'Direct USB Host Bus'
		}
	},
	'usbfan': {
		tag: 'HL-COOL-01-USBFAN',
		title: '5V USB Blower Fan (Active Yoga Cooling)',
		os: 'DC 5V Physical Bus (Mac 2011 Powered)',
		power: '~1.8 W',
		uptime: 'Shelf 4 (Bottom Shelf) &middot; 24/7 Continuous',
		status: 'ONLINE',
		workloads: 'Direct forced-air cooling over the bare-board Lenovo Yoga 2 11 motherboard and daughterboard heatsinks, preventing thermal throttling during 24/7 crypto mining.',
		salvage: 'External 5V high-CFM blower fan positioned directly adjacent to the stripped Yoga motherboard heatsink, powered entirely through the Debian 2011 Mac\'s rear USB port.',
		glpi: {
			tag: 'HL-COOL-01-USBFAN',
			cat: 'Active Thermal Auxiliary System',
			state: 'In Production / Continuous Run',
			depr: 'Salvage Cooling Equipment',
			service: '2026-11-21 (Bearing & Airflow Audit)',
			net: 'Hardwired 5V USB Power Circuit'
		}
	},
	'bluefruit': {
		tag: 'HL-MCU-01-BLUEFRUIT',
		title: 'Adafruit Circuit Playground Bluefruit',
		os: 'CircuitPython / Bare-Metal nRF52840',
		power: '~0.4 W',
		uptime: 'Raised Tier &middot; USB Powered',
		status: 'ONLINE',
		workloads: 'Telemetry beaconing, environmental temperature and light sensing for the rack enclosure, and Bluetooth Low Energy (BLE) peripheral experimentation.',
		salvage: 'Educational microcontroller board mounted alongside the NUC on the raised back tier, providing hardware sensor monitoring and visual status NeoPixels.',
		glpi: {
			tag: 'HL-MCU-01-BLUEFRUIT',
			cat: 'Microcontroller / Environmental Sensor',
			state: 'Active Testbench / IoT',
			depr: 'Educational Hardware Asset',
			service: '2026-11-21 (Firmware 8.x Flashed)',
			net: 'USB Serial CDC + Bluetooth LE'
		}
	},
	'winws': {
		tag: 'HL-NODE-07-WINWS',
		title: 'FREEHPGAMER from Fishbeck (Windows 11 Workstation)',
		os: 'Windows 11 Pro (x86_64)',
		power: '~45.0 W (Dynamic)',
		uptime: 'Shelf 1 (Top Shelf / Desk Surface) &middot; (99.2%)',
		status: 'ONLINE',
		workloads: 'Folding@home molecular dynamics simulations, burst crypto mining, physical optical media archiving / DVD ripping, and local CIS virtualization hypervisor (Hyper-V).',
		salvage: 'Hybrid academic workstation: dynamically schedules distributed medical research and mining workloads during idle hours while providing immediate hardware access for CIS coursework.',
		glpi: {
			tag: 'HL-NODE-07-WINWS',
			cat: 'Hybrid Workstation / Hypervisor',
			state: 'Primary Academic & Compute Node',
			depr: 'Active Educational Hardware',
			service: '2026-11-21 (Folding Client Check)',
			net: 'Gigabit LAN / Wi-Fi 6'
		}
	}
};

function initNodeFleetData() {
	selectNode('winws');
}

function selectNode(nodeId) {
	const data = FLEET_DATA[nodeId];
	if (!data) return;

	document.getElementById('insp-tag').textContent = data.tag;
	document.getElementById('insp-title').textContent = data.title;
	document.getElementById('insp-os').textContent = data.os;
	document.getElementById('insp-power').textContent = data.power;
	document.getElementById('insp-uptime').textContent = data.uptime;
	document.getElementById('insp-workloads').textContent = data.workloads;
	document.getElementById('insp-salvage').textContent = data.salvage;

	document.getElementById('glpi-tag').textContent = data.glpi.tag;
	document.getElementById('glpi-cat').textContent = data.glpi.cat;
	document.getElementById('glpi-state').textContent = data.glpi.state;
	document.getElementById('glpi-depr').textContent = data.glpi.depr;
	document.getElementById('glpi-service').textContent = data.glpi.service;
	document.getElementById('glpi-net').textContent = data.glpi.net;

	document.querySelectorAll('.svg-node-group').forEach(el => {
		if (el.getAttribute('data-node') === nodeId) {
			el.classList.add('active-node');
		} else {
			el.classList.remove('active-node');
		}
	});
}

function initViewportInteractivity() {
	document.querySelectorAll('.svg-node-group').forEach(group => {
		group.addEventListener('click', () => {
			const nodeId = group.getAttribute('data-node');
			selectNode(nodeId);
		});
	});

	const viewBtns = document.querySelectorAll('.view-btn');
	const viewIndicator = document.getElementById('current-view-name');
	const netLines = document.getElementById('network-lines');

	viewBtns.forEach(btn => {
		btn.addEventListener('click', () => {
			viewBtns.forEach(b => b.classList.remove('active'));
			btn.classList.add('active');
			const view = btn.getAttribute('data-view');

			if (view === 'topology') {
				viewIndicator.textContent = 'VIEW: Physical Shelves & Workbench Layout';
				netLines.style.opacity = '0.6';
				resetNodeColors();
			} else if (view === 'network') {
				viewIndicator.textContent = 'VIEW: Network Mesh & Active Ports';
				netLines.style.opacity = '1';
				highlightNetworkPorts();
			} else if (view === 'thermals') {
				viewIndicator.textContent = 'VIEW: Thermal Dissipation & Power Profiling';
				netLines.style.opacity = '0.1';
				applyThermalOverlay();
			} else if (view === 'glpi') {
				viewIndicator.textContent = 'VIEW: GLPI Inventory & Asset Lifecycle';
				netLines.style.opacity = '0.4';
				applyGlpiOverlay();
			}
		});
	});

	document.getElementById('reset-viewport-btn').addEventListener('click', () => {
		selectNode('winws');
		document.querySelector('.view-btn[data-view="topology"]').click();
	});
}

function resetNodeColors() {
	document.querySelectorAll('.svg-node-group .node-box').forEach(box => {
		box.style.fill = '';
	});
}

function highlightNetworkPorts() {
	document.querySelectorAll('.svg-node-group .node-box').forEach(box => {
		box.style.fill = '#0f172a';
	});
}

function applyThermalOverlay() {
	const colors = {
		's4mini': '#166534',
		'ypgi1': '#166534',
		'ipodtouch': '#166534',
		'yoga': '#15803d',
		'usbfan': '#0284c7',
		'mbp2011': '#b45309',
		'hp15': '#c2410c',
		'dell': '#b91c1c',
		'floppy': '#475569',
		'onefive': '#0369a1',
		'winws': '#dc2626',
		'nuc': '#15803d',
		'bluefruit': '#10b981'
	};
	document.querySelectorAll('.svg-node-group').forEach(group => {
		const node = group.getAttribute('data-node');
		const box = group.querySelector('.node-box');
		if (colors[node]) {
			box.style.fill = colors[node];
		}
	});
}

function applyGlpiOverlay() {
	document.querySelectorAll('.svg-node-group .node-box').forEach(box => {
		box.style.fill = '#1e3a5f';
	});
}

function initNodeFilter() {
	if (!document.querySelector('.node-filter-btn')) return;
	const filterBtns = document.querySelectorAll('.node-filter-btn');
	const cards = document.querySelectorAll('.fleet-card');

	filterBtns.forEach(btn => {
		btn.addEventListener('click', () => {
			filterBtns.forEach(b => b.classList.remove('active'));
			btn.classList.add('active');
			const filter = btn.getAttribute('data-filter');

			cards.forEach(card => {
				const cats = card.getAttribute('data-category');
				if (filter === 'all' || cats.includes(filter)) {
					card.style.display = 'flex';
				} else {
					card.style.display = 'none';
				}
			});
		});
	});

	cards.forEach(card => {
		card.addEventListener('click', () => {
			const id = card.getAttribute('data-id');
			selectNode(id);
			document.getElementById('fleet-viewport-container').scrollIntoView({ behavior: 'smooth', block: 'center' });
		});
	});
}

// -------------------------------------------------------------
// Hardware Longevity & Salvage ROI Calculator (Option D - 9 Nodes)
// -------------------------------------------------------------
function initRoiCalculator() {
	if (!document.getElementById('sl-nodes')) return;
	const slNodes = document.getElementById('sl-nodes');
	const slLifespan = document.getElementById('sl-lifespan');
	const slCost = document.getElementById('sl-cost');
	const slCloud = document.getElementById('sl-cloud');
	const slPower = document.getElementById('sl-power');
	const slKwh = document.getElementById('sl-kwh');

	const valNodes = document.getElementById('val-nodes');
	const valLifespan = document.getElementById('val-lifespan');
	const valCost = document.getElementById('val-cost');
	const valCloud = document.getElementById('val-cloud');
	const valPower = document.getElementById('val-power');
	const valKwh = document.getElementById('val-kwh');

	const roiNetSavings = document.getElementById('roi-net-savings');
	const roiCapex = document.getElementById('roi-capex');
	const roiCloud = document.getElementById('roi-cloud');
	const roiElectric = document.getElementById('roi-electric');
	const roiEwaste = document.getElementById('roi-ewaste');
	const roiHours = document.getElementById('roi-hours');
	const roiPercentage = document.getElementById('roi-percentage');

	function calculate() {
		const nodes = parseInt(slNodes.value, 10);
		const years = parseFloat(slLifespan.value);
		const costPerNode = parseFloat(slCost.value);
		const cloudPerMonth = parseFloat(slCloud.value);
		const wattsPerNode = parseFloat(slPower.value);
		const tariffKwh = parseFloat(slKwh.value);

		valNodes.textContent = `${nodes} nodes`;
		valLifespan.textContent = `${years.toFixed(1)} years`;
		valCost.textContent = `$${Math.round(costPerNode)}`;
		valCloud.textContent = `$${Math.round(cloudPerMonth)} / mo`;
		valPower.textContent = `${Math.round(wattsPerNode)} W / node`;
		valKwh.textContent = `$${tariffKwh.toFixed(2)} / kWh`;

		const capexAvoided = nodes * costPerNode;
		const totalMonths = years * 12;
		const cloudAvoided = nodes * cloudPerMonth * totalMonths;
		const grossSavings = capexAvoided + cloudAvoided;

		const totalHoursPerNode = years * 8766;
		const totalKwh = (nodes * wattsPerNode * totalHoursPerNode) / 1000;
		const electricityCost = totalKwh * tariffKwh;

		const netSavings = grossSavings - electricityCost;
		const ewasteKg = nodes * 2.7; // average device weight across laptops, towers and mobile
		const computeHours = nodes * totalHoursPerNode;
		const roiPct = electricityCost > 0 ? ((netSavings / (electricityCost + (nodes * 20))) * 100) : 999;

		roiNetSavings.textContent = `$${Math.round(netSavings).toLocaleString()}`;
		roiCapex.textContent = `$${Math.round(capexAvoided).toLocaleString()}`;
		roiCloud.textContent = `$${Math.round(cloudAvoided).toLocaleString()}`;
		roiElectric.textContent = `-$${Math.round(electricityCost).toLocaleString()}`;
		roiEwaste.textContent = `${ewasteKg.toFixed(1)} kg`;
		roiHours.textContent = `${Math.round(computeHours).toLocaleString()} hrs`;
		roiPercentage.textContent = `${Math.round(roiPct)}%`;

		const kpiTotalSaved = document.getElementById('kpi-total-saved');
		const kpiComputeHours = document.getElementById('kpi-compute-hours');
		const kpiLifespanExt = document.getElementById('kpi-lifespan-ext');
		const kpiNodeCount = document.getElementById('kpi-node-count');

		if (kpiTotalSaved) kpiTotalSaved.textContent = `$${Math.round(grossSavings).toLocaleString()}`;
		if (kpiComputeHours) kpiComputeHours.textContent = `${Math.round(computeHours).toLocaleString()}`;
		if (kpiLifespanExt) kpiLifespanExt.textContent = `+${years.toFixed(1)} yrs`;
		if (kpiNodeCount) kpiNodeCount.textContent = nodes;
	}

	[slNodes, slLifespan, slCost, slCloud, slPower, slKwh].forEach(input => {
		input.addEventListener('input', calculate);
	});

	const presetBtns = document.querySelectorAll('.preset-btn');
	presetBtns.forEach(btn => {
		btn.addEventListener('click', () => {
			presetBtns.forEach(b => b.classList.remove('active'));
			btn.classList.add('active');
			const preset = btn.getAttribute('data-preset');

			if (preset === 'current') {
				slNodes.value = 9;
				slLifespan.value = 3.5;
				slCost.value = 380;
				slCloud.value = 22;
				slPower.value = 17;
				slKwh.value = 0.16;
			} else if (preset === 'lowpower') {
				slNodes.value = 6;
				slLifespan.value = 4.0;
				slCost.value = 250;
				slCloud.value = 15;
				slPower.value = 6;
				slKwh.value = 0.14;
			} else if (preset === 'cloud') {
				slNodes.value = 12;
				slLifespan.value = 5.0;
				slCost.value = 550;
				slCloud.value = 35;
				slPower.value = 28;
				slKwh.value = 0.18;
			}
			calculate();
		});
	});

	calculate();
}

window.selectNode = selectNode;
