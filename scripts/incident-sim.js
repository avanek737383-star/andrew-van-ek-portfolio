/* Homelab Incident Response & Chaos Simulator - Educational Edition */

(function () {
	'use strict';

	var scenarios = {
		dns_blackhole: {
			id: 'dns_blackhole',
			title: 'Websites will not load on my M1 MacBook Air',
			host: 'avanek@macbook-air-m1:~',
			prompt: 'avanek@macbook-air-m1:~$',
			brief: '<p><strong>Incident Summary:</strong> Browsing suddenly failed across your M1 MacBook Air (<code>DNS_PROBE_FINISHED_BAD_CONFIG</code>). Tailscale mesh peers are reachable by IP, but standard website URLs return <code>SERVFAIL</code>.</p><p><strong>Target Setup:</strong> M1 MacBook Air running an encrypted AdGuard DNS profile alongside an active Tailscale WireGuard client.</p>',
			actions: [
				{
					cmd: 'scutil --dns',
					label: 'scutil --dns',
					desc: 'Inspect macOS DNS resolver priority order',
					type: 'diag'
				},
				{
					cmd: 'dig @192.168.0.201 google.com +short',
					label: 'dig @192.168.0.201 google.com',
					desc: 'Test if your local AdGuard Home router is responding',
					type: 'diag'
				},
				{
					cmd: 'tailscale status',
					label: 'tailscale status',
					desc: 'Check if the Tailscale VPN mesh interface is online',
					type: 'diag'
				},
				{
					cmd: 'sudo networksetup -setdnsservers Wi-Fi 192.168.0.201',
					label: 'networksetup -setdnsservers Wi-Fi',
					desc: 'Hardcode Wi-Fi DNS (Band-aid: does not fix profile priority)',
					type: 'fix_partial'
				},
				{
					cmd: 'reorder-dns-priority',
					label: 'reorder-dns-priority',
					desc: 'Simulated settings workflow: adjust the competing DNS configurations',
					type: 'fix_correct'
				}
			],
			responses: {
				'scutil --dns': {
					output: 'Resolver configuration\nresolver #1\n  search domain[0] : taile72a68.ts.net\n  nameserver[0] : 100.100.100.100\n  flags    : Scoped, Request A records\n  order    : 100400 (PRIMARY)\n\nresolver #2\n  nameserver[0] : https://doh.adguard.com/dns-query\n  flags    : Supplemental (Encrypted)\n  order    : 200000',
					explanation: '💡 WHAT THIS COMMAND DID & WHAT IT FOUND:\n`scutil --dns` asks macOS to display its internal DNS resolver hierarchy. Notice resolver #1 has order 100400 (Tailscale MagicDNS), while your AdGuard profile is stuck at order 200000. Because lower order numbers win, Tailscale hijacked all your web lookups instead of letting your local AdGuard Home resolve them!'
				},
				'dig @192.168.0.201 google.com +short': {
					output: '142.250.190.46\n142.250.190.78',
					explanation: '💡 WHAT THIS COMMAND DID & WHAT IT FOUND:\n`dig` queried your local router (192.168.0.201) directly on port 53. It returned IP addresses in 12ms! This proves your AdGuard Home server is 100% HEALTHY and working fine. The bug is inside your Mac\'s internal priority list, not your home server.'
				},
				'tailscale status': {
					output: '100.87.81.52   nucwol2-0--hdd  avanek@  linux   active; direct 192.168.0.202:41641\n100.101.40.12  macbook-air-m1  avanek@  macOS   active; self',
					explanation: '💡 WHAT THIS COMMAND DID & WHAT IT FOUND:\n`tailscale status` checked the WireGuard mesh tunnel. It shows the NUC and M1 MacBook Air are happily connected. The VPN tunnel itself is healthy; it just grabbed DNS priority without asking.'
				},
				'sudo networksetup -setdnsservers Wi-Fi 192.168.0.201': {
					output: '[WARN] Wi-Fi DNS adjusted to 192.168.0.201, but scutil reveals macOS configuration profiles override standard Wi-Fi network settings. Symptom persists.',
					explanation: '💡 WHY THIS DIDN\'T WORK:\nOn macOS, installed security profiles (.mobileconfig) and VPN extensions override whatever you manually type into the Wi-Fi settings box. You have to fix the profile priority itself!'
				},
				'reorder-dns-priority': {
					output: '[SUCCESS] Re-ordered resolver hierarchy! Profile AdGuard encrypted DoH promoted to order 50000. Resolving google.com via AdGuard: 142.250.190.78. LAN browsing restored.',
					explanation: '🏆 WHY THIS FIXED THE INCIDENT:\nBy assigning order 50000 to the AdGuard profile, it now evaluates BEFORE Tailscale\'s 100400. Everyday web lookups go straight to your local ad-blocking DNS, while private *.ts.net queries still route through Tailscale. Problem solved!'
				}
			},
			solutionCmd: 'reorder-dns-priority',
			postmortem: '<p><strong>Root Cause:</strong> Tailscale\'s MagicDNS feature automatically claims primary DNS resolver priority upon tunnel activation. When mobile configuration profiles (.mobileconfig) for encrypted DNS (AdGuard) coexist without explicit priority binding, standard web traffic is routed into the VPN tunnel resolver rather than the local LAN sinkhole.</p><p><strong>Permanent Prevention:</strong> Configured split-DNS routing in Tailscale admin console and set explicit order 50000 on the local macOS AdGuard configuration profile.</p>'
		},
		code10_desync: {
			id: 'code10_desync',
			title: 'A phone USB connection stopped working',
			host: 'Owner@WINDOWS10-DESKTOP:C:\\Users\\Owner',
			prompt: 'PS C:\\Users\\Owner> ',
			brief: '<p><strong>Incident Summary:</strong> During non-volatile RAM diagnostics on an LG Accolade (VX5600) via <code>WriteProgram</code>, serial port COM2 became unresponsive mid-write. Device Manager flags the USB controller with a yellow exclamation point: <em>Code 10: This device cannot start</em>.</p><p><strong>Target Architecture:</strong> Windows 10 host communicating via virtualized USB-to-UART COM port with Qualcomm AMSS baseband.</p>',
			actions: [
				{
					cmd: 'Get-PnpDevice -FriendlyName "*USB*" | Select FriendlyName, Status',
					label: 'Get-PnpDevice (Device Manager Audit)',
					desc: 'Check which USB device driver crashed in Windows',
					type: 'diag'
				},
				{
					cmd: 'python test_com2.py',
					label: 'python test_com2.py',
					desc: 'Try opening COM2 port directly in Python',
					type: 'diag'
				},
				{
					cmd: 'Restart-Computer -Force',
					label: 'Restart-Computer -Force',
					desc: 'Reboot Windows (Nuclear option: risks corrupting phone NV-items!)',
					type: 'fix_bad'
				},
				{
					cmd: 'Cycle-ComPort-DeviceManager',
					label: 'Cycle-ComPort-DeviceManager',
					desc: 'Simulated Device Manager workflow: disable and re-enable COM2',
					type: 'fix_correct'
				}
			],
			responses: {
				'Get-PnpDevice -FriendlyName "*USB*" | Select FriendlyName, Status': {
					output: 'FriendlyName                               Status\n------------                               ------\nSAMSUNG Mobile USB Composite Device        OK\nLGE CDMA USB Serial Port (COM2)            Error (Code 10)\nIntel(R) USB 3.0 eXtensible Host Controller OK',
					explanation: '💡 WHAT THIS COMMAND DID & WHAT IT FOUND:\n`Get-PnpDevice` is the PowerShell equivalent of opening Windows Device Manager. It confirms that "LGE CDMA USB Serial Port (COM2)" has a yellow exclamation mark (Code 10). The driver crashed into a hung power state after a bad packet.'
				},
				'python test_com2.py': {
					output: 'Traceback (most recent call last):\n  File "test_com2.py", line 4, in <module>\n    ser = serial.Serial("COM2", 115200, timeout=1)\nserial.serialutil.SerialException: could not open port "COM2": PermissionError(13, "Access is denied.", None, 5)',
					explanation: '💡 WHAT THIS COMMAND DID & WHAT IT FOUND:\nPython attempted to open COM2 with PySerial. Windows returned "Access is denied" because a dead zombie thread is still clinging to the old serial handle.'
				},
				'Restart-Computer -Force': {
					output: '[FAIL] Host reboot cleared RAM, but unsaved ESN write buffer was corrupted and phone was left in a hanging diagnostic state. Practice score reduced!',
					explanation: '💡 WHY THIS WAS DANGEROUS:\nRebooting your whole computer while a phone is in diagnostic flash mode interrupts cellular memory writes and can brick the phone\'s firmware. Always try soft-restarting the specific driver first!'
				},
				'Cycle-ComPort-DeviceManager': {
					output: '[SUCCESS] Executed PnP disable descriptor -> wait 2000ms -> PnP re-enable! Windows reloaded usbser.sys. COM2 is online. WriteProgram confirms: "COM2 Reading OK! Firmware VX560V04. PASS".',
					explanation: '🏆 WHY THIS FIXED THE INCIDENT:\nBy right-clicking and Disabling then Re-enabling the device in Device Manager, Windows forcefully kills the zombie thread, resets the virtual COM hardware handle, and reloads `usbser.sys` without restarting your PC or harming the phone!'
				}
			},
			solutionCmd: 'Cycle-ComPort-DeviceManager',
			postmortem: '<p><strong>Root Cause:</strong> Legacy CDMA Qualcomm diagnostic handlers drop USB DTR/RTS lines during firmware block writes, leaving Windows virtual serial drivers in a wedged Code 10 state. A full machine reboot is destructive to in-flight cellular NV-items.</p><p><strong>Permanent Prevention:</strong> Programmatically cycling the PnP hardware ID re-enumerates the USB interface without dropping host system state or bricking the handset.</p>'
		},
		scsi_shift: {
			id: 'scsi_shift',
			title: 'A drive disappeared after reconnecting',
			host: 'avanek@alpinestorage:~',
			prompt: 'alpinestorage:~$ ',
			brief: '<p><strong>Incident Summary:</strong> The intranet gathering slideshow service suddenly dropped with error 500. Logs indicate directory <code>/media/onefive</code> is unreadable. Guests are arriving in 15 minutes.</p><p><strong>Target Architecture:</strong> Alpine Linux Intel NUC gateway with external Sabrent USB 3.0 SATA enclosure.</p>',
			actions: [
				{
					cmd: 'dmesg | tail -n 25',
					label: 'dmesg | tail -n 25',
					desc: 'Inspect Linux kernel buffer for USB or SCSI disconnect events',
					type: 'diag'
				},
				{
					cmd: 'lsblk -f',
					label: 'lsblk -f',
					desc: 'List block storage devices and filesystem UUID numbers',
					type: 'diag'
				},
				{
					cmd: 'mount /dev/sdc1 /media/onefive',
					label: 'mount /dev/sdc1 /media/onefive',
					desc: 'Try mounting /dev/sdc1 again (Fragile: drive name changed!)',
					type: 'fix_bad'
				},
				{
					cmd: 'fix-fstab-uuid',
					label: 'fix-fstab-uuid',
					desc: 'Simulated configuration workflow: use a stable drive identifier',
					type: 'fix_correct'
				}
			],
			responses: {
				'dmesg | tail -n 25': {
					output: '[ 8412.104] usb 2-1: reset SuperSpeed Gen 1 USB device number 3 using xhci_hcd\n[ 8412.340] sd 2:0:0:0: [sdc] Synchronizing SCSI cache\n[ 8412.450] sd 3:0:0:0: [sdd] 1953525168 512-byte logical blocks\n[ 8412.451] sd 3:0:0:0: [sdd] Attached SCSI disk',
					explanation: '💡 WHAT THIS COMMAND DID & WHAT IT FOUND:\n`dmesg` shows the Linux kernel\'s internal message ring. Look at those lines: the Sabrent USB drive had a tiny power hiccup, disconnected for half a second as `sdc`, and reconnected as `sdd`! Linux gave it a new drive letter!'
				},
				'lsblk -f': {
					output: 'NAME   FSTYPE LABEL    UUID                                 MOUNTPOINT\nsda                                                         \n├─sda1 vfat   BOOT     1E2D-3F4A                            /boot\n└─sda2 ext4   ALPINE   a9c1e024-5d98-4b9e-b14a-73d9e84b9e02 /\nsdd                                                         \n└─sdd1 ext4   ONEFIVE  8f3c7b20-410a-4933-91b7-a3f5c9e2d140 ',
					explanation: '💡 WHAT THIS COMMAND DID & WHAT IT FOUND:\n`lsblk -f` lists all hard drives and their permanent cryptographic UUID (Universally Unique Identifier). Notice the partition is now named `sdd1`, but its UUID `8f3c7b20...` NEVER changes!'
				},
				'mount /dev/sdc1 /media/onefive': {
					output: 'mount: /media/onefive: special device /dev/sdc1 does not exist.\n[FAIL] Fragile device path failed. Drive is currently sdd1.',
					explanation: '💡 WHY THIS FAILED:\nBecause the kernel re-labeled the drive from `sdc1` to `sdd1`, typing `/dev/sdc1` fails completely. Drive letters in Linux are temporary and unreliable across reboots!'
				},
				'fix-fstab-uuid': {
					output: '[SUCCESS] Replaced fragile "/dev/sdc1" in /etc/fstab with "UUID=8f3c7b20-410a-4933-91b7-a3f5c9e2d140". Executed mount -a. /media/onefive is mounted and slideshow-party service recovered immediately!',
					explanation: '🏆 WHY THIS FIXED THE INCIDENT:\nBy mounting the drive using `UUID=8f3c7b20...` in `/etc/fstab`, Linux finds the exact same physical hard drive whether it plugs in as sdc, sdd, sde, or sdf. It is now 100% immune to USB drive-letter shifts!'
				}
			},
			solutionCmd: 'fix-fstab-uuid',
			postmortem: '<p><strong>Root Cause:</strong> USB 3.0 SATA bridge controllers can drop and re-attach under minor voltage fluctuations. Linux kernel dynamically assigns the next available SCSI letter (/dev/sdd instead of /dev/sdc), causing static device name mounts to shatter.</p><p><strong>Permanent Prevention:</strong> Always mount drives via immutable UUID or LABEL parameters in /etc/fstab rather than ephemeral /dev/sdX declarations.</p>'
		},
		thermal_runaway: {
			id: 'thermal_runaway',
			title: 'A compute laptop is overheating',
			host: 'avanek@debian-mac:~',
			prompt: 'avanek@debian-mac:~$ ',
			brief: '<p><strong>Incident Summary:</strong> Mid-2011 MacBook Pro Debian node locked up during a 500-image batch render. CPU fan is howling at maximum 6,200 RPM, core temperature pegged at 99&deg;C, and thermal throttling dropped frequency to 800 MHz.</p><p><strong>Target Architecture:</strong> Headless 2011 Apple aluminum unibody compute node with Intel Core i5 Sandy Bridge.</p>',
			actions: [
				{
					cmd: 'sensors',
					label: 'sensors',
					desc: 'Check live CPU temperature sensors & fan RPM speed',
					type: 'diag'
				},
				{
					cmd: 'cpufreq-info',
					label: 'cpufreq-info',
					desc: 'Check CPU clock frequency to see if it is throttling down',
					type: 'diag'
				},
				{
					cmd: 'echo 1 > /sys/devices/system/cpu/intel_pstate/no_turbo',
					label: 'Disable Intel Turbo Boost',
					desc: 'Software patch: drops heat slightly, but slows jobs by 45%',
					type: 'fix_partial'
				},
				{
					cmd: 'apply-ptm7950-repaste',
					label: 'apply-ptm7950-repaste',
					desc: 'Simulated physical repair: replace the CPU thermal interface',
					type: 'fix_correct'
				}
			],
			responses: {
				'sensors': {
					output: 'coretemp-isa-0000\nAdapter: ISA adapter\nPackage id 0:  +99.0°C  (high = +86.0°C, crit = +100.0°C)\nCore 0:        +99.0°C  (high = +86.0°C, crit = +100.0°C)\nCore 1:        +97.0°C  (high = +86.0°C, crit = +100.0°C)\napplesmc-isa-0300\nFan 1:         6198 RPM (min = 2000, max = 6200)',
					explanation: '💡 WHAT THIS COMMAND DID & WHAT IT FOUND:\n`sensors` reads internal hardware temperature probes. The CPU package is at 99.0°C! The critical emergency shutdown temperature is 100°C, meaning the machine was literally 1 degree away from shutting off to protect itself.'
				},
				'cpufreq-info': {
					output: 'current policy: frequency should be within 800 MHz and 2.30 GHz.\nThe governor "powersave" may decide which speed to use.\ncurrent CPU frequency is 800 MHz (asserted by thermal throttle limit).',
					explanation: '💡 WHAT THIS COMMAND DID & WHAT IT FOUND:\n`cpufreq-info` checks the processor\'s clock speed. The chip is capable of 2.30 GHz, but has slammed on the brakes down to 800 MHz to keep from catching fire. Your batch image renders are taking 3x longer than they should.'
				},
				'echo 1 > /sys/devices/system/cpu/intel_pstate/no_turbo': {
					output: '[WARN] Turbo Boost disabled. Temperature lowered slightly to 88°C, but generation throughput cratered by 45%. Does not solve dried thermal paste pump-out.',
					explanation: '💡 WHY THIS IS ONLY A BAND-AID:\nDisabling Turbo Boost stops the processor from sprinting, which cools it down to 88°C, but cripples performance. The physical heatsink paste is still dried up and crusty.'
				},
				'apply-ptm7950-repaste': {
					output: '[SUCCESS] Removed crusty, dried factory silicone paste. Applied Honeywell PTM7950 phase-change polymer pad. Under full 100% compute load, temperatures stabilized at a cool 72°C with CPU locked at full 2.30 GHz! Thermal throttling eliminated.',
					explanation: '🏆 WHY THIS FIXED THE INCIDENT:\nHoneywell PTM7950 melts at 45°C to form an ultra-thin liquid contact layer, then solidifies when cool. Unlike normal thermal pastes that dry out and pump out under 24/7 load, PTM7950 keeps the processor cool indefinitely!'
				}
			},
			solutionCmd: 'apply-ptm7950-repaste',
			postmortem: '<p><strong>Root Cause:</strong> Legacy silicone pastes suffer pump-out and dry-out under repeated thermal cycles of 24/7 continuous CPU inference workloads, creating micro air gaps between the silicon die and copper heatpipe.</p><p><strong>Permanent Prevention:</strong> Honeywell PTM7950 phase-change material melts at 45°C to form an ultra-thin liquid contact layer, then resolidifies when cool—preventing pump-out indefinitely.</p>'
		},
		monero_filter: {
			id: 'monero_filter',
			title: 'A DNS filter blocked the mining pool',
			host: 'root@alpinestorage:~# ',
			prompt: 'alpinestorage:~# ',
			brief: '<p><strong>Incident Summary:</strong> The Lenovo Yoga bare-board rig and Samsung S4 Mini miners suddenly stopped reporting shares. Mining client outputs: <code>Socket error: connection timed out to pool.moneroocean.stream:10128</code>.</p><p><strong>Target Architecture:</strong> Centralized AdGuard Home DNS sinkhole protecting local home network.</p>',
			actions: [
				{
					cmd: 'grep -i "monero" /opt/AdGuardHome/data/querylog.json',
					label: 'Inspect AdGuard Query Log',
					desc: 'Search AdGuard Home logs for blocked domain requests',
					type: 'diag'
				},
				{
					cmd: 'curl -v telnet://pool.moneroocean.stream:10128',
					label: 'Test TCP Connection to Pool',
					desc: 'Check if the external mining pool server is actually reachable',
					type: 'diag'
				},
				{
					cmd: 'iptables -F',
					label: 'iptables -F (Flush Firewall)',
					desc: 'Flush Linux firewall rules (Dangerous & useless for DNS blocks!)',
					type: 'fix_bad'
				},
				{
					cmd: 'adguard-unblock-moneroocean',
					label: 'adguard-unblock-moneroocean',
					desc: 'Simulated settings workflow: add an exception for this pool',
					type: 'fix_correct'
				}
			],
			responses: {
				'grep -i "monero" /opt/AdGuardHome/data/querylog.json': {
					output: '{\n  "QH": "pool.moneroocean.stream",\n  "QT": "A",\n  "Result": {\n    "Reason": "FilteredBlockList",\n    "Rule": "||moneroocean.stream^",\n    "FilterListId": 14\n  }\n}',
					explanation: '💡 WHAT THIS COMMAND DID & WHAT IT FOUND:\n`grep` searched AdGuard Home\'s DNS query log. It caught the culprit red-handed: Filter list #14 (NoCoin anti-malware blocklist) updated in the middle of the night and blacklisted your mining pool as a "cryptojacker"!'
				},
				'curl -v telnet://pool.moneroocean.stream:10128': {
					output: '* Could not resolve host: pool.moneroocean.stream\n* Closing connection 0',
					explanation: '💡 WHAT THIS COMMAND DID & WHAT IT FOUND:\n`curl` tested the connection and returned "Could not resolve host". Because AdGuard returned 0.0.0.0, your computer doesn\'t even know what IP address to talk to.'
				},
				'iptables -F': {
					output: '[FAIL] Flushed firewall tables, but filter was occurring at the application DNS layer. LAN security compromised without solving the blackhole!',
					explanation: '💡 WHY THIS WAS A BAD MOVE:\n`iptables` is your network firewall. Flushing firewall rules leaves your server wide open, but doesn\'t fix DNS filters inside AdGuard Home!'
				},
				'adguard-unblock-moneroocean': {
					output: '[SUCCESS] Added "@@||moneroocean.stream^$important" to AdGuard custom filtering rules. Re-queried pool: returns 172.67.182.204. Miners reconnected and hashing resumed!',
					explanation: '🏆 WHY THIS FIXED THE INCIDENT:\nBy adding an explicit exception rule (`@@||...^$important`), AdGuard ignores the public blocklist for this domain while keeping the rest of your home network protected from malware ads!'
				}
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
	var fixButtonsEl = document.getElementById('fix-buttons');
	var fixStepsEl = document.getElementById('fix-steps');
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
		hudStatusEl.textContent = 'INVESTIGATING';

		briefTitleEl.textContent = currentScenario.title;
		briefBodyEl.innerHTML = currentScenario.brief;

		termHostEl.textContent = currentScenario.host;
		termPromptEl.textContent = currentScenario.prompt;

		termHistoryLogEl.innerHTML = '';
		appendOutput('*** INCIDENT COMMAND INITIALIZED: ' + currentScenario.title.toUpperCase() + ' ***', 'term-warn');
		appendOutput('Start with a check under Investigate. Read its result here, then open the repair steps when you have a theory.\nType help for commands supported by this problem. This is a scripted practice terminal.', 'term-dim');
		appendOutput('', '');

		postmortemCardEl.style.display = 'none';

		// Render action buttons with subtitles
		actionButtonsEl.innerHTML = '';
		fixButtonsEl.innerHTML = '';
		fixStepsEl.open = false;
		currentScenario.actions.forEach(function (act) {
			var btn = document.createElement('button');
			btn.type = 'button';
			btn.className = 'action-btn';
			var workflow = ['reorder-dns-priority', 'Cycle-ComPort-DeviceManager', 'fix-fstab-uuid', 'apply-ptm7950-repaste', 'adguard-unblock-moneroocean'].indexOf(act.cmd) !== -1;
			var badgeText = workflow ? 'SIM STEP' : (act.type === 'diag' ? 'CHECK' : 'TRY');
			
			btn.innerHTML = '<div>' +
				'<code class="btn-cmd-title">' + act.cmd + '</code>' +
				'<div class="btn-cmd-desc">' + act.desc + '</div>' +
				'</div>' +
				'<span class="btn-badge">' + badgeText + '</span>';

			btn.addEventListener('click', function () {
				executeCommand(act.cmd);
			});
			(act.type === 'diag' ? actionButtonsEl : fixButtonsEl).appendChild(btn);
		});

		termInputEl.value = '';
		termInputEl.focus();
	}

	function updateSlaDisplay() {
		sla = Math.max(0, sla);
		slaFillEl.style.width = sla + '%';
		slaTextEl.textContent = sla + ' / 100 points';
		if (sla > 65) {
			slaFillEl.style.backgroundColor = '#3fb950';
		} else if (sla > 35) {
			slaFillEl.style.backgroundColor = '#d29922';
		} else {
			slaFillEl.style.backgroundColor = '#f85149';
		}

		if (sla <= 0 && !isSolved) {
			hudStatusEl.textContent = 'KEEP PRACTICING';
			hudStatusEl.className = 'hud-status-badge';
			appendOutput('\nYour practice score reached zero. You can still investigate and finish, or restart for a fresh attempt.', 'term-warn');
		}
	}

	function executeCommand(rawCmd) {
		var cmd = rawCmd.trim().replace(/\s+/g, ' ');
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
            var reference = 'This is a scripted simulator, not a full shell.\n\nAlways available:\n  help     Show commands for this problem\n  clear    Clear terminal output\n  history  Show your typed and clicked commands\n  status   Show practice score and progress\n\nChecks for this problem:\n';
            currentScenario.actions.forEach(function (act) { if (act.type === 'diag') reference += '  ' + act.cmd + '\n    ' + act.desc + '\n'; });
            reference += '\nRepair attempts for this problem:\n';
            currentScenario.actions.forEach(function (act) { if (act.type !== 'diag') reference += '  ' + act.cmd + '\n'; });
            reference += '\nSIM STEP buttons represent a settings workflow or physical repair. Their names are simulator shortcuts, not installed shell commands.\nUnsupported commands do not cost points. Risky repair attempts cost 25 points.';
            appendOutput(reference, 'term-dim');
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
			appendOutput('Practice score: ' + sla + '/100 | Incident: ' + currentScenario.title + ' | State: ' + (isSolved ? 'RESOLVED' : 'UNRESOLVED'), 'term-dim');
			return;
		}

		if (isSolved && currentScenario.actions.some(function (a) { return a.cmd === cmd; })) {
			appendOutput('This practice incident is already resolved. Restart it to explore the original failure again.', 'term-succ');
			return;
		}

		if (currentScenario.responses[cmd]) {
			var item = currentScenario.responses[cmd];
			var respText = typeof item === 'string' ? item : item.output;
			var explanation = typeof item === 'object' && item.explanation ? item.explanation : '';

			appendOutput(respText, '');

			if (explanation) {
				appendOutput('\n' + explanation, 'term-explanation');
			}

			if (cmd === currentScenario.solutionCmd && !isSolved) {
				isSolved = true;
				hudStatusEl.className = 'hud-status-badge ok';
				hudStatusEl.textContent = 'RESOLVED';
				appendOutput('\n>>> PROBLEM SOLVED! Practice score: ' + sla + '/100 <<<' , 'term-succ');
				postmortemCardEl.style.display = 'block';
				postmortemContentEl.innerHTML = currentScenario.postmortem;
			} else {
				var act = currentScenario.actions.find(function (a) { return a.cmd === cmd; });
				if (act && act.type === 'fix_bad' && !isSolved) {
					sla -= 25;
					updateSlaDisplay();
				}
			}
		} else {
			// Unknown command
			appendOutput('This simulator has no scripted response for: ' + cmd + '\nType help for the exact commands supported by this problem, or choose a check. No points lost.', 'term-warn');
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
