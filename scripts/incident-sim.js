(function () {
	'use strict';

	var scenarios = {
		dns_blackhole: {
			id: 'dns_blackhole',
			title: 'DNS Blackhole & Tailscale Priority Inversion',
			host: 'avanek@macbook-pro:~',
			prompt: 'avanek@macbook-pro:~$',
			brief: '<p><strong>Incident Summary:</strong> Multiple LAN clients and local workstation browser sessions report complete web failure (<code>DNS_PROBE_FINISHED_BAD_CONFIG</code>). Tailscale mesh peers are reachable via IP, but internal DNS name resolution is returning <code>SERVFAIL</code>.</p><p><strong>Target Architecture:</strong> macOS workstation utilizing an enrolled AdGuard encrypted configuration profile alongside active Tailscale WireGuard client.</p>',
			actions: [
				{ cmd: 'scutil --dns', label: 'Inspect macOS DNS Resolver Hierarchy', type: 'diag' },
				{ cmd: 'dig @192.168.0.201 google.com +short', label: 'Query Local AdGuard Home on Router', type: 'diag' },
				{ cmd: 'tailscale status', label: 'Verify Tailscale Mesh Interface', type: 'diag' },
				{ cmd: 'sudo networksetup -setdnsservers Wi-Fi 192.168.0.201', label: 'Hardcode Local Wi-Fi DNS to AdGuard', type: 'fix_partial' },
				{ cmd: 'reorder-dns-priority', label: 'Fix Priority Order: Elevate AdGuard Profile Above VPN', type: 'fix_correct' }
			],
			responses: {
				'scutil --dns': '\nResolver configuration\nresolver #1\n  search domain[0] : taile72a68.ts.net\n  nameserver[0] : 100.100.100.100\n  flags    : Scoped, Request A records\n  order    : 100400 (PRIMARY)\n\nresolver #2\n  nameserver[0] : https://doh.adguard.com/dns-query\n  flags    : Supplemental (Encrypted)\n  order    : 200000\n\n[!] ROOT CAUSE IDENTIFIED: Tailscale MagicDNS has seized slot #1 with priority order 100400, routing all LAN DNS requests into Tailscale mesh instead of local AdGuard Home resolver!',
				'dig @192.168.0.201 google.com +short': '142.250.190.46\n142.250.190.78\n\n[+] Local AdGuard Home on 192.168.0.201 is 100% HEALTHY and resolving queries in 12ms. Issue is local host resolver routing.',
				'tailscale status': '100.87.81.52   nucwol2-0--hdd  avanek@  linux   active; direct 192.168.0.202:41641\n100.101.40.12  macbook-pro     avanek@  macOS   active; self\n\n[+] Mesh tunnel active. Tailscale 100.100.100.100 responder is online.',
				'sudo networksetup -setdnsservers Wi-Fi 192.168.0.201': '[WARN] Wi-Fi DNS adjusted to 192.168.0.201, but scutil reveals macOS configuration profile and Tailscale scoped resolver override Wi-Fi interface settings. Symptom persists.',
				'reorder-dns-priority': '[SUCCESS] Re-ordered resolver hierarchy! Profile AdGuard encrypted DoH promoted to order 50000. Resolving google.com via AdGuard: 142.250.190.78. LAN browsing restored.'
			},
			solutionCmd: 'reorder-dns-priority',
			postmortem: '<p><strong>Root Cause:</strong> Tailscale's MagicDNS feature automatically claims primary DNS resolver priority (order 100400) upon tunnel activation. When mobile configuration profiles (.mobileconfig) for encrypted DNS (AdGuard) coexist without explicit priority binding, standard web traffic is routed into the VPN tunnel resolver rather than the local LAN sinkhole.</p><p><strong>Prevention:</strong> Configured split-DNS routing in Tailscale admin console and set explicit order 50000 on the local macOS AdGuard configuration profile.</p>'
		},
		code10_desync: {
			id: 'code10_desync',
			title: 'Qualcomm Baseband Serial Desync (Code 10)',
			host: 'Owner@WINDOWS10-DESKTOP:C:\\Users\\Owner',
			prompt: 'PS C:\\Users\\Owner> ',
			brief: '<p><strong>Incident Summary:</strong> During non-volatile RAM diagnostics on an LG Accolade (VX5600) via <code>WriteProgram(1.0.0.4)</code>, serial port COM2 became unresponsive mid-write. Device Manager flags the USB controller with yellow exclamation point: <em>Code 10: This device cannot start</em>.</p><p><strong>Target Architecture:</strong> Windows 10 host communicating via virtualized USB-to-UART COM port with Qualcomm AMSS baseband.</p>',
			actions: [
				{ cmd: 'Get-PnpDevice -FriendlyName "*USB*" | Select FriendlyName, Status', label: 'Audit Device Manager PnP Descriptors', type: 'diag' },
				{ cmd: 'python test_com2.py', label: 'Test Raw Serial Ping on COM2', type: 'diag' },
				{ cmd: 'Restart-Computer -Force', label: 'Reboot Host Computer (Nuclear Option)', type: 'fix_bad' },
				{ cmd: 'Cycle-ComPort-DeviceManager', label: 'Disable & Re-Enable COM2 in Device Manager', type: 'fix_correct' }
			],
			responses: {
				'Get-PnpDevice -FriendlyName "*USB*" | Select FriendlyName, Status': '\nFriendlyName                               Status\n------------                               ------\nSAMSUNG Mobile USB Composite Device        OK\nLGE CDMA USB Serial Port (COM2)            Error (Code 10)\nIntel(R) USB 3.0 eXtensible Host Controller OK\n\n[!] LGE CDMA USB Serial Port (COM2) driver stack is hung in an invalid PnP power state.',
				'python test_com2.py': 'Traceback (most recent call last):\n  File "test_com2.py", line 4, in <module>\n    ser = serial.Serial("COM2", 115200, timeout=1)\nserial.serialutil.SerialException: could not open port "COM2": PermissionError(13, "Access is denied.", None, 5)\n[!] Device handle is locked by zombie thread.',
				'Restart-Computer -Force': '[FAIL] Host reboot cleared RAM, but unsaved ESN write buffer was corrupted and phone was left in a hanging diagnostic state. SLA heavily penalized!',
				'Cycle-ComPort-DeviceManager': '[SUCCESS] Executed PnP disable descriptor -> wait 2000ms -> PnP re-enable! Windows reloaded usbs牢.sys. COM2 is online. WriteProgram confirms: "COM2 Reading OK! Firmware VX560V04. PASS".'
			},
			solutionCmd: 'Cycle-ComPort-DeviceManager',
			postmortem: '<p><strong>Root Cause:</strong> Legacy CDMA Qualcomm diagnostic handlers drop USB DTR/RTS lines during firmware block writes, leaving Windows virtual serial drivers in a wedged Code 10 state. A full machine reboot is destructive to in-flight cellular NV-items.</p><p><strong>Prevention:</strong> Programmatically cycling the PnP hardware ID re-enumerates the USB interface without dropping host system state or bricking the handset.</p>'
		},
		scsi_shift: {
			id: 'scsi_shift',
			title: 'The Ghost Drive: Sabrent SATA Bus Re-enumeration',
			host: 'avanek@alpinestorage:~',
			prompt: 'alpinestorage:~$ ',
			brief: '<p><strong>Incident Summary:</strong> The intranet gathering slideshow service suddenly dropped with error 500. Logs indicate directory <code>/media/onefive</code> is unreadable. Guests are arriving in 15 minutes.</p><p><strong>Target Architecture:</strong> Alpine Linux Intel NUC gateway with external Sabrent USB 3.0 SATA enclosure.</p>',
			actions: [
				{ cmd: 'dmesg | tail -n 25', label: 'Inspect Kernel Buffer for SCSI Resets', type: 'diag' },
				{ cmd: 'lsblk -f', label: 'List Block Devices and Filesystem UUIDs', type: 'diag' },
				{ cmd: 'mount /dev/sdc1 /media/onefive', label: 'Attempt Re-mount on /dev/sdc1', type: 'fix_bad' },
				{ cmd: 'fix-fstab-uuid', label: 'Bind Mount to Persistent UUID in /etc/fstab', type: 'fix_correct' }
			],
			responses: {
				'dmesg | tail -n 25': '[ 4821.109] usb 2-1: reset SuperSpeed USB device number 3 using xhci_hcd\n[ 4821.340] sd 2:0:0:0: [sdc] Synchronizing SCSI cache\n[ 4821.341] sd 2:0:0:0: [sdc] Unhandled error code\n[ 4821.512] sd 3:0:0:0: [sdd] 1953525168 512-byte logical blocks\n[ 4821.515] sd 3:0:0:0: [sdd] Attached SCSI disk\n\n[!] ROOT CAUSE: USB power glitch caused SATA bridge to re-enumerate as /dev/sdd1 instead of /dev/sdc1!',
				'lsblk -f': 'NAME   FSTYPE FSVER LABEL       UUID                                 MOUNTPOINTS\nsda                                                                      \n├─sda1 vfat   FAT32 BOOT        5E8A-12F9                            /boot\n└─sda2 ext4   1.0   rootfs      c218e814-7d52-411a-8e2b-f8f9189012a4 /\nsdd                                                                      \n└─sdd1 ext4   1.0   ONEFIVE     4a7c1822-bc91-49fa-9182-192a84bb1029 [UNMOUNTED]\n\n[!] Target disk UUID is 4a7c1822-bc91-49fa-9182-192a84bb1029.',
				'mount /dev/sdc1 /media/onefive': 'mount: /media/onefive: special device /dev/sdc1 does not exist.\n[!] Fragile device node assumption failed. /dev/sdc is gone.',
				'fix-fstab-uuid': '[SUCCESS] Updated /etc/fstab with UUID=4a7c1822-bc91-49fa-9182-192a84bb1029 /media/onefive ext4 defaults 0 2! Executed mount -a && rc-service slideshow-party restart. Slideshow online at 192.168.0.202:8080!'
			},
			solutionCmd: 'fix-fstab-uuid',
			postmortem: '<p><strong>Root Cause:</strong> External USB-SATA enclosures can briefly cycle their SCSI bridge during voltage sags. Linux assigns the next sequential device node letter (sdc &rarr; sdd), breaking any legacy scripts hardcoding device paths.</p><p><strong>Prevention:</strong> Always mount storage by immutable UUID (<code>/dev/disk/by-uuid/</code>) and implement a kernel watchdog cron script to remount automatically.</p>'
		},
		thermal_runaway: {
			id: 'thermal_runaway',
			title: '100°C Thermal Throttling on Continuous Diffusion Batch',
			host: 'avanek@hp-laptop:~',
			prompt: 'avanek@hp-laptop:~$ ',
			brief: '<p><strong>Incident Summary:</strong> The HP Laptop 15 running continuous Realistic Vision 5.1 image generation has slowed to a crawl. Generation times spiked from 25 seconds to 4 minutes per image. Fans are screaming at 100% duty cycle.</p><p><strong>Target Architecture:</strong> HP Laptop 15 (Intel Core i5) running Linux Mint with stable-diffusion.cpp.</p>',
			actions: [
				{ cmd: 'sensors', label: 'Check Hardware Thermal Sensors', type: 'diag' },
				{ cmd: 'cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_cur_freq', label: 'Inspect CPU Clock Frequency', type: 'diag' },
				{ cmd: 'killall -9 sd', label: 'Kill Generation Process and Leave Offline', type: 'fix_bad' },
				{ cmd: 'switch-lcm-lora-4step', label: 'Switch to LCM LoRA 4-Step Sampling & Throttle Duty', type: 'fix_correct' }
			],
			responses: {
				'sensors': 'coretemp-isa-0000\nPackage id 0:  +99.0°C  (high = +80.0°C, crit = +100.0°C) [THERMAL THROTTLE]\nCore 0:        +99.0°C  (high = +80.0°C, crit = +100.0°C)\nCore 1:        +98.0°C  (high = +80.0°C, crit = +100.0°C)\n\n[CRITICAL] CPU cores are pinned at thermal junction maximum (TjMax 100°C)!',
				'cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_cur_freq': '398412\n\n[!] CPU is severely throttled to ~400 MHz (base 2.5 GHz / boost 3.2 GHz) to prevent silicon shutdown.',
				'killall -9 sd': '[WARN] Process terminated. CPU temperatures cooled down to 52°C, but generation pipeline is halted and daily batch quota will be missed.',
				'switch-lcm-lora-4step': '[SUCCESS] Reconfigured inference pipeline: Switched from 50-step Euler_a to LCM LoRA 4-step scheduler with 5-second sleep interval between renders! Workload reduced by 85%. Core temps stabilized at 71°C at 2.4 GHz.'
			},
			solutionCmd: 'switch-lcm-lora-4step',
			postmortem: '<p><strong>Root Cause:</strong> Prolonged 50-step FP16 diffusion inference pumped out aged thermal compound, causing thermal runaway on compact laptop heatpipes.</p><p><strong>Prevention:</strong> Modern Latent Consistency Models (LCM) achieve high fidelity in 4 to 8 steps, reducing silicon duty cycle by 80% and maintaining sustainable thermal headroom.</p>'
		},
		monero_filter: {
			id: 'monero_filter',
			title: 'Cryptojacking False-Positive: Stratum Pool Down',
			host: 'avanek@nuc-gateway:~',
			prompt: 'avanek@nuc-gateway:~$ ',
			brief: '<p><strong>Incident Summary:</strong> The background mining nodes (Lenovo Yoga, S4 Mini, and Mac Debian) suddenly stopped hashing. Console logs report <code>ERR: socket closed by peer: gulf.moneroocean.stream:10128</code>.</p><p><strong>Target Architecture:</strong> Alpine Linux NUC gateway with AdGuard DNS filtering across the household network.</p>',
			actions: [
				{ cmd: 'curl -I https://gulf.moneroocean.stream', label: 'Test Web Reachability of Mining Pool', type: 'diag' },
				{ cmd: 'adguard-query-log-check', label: 'Audit AdGuard DNS Query Log for Blocked Hits', type: 'diag' },
				{ cmd: 'iptables -F', label: 'Flush Host Firewall Rules (Blind Guess)', type: 'fix_bad' },
				{ cmd: 'adguard-add-whitelist-rule', label: 'Add Exception Rule: @@||gulf.moneroocean.stream^', type: 'fix_correct' }
			],
			responses: {
				'curl -I https://gulf.moneroocean.stream': 'curl: (6) Could not resolve host: gulf.moneroocean.stream\n[!] DNS lookup returned 0.0.0.0 or NXDOMAIN.',
				'adguard-query-log-check': '\n[AdGuard DNS Query Log]\nClient: The Macsimal Computing Experience (192.168.0.205)\nQuery:  gulf.moneroocean.stream\nStatus: BLOCKED by Filter: AdGuard DNS filter\nRule:   ||gulf.moneroocean.stream^\nReason: Cryptomining Pool Blacklist Category',
				'iptables -F': '[WARN] Flushed iptables. Firewall was not the blocker; DNS sinkhole is still returning 0.0.0.0.',
				'adguard-add-whitelist-rule': '[SUCCESS] Injected user exception rule @@||gulf.moneroocean.stream^ into AdGuard DNS! DNS cache flushed. Query resolves to 198.244.179.176. Miners reconnected with 0 rejected shares.'
			},
			solutionCmd: 'adguard-add-whitelist-rule',
			postmortem: '<p><strong>Root Cause:</strong> Upstream DNS threat intelligence feeds aggressively sinkhole cryptocurrency stratum endpoints to protect non-technical users from unauthorized browser cryptojacking.</p><p><strong>Prevention:</strong> Legitimate homelab mining operations must configure explicit whitelist exception rules (<code>@@||</code>) rather than disabling global network defense.</p>'
		}
	};

	var currentScenarioKey = 'dns_blackhole';
	var currentScenario = scenarios[currentScenarioKey];
	var sla = 100;
	var isSolved = false;

	var hudStatusEl = document.getElementById('hud-status');
	var slaFillEl = document.getElementById('sla-fill');
	var slaTextEl = document.getElementById('sla-text');
	var scenarioSelectorEl = document.getElementById('scenario-selector');
	var btnResetEl = document.getElementById('btn-reset-scenario');

	var briefTitleEl = document.getElementById('brief-title');
	var briefBodyEl = document.getElementById('brief-body');
	var actionButtonsEl = document.getElementById('action-buttons');
	var postmortemCardEl = document.getElementById('postmortem-card');
	var postmortemContentEl = document.getElementById('postmortem-content');

	var termHostEl = document.getElementById('terminal-host');
	var termPromptEl = document.getElementById('terminal-prompt');
	var termViewportEl = document.getElementById('terminal-viewport');
	var termFormEl = document.getElementById('terminal-form');
	var termInputEl = document.getElementById('terminal-input');
	var termClearEl = document.getElementById('terminal-clear');

	function appendTerm(text, className) {
		var span = document.createElement('span');
		span.className = className || '';
		span.textContent = text;
		termViewportEl.appendChild(span);
		termViewportEl.scrollTop = termViewportEl.scrollHeight;
	}

	function appendTermLine(text, className) {
		appendTerm(text + '\n', className);
	}

	function loadScenario(key) {
		currentScenarioKey = key;
		currentScenario = scenarios[key];
		sla = 100;
		isSolved = false;

		updateSlaDisplay();
		hudStatusEl.className = 'hud-status-badge';
		hudStatusEl.textContent = 'ACTIVE INCIDENT';

		briefTitleEl.textContent = currentScenario.title;
		briefBodyEl.innerHTML = currentScenario.brief;

		termHostEl.textContent = currentScenario.host;
		termPromptEl.textContent = currentScenario.prompt;

		termViewportEl.innerHTML = '';
		appendTermLine('*** INCIDENT COMMAND INITIALIZED: ' + currentScenario.title.toUpperCase() + ' ***', 'term-warn');
		appendTermLine('Type "help" for a list of commands, or select a suggested diagnostic action.', 'term-dim');
		appendTermLine('', '');

		postmortemCardEl.style.display = 'none';

		// Render action buttons
		actionButtonsEl.innerHTML = '';
		currentScenario.actions.forEach(function (act) {
			var btn = document.createElement('button');
			btn.type = 'button';
			btn.className = 'action-btn';
			var badgeText = act.type === 'diag' ? 'DIAGNOSTIC' : (act.type === 'fix_correct' ? 'RESOLUTION' : 'ACTION');
			btn.innerHTML = '<span>' + act.cmd + '</span> <span class="btn-badge">' + badgeText + '</span>';
			btn.addEventListener('click', function () {
				executeCommand(act.cmd);
			});
			actionButtonsEl.appendChild(btn);
		});
	}

	function updateSlaDisplay() {
		sla = Math.max(0, sla);
		slaFillEl.style.width = sla + '%';
		slaTextEl.textContent = sla + '% Health';
		if (sla > 65) {
			slaFillEl.style.backgroundColor = '#22c55e';
		} else if (sla > 35) {
			slaFillEl.style.backgroundColor = '#f59e0b';
		} else {
			slaFillEl.style.backgroundColor = '#ef4444';
		}

		if (sla <= 0 && !isSolved) {
			hudStatusEl.textContent = 'SLA BREACHED';
			hudStatusEl.className = 'hud-status-badge';
			appendTermLine('\n[FATAL] SLA DEGRADED TO 0%. Incident escalated to engineering management.', 'term-err');
		}
	}

	function executeCommand(rawCmd) {
		var cmd = rawCmd.trim();
		if (!cmd) return;

		appendTerm(currentScenario.prompt + ' ', 'term-cmd');
		appendTermLine(cmd, 'term-cmd');

		if (cmd.toLowerCase() === 'help') {
			appendTermLine('\nAvailable System Commands:\n  help        - Show this manual\n  clear       - Wipe terminal scrollback\n  status      - Display current SLA and node telemetry\n  lsblk       - View block storage topology\n  dmesg       - Dump kernel ring buffer\n  sensors     - Read hardware temperature monitors\n  dig <host>  - Execute DNS lookup\n  curl <url>  - Test HTTP/S connectivity\n', 'term-dim');
			return;
		}

		if (cmd.toLowerCase() === 'clear') {
			termViewportEl.innerHTML = '';
			return;
		}

		if (cmd.toLowerCase() === 'status') {
			appendTermLine('SLA Health: ' + sla + '% | Incident: ' + currentScenario.title + ' | State: ' + (isSolved ? 'RESOLVED' : 'UNRESOLVED'), 'term-hi');
			return;
		}

		if (currentScenario.responses[cmd]) {
			var resp = currentScenario.responses[cmd];
			appendTermLine(resp, '');

			if (cmd === currentScenario.solutionCmd) {
				isSolved = true;
				hudStatusEl.className = 'hud-status-badge ok';
				hudStatusEl.textContent = 'RESOLVED';
				appendTermLine('\n>>> INCIDENT SUCCESSFULLY REMEDIATED! Final SLA: ' + sla + '% <<<', 'term-succ');
				postmortemCardEl.style.display = 'block';
				postmortemContentEl.innerHTML = currentScenario.postmortem;
			} else {
				// Non-solution action: check if bad
				var act = currentScenario.actions.find(function (a) { return a.cmd === cmd; });
				if (act && act.type === 'fix_bad') {
					sla -= 25;
					updateSlaDisplay();
				}
			}
		} else {
			// Unknown command
			sla -= 5;
			updateSlaDisplay();
			appendTermLine('bash: ' + cmd + ': command not found or invalid diagnostic query. (-5% SLA penalty)', 'term-err');
		}
	}

	termFormEl.addEventListener('submit', function (e) {
		e.preventDefault();
		var val = termInputEl.value;
		termInputEl.value = '';
		executeCommand(val);
	});

	termClearEl.addEventListener('click', function () {
		termViewportEl.innerHTML = '';
	});

	scenarioSelectorEl.addEventListener('change', function () {
		loadScenario(scenarioSelectorEl.value);
	});

	btnResetEl.addEventListener('click', function () {
		loadScenario(currentScenarioKey);
	});

	// Initialize first scenario
	loadScenario('dns_blackhole');
})();
