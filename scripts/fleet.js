/* Fleet & Salvage Architecture Hub Interactivity */

document.addEventListener('DOMContentLoaded', () => {
	initNodeFleetData();
	initViewportInteractivity();
	initNodeFilter();
	initRoiCalculator();
});

// Telemetry & Hardware Node Dictionary
const FLEET_DATA = {
	'nuc': {
		tag: 'HL-NODE-06-NUC-CORE',
		title: 'Headless Intel NUC LAN Backbone',
		os: 'Alpine Linux 3.x (musl)',
		power: '~12.5 W',
		uptime: '99.98% (Always-On)',
		status: 'ONLINE',
		workloads: 'Central LAN AdGuard Home DNS sinkhole, dual BOINC distributed research compute (Rosetta@home disease modeling & Universe@home astrophysics), Tailscale WireGuard gateway.',
		salvage: 'Compact ultra-low-idle compute node running musl/busybox minimal userspace to maximize CPU cycles dedicated directly to volunteer astrophysics and biomedical simulations.',
		glpi: {
			tag: 'HL-NODE-06-NUC-CORE',
			cat: 'Core Compute / Infrastructure',
			state: 'In Production / Mission Critical',
			depr: '100% Amortized (Salvage Reclaim)',
			service: '2026-11-20 (Antigravity Sync)',
			net: 'Gigabit LAN + Tailscale Mesh'
		}
	},
	's4mini': {
		tag: 'HL-NODE-01-S4MINI',
		title: 'Samsung Galaxy S4 Mini (SCH-I435)',
		os: 'Android 4.4.2 / WebKit ES5',
		power: '~1.8 W',
		uptime: '99.4%',
		status: 'ONLINE',
		workloads: 'Dedicated 24/7 Duino-Coin web worker node running continuous WebKit multithreaded JavaScript hashing. Local telemetry monitoring web UI hosted on port 8097.',
		salvage: 'Retired 2013 mobile handset diverted from landfill. Stripped of background mobile services; powered by continuous regulated USB 5V DC line with display sleep-override.',
		glpi: {
			tag: 'HL-NODE-01-S4MINI',
			cat: 'Mobile Silicon Reclamation',
			state: 'In Production / Dedicated Miner',
			depr: 'Zero Net Book Value ($0 Reclaim)',
			service: '2026-11-18 (Battery Safety Check)',
			net: 'Wi-Fi 802.11n (Port 8097 Web UI)'
		}
	},
	'yoga': {
		tag: 'HL-NODE-02-YOGA-BB',
		title: 'Lenovo Yoga 2 11 Bare-Board Rig',
		os: 'Headless Linux x86_64',
		power: '~6.2 W',
		uptime: '99.1%',
		status: 'ONLINE',
		workloads: 'Continuous crypto mining and lightweight local utility daemon. Completely open-air testbench rig operating 24/7 without thermal accumulation.',
		salvage: 'Rescued from landfill after catastrophic chassis and screen fracture. Motherboard and daughterboard extracted and bench-mounted with a dedicated 5V USB cooling blower.',
		glpi: {
			tag: 'HL-NODE-02-YOGA-BB',
			cat: 'Open-Bench Compute',
			state: 'Active Testbench / Utility',
			depr: '100% Amortized E-Waste',
			service: '2026-11-15 (Thermal Fan Re-seat)',
			net: 'Integrated LAN / USB Ethernet'
		}
	},
	'mbp2011': {
		tag: 'HL-NODE-03-MBP2011',
		title: 'Mid-2011 MacBook Pro 13" (A1278)',
		os: 'Debian 12 Bookworm (Minimal)',
		power: '~18.5 W',
		uptime: '99.8%',
		status: 'ONLINE',
		workloads: 'Batch CPU image generation queue processing, background cryptocurrency mining, and automated project build worker.',
		salvage: 'Rescued 2011 Apple aluminum unibody. Internal bloated battery removed for fire safety; repasted with industrial Honeywell PTM7950 phase-change material on copper heatsink.',
		glpi: {
			tag: 'HL-NODE-03-MBP2011',
			cat: 'Server / Compute Node',
			state: 'In Production / Stable',
			depr: 'Salvaged Legacy Hardware',
			service: '2026-11-10 (PTM7950 Repaste)',
			net: 'Gigabit LAN (VLAN 10)'
		}
	},
	'hp15': {
		tag: 'HL-NODE-04-HP15',
		title: 'Legacy HP Laptop 15 Workhorse',
		os: 'Linux Mint 21 (Cinnamon)',
		power: '~24.0 W',
		uptime: '98.9%',
		status: 'ONLINE',
		workloads: 'Continuous local diffusion batch image generation running Realistic Vision 5.1 with LCM LoRA 4-step sampling, background mining, and persistent Rclone Google Drive cloud sync.',
		salvage: 'Repurposed domestic laptop. Configured with headless automated startup daemons and thermal-throttled thread concurrency limits for non-stop generative workflows.',
		glpi: {
			tag: 'HL-NODE-04-HP15',
			cat: 'AI Synthesis / Cloud Gateway',
			state: 'In Production / Media Node',
			depr: 'Repurposed Asset',
			service: '2026-11-20 (Rclone Sync Audit)',
			net: 'Wi-Fi 802.11ac + Rclone Daemon'
		}
	},
	'dell': {
		tag: 'HL-NODE-05-DELLTWR',
		title: 'Dell Inspiron Desktop ("Hopes & Dreams")',
		os: 'Custom Slax Linux (Live USB)',
		power: '~38.0 W',
		uptime: '97.6%',
		status: 'ONLINE',
		workloads: 'Batch image generation and crypto mining operating entirely in RAM off a customized Slax USB live drive with persistence overlay. Zero spinning mechanical drive dependency.',
		salvage: 'Resurrected surplus office desktop tower following primary hard drive failure. Configured to boot completely into RAM overlay, eliminating disk wear and surviving sudden power interrupts.',
		glpi: {
			tag: 'HL-NODE-05-DELLTWR',
			cat: 'Diskless RAM Compute',
			state: 'Active Experimental Rig',
			depr: 'Surplus Reclaim',
			service: '2026-11-19 (Slax Kernel Update)',
			net: 'Gigabit Onboard Ethernet'
		}
	},
	'winws': {
		tag: 'HL-NODE-07-WINWS',
		title: 'Windows Multi-Role Laptop Workstation',
		os: 'Windows 11 Pro (x86_64)',
		power: '~45.0 W (Dynamic)',
		uptime: '99.2%',
		status: 'ONLINE',
		workloads: 'Folding@home molecular dynamics simulations, burst crypto mining, physical optical media archiving / DVD ripping, and local CIS virtualization hypervisor (Hyper-V).',
		salvage: 'Hybrid academic workstation: dynamically schedules distributed medical research and mining workloads during idle hours while providing immediate hardware access for CIS coursework.',
		glpi: {
			tag: 'HL-NODE-07-WINWS',
			cat: 'Hybrid Workstation / Hypervisor',
			state: 'Primary Academic & Compute Node',
			depr: 'Active Educational Hardware',
			service: '2026-11-20 (Folding Client Check)',
			net: 'Gigabit LAN / Wi-Fi 6'
		}
	}
};

function initNodeFleetData() {
	// Default inspector on NUC
	selectNode('nuc');
}

function selectNode(nodeId) {
	const data = FLEET_DATA[nodeId];
	if (!data) return;

	// Update Inspector DOM
	document.getElementById('insp-tag').textContent = data.tag;
	document.getElementById('insp-title').textContent = data.title;
	document.getElementById('insp-os').textContent = data.os;
	document.getElementById('insp-power').textContent = data.power;
	document.getElementById('insp-uptime').textContent = data.uptime;
	document.getElementById('insp-workloads').textContent = data.workloads;
	document.getElementById('insp-salvage').textContent = data.salvage;

	// GLPI
	document.getElementById('glpi-tag').textContent = data.glpi.tag;
	document.getElementById('glpi-cat').textContent = data.glpi.cat;
	document.getElementById('glpi-state').textContent = data.glpi.state;
	document.getElementById('glpi-depr').textContent = data.glpi.depr;
	document.getElementById('glpi-service').textContent = data.glpi.service;
	document.getElementById('glpi-net').textContent = data.glpi.net;

	// Highlight SVG node
	document.querySelectorAll('.svg-node-group').forEach(el => {
		if (el.getAttribute('data-node') === nodeId) {
			el.classList.add('active-node');
		} else {
			el.classList.remove('active-node');
		}
	});
}

function initViewportInteractivity() {
	// Click SVG node
	document.querySelectorAll('.svg-node-group').forEach(group => {
		group.addEventListener('click', () => {
			const nodeId = group.getAttribute('data-node');
			selectNode(nodeId);
		});
	});

	// View buttons
	const viewBtns = document.querySelectorAll('.view-btn');
	const viewIndicator = document.getElementById('current-view-name');
	const netLines = document.getElementById('network-lines');

	viewBtns.forEach(btn => {
		btn.addEventListener('click', () => {
			viewBtns.forEach(b => b.classList.remove('active'));
			btn.classList.add('active');
			const view = btn.getAttribute('data-view');

			if (view === 'topology') {
				viewIndicator.textContent = 'VIEW: Physical Workbench Layout';
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
		selectNode('nuc');
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
		's4mini': '#166534', // very cool ~1.8W
		'yoga': '#15803d',   // ~6W
		'mbp2011': '#b45309',// ~18.5W
		'hp15': '#c2410c',   // ~24W
		'dell': '#b91c1c',   // ~38W
		'nuc': '#15803d',    // ~12.5W
		'winws': '#dc2626'   // ~45W
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

	// Clicking card selects node in inspector & scrolls smoothly
	cards.forEach(card => {
		card.addEventListener('click', () => {
			const id = card.getAttribute('data-id');
			selectNode(id);
			document.getElementById('fleet-viewport-container').scrollIntoView({ behavior: 'smooth', block: 'center' });
		});
	});
}

// -------------------------------------------------------------
// Hardware Longevity & Salvage ROI Calculator (Option D)
// -------------------------------------------------------------
function initRoiCalculator() {
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

	// Results
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

		// Label updates
		valNodes.textContent = `${nodes} nodes`;
		valLifespan.textContent = `${years.toFixed(1)} years`;
		valCost.textContent = `$${Math.round(costPerNode)}`;
		valCloud.textContent = `$${Math.round(cloudPerMonth)} / mo`;
		valPower.textContent = `${Math.round(wattsPerNode)} W / node`;
		valKwh.textContent = `$${tariffKwh.toFixed(2)} / kWh`;

		// Core Computations
		const capexAvoided = nodes * costPerNode;
		const totalMonths = years * 12;
		const cloudAvoided = nodes * cloudPerMonth * totalMonths;
		const grossSavings = capexAvoided + cloudAvoided;

		// Power consumption: (watts * 24 hrs * 365.25 days * years) / 1000 * tariff
		const totalHoursPerNode = years * 8766;
		const totalKwh = (nodes * wattsPerNode * totalHoursPerNode) / 1000;
		const electricityCost = totalKwh * tariffKwh;

		const netSavings = grossSavings - electricityCost;
		const ewasteKg = nodes * 3.2; // approx 3.2 kg average device weight
		const computeHours = nodes * totalHoursPerNode;
		const roiPct = electricityCost > 0 ? ((netSavings / (electricityCost + (nodes * 20))) * 100) : 999;

		// Update UI
		roiNetSavings.textContent = `$${Math.round(netSavings).toLocaleString()}`;
		roiCapex.textContent = `$${Math.round(capexAvoided).toLocaleString()}`;
		roiCloud.textContent = `$${Math.round(cloudAvoided).toLocaleString()}`;
		roiElectric.textContent = `-$${Math.round(electricityCost).toLocaleString()}`;
		roiEwaste.textContent = `${ewasteKg.toFixed(1)} kg`;
		roiHours.textContent = `${Math.round(computeHours).toLocaleString()} hrs`;
		roiPercentage.textContent = `${Math.round(roiPct)}%`;

		// Header Hero Sync
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

	// Presets
	const presetBtns = document.querySelectorAll('.preset-btn');
	presetBtns.forEach(btn => {
		btn.addEventListener('click', () => {
			presetBtns.forEach(b => b.classList.remove('active'));
			btn.classList.add('active');
			const preset = btn.getAttribute('data-preset');

			if (preset === 'current') {
				slNodes.value = 7;
				slLifespan.value = 3.5;
				slCost.value = 450;
				slCloud.value = 25;
				slPower.value = 21;
				slKwh.value = 0.16;
			} else if (preset === 'lowpower') {
				slNodes.value = 5;
				slLifespan.value = 4.0;
				slCost.value = 350;
				slCloud.value = 15;
				slPower.value = 8;
				slKwh.value = 0.14;
			} else if (preset === 'cloud') {
				slNodes.value = 10;
				slLifespan.value = 5.0;
				slCost.value = 600;
				slCloud.value = 40;
				slPower.value = 35;
				slKwh.value = 0.18;
			}
			calculate();
		});
	});

	calculate();
}
