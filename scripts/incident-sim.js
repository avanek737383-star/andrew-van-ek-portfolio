/* Homelab Incident Response & Chaos Simulator Interactivity */

(function () {
	'use strict';

	var scenarios = {
		dns_blackhole: {
			id: 'dns_blackhole',
			title: 'DNS Blackhole & Tailscale Conflict',
			host: 'avanek@macbook-pro:~',
			prompt: 'avanek@macbook-pro:~$',
			brief: '<p><strong>Incident Summary:</strong> Multiple LAN clients and local workstation browser sessions report complete web failure (<code>DNS_PROBE_FINISHED_BAD_CONFIG</code>). Tailscale mesh peers are reachable via IP, but internal DNS name resolution is returning <code>SERVFAIL</code>.</p><p><strong>Target Architecture:</strong> macOS workstation utilizing an enrolled AdGuard encrypted configuration profile alongside an active Tailscale WireGuard client.</p>',
			actions: [
				{ cmd: 'scutil --dns', label: 'Inspect macOS DNS Resolver Hierarchy', type: 'diag' },
				{ cmd: 'dig @192.168.0.201 google.com +short', label: 'Query Local AdGuard Home on Router', type: 'diag' },
				{ cmd: 'tailscale status', label: 'Verify Tailscale Mesh Interface', type: 'diag' },
				{ cmd: 'sudo networksetup -setdnsservers Wi-Fi 192.168.0.201', label: 'Hardcode Local Wi-Fi DNS to AdGuard', type: 'fix_partial' },
				{ cmd: 'reorder-dns-priority', label: 'Elevate AdGuard Profile Above VPN Tunnel', type: 'fix_correct' }
			],
			responses: {
				'scutil --dns': '\nResolver configuration\nresolver #1\n  search domain[0] : taile72a68.ts.net\n  nameserver[0] : 100.100.100.100\n  flags    : Scoped, Request A records\n  order    : 100400 (PRIMARY)\n\nresolver #2\n  nameserver[0] : https://doh.adguard.com/dns-query\n  flags    : Supplemental (Encrypted)\n  order    : 200000\n\n[!] ROOT CAUSE IDENTIFIED: Tailscale MagicDNS claimed slot #1 with priority order 100400, routing all LAN DNS requests into the VPN tunnel instead of the local AdGuard Home resolver!',
				'dig @192.168.0.201 google.com +short': '142.250.190.46\n142.250.190.78\n\n[+] Local AdGuard Home on 192.168.0.201 is 100% HEALTHY and resolving queries in 12ms. The issue is local host resolver priority.',
				'tailscale status': '100.87.81.52   nucwol2-0--hdd  avanek@  linux   active; direct 192.168.0.202:41641\n100.101.40.12  macbook-pro     avanek@  macOS   active; self\n\n[+] Mesh tunnel active. Tailscale 100.100.100.100 responder is online.',
				'sudo networksetup -setdnsservers Wi-Fi 192.168.0.201': '[WARN] Wi-Fi DNS adjusted to 192.168.0.201, but scutil reveals the macOS mobile profile and Tailscale scoped resolver override Wi-Fi interface settings. Symptom persists.',
				'reorder-dns-priority': '[SUCCESS] Re-ordered resolver hierarchy! Profile AdGuard encrypted DoH promoted to order 50000. Resolving google.com via AdGuard: 142.250.190.78. LAN browsing restored.'
			},
			solutionCmd: 'reorder-dns-priority',
			postmortem: '<p><strong>Root Cause:</strong> Tailscale\'s MagicDNS feature automatically claims primary DNS resolver priority upon tunnel activation. When mobile configuration profiles (.mobileconfig) for encrypted DNS (AdGuard) coexist without explicit priority binding, standard web traffic is routed into the VPN tunnel resolver rather than the local LAN sinkhole.</p><p><strong>Permanent Prevention:</strong> Configured split-DNS routing in Tailscale admin console and set explicit order 50000 on the local macOS AdGuard configuration profile.</p>'
		},
		code10_desync: {
			id: 'code10_desync',
			title: 'Qualcomm Baseband Serial Desync (Code 10)',
			host: 'Owner@WINDOWS10-DESKTOP:C:\\Users\\Owner',
			prompt: 'PS C:\\Users\\Owner> ',
			brief: '<p><strong>Incident Summary:</strong> During non-volatile RAM diagnostics on an LG Accolade (VX5600) via <code>WriteProgram(1.0.0.4)</code>, serial port COM2 became unresponsive mid-write. Device Manager flags the USB controller with a yellow exclamation point: <em>Code 10: This device cannot start</em>.</p><p><strong>Target Architecture:</strong> Windows 10 host communicating via virtualized USB-to-UART COM port with Qualcomm AMSS baseband.</p>',
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
				'Cycle-ComPort-DeviceManager': '[SUCCESS] Executed PnP disable descriptor -> wait 2000ms -> PnP re-enable! Windows reloaded usbser.sys. COM2 is online. WriteProgram confirms: "COM2 Reading OK! Firmware VX560V04. PASS".'
			},
			solutionCmd: 'Cycle-ComPort-DeviceManager',
			postmortem: '<p><strong>Root Cause:</strong> Legacy CDMA Qualcomm diagnostic handlers drop USB DTR/RTS lines during firmware block writes, leaving Windows virtual serial drivers in a wedged Code 10 state. A full machine reboot is destructive to in-flight cellular NV-items.</p><p><strong>Permanent Prevention:</strong> Programmatically cycling the PnP hardware ID re-enumerates the USB interface without dropping host system state or bricking the handset.</p>'
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
				'dmesg | tail -n 25': '[ 8412.104] usb 2-1: reset SuperSpeed Gen 1 USB device number 3 using xhci_hcd\n[ 8412.340] sd 2:0:0:0: [sdc] Synchronizing SCSI cache\n[ 8412.450] sd 3:0:0:0: [sdd] 1953525168 512-byte logical blocks\n[ 8412.451] sd 3:0:0:0: [sdd] Attached SCSI disk\n\n[!] ROOT CAUSE IDENTIFIED: Sabrent USB controller experienced momentary power blip. Kernel detached /dev/sdc and re-enumerated the identical physical disk as /dev/sdd!',
				'lsblk -f': 'NAME   FSTYPE LABEL    UUID                                 MOUNTPOINT\nsda                                                         \n├─sda1 vfat   BOOT     1E2D-3F4A                            /boot\n└─sda2 ext4   ALPINE   a9c1e024-5d98-4b9e-b14a-73d9e84b9e02 /\nsdd                                                         \n└─sdd1 ext4   ONEFIVE  8f3c7b20-410a-4933-91b7-a3f5c9e2d140 \n\nNotice: /dev/sdd1 has UUID="8f3c7b20-410a-4933-91b7-a3f5c9e2d140" but fstab is looking for hardcoded /dev/sdc1!',
				'mount /dev/sdc1 /media/onefive': 'mount: /media/onefive: special device /dev/sdc1 does not exist.\n[FAIL] Fragile device path failed. Drive is currently sdd1.',
				'fix-fstab-uuid': '[SUCCESS] Replaced fragile "/dev/sdc1" in /etc/fstab with "UUID=8f3c7b20-410a-4933-91b7-a3f5c9e2d140". Executed mount -a. /media/onefive is mounted and slideshow-party service recovered immediately!'
			},
			solutionCmd: 'fix-fstab-uuid',
			postmortem: '<p><strong>Root Cause:</strong> USB 3.0 SATA bridge controllers can drop and re-attach under minor voltage fluctuations. Linux kernel dynamically assigns the next available SCSI letter (/dev/sdd instead of /dev/sdc), causing static device name mounts to shatter.</p><p><strong>Permanent Prevention:</strong> Always mount drives via immutable UUID or LABEL parameters in /etc/fstab rather than ephemeral /dev/sdX declarations.</p>'
		},
		thermal_runaway: {
			id: 'thermal_runaway',
			title: '100°C Thermal Runaway on Diffusion Batch Run',
			host: 'avanek@debian-mac:~',
			prompt: 'avanek@debian-mac:~$ ',
			brief: '<p><strong>Incident Summary:</strong> Mid-2011 MacBook Pro Debian node locked up during a 500-image batch render. CPU fan is howling at maximum 6,200 RPM, core temperature pegged at 99&deg;C, and thermal throttling dropped frequency to 800 MHz.</p><p><strong>Target Architecture:</strong> Headless 2011 Apple aluminum unibody compute node with Intel Core i5 Sandy Bridge.</p>',
			actions: [
				{ cmd: 'sensors', label: 'Query Core Temperature & Fan Tachometers', type: 'diag' },
				{ cmd: 'cpufreq-info', label: 'Check CPU Governor & Frequency Throttling', type: 'diag' },
				{ cmd: 'echo 1 > /sys/devices/system/cpu/intel_pstate/no_turbo', label: 'Disable Intel Turbo Boost (Software Band-Aid)', type: 'fix_partial' },
				{ cmd: 'apply-ptm7950-repaste', label: 'Deploy Honeywell PTM7950 Phase-Change Pad', type: 'fix_correct' }
			],
			responses: {
				'sensors': 'coretemp-isa-0000\nAdapter: ISA adapter\nPackage id 0:  +99.0°C  (high = +86.0°C, crit = +100.0°C)\nCore 0:        +99.0°C  (high = +86.0°C, crit = +100.0°C)\nCore 1:        +97.0°C  (high = +86.0°C, crit = +100.0°C)\napplesmc-isa-0300\nFan 1:         6198 RPM (min = 2000, max = 6200)\n\n[!] CRITICAL: Core temperature is 1.0°C from emergency PROCHOT shutdown!',
				'cpufreq-info': 'current policy: frequency should be within 800 MHz and 2.30 GHz.\nThe governor "powersave" may decide which speed to use.\ncurrent CPU frequency is 800 MHz (asserted by thermal throttle limit).',
				'echo 1 > /sys/devices/system/cpu/intel_pstate/no_turbo': '[WARN] Turbo Boost disabled. Temperature lowered slightly to 88°C, but generation throughput cratered by 45%. Does not solve dried thermal paste pump-out.',
				'apply-ptm7950-repaste': '[SUCCESS] Removed crusty, dried factory silicone paste. Applied Honeywell PTM7950 phase-change polymer pad. Under full 100% compute load, temperatures stabilized at a cool 72°C with CPU locked at full 2.30 GHz! Thermal throttling eliminated.'
			},
			solutionCmd: 'apply-ptm7950-repaste',
			postmortem: '<p><strong>Root Cause:</strong> Legacy silicone pastes suffer pump-out and dry-out under repeated thermal cycles of 24/7 continuous CPU inference workloads, creating micro air gaps between the silicon die and copper heatpipe.</p><p><strong>Permanent Prevention:</strong> Honeywell PTM7950 phase-change material melts at 45°C to form an ultra-thin liquid contact layer, then resolidifies when cool—preventing pump-out indefinitely.</p>'
		},
		monero_filter: {
			id: 'monero_filter',
			title: 'Cryptojacking False-Positive: Stratum Pool Down',
			host: 'root@alpinestorage:~# ',
			prompt: 'alpinestorage:~# ',
			brief: '<p><strong>Incident Summary:</strong> The Lenovo Yoga bare-board rig and Samsung S4 Mini miners suddenly stopped reporting shares. Mining client outputs: <code>Socket error: connection timed out to pool.moneroocean.stream:10128</code>.</p><p><strong>Target Architecture:</strong> Centralized AdGuard Home DNS sinkhole protecting local home network.</p>',
			actions: [
				{ cmd: 'grep -i "monero" /opt/AdGuardHome/data/querylog.json', label: 'Search AdGuard Query Log for Denied Requests', type: 'diag' },
				{ cmd: 'curl -v telnet://pool.moneroocean.stream:10128', label: 'Test TCP Handshake to Stratum Pool', type: 'diag' },
				{ cmd: 'iptables -F', label: 'Flush All Firewall Rules (Dangerous)', type: 'fix_bad' },
				{ cmd: 'adguard-unblock-moneroocean', label: 'Add Domain Exception to AdGuard Custom Rules', type: 'fix_correct' }
			],
			responses: {
				'grep -i "monero" /opt/AdGuardHome/data/querylog.json': '{\n  "QH": "pool.moneroocean.stream",\n  "QT": "A",\n  "Result": {\n    "Reason": "FilteredBlockList",\n    "Rule": "||moneroocean.stream^",\n    "FilterListId": 14\n  }\n}\n\n[!] ROOT CAUSE IDENTIFIED: AdGuard updated upstream "NoCoin / Anti-Mining" filter list #14, blacklisting Andrew\'s deliberate homelab mining pool as a malware cryptojacker!',
				'curl -v telnet://pool.moneroocean.stream:10128': '* Could not resolve host: pool.moneroocean.stream\n* Closing connection 0\n[!] DNS lookup returns 0.0.0.0 sinkhole response.',
				'iptables -F': '[FAIL] Flushed firewall tables, but filter was occurring at the application DNS layer. LAN security compromised without solving the blackhole!',
				'adguard-unblock-moneroocean': '[SUCCESS] Added "@@||moneroocean.stream^$important" to AdGuard custom filtering rules. Re-queried pool: returns 172.67.182.204. Miners reconnected and hashing resumed!'
			},
			solutionCmd: 'adguard-unblock-moneroocean',
			postmortem: '<p><strong>Root Cause:</strong> Automated threat intelligence blocklists frequently group intentional volunteer mining alongside unauthorized in-browser cryptojacking malware.</p><p><strong>Permanent Prevention:</strong> Maintain an explicit whitelist exemption rule in AdGuard Home for authorized homelab compute pools.</p>'
		}
	};

	var currentScenarioKey = 'dns_blackhole';
	var currentScenario = scenarios[currentScenarioKey];
	var sla = 100;
	var isSolved = false;

	// Command history state
	var cmdHistory = [];
	var cmdHistoryIndex = -1;

	// DOM Elements
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

	var termWindowEl = document.getElementById('terminal-window');
	var termScreenEl = document.getElementById('terminal-screen');
	var termHostEl = document.getElementById('terminal-host');
	var termPromptEl = document.getElementById('terminal-prompt');
	var termHistoryLogEl = document.getElementById('terminal-history-log');
	var termInputEl = document.getElementById('terminal-input');
	var termClearEl = document.getElementById('terminal-clear');

	function appendOutput(text, className) {
		var div = document.createElement('div');
		div.className = 'term-output-block ' + (className || '');
		div.textContent = text;
		termHistoryLogEl.appendChild(div);
		scrollTerminalToBottom();
	}

	function appendCommandEntry(cmdText) {
		var entry = document.createElement('div');
		entry.className = 'term-entry';

		var promptSpan = document.createElement('span');
		promptSpan.className = 'term-prompt';
		promptSpan.textContent = currentScenario.prompt;

		var cmdSpan = document.createElement('span');
		cmdSpan.className = 'term-cmd-text';
		cmdSpan.textContent = cmdText;

		entry.appendChild(promptSpan);
		entry.appendChild(cmdSpan);
		termHistoryLogEl.appendChild(entry);
		scrollTerminalToBottom();
	}

	function scrollTerminalToBottom() {
		termScreenEl.scrollTop = termScreenEl.scrollHeight;
	}

	function loadScenario(key) {
		currentScenarioKey = key;
		currentScenario = scenarios[key];
		sla = 100;
		isSolved = false;
		cmdHistory = [];
		cmdHistoryIndex = -1;

		updateSlaDisplay();
		hudStatusEl.className = 'hud-status-badge';
		hudStatusEl.textContent = 'ACTIVE INCIDENT';

		briefTitleEl.textContent = currentScenario.title;
		briefBodyEl.innerHTML = currentScenario.brief;

		termHostEl.textContent = currentScenario.host;
		termPromptEl.textContent = currentScenario.prompt;

		termHistoryLogEl.innerHTML = '';
		appendOutput('*** INCIDENT COMMAND INITIALIZED: ' + currentScenario.title.toUpperCase() + ' ***', 'term-warn');
		appendOutput('Type "help" for a list of commands, or select a suggested diagnostic action.', 'term-dim');
		appendOutput('', '');

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

		termInputEl.value = '';
		termInputEl.focus();
	}

	function updateSlaDisplay() {
		sla = Math.max(0, sla);
		slaFillEl.style.width = sla + '%';
		slaTextEl.textContent = sla + '% Health';
		if (sla > 65) {
			slaFillEl.style.backgroundColor = '#3fb950';
		} else if (sla > 35) {
			slaFillEl.style.backgroundColor = '#d29922';
		} else {
			slaFillEl.style.backgroundColor = '#f85149';
		}

		if (sla <= 0 && !isSolved) {
			hudStatusEl.textContent = 'SLA BREACHED';
			hudStatusEl.className = 'hud-status-badge';
			appendOutput('\n[FATAL] SLA DEGRADED TO 0%. Incident escalated to engineering management.', 'term-err');
		}
	}

	function executeCommand(rawCmd) {
		var cmd = rawCmd.trim();
		if (!cmd) return;

		// Add to history
		if (cmdHistory[cmdHistory.length - 1] !== cmd) {
			cmdHistory.push(cmd);
		}
		cmdHistoryIndex = cmdHistory.length;

		// Print command entry to terminal history log
		appendCommandEntry(cmd);

		var lower = cmd.toLowerCase();

		if (lower === 'help') {
			appendOutput('\nAvailable System Commands:\n  help        - Show this reference manual\n  clear       - Wipe terminal scrollback\n  history     - Display command history for this session\n  status      - Display current SLA and incident state\n  lsblk       - View block storage topology\n  dmesg       - Dump kernel ring buffer\n  sensors     - Read hardware temperature monitors\n  dig <host>  - Execute DNS lookup\n  tailscale   - Query Tailscale mesh status\n', 'term-dim');
			return;
		}

		if (lower === 'clear') {
			termHistoryLogEl.innerHTML = '';
			return;
		}

		if (lower === 'history') {
			var histText = '\nCommand History:\n';
			cmdHistory.forEach(function (c, idx) {
				histText += '  ' + (idx + 1) + '  ' + c + '\n';
			});
			appendOutput(histText, 'term-dim');
			return;
		}

		if (lower === 'status') {
			appendOutput('SLA Health: ' + sla + '% | Incident: ' + currentScenario.title + ' | State: ' + (isSolved ? 'RESOLVED' : 'UNRESOLVED'), 'term-dim');
			return;
		}

		if (currentScenario.responses[cmd]) {
			var resp = currentScenario.responses[cmd];
			appendOutput(resp, '');

			if (cmd === currentScenario.solutionCmd) {
				isSolved = true;
				hudStatusEl.className = 'hud-status-badge ok';
				hudStatusEl.textContent = 'RESOLVED';
				appendOutput('\n>>> INCIDENT SUCCESSFULLY REMEDIATED! Final SLA: ' + sla + '% <<<', 'term-succ');
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
			appendOutput('bash: ' + cmd + ': command not found or invalid diagnostic query. (-5% SLA penalty)', 'term-err');
		}
	}

	// Keydown listener for Enter and Arrow navigation
	termInputEl.addEventListener('keydown', function (e) {
		if (e.key === 'Enter') {
			e.preventDefault();
			var val = termInputEl.value;
			termInputEl.value = '';
			executeCommand(val);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			if (cmdHistory.length > 0) {
				if (cmdHistoryIndex > 0) {
					cmdHistoryIndex--;
				}
				termInputEl.value = cmdHistory[cmdHistoryIndex] || '';
			}
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			if (cmdHistory.length > 0) {
				if (cmdHistoryIndex < cmdHistory.length - 1) {
					cmdHistoryIndex++;
					termInputEl.value = cmdHistory[cmdHistoryIndex] || '';
				} else {
					cmdHistoryIndex = cmdHistory.length;
					termInputEl.value = '';
				}
			}
		}
	});

	// Focus input when clicking anywhere on the terminal window
	termWindowEl.addEventListener('click', function () {
		termInputEl.focus();
	});

	termClearEl.addEventListener('click', function (e) {
		e.stopPropagation();
		termHistoryLogEl.innerHTML = '';
		termInputEl.focus();
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
