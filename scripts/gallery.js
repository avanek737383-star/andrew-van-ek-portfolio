/**
 * Visual Gallery & Homelab Showcase Script
 * Author: Andrew Van Ek (with Google DeepMind Antigravity AI pair programming)
 *
 * Features:
 * - 51 Workbench Captures across 5 Curated Categories
 * - Desktop/Tablet Filter Pill Bar
 * - Dedicated Mobile Category Selection Modal Overlay (Tap -> Select -> Auto-Dismiss)
 * - Fullscreen Interactive Lightbox Modal with Deep Linking (#id)
 * - Desktop Floating Zoom Toolbar (Slider, +/- Buttons, Mouse Wheel Zoom, Pan/Drag)
 * - Mobile Touch Gestures (2-Finger Pinch-to-Zoom, 1-Finger Pan when Zoomed, Double-Tap)
 * - Integrated Tech Term Analogy Tooltips
 */

(function () {
    "use strict";

    var galleryItems = [
        // Hardware repair photographs and documentation: Andrew Van Ek, Microsoft Copilot, and OpenAI Codex.
        {
            id: "repair-01-cooling-assembly",
            title: "HP: locating the CPU cooling assembly",
            category: "hardware",
            categoryLabel: "HP Cooling Maintenance",
            badgeClass: "badge-info",
            image: "images/gallery/repairs/01-cooling-assembly.jpg",
            thumb: "images/gallery/repairs/01-cooling-assembly-thumb.jpg",
            tags: ["HP laptop", "Hardware Repair", "Copilot", "Completed"],
            summary: "I was preparing to replace the CPU thermal interface and needed to understand which cooling components had to come off.",
            sandboxObservation: "The open HP shows its fan, copper heat pipe, and CPU contact plate still installed.",
            technicalBreakdown: "The CPU contact surface sits beneath the heatsink plate. Identifying the fan, heat pipe, mounting screws, and wiring made the disassembly easier to understand before removing the assembly.",
            defensePlaybook: ["I was preparing to replace the CPU thermal interface and needed to understand which cooling components had to come off."],
            containment: "This records the starting point. Later photos show the heatsink removed; this image does not document a completed repair. Follow-up from Andrew on November 5: the HP repair is complete and temperatures look good; no numerical readings were supplied. On this HP, Andrew found that the battery needed to be connected for it to boot.",
            credit: "Hardware work and original photography by Andrew Van Ek. Repair discussion with Microsoft Copilot. Photo selection, captions, gallery integration, and project documentation by OpenAI Codex, reviewed against the chat and Andrew’s follow-up."
        },
        {
            id: "repair-02-exposed-cpu-old-paste",
            title: "HP: exposing the old thermal compound",
            category: "hardware",
            categoryLabel: "HP Cooling Maintenance",
            badgeClass: "badge-info",
            image: "images/gallery/repairs/02-exposed-cpu-old-paste.jpg",
            thumb: "images/gallery/repairs/02-exposed-cpu-old-paste-thumb.jpg",
            tags: ["HP laptop", "Hardware Repair", "Copilot", "Completed"],
            summary: "I needed to inspect the existing thermal interface and prepare the CPU for replacement material.",
            sandboxObservation: "With the heatsink removed, old thermal compound is visible across the CPU die on the blue motherboard.",
            technicalBreakdown: "Removing the heatsink exposed the actual contact area. The small CPU die and the larger surrounding package are different surfaces, which matters when sizing the replacement thermal material.",
            defensePlaybook: ["I needed to inspect the existing thermal interface and prepare the CPU for replacement material."],
            containment: "The chat identified the compound as looking dry and uneven. Its appearance alone does not establish the cause of a thermal problem. Follow-up from Andrew on November 5: the HP repair is complete and temperatures look good; no numerical readings were supplied. On this HP, Andrew found that the battery needed to be connected for it to boot.",
            credit: "Hardware work and original photography by Andrew Van Ek. Repair discussion with Microsoft Copilot. Photo selection, captions, gallery integration, and project documentation by OpenAI Codex, reviewed against the chat and Andrew’s follow-up."
        },
        {
            id: "repair-03-dust-blocked-heatsink-fins",
            title: "HP: discovering blocked heatsink fins",
            category: "hardware",
            categoryLabel: "HP Cooling Maintenance",
            badgeClass: "badge-info",
            image: "images/gallery/repairs/03-dust-blocked-heatsink-fins.jpg",
            thumb: "images/gallery/repairs/03-dust-blocked-heatsink-fins-thumb.jpg",
            tags: ["HP laptop", "Hardware Repair", "Copilot", "Completed"],
            summary: "A job that began as thermal-interface replacement also uncovered a substantial obstruction in the cooling airflow path.",
            sandboxObservation: "The removed copper heatsink is held above the laptop, revealing a dense mat of dust and lint caught along the radiator fins.",
            technicalBreakdown: "Cooling depends on air moving through the fin stack as well as heat reaching it from the CPU. Inspecting the removed heatsink revealed a problem that replacing thermal material alone would leave behind.",
            defensePlaybook: ["A job that began as thermal-interface replacement also uncovered a substantial obstruction in the cooling airflow path."],
            containment: "The obstruction is visible. The chat proposed cleaning the fins, but no post-cleaning temperature measurements or performance results were supplied. Follow-up from Andrew on November 5: the HP repair is complete and temperatures look good; no numerical readings were supplied. On this HP, Andrew found that the battery needed to be connected for it to boot.",
            credit: "Hardware work and original photography by Andrew Van Ek. Repair discussion with Microsoft Copilot. Photo selection, captions, gallery integration, and project documentation by OpenAI Codex, reviewed against the chat and Andrew’s follow-up."
        },
        {
            id: "repair-04-ptm7950-sizing",
            title: "HP: understanding PTM7950 placement",
            category: "hardware",
            categoryLabel: "HP Cooling Maintenance",
            badgeClass: "badge-info",
            image: "images/gallery/repairs/04-ptm7950-sizing.jpg",
            thumb: "images/gallery/repairs/04-ptm7950-sizing-thumb.jpg",
            tags: ["HP laptop", "Hardware Repair", "Copilot", "Completed"],
            summary: "I asked whether to install the entire sheet or cut it to fit the CPU.",
            sandboxObservation: "A packaged sheet of PTM7950 is held beside the exposed HP CPU, which still has old compound on its die.",
            technicalBreakdown: "The discussion distinguished the CPU die from its larger package and explained that the phase-change sheet needs to be sized for the contact area. It also covered the protective liners and using a single layer rather than combining it with paste.",
            defensePlaybook: ["I asked whether to install the entire sheet or cut it to fit the CPU."],
            containment: "This photo documents planning and sizing. It does not show the CPU cleaned, the material installed, or the machine tested afterward. Follow-up from Andrew on November 5: the HP repair is complete and temperatures look good; no numerical readings were supplied. On this HP, Andrew found that the battery needed to be connected for it to boot.",
            credit: "Hardware work and original photography by Andrew Van Ek. Repair discussion with Microsoft Copilot. Photo selection, captions, gallery integration, and project documentation by OpenAI Codex, reviewed against the chat and Andrew’s follow-up."
        },
        {
            id: "repair-05-stripped-battery-screw",
            title: "MacBook Pro: dealing with a stripped battery screw",
            category: "hardware",
            categoryLabel: "2011 MacBook Pro Battery Work",
            badgeClass: "badge-warning",
            image: "images/gallery/repairs/05-stripped-battery-screw.jpg",
            thumb: "images/gallery/repairs/05-stripped-battery-screw-thumb.jpg",
            tags: ["2011 MacBook Pro", "Hardware Repair", "Copilot", "In Progress"],
            summary: "I wanted to remove the battery, but a stripped mounting screw was preventing progress.",
            sandboxObservation: "A close-up shows the battery mounting area beside the MacBook logic board, including a damaged screw head and the battery wiring.",
            technicalBreakdown: "The conversation clarified that the troublesome fastener belonged to the battery mounting tab even though it was close to the logic board. The useful lesson was to identify what a screw secures and recognize when a driver is slipping instead of repeatedly worsening the head.",
            defensePlaybook: ["I wanted to remove the battery, but a stripped mounting screw was preventing progress."],
            containment: "The chat discussed several extraction approaches. This photo records the obstacle; it does not establish which technique ultimately removed the screw. Overall project status: in progress as of November 5, 2026.",
            credit: "Hardware work and original photography by Andrew Van Ek. Repair discussion with Microsoft Copilot. Photo selection, captions, gallery integration, and project documentation by OpenAI Codex, reviewed against the chat and Andrew’s follow-up."
        },
        {
            id: "repair-06-macbook-battery-clearance",
            title: "MacBook Pro: checking what still held the battery",
            category: "hardware",
            categoryLabel: "2011 MacBook Pro Battery Work",
            badgeClass: "badge-warning",
            image: "images/gallery/repairs/06-macbook-battery-clearance.jpg",
            thumb: "images/gallery/repairs/06-macbook-battery-clearance-thumb.jpg",
            tags: ["2011 MacBook Pro", "Hardware Repair", "Copilot", "In Progress"],
            summary: "After reporting that the screw was out, I was checking why the battery still would not come free and whether more disassembly was needed.",
            sandboxObservation: "A low-angle close-up shows the battery cable and connector area near the edge of the logic board and aluminum chassis.",
            technicalBreakdown: "A freed mounting screw does not prove that the battery is electrically disconnected. Later messages corrected Copilot’s initial assumption about the connector, showing why a physical connection must be checked directly.",
            defensePlaybook: ["After reporting that the screw was out, I was checking why the battery still would not come free and whether more disassembly was needed."],
            containment: "The chat speculated about the battery catching under the logic board. That explanation and the suggested need to loosen the board were not verified in the conversation. Overall project status: in progress as of November 5, 2026.",
            credit: "Hardware work and original photography by Andrew Van Ek. Repair discussion with Microsoft Copilot. Photo selection, captions, gallery integration, and project documentation by OpenAI Codex, reviewed against the chat and Andrew’s follow-up."
        },
        {
            id: "repair-07-macbook-spark-incident-overview",
            title: "MacBook Pro: pausing after a reported spark",
            category: "hardware",
            categoryLabel: "2011 MacBook Pro Battery Work",
            badgeClass: "badge-warning",
            image: "images/gallery/repairs/07-macbook-spark-incident-overview.jpg",
            thumb: "images/gallery/repairs/07-macbook-spark-incident-overview-thumb.jpg",
            tags: ["2011 MacBook Pro", "Hardware Repair", "Copilot", "In Progress"],
            summary: "I reported a brief spark after a screw or metal tool contacted exposed metal near the battery connection, while another stripped screw complicated the work.",
            sandboxObservation: "A wider view shows the MacBook logic board, battery cable, and partly moved battery during the removal attempt.",
            technicalBreakdown: "The repair priority shifted from removing parts to checking the power connection and preventing another accidental bridge between contacts. The later clarification that the battery remained connected was more reliable than Copilot’s first reading of this photo.",
            defensePlaybook: ["I reported a brief spark after a screw or metal tool contacted exposed metal near the battery connection, while another stripped screw complicated the work."],
            containment: "The spark was reported in the message rather than captured in the image. This view cannot establish whether electrical damage occurred. Overall project status: in progress as of November 5, 2026.",
            credit: "Hardware work and original photography by Andrew Van Ek. Repair discussion with Microsoft Copilot. Photo selection, captions, gallery integration, and project documentation by OpenAI Codex, reviewed against the chat and Andrew’s follow-up."
        },
        {
            id: "repair-08-macbook-logic-board-screw-closeup",
            title: "MacBook Pro: inspecting another damaged screw",
            category: "hardware",
            categoryLabel: "2011 MacBook Pro Battery Work",
            badgeClass: "badge-warning",
            image: "images/gallery/repairs/08-macbook-logic-board-screw-closeup.jpg",
            thumb: "images/gallery/repairs/08-macbook-logic-board-screw-closeup-thumb.jpg",
            tags: ["2011 MacBook Pro", "Hardware Repair", "Copilot", "In Progress"],
            summary: "A stripped screw near delicate circuitry was blocking further disassembly during the same reported spark incident.",
            sandboxObservation: "A tight close-up shows a severely damaged screw head surrounded by traces, small components, and exposed copper around the mounting point.",
            technicalBreakdown: "The close-up showed why repeated driver slippage or rushed extraction could affect nearby circuitry. It also separated the mechanical screw problem from the electrical question raised by the spark.",
            defensePlaybook: ["A stripped screw near delicate circuitry was blocking further disassembly during the same reported spark incident."],
            containment: "The photo shows wear around the screw, but it does not establish whether marks came from tool contact, earlier work, corrosion, or the reported electrical event. Removal of this screw is not documented. Overall project status: in progress as of November 5, 2026.",
            credit: "Hardware work and original photography by Andrew Van Ek. Repair discussion with Microsoft Copilot. Photo selection, captions, gallery integration, and project documentation by OpenAI Codex, reviewed against the chat and Andrew’s follow-up."
        },
        {
            id: "repair-09-macbook-battery-still-connected",
            title: "MacBook Pro: correcting the battery connection diagnosis",
            category: "hardware",
            categoryLabel: "2011 MacBook Pro Battery Work",
            badgeClass: "badge-warning",
            image: "images/gallery/repairs/09-macbook-battery-still-connected.jpg",
            thumb: "images/gallery/repairs/09-macbook-battery-still-connected-thumb.jpg",
            tags: ["2011 MacBook Pro", "Hardware Repair", "Copilot", "In Progress"],
            summary: "I clarified that the battery was still connected when the metal screwdriver touched the nearby contacts.",
            sandboxObservation: "The battery connector and the row of exposed soldered contacts immediately above it fill the frame.",
            technicalBreakdown: "This corrected the earlier assumption that the battery had already been unplugged. Removing mounting screws and moving the battery are separate from disconnecting its electrical connector; the next step in the chat became using a plastic tool to disconnect it.",
            defensePlaybook: ["I clarified that the battery was still connected when the metal screwdriver touched the nearby contacts."],
            containment: "The user described a very brief possible spark and no burnt smell. Neither that report nor this photograph proves that the board escaped damage. Overall project status: in progress as of November 5, 2026.",
            credit: "Hardware work and original photography by Andrew Van Ek. Repair discussion with Microsoft Copilot. Photo selection, captions, gallery integration, and project documentation by OpenAI Codex, reviewed against the chat and Andrew’s follow-up."
        },
        {
            id: "repair-10-macbook-battery-disconnected",
            title: "MacBook Pro: successful disconnection with a plastic spudger",
            category: "hardware",
            categoryLabel: "2011 MacBook Pro Battery Work",
            badgeClass: "badge-warning",
            image: "images/gallery/repairs/10-macbook-battery-disconnected.jpg",
            thumb: "images/gallery/repairs/10-macbook-battery-disconnected-thumb.jpg",
            tags: ["2011 MacBook Pro", "Hardware Repair", "Copilot", "In Progress"],
            summary: "I needed to disconnect the battery after the metal-tool incident and difficulty around the stripped screws.",
            sandboxObservation: "The battery plug is absent from the logic-board socket, leaving its contact pins visible.",
            technicalBreakdown: "Switching to the plastic spudger worked. This photo provided a clearer visual check of disconnection than the earlier angled views and marked a concrete milestone in the repair.",
            defensePlaybook: ["I needed to disconnect the battery after the metal-tool incident and difficulty around the stripped screws."],
            containment: "The user explicitly reported that the plastic spudger worked. The visible result supports successful connector removal; the chat does not document a later boot test, complete reassembly, or confirmation that all components remained functional. Overall project status: in progress as of November 5, 2026.",
            credit: "Hardware work and original photography by Andrew Van Ek. Repair discussion with Microsoft Copilot. Photo selection, captions, gallery integration, and project documentation by OpenAI Codex, reviewed against the chat and Andrew’s follow-up."
        },
        // ----------------- Category: Malware & Security (10) -----------------
        {
            id: "wannacry",
            title: "WannaCry Ransomware (EternalBlue MS17-010)",
            category: "security",
            categoryLabel: "Cryptographic Ransomware",
            badgeClass: "badge-danger",
            image: "images/gallery/wannacry-sandbox-test.png",
            thumb: "images/gallery/wannacry-sandbox-test.png",
            tags: ["WannaCry", "Ransomware", "EternalBlue", "Windows Sandbox", "Da2dalus"],
            summary: "Detonation of the notorious Wanna Decryptor 1.0 payload inside Windows Sandbox, presenting extortion countdown clocks and Bitcoin payment demands.",
            sandboxObservation: "Andrew detonated the sample inside disposable Windows Sandbox memory. The malware background process enumerated virtual directories and deployed its UI prompt over active windows. As seen in the background, test files and references were pulled directly from the Da2dalus malware repository for controlled academic analysis.",
            technicalBreakdown: "WannaCry deploys high-grade asymmetric cryptography (AES-128 coupled with RSA-2048) to encrypt targeted file extensions. It historically spread as a worm by exploiting the <span class=\"tech-term\" data-term=\"ransomware\">MS17-010 EternalBlue</span> SMBv1 vulnerability. Once locked, the software presents a persistent decryption GUI with automated countdown clocks.",
            defensePlaybook: [
                "Strict Patch Management: Ensure Microsoft security bulletin MS17-010 (KB4012598) is installed across all endpoints.",
                "Disable Legacy SMBv1: Deprecate and completely disable SMBv1 across enterprise group policies and client machines.",
                "Perimeter Firewall Rules: Block TCP ports 139 and 445 at the gateway boundary to eliminate unauthenticated external access.",
                "Immutable Backups: Maintain offline, air-gapped, or write-once (WORM) backups that cannot be overwritten by infected endpoints."
            ],
            containment: "Executed exclusively inside <span class=\"tech-term\" data-term=\"windows-sandbox\">Windows Sandbox</span>. No shared host folders or host networking were active during execution. The entire sandbox hypervisor state was discarded upon closing, leaving the host operating system completely untouched.",
            credit: "Exploration, safety containment, and screenshot captured by Andrew Van Ek. Technical breakdown and mitigation playbook co-authored with Google DeepMind Antigravity AI."
        },
        {
            id: "redeye",
            title: "RedEye Ransomware (Active Filesystem Destruction)",
            category: "security",
            categoryLabel: "Active Encryption",
            badgeClass: "badge-danger",
            image: "images/gallery/redeye-ransomware-encryption.png",
            thumb: "images/gallery/redeye-ransomware-encryption.png",
            tags: ["RedEye", "Filesystem Encryption", "VSS Purge", "Windows Sandbox"],
            summary: "Real-time capture of File Explorer showing test binaries actively encrypted and rewritten with the .RedEye extension.",
            sandboxObservation: "During Andrew's test, RedEye immediately began mass-encrypting binaries across the virtual user profile. Watching Windows Explorer refresh in real time as file extensions mutated to .RedEye demonstrated how rapidly a modern ransomware payload tears through a filesystem.",
            technicalBreakdown: "RedEye executes an aggressive background loop that renames targeted files and encrypts their contents. To thwart recovery, modern ransomware families systematically execute shell commands like <code>vssadmin.exe delete shadows /all /quiet</code> to wipe out <span class=\"tech-term\" data-term=\"volume-shadow-copies\">Volume Shadow Copies</span> and disable system startup repair.",
            defensePlaybook: [
                "Controlled Folder Access: Enable Windows Defender Controlled Folder Access to prevent unauthorized binaries from altering key directories.",
                "Heuristic Endpoint Detection (EDR): Deploy behavioral detection configured to flag and terminate rapid file renaming and encryption cascades.",
                "Least Privilege File Permissions: Restrict write permissions on shared network directories to prevent runaway workstation encryption.",
                "Volume Shadow Copy Protection: Monitor and block unprivileged invocations of vssadmin, bcdedit, and wmic."
            ],
            containment: "Detonated in isolated <span class=\"tech-term\" data-term=\"windows-sandbox\">Windows Sandbox</span>. All 53 modified test samples existed only in temporary sandbox storage and were wiped instantly upon closing the session.",
            credit: "Detonation monitoring and screenshot captured by Andrew Van Ek. Forensic analysis and defensive guidelines authored with Google DeepMind Antigravity AI."
        },
        {
            id: "hydra",
            title: "Hydra Joke Virus (Rayquaza Cascading Fork-Bomb)",
            category: "security",
            categoryLabel: "Joke / UI Fork Bomb",
            badgeClass: "badge-warning",
            image: "images/gallery/hydra-joke-virus-forkbomb.png",
            thumb: "images/gallery/hydra-joke-virus-forkbomb.png",
            tags: ["Hydra Virus", "Fork Bomb", "Rayquaza", "UI Exhaustion", "Windows Sandbox"],
            summary: "\"Cut off a head, two more will take its place.\" A classic recursively spawning UI prank that multiplies dialog boxes on every dismissal.",
            sandboxObservation: "Clicking 'OK' on one dialog immediately caused two more to spawn, each displaying randomized corrupted text strings alongside the green Rayquaza sprite. Within moments, the cascading windows overwhelmed the virtual desktop window manager and rendered the screen unusable.",
            technicalBreakdown: "Hydra operates as a <span class=\"tech-term\" data-term=\"fork-bomb\">UI fork-bomb</span>. It catches standard window close events (<code>WM_CLOSE</code>, <code>WM_COMMAND</code>) and launches two duplicated subprocesses for every user attempt to close the modal. This rapidly saturates the Windows desktop thread message queues, handles, and process tables.",
            defensePlaybook: [
                "Job Objects & Process Limits: Configure Windows Job Objects to enforce a hard ceiling on child process creation per parent process.",
                "Process Tree Termination: Use PowerShell commands like <code>Get-Process hydra | Stop-Process -Force</code> or Taskkill /T to sever the entire execution tree simultaneously.",
                "AppLocker Rules: Prevent unauthorized non-whitelisted executables from running out of user download directories.",
                "User Awareness: Educate users on identifying prank programs that exploit panic and repeated mouse clicking."
            ],
            containment: "Detonated safely within <span class=\"tech-term\" data-term=\"windows-sandbox\">Windows Sandbox</span>. The UI freeze was resolved simply by terminating the sandbox session without any risk to the host PC.",
            credit: "Sandbox experiment conducted by Andrew Van Ek. Process hierarchy and mitigation insights developed in collaboration with Google DeepMind Antigravity AI."
        },
        {
            id: "fake-update",
            title: "Fake Windows Update (Deceptive Screen Locker)",
            category: "security",
            categoryLabel: "Screen Locker & Social Engineering",
            badgeClass: "badge-info",
            image: "images/gallery/fake-windows-update-locker.png",
            thumb: "images/gallery/fake-windows-update-locker.png",
            tags: ["Screen Locker", "Social Engineering", "Fake Update", "Windows Sandbox"],
            summary: "A deceptive full-screen modal simulating a legitimate Windows Update screen to immobilize the user while concealing underlying activity.",
            sandboxObservation: "The application instantly seized the entire monitor with a photorealistic Windows 11 update screen (\"Working on updates 2% complete. Don't turn off your PC.\"). Standard window borders disappeared, masking background processes and discouraging the user from rebooting or investigating.",
            technicalBreakdown: "This sample functions as a <span class=\"tech-term\" data-term=\"screen-locker\">screen locker</span> that utilizes low-level keyboard hooks (<code>SetWindowsHookEx</code>) to suppress hotkeys like <code>Alt+Tab</code>, <code>Windows Key</code>, and <code>Esc</code>. The objective is psychological social engineering: convincing the user that legitimate maintenance is underway while malicious payload installation occurs in the background.",
            defensePlaybook: [
                "Secure Attention Sequence (SAS): Utilize <code>Ctrl + Alt + Delete</code>, which is handled at the Windows kernel level and cannot be trapped or faked by user-mode applications.",
                "Disable Automatic Script Execution: Block untrusted script interpreters (WScript, CScript, PowerShell execution policies) from launching out of temporary folders.",
                "Startup Integrity Monitoring: Inspect registry run keys for unauthorized persistence mechanisms.",
                "Safe Mode Boot: If locked on physical hardware, boot into Windows Safe Mode to bypass non-essential startup screen blockers."
            ],
            containment: "Executed in <span class=\"tech-term\" data-term=\"windows-sandbox\">Windows Sandbox</span>. Because the sandbox is ephemeral, closing the sandbox window instantly terminated the hook without needing kernel debugging.",
            credit: "Experiment captured by Andrew Van Ek. Technical reverse-engineering notes compiled with Google DeepMind Antigravity AI."
        },
        {
            id: "suckylocker",
            title: "$ucyLocker (High-Contrast Threat Locker)",
            category: "security",
            categoryLabel: "Ransomware Screen Locker",
            badgeClass: "badge-danger",
            image: "images/gallery/suckylocker-ransomware.png",
            thumb: "images/gallery/suckylocker-ransomware.png",
            tags: ["$ucyLocker", "Screen Locker", "Registry Hooks", "Windows Sandbox"],
            summary: "High-contrast red and black screen locker displaying explicit warnings against closing the window, demanding payment before restoring access.",
            sandboxObservation: "Upon execution, $ucyLocker hijacked the primary display and rendered a stark warning banner over the desktop. During this test, Andrew observed how malicious software can completely break Windows Explorer and freeze the interface—reaffirming the critical importance of isolated sandboxes for security testing.",
            technicalBreakdown: "The locker sets itself as topmost (<code>HWND_TOPMOST</code>), disables access to Task Manager by altering registry keys (<code>DisableTaskMgr</code>), and kills the Windows desktop shell process (<code>explorer.exe</code>). It traps mouse cursor movement within its window boundary to prevent user escape.",
            defensePlaybook: [
                "Administrative Registry Protections: Enforce Group Policy objects (GPO) to prevent non-administrative processes from modifying Task Manager policies.",
                "Application Control: Deploy Microsoft Defender Application Control (WDAC) to prevent unvetted unsigned binaries from launching.",
                "Secondary Shell Recovery: Launch administrative command prompts via remote management or recovery console to restart explorer.exe and purge the persistence key.",
                "Routine Threat Sandboxing: Always test suspicious files in isolated environments before execution."
            ],
            containment: "Analyzed safely in <span class=\"tech-term\" data-term=\"windows-sandbox\">Windows Sandbox</span>. Shell destruction remained entirely confined to the disposable virtual machine.",
            credit: "Sandbox observation and capture by Andrew Van Ek. Technical breakdown and policy hardening guidelines written with Google DeepMind Antigravity AI."
        },
        {
            id: "xpaj",
            title: "Xpaj Polymorphic Virus (SmartScreen Interception)",
            category: "security",
            categoryLabel: "Polymorphic File Infector",
            badgeClass: "badge-warning",
            image: "images/gallery/xpaj-virus-smartscreen.png",
            thumb: "images/gallery/xpaj-virus-smartscreen.png",
            tags: ["Xpaj", "Polymorphic Virus", "SmartScreen", "Cloud Telemetry", "Windows Sandbox"],
            summary: "Windows Defender SmartScreen raising a high-severity red warning banner, successfully intercepting polymorphic sample xpajB.exe.",
            sandboxObservation: "Attempting to launch xpajB.exe inside Windows Sandbox triggered an immediate full-window SmartScreen alert. The warning clearly identified the binary as dangerous and advised against execution, demonstrating Microsoft's cloud reputation telemetry in action.",
            technicalBreakdown: "Xpaj is an advanced <span class=\"tech-term\" data-term=\"polymorphic-virus\">polymorphic file infector</span> known for targeting executable files (.exe, .dll) and system drivers. It mutates its decryption wrapper on each infection to bypass traditional hash signatures. Here, <span class=\"tech-term\" data-term=\"smartscreen\">Windows Defender SmartScreen</span> blocked execution based on behavioral reputation and invalid publisher certificates.",
            defensePlaybook: [
                "Enforce SmartScreen Policy: Keep Windows Defender SmartScreen enabled across all browsers, email clients, and file managers.",
                "Code Signing Mandates: Reject executables that lack verified digital certificates from trusted Certificate Authorities.",
                "Cloud-Delivered Protection: Enable Real-Time and Cloud-Delivered Protection in Windows Security for real-time zero-day definitions.",
                "File Integrity Monitoring (FIM): Use file integrity monitoring to detect unauthorized modifications to system binaries in System32."
            ],
            containment: "Executed inside <span class=\"tech-term\" data-term=\"windows-sandbox\">Windows Sandbox</span>. Testing confirmed SmartScreen functionality works inside disposable VMs while keeping the physical system safe.",
            credit: "Verification test conducted by Andrew Van Ek. Threat intelligence and defense documentation prepared with Google DeepMind Antigravity AI."
        },
        {
            id: "nsb-winlocker",
            title: "National Security Bureau (Police Winlocker Extortion)",
            category: "security",
            categoryLabel: "Police Winlocker / Extortion",
            badgeClass: "badge-danger",
            image: "images/gallery/nsb-police-ransomware-winlocker.png",
            thumb: "images/gallery/nsb-police-ransomware-winlocker.png",
            tags: ["NSB Locker", "Police Ransomware", "Extortion", "Social Engineering", "Windows Sandbox"],
            summary: "Government impersonation screen claiming 140 files seized for pirated software, demanding 250 USD in Bitcoin under threat of arrest.",
            sandboxObservation: "The sample launched full-screen in Windows Sandbox, impersonating a fictitious \"National Security Bureau (NSB)\". It populated an input box demanding a Bitcoin transaction ID and threatened up to 5 years imprisonment if payment was not submitted.",
            technicalBreakdown: "This is a classic police <span class=\"tech-term\" data-term=\"screen-locker\">winlocker</span> that exploits authority deception and urgency. It blocks desktop access while displaying scary legal jargon to coerce victims into sending non-refundable cryptocurrency payments. Unlike true ransomware, files are often intact beneath the lock window.",
            defensePlaybook: [
                "Public Awareness & Education: Official law enforcement and security bureaus never lock computers or demand fines via Bitcoin or gift cards.",
                "Task Manager & Safe Mode Bypasses: Terminate the locker via Safe Mode or an alternate user account where the startup hook is inactive.",
                "Clean Boot Procedures: Use Msconfig or Sysinternals Autoruns to remove unauthorized startup items.",
                "Never Pay Extortion Demands: Submitting payments neither guarantees unlock keys nor removes the underlying malware."
            ],
            containment: "Safely detonated and documented inside <span class=\"tech-term\" data-term=\"windows-sandbox\">Windows Sandbox</span> with zero persistent host contamination.",
            credit: "Sandbox test and forensic screenshot by Andrew Van Ek. Social engineering analysis and recovery guidelines co-authored with Google DeepMind Antigravity AI."
        },
        {
            id: "fake-adwcleaner",
            title: "Fake AdwCleaner (Scareware & Trojan Dropper)",
            category: "security",
            categoryLabel: "Scareware / Trojan Dropper",
            badgeClass: "badge-warning",
            image: "images/gallery/fake-adwcleaner-scareware.png",
            thumb: "images/gallery/fake-adwcleaner-scareware.png",
            tags: ["Fake AdwCleaner", "Scareware", "Banking Trojan", "Social Engineering", "Windows Sandbox"],
            summary: "Phony utility mimicking the legitimate AdwCleaner interface, generating fake registry infections from Banking-Malware samples.",
            sandboxObservation: "The executable displayed a polished replica of the AdwCleaner interface. It ran a fake animated progress bar before reporting 7 fabricated \"Very High\" infections. The sample originated from a banking malware repository containing DanaBot, Emotet, and Dridex.",
            technicalBreakdown: "This represents <span class=\"tech-term\" data-term=\"rogue-antivirus\">rogue security software / scareware</span>. The malware intentionally fabricates alarming infection reports to panic the victim into downloading an additional \"remediation tool\" that serves as a dropper for destructive banking trojans like Emotet or Dridex.",
            defensePlaybook: [
                "Verify Software Provenance: Always download utility software directly from official vendor domains.",
                "Hash Verification: Compare downloaded file hashes (SHA-256) against official release checksums and VirusTotal records.",
                "DNS Filtering: Implement DNS filtering (such as Quad9 or Cloudflare for Families) to block known malicious download domains.",
                "Zero Trust Execution: Prevent execution of unknown binaries downloaded from untrusted file-sharing repositories."
            ],
            containment: "Executed within <span class=\"tech-term\" data-term=\"windows-sandbox\">Windows Sandbox</span>. The deception and simulated scan were thoroughly analyzed without risking physical credentials.",
            credit: "Investigation and capture by Andrew Van Ek. Threat vector breakdown and defensive recommendations produced with Google DeepMind Antigravity AI."
        },
        {
            id: "ftk-imager",
            title: "FTK Imager Forensics: FAT32 vs. NTFS Filesystem Artifacts",
            category: "security",
            categoryLabel: "Digital Forensics & Artifacts",
            badgeClass: "badge-info",
            image: "images/gallery/ftk-imager-digital-forensics-fat-ntfs.png",
            thumb: "images/gallery/ftk-imager-digital-forensics-fat-ntfs.png",
            tags: ["FTK Imager", "Digital Forensics", "FAT32", "NTFS", "Hex Analysis", "Deleted Files"],
            summary: "Side-by-side evidence analysis in Exterro FTK Imager comparing directory allocation tables, deleted file recovery (!ank.jpg), and hex clusters.",
            sandboxObservation: "Andrew conducted a comparative filesystem forensic audit between raw disk images (fat32.001 vs. ntfs.001) for university coursework. In the FAT32 image, deleted files were flagged with red X icons where the initial character in the directory entry was replaced with a deleted marker byte (0xE5, rendered as '!'), while NTFS preserved deep transaction metadata ($RmMetadata, $BadClus, $Secure).",
            technicalBreakdown: "FTK Imager provides low-level hex and structural parsing of physical and logical disk images. The analysis revealed how FAT32 marks file deletion by zeroing FAT chain clusters and overwriting the first directory entry byte, whereas NTFS tracks allocations via the Master File Table (MFT) $BITMAP and record flags, allowing forensic analysts to recover data from unallocated sectors.",
            defensePlaybook: [
                "Secure Erase & Sanitization: Standard OS file deletion does not sanitize storage; employ NIST 800-88 cryptographic wiping or secure shredding tools for sensitive media.",
                "BitLocker Full Disk Encryption: Encrypt volumes with AES-XTS 256 to ensure raw unallocated sectors cannot be read if physical drives are seized or lost.",
                "Write-Blocker Hardware: Always utilize hardware or software write-blockers during forensic acquisition to prevent evidence contamination."
            ],
            containment: "Performed on isolated disk image files (.001) mounted read-only within FTK Imager to preserve cryptographic hash integrity.",
            credit: "Forensic laboratory analysis and image evidence captured by Andrew Van Ek. Filesystem architectural breakdown co-authored with Google DeepMind Antigravity AI."
        },
        {
            id: "phishing-analysis",
            title: "Gmail Phishing Triage: TransUnion Deception & Lures",
            category: "security",
            categoryLabel: "Email Security & Threat Analysis",
            badgeClass: "badge-warning",
            image: "images/gallery/phishing-email-analysis-transunion-spam.png",
            thumb: "images/gallery/phishing-email-analysis-transunion-spam.png",
            tags: ["Phishing", "Email Security", "Social Engineering", "Spam Analysis"],
            summary: "Triage and forensic review of an active credit-monitoring phishing campaign targeting Gmail inboxes with misspelled entity names and urgent financial lures.",
            sandboxObservation: "Andrew analyzed a live phishing email flagged by spam heuristics. The email impersonated credit bureau TransUnion with glaring typos ('TransUnioun') and urgent claims of sudden score increases to coax clicks on deceptive external landing pages.",
            technicalBreakdown: "Financial phishing campaigns leverage urgent emotional triggers (credit fluctuations, vehicle loans) to drive victims to credential harvesting portals. Attackers frequently register typosquatted domains and utilize obfuscated redirect chains to evade basic URL filtering.",
            defensePlaybook: [
                "SPF, DKIM & DMARC Enforcement: Implement strict email authentication records (p=reject) to prevent domain spoofing.",
                "Automated Inbox Rules: Deploy server-side email rules (like Andrew's custom Google Apps Script automation) to auto-purge high-confidence spam threads.",
                "Security Awareness Training: Train users to verify sender domain headers and look for brand typographical errors before interacting with financial alerts."
            ],
            containment: "Triaged safely within isolated web sandbox without clicking external payload hyperlinks.",
            credit: "Email threat triage and screenshot captured by Andrew Van Ek. Analysis authored with Google DeepMind Antigravity AI."
        },

        // ----------------- Category: Virtual Machines & Retro OS (5) -----------------
        {
            id: "windows-xp-rdp",
            title: "Windows XP Professional: Remote Desktop (RDP) Live Session",
            category: "vms",
            categoryLabel: "Retro Workstation & RDP",
            badgeClass: "badge-info",
            image: "images/gallery/windows-xp-rdp-remote-desktop-session.png",
            thumb: "images/gallery/windows-xp-rdp-remote-desktop-session.png",
            tags: ["Windows XP", "RDP", "Remote Administration", "Retro Computing", "Luna Theme", "Homelab"],
            summary: "Active high-resolution Remote Desktop session connected to a vintage Windows XP workstation (192.168.0.160), showcasing native Luna desktop and legacy administration tools.",
            sandboxObservation: "Andrew established a high-resolution Remote Desktop connection directly to a dedicated vintage Windows XP workstation at 192.168.0.160. The connection bar confirms live low-latency interactive control over the iconic Bliss wallpaper and Luna blue shell. Desktop staging shows active vintage media and extraction tooling—including ImgBurn, VLC media player, 7-Zip, TrackMania Nations Forever, and curated disc staging archives (XP_Disc_Stufz).",
            technicalBreakdown: "Windows XP utilizes RDP version 5.1 (port 3389) over TCP. Diagnosing reliable remote administration required verifying Windows Firewall exception rules with Nmap and Netcat, adjusting service session isolation handles so console applications execute within interactive desktop contexts, and disabling legacy power-saving shutoffs on USB wireless adapters to prevent sleep-induced socket drops.",
            defensePlaybook: [
                "Network Isolation: Confine vintage legacy endpoints (XP/2000) to segregated homelab VLANs or isolated subnets with no direct WAN egress.",
                "RDP Port Security: Never expose port 3389 directly to the public internet; restrict remote access exclusively to trusted local subnets or encrypted VPN/Tailscale tunnels.",
                "Power Management Hardening: Configure power schemes to 'Always On' and disable selective USB/NIC suspension in Device Manager to maintain socket persistence."
            ],
            containment: "Physical retro hardware workstation isolated on internal homelab subnet with strict firewall controls and Samba credential sandboxing.",
            credit: "Workstation restoration, RDP network diagnostics, and screenshot captured by Andrew Van Ek. Technical analysis authored with Google DeepMind Antigravity AI."
        },
        {
            id: "vista-legacy-update",
            title: "Windows Vista Ultimate SP2: Legacy Update 1.14.1 Revival",
            category: "vms",
            categoryLabel: "Vintage VM & Update Revival",
            badgeClass: "badge-info",
            image: "images/gallery/windows-vista-legacy-update-vm.png",
            thumb: "images/gallery/windows-vista-legacy-update-vm.png",
            tags: ["Windows Vista", "Legacy Update", "Virtual Machine", "Retro Computing", "TLS Certificates"],
            summary: "Windows Vista Ultimate SP2 running inside a virtual machine, successfully restored to online status using community-driven Legacy Update 1.14.1.",
            sandboxObservation: "Andrew revived a fresh installation of Windows Vista Ultimate SP2 in a virtual machine. Because Microsoft shut down legacy Windows Update servers and modern websites require updated TLS 1.2/1.3 root certificates, Andrew deployed Legacy Update 1.14.1 to restore Windows Update functionality and patched cryptographic trust stores.",
            technicalBreakdown: "Legacy operating systems encounter error 80072EFE when connecting to outdated Windows Update endpoints due to retired SHA-1 hashing and discontinued TLS 1.0 protocols. Legacy Update proxies update requests, installs updated Root Certificate Authorities (CA), and patches the Windows Update client (wuaueng.dll) so the OS can safely discover and install missing patches.",
            defensePlaybook: [
                "Isolated Retro Networks: Legacy operating systems (Vista, XP) should reside on dedicated isolated VLANs with no direct outbound WAN routing.",
                "Proxy-Based Certificate Management: Revive legacy browser trust safely using verified root certificates from reputable archive repositories.",
                "Virtual Machine Snapshots: Maintain gold-master VM snapshots before installing community patches to enable instant rollback."
            ],
            containment: "Isolated guest virtual machine configured with host-only networking and snapshot rollbacks.",
            credit: "Virtual machine engineering and system restoration executed by Andrew Van Ek. Technical documentation compiled with Google DeepMind Antigravity AI."
        },
        {
            id: "win81-charms",
            title: "Windows 8.1 32-Bit: Metro Charms & Start Tutorial in VM",
            category: "vms",
            categoryLabel: "Legacy VM / UI Architecture",
            badgeClass: "badge-info",
            image: "images/gallery/windows-81-metro-charms-tutorial-vm.png",
            thumb: "images/gallery/windows-81-metro-charms-tutorial-vm.png",
            tags: ["Windows 8.1", "Metro UI", "Charms Bar", "Virtual Machine", "UTM / Fusion"],
            summary: "Windows 8.1 32-bit guest VM displaying the historic Metro Charms tutorial: 'Here\\'s Start: Move your mouse pointer all the way into the corner and click.'",
            sandboxObservation: "Andrew deployed a 32-bit Windows 8.1 virtual machine on his Mac to study Microsoft's touch-first Metro UI paradigm and OS architecture. The screenshot captures the initial OOBE personalization tour introducing edge-screen gesture mechanics.",
            technicalBreakdown: "Windows 8 introduced the Windows Runtime (WinRT) framework and dual-shell architecture, mapping screen corner hover events to the DWM (Desktop Window Manager) to render the Charms bar and Start screen. Running 32-bit builds in virtualization allows testing lightweight legacy enterprise apps with minimal RAM overhead.",
            defensePlaybook: [
                "Lifecycle Deprecation: Windows 8.1 reached End of Life in January 2023; air-gap legacy virtual machines running obsolete OS builds.",
                "Hypervisor Isolation: Ensure VM guest additions and shared clipboards are disabled when running untrusted legacy workloads."
            ],
            containment: "Executed in an isolated guest VM on macOS.",
            credit: "VM setup and capture by Andrew Van Ek. Technical analysis formatted with Google DeepMind Antigravity AI."
        },
        {
            id: "win81-load",
            title: "Windows 8.1 Pro VM: 100% CPU Benchmark & Task Manager",
            category: "vms",
            categoryLabel: "Virtualization Performance",
            badgeClass: "badge-info",
            image: "images/gallery/windows-81-vm-taskmanager-load.png",
            thumb: "images/gallery/windows-81-vm-taskmanager-load.png",
            tags: ["Windows 8.1 Pro", "Task Manager", "100% CPU", "Virtualization", "Resource Monitoring"],
            summary: "Task Manager resource telemetry inside Windows 8.1 Pro Build 9600 during a 100% 1.00 GHz CPU stress benchmark on a 2.0 GB RAM virtual machine.",
            sandboxObservation: "Andrew monitored hypervisor resource scheduling during a compute stress test on Windows 8.1 Pro. The virtualized single-core processor pinned at 100% utilization while memory allocation held stable at 1.2 / 2.0 GB (60%), verifying guest stability under full CPU constraint.",
            technicalBreakdown: "Demonstrates hypervisor vCPU time-slicing and virtual interrupt handling. Windows 8.1 was the first consumer Windows release to debut the redesigned modern Task Manager, introducing the heat-map resource grid, grouped processes, and live performance metrics.",
            defensePlaybook: [
                "Hypervisor Resource Quotas: Always configure vCPU shares and execution caps to prevent a runaway guest VM from starving the host OS.",
                "Synthetic Metric Verification: Correlate in-guest Task Manager stats with host-level hypervisor telemetry to detect CPU scheduling latency."
            ],
            containment: "Contained within a single-vCPU guest virtual machine.",
            credit: "Benchmarking and capture conducted by Andrew Van Ek. Architectural review with Google DeepMind Antigravity AI."
        },
        {
            id: "kali-wordlist",
            title: "Kali Linux in VirtualBox: Wordlist Cracking & Character Encoding",
            category: "vms",
            categoryLabel: "Security VM & Password Auditing",
            badgeClass: "badge-warning",
            image: "images/gallery/kali-linux-virtualbox-hash-cracking.png",
            thumb: "images/gallery/kali-linux-virtualbox-hash-cracking.png",
            tags: ["Kali Linux", "VirtualBox", "Rockyou.txt", "Hash Cracking", "UTF-8 Encoding", "Remote Desktop"],
            summary: "Multi-tier cross-platform virtualization: macOS Safari controlling Chrome Remote Desktop to Windows, running Kali Linux 64-bit in VirtualBox for password security labs.",
            sandboxObservation: "Andrew set up a multi-hop remote access architecture to conduct security lab work from anywhere. Inside Kali Linux, while preparing wordlists (rockyou.txt) for hash cracking labs, the Mousepad editor flagged a non-UTF-8 encoding conflict—highlighting practical character set challenges when parsing legacy dictionary archives.",
            technicalBreakdown: "The famous rockyou.txt wordlist contains over 14 million passwords compiled from historical leaks, including raw binary strings, extended ASCII, and ISO-8859-1 encodings that violate strict UTF-8 parsers. Security tooling requires iconv normalization or binary-safe stream processing (e.g. John the Ripper / Hashcat) to avoid corrupted dictionary evaluations.",
            defensePlaybook: [
                "High-Entropy Password Policies: Require passphrases (>16 characters) with high Kolmogorov complexity to render dictionary attacks mathematically infeasible.",
                "Adaptive Salting & KDFs: Store hashes using Argon2id, bcrypt, or PBKDF2 with high work factors to thwart GPU-accelerated cracking.",
                "Rate Limiting & Account Lockouts: Implement progressive exponential backoffs on authentication endpoints to stop automated wordlist spray attacks."
            ],
            containment: "Executed in an isolated VirtualBox Kali Linux instance accessed securely over Chrome Remote Desktop.",
            credit: "Cross-platform setup and security lab work by Andrew Van Ek. Cryptographic analysis authored with Google DeepMind Antigravity AI."
        },

        // ----------------- Category: Homelab, Cloud & Linux Fleet (11) -----------------
        {
            id: "antigravity-cli-vnc",
            title: "Antigravity CLI: Live AI Pair Programming in Alpine TigerVNC",
            category: "homelab",
            categoryLabel: "Autonomous AI & Homelab Ops",
            badgeClass: "badge-success",
            image: "images/gallery/antigravity-cli-alpine-vnc-pair-programming.png",
            thumb: "images/gallery/antigravity-cli-alpine-vnc-pair-programming.png",
            tags: ["Antigravity CLI", "Gemini 3.8 Flash", "TigerVNC", "Alpine Linux", "Pair Programming", "Terminal AI", "BOINC"],
            summary: "Active terminal session running Google DeepMind's Antigravity CLI (Gemini 3.8 Flash High) inside an Alpine Linux TigerVNC desktop, driving multi-task desktop customization and automated Git operations.",
            sandboxObservation: "Andrew engaged in an interactive pair programming session with Antigravity CLI directly inside LXTerminal on the stationary Alpine Linux NUC over TigerVNC (912x720). The prompt showcases real-time homelab problem-solving: diagnosing desktop wallpaper state, engineering Windows-like taskbar window hover previews, unpinning dock shortcuts, auditing GNOME Software update indicators, and generating structured maintenance documentation before pushing to GitHub. In the background, BOINC Manager computes Einstein@Home pulsar search work units and GNOME Software manages system packages.",
            technicalBreakdown: "Antigravity CLI leverages advanced agentic coding workflows powered by Gemini models with real-time streaming tokens and subagent orchestration. Operating directly within terminal environments on remote Linux nodes over Tailscale, it enables conversational shell automation, configuration debugging, and Git repository reconciliation without leaving the developer console.",
            defensePlaybook: [
                "Agent Sandboxing: Restrict autonomous CLI agents to documented repository paths and non-destructive terminal command sets.",
                "Review Staged Diff Verification: Always audit staged HTML, CSS, and script diffs prior to executing automated git push commands.",
                "Process Headroom Monitoring: Monitor background compute daemons (like BOINC and Docker containers) during intensive LLM token generation sessions."
            ],
            containment: "Live developer terminal session hosted inside isolated TigerVNC container on Alpine NUC.",
            credit: "Agentic prompt engineering and screenshot captured by Andrew Van Ek. Technical workflow co-developed with Google DeepMind Antigravity AI."
        },
        {
            id: "alpine-nuc-vnc",
            title: "Alpine Linux NUC: Dual-Resolution TigerVNC Desktop & Conky Telemetry",
            category: "homelab",
            categoryLabel: "Homelab Fleet & Headless VNC",
            badgeClass: "badge-info",
            image: "images/gallery/alpine-nuc-vnc-tigervnc-desktop.png",
            thumb: "images/gallery/alpine-nuc-vnc-tigervnc-desktop.png",
            tags: ["Alpine Linux", "TigerVNC", "x11vnc", "Tailscale", "Conky", "Homelab Fleet", "NUC", "LXTerminal"],
            summary: "Live TigerVNC session connected to the Alpine Linux NUC over Tailscale (100.87.81.52:5921), featuring dual-resolution remote desktop endpoints, LXTerminal, and a real-time Conky hardware telemetry desklet.",
            sandboxObservation: "Andrew established a low-latency remote desktop connection via TigerVNC to the stationary Alpine Linux NUC (nucWOL2-0--HDD) at 100.87.81.52:5921 (912x720 mobile/tablet optimized viewport). The session highlights live system monitoring—CPU live graph across 4 cores (47% @ 1.84 GHz), RAM tachometer (1.87 / 3.75 GiB), thermal gauges (CPU 118.4°F, Disk 89.6°F)—and an active LXTerminal session reviewing modern developer tools, while documenting dual Tailscale VNC display listeners (:5921 at 912x720 and :5922 at 1600x1264).",
            technicalBreakdown: "Headless X11 environments on Alpine Linux leverage lightweight display servers paired with x11vnc daemons bound strictly to the Tailscale WireGuard virtual interface (100.87.81.52). Running parallel listeners with fixed virtual viewports enables adaptive client scaling: high-resolution multi-monitor desktop sessions over port 5922 and lightweight mobile/low-bandwidth sessions over port 5921 without desktop resync stalls.",
            defensePlaybook: [
                "Tailnet-Bound Display Listeners: Bind VNC daemons exclusively to internal Tailscale IP addresses (100.x.y.z) to prevent unauthenticated RFB scanning on public network interfaces.",
                "Encrypted Transport Tunneling: Utilize WireGuard peer-to-peer encryption for VNC traffic rather than transmitting unencrypted RFB protocol packets across LAN/WAN perimeters.",
                "Thermal & Resource Limits: Monitor core temperatures and disk thermal metrics continuously via Conky or Prometheus exporters to protect stationary low-power NUC hardware under persistent compute loads."
            ],
            containment: "Private homelab server running headless X11 with x11vnc restricted exclusively to Tailscale mesh interfaces.",
            credit: "Remote desktop architecture, dual-resolution VNC daemon engineering, and Conky HUD design by Andrew Van Ek. Documentation compiled with Google DeepMind Antigravity AI."
        },
        {
            id: "glm4-web-chat",
            title: "GLM-4-9B Private Tailscale Web Chat Interface",
            category: "homelab",
            categoryLabel: "Private LLM & Tailscale Streaming",
            badgeClass: "badge-success",
            image: "images/gallery/glm4-tailscale-web-chat-interface.png",
            thumb: "images/gallery/glm4-tailscale-web-chat-interface.png",
            tags: ["GLM-4", "LM Studio", "Tailscale", "Local AI", "Web Chat", "Private Mesh", "Streaming SSE"],
            summary: "Dedicated zero-dependency streaming web interface for GLM-4-9B-Chat hosted on an 8-vCPU homelab Linux VM, accessed privately over Tailscale (100.82.213.77:3000).",
            sandboxObservation: "Andrew deployed a custom, zero-dependency streaming web chat client connected to GLM-4-9B-Chat running headlessly via LM Studio on an 8-vCPU Linux VM over Tailscale (100.82.213.77:3000). The active session demonstrates real-time streaming token generation for academic coursework inquiries regarding project management resource requirements, backed by an instant clear-chat action and active model selection.",
            technicalBreakdown: "The architecture combines a headless LM Studio API daemon managed by a systemd supervisor unit with a custom lightweight Python/HTML streaming frontend. Model weights (GLM-4-9B Q4_K_M GGUF, 6.25 GB) are pre-allocated directly into RAM at boot to eliminate cold-start latencies. Requests stream via Server-Sent Events (SSE) over an encrypted wireguard Tailscale mesh without public internet port exposure.",
            defensePlaybook: [
                "Encrypted Mesh Transport: Restrict proprietary model endpoints to private WireGuard Tailscale interfaces (100.x.y.z) rather than public IP bindings.",
                "RAM Allocation Pre-Checks: Ensure systemd supervisor units verify memory availability before pre-loading multi-gigabyte GGUF model weights.",
                "Disk Partition Quotas: Implement automated cleanup routines to purge partial download artifacts (.part) that can silently exhaust root disk storage."
            ],
            containment: "Private VM inference node supervised by systemd, completely isolated behind Tailscale network ACLs with zero public internet routing.",
            credit: "Headless LLM inference pipeline, web streaming UI, and screenshot captured by Andrew Van Ek. Service supervision and documentation engineered with Google DeepMind Antigravity AI."
        },
        {
            id: "slax-dell-conky",
            title: "Custom Slax XFCE on Home Dell: USB Persistence & Real-Time Desklets",
            category: "homelab",
            categoryLabel: "Homelab Fleet & Live OS",
            badgeClass: "badge-info",
            image: "images/gallery/slax-dell-usb-persistence-conky.png",
            thumb: "images/gallery/slax-dell-usb-persistence-conky.png",
            tags: ["Slax Linux", "Dell Laptop", "USB Persistence", "Conky", "Tailscale", "Homebrew Maintenance"],
            summary: "Custom persistent Slax Linux installation running on the Home Dell laptop over USB 3.0, featuring Conky system monitors and autonomous Homebrew maintenance.",
            sandboxObservation: "Andrew engineered a custom live Slax XFCE deployment running entirely off a USB drive with encrypted persistence (14.0 GiB / 46.8 GiB utilized). Connected via TigerVNC, the desktop features a custom Conky telemetry HUD tracking CPU temp (+51°C), RAM (4.59 / 15.5 GiB), USB I/O throughput, Tailscale mesh IP (100.121.51.123), and background Homebrew updates.",
            technicalBreakdown: "Slax uses an AUFS / OverlayFS layered filesystem architecture to merge read-only compressed squashfs system modules with a writable persistence directory on USB storage. Andrew configured background maintenance scripts with download rate-limiting (16 KiB/s) to ensure package updates never saturate mobile or homelab bandwidth.",
            defensePlaybook: [
                "Persistence Partition Encryption: Encrypt LUKS storage on portable USB operating systems to protect credentials if physical media is misplaced.",
                "Mesh Network Segmentation: Enforce Tailscale ACL policies so portable endpoints only reach authorized internal homelab services."
            ],
            containment: "Ephemeral live OS with modular persistence overlay running on dedicated test hardware.",
            credit: "Operating system tailoring, Conky widget scripting, and system monitoring by Andrew Van Ek. Systems architecture documented with Google DeepMind Antigravity AI."
        },
        {
            id: "debian-mac-ai",
            title: "2011 Debian Intel Mac: AI Wallpaper Generation & Conky Telemetry",
            category: "homelab",
            categoryLabel: "Retro Mac Linux & Local AI",
            badgeClass: "badge-info",
            image: "images/gallery/debian-mac-ai-image-gen-conky.png",
            thumb: "images/gallery/debian-mac-ai-image-gen-conky.png",
            tags: ["2011 Mac", "Debian Linux", "Local AI", "Wallpaper Generator", "Conky", "TigerVNC"],
            summary: "Vintage 2011 Intel Mac repurposed with Debian Linux, running an autonomous multi-threaded Wallpaper Batch Generator GUI with live hardware telemetry.",
            sandboxObservation: "Andrew brought new life to his 2011 Intel Mac by installing Debian Linux and engineering an automated Python/Tkinter Wallpaper Batch Generator. Over TigerVNC, the Mac coordinates 30-image batch prompts while Conky monitors CPU temperature (84.4°F), RAM temperature (125.2°F), and 23.6 GiB memory utilization.",
            technicalBreakdown: "Demonstrates repurposing legacy x86_64 Mac hardware into a headless AI compute worker. By offloading image generation tasks to background queues with swap optimizations (leveraging up to 48 GB swap when needed), older hardware remains highly capable of autonomous creative workloads.",
            defensePlaybook: [
                "Hardware Thermal Guardrails: Implement temperature-triggered throttling scripts (lm-sensors) to prevent thermal degradation on aging laptop logic boards.",
                "Headless VNC Security: Bind VNC servers strictly to localhost (127.0.0.1) and tunnel display sessions exclusively over SSH or Tailscale."
            ],
            containment: "Headless Debian Linux workstation on private homelab Tailscale network.",
            credit: "Hardware revival, Debian configuration, and AI batch script engineering by Andrew Van Ek. Telemetry integration with Google DeepMind Antigravity AI."
        },
        {
            id: "mint-desklets-crypto",
            title: "Linux Mint on HP Laptop: Quad-Core Desklets & Monero Mining",
            category: "homelab",
            categoryLabel: "Linux Fleet & Distributed Compute",
            badgeClass: "badge-info",
            image: "images/gallery/linux-mint-desklets-monero-mining.png",
            thumb: "images/gallery/linux-mint-desklets-monero-mining.png",
            tags: ["Linux Mint", "HP Laptop", "Monero Mining", "Cinnamon Desklets", "Hardware Telemetry"],
            summary: "HP 15 laptop running Linux Mint Cinnamon, featuring custom circular CPU core gauges, live Monero mining telemetry, and local AI model runners.",
            sandboxObservation: "Andrew configured his HP 15 laptop as a distributed compute node on Linux Mint. The desktop displays custom Cinnamon desklets tracking 100% load across all 4 CPU cores, RAM allocation (11.20 / 16.40 GiB), and MoneroOcean mining pool shares (386.0 H/s) running alongside local Realistic Vision AI models.",
            technicalBreakdown: "Utilizes the RandomX proof-of-work algorithm optimized for consumer x86 CPUs. Andrew carefully tuned the thread allocation and Huge Pages settings to balance compute throughput without causing thermal runaway on laptop form factors.",
            defensePlaybook: [
                "Mining Pool Authentication: Secure pool payout addresses with hardware wallets and enforce TLS-encrypted Stratum connections.",
                "Thermal Management: Configure core affinity and power-limit throttles to preserve battery health on mobile laptops."
            ],
            containment: "Dedicated Linux Mint hardware node on private home network.",
            credit: "Linux Mint customization, desklet arrangement, and mining node administration by Andrew Van Ek. Hardware evaluation with Google DeepMind Antigravity AI."
        },
        {
            id: "folding-dashboard",
            title: "Folding@Home Multi-Machine Cluster: 151.7 Million PPD Telemetry",
            category: "homelab",
            categoryLabel: "Distributed Science & Compute Cluster",
            badgeClass: "badge-info",
            image: "images/gallery/folding-at-home-slax-multi-machine.png",
            thumb: "images/gallery/folding-at-home-slax-multi-machine.png",
            tags: ["Folding@Home", "Banano.cc", "Distributed Computing", "151M PPD", "Cluster Dashboard"],
            summary: "Unified Folding@home Web Client dashboard orchestrating 151,764,241 Points Per Day (PPD) across cloud and physical nodes for biomedical research.",
            sandboxObservation: "Andrew's distributed scientific compute cluster in action. Monitored from Slax Linux, the dashboard tracks parallel work units running across physical and cloud nodes: slax (2 CPUs), EC2AMAZ high-performance cloud compute (151.6M PPD), fah-cpu-8 (8 CPUs), and fah-linux.",
            technicalBreakdown: "Folding@home distributes molecular dynamics simulations of protein folding to help researchers develop treatments for cancer and Alzheimer's disease. Andrew orchestrated multiple heterogenous nodes into the Banano.cc folding team, contributing millions of compute points to medical research.",
            defensePlaybook: [
                "Zero-Privilege Daemon Execution: Run scientific compute daemons under isolated non-root system users (fahclient).",
                "Egress Traffic Filtering: Restrict folding node outbound network connections strictly to verified Stanford/Folding@home assignment servers."
            ],
            containment: "Distributed compute cluster operating across isolated cloud instances and homelab hardware.",
            credit: "Cluster architecture, node deployment, and team configuration engineered by Andrew Van Ek. Summary reviewed with Google DeepMind Antigravity AI."
        },
        {
            id: "gcp-folding-xeon",
            title: "Google Cloud 8-vCPU Xeon VM: Parallel Folding & Stable-Diffusion.cpp",
            category: "homelab",
            categoryLabel: "Cloud Infrastructure & Compute",
            badgeClass: "badge-info",
            image: "images/gallery/gcp-folding-vm-stablediffusion-xeon.png",
            thumb: "images/gallery/gcp-folding-vm-stablediffusion-xeon.png",
            tags: ["Google Cloud", "Intel Xeon", "Stable-Diffusion.cpp", "TigerVNC", "Linuxbrew", "Folding"],
            summary: "Google Cloud Compute Engine 8-vCPU Intel Xeon instance running parallel workloads: Folding@home client, stable-diffusion.cpp WebUI, and Linuxbrew package management.",
            sandboxObservation: "Andrew architected an 8-vCPU Intel Xeon instance on Google Cloud (fah-cpu-8) as an elastic compute laboratory. Connected via TigerVNC, the desktop manages parallel threads: compiling local image prompts through stable-diffusion.cpp WebUI, managing system packages via Linuxbrew, and crunching research units.",
            technicalBreakdown: "Demonstrates running quantized CPU-optimized neural network inference using stable-diffusion.cpp. By utilizing AVX-512 vector extensions on Intel Xeon processors, the VM generates high-quality images without requiring expensive dedicated GPU allocations.",
            defensePlaybook: [
                "IAM Principle of Least Privilege: Enforce strict Google Cloud Service Account roles with zero access to production project resources.",
                "Automated Cloud Shutdowns: Deploy Cloud Functions to automatically stop high-vCPU instances when idle to eliminate unexpected billing."
            ],
            containment: "Isolated Google Cloud Virtual Private Cloud (VPC) with firewall rules permitting ingress strictly from authorized VPN IPs.",
            credit: "Cloud VM deployment, desktop environment tailoring, and workflow optimization by Andrew Van Ek. Cloud security audit with Google DeepMind Antigravity AI."
        },
        {
            id: "azure-vm-telemetry",
            title: "Azure Cloud VM: stable-diffusion.cpp Memory-Mapped Weights & Network Telemetry",
            category: "homelab",
            categoryLabel: "Cloud Virtualization & AI",
            badgeClass: "badge-info",
            image: "images/gallery/azure-vm-stablediffusion-telemetry.png",
            thumb: "images/gallery/azure-vm-stablediffusion-telemetry.png",
            tags: ["Microsoft Azure", "Stable-Diffusion.cpp", "Memory Mapping", "Network Telemetry", "TigerVNC"],
            summary: "Microsoft Azure cloud Linux VM running stable-diffusion.cpp with memory-mapped weights (1268 MB), displaying real-time 2.29 MB/s network throughput.",
            sandboxObservation: "Andrew deployed an Azure cloud instance running stable-diffusion.cpp WebUI over TigerVNC. The terminal showcases instant model loading via memory-mapped files (mmap taking 0.00s) paired with live network telemetry graphs capturing real-time asset streaming.",
            technicalBreakdown: "Memory-mapping (mmap) allows the operating system kernel to map neural network weights directly from disk into virtual address space, bypassing user-space buffer copies and drastically accelerating cold-start inference times on resource-constrained cloud VMs.",
            defensePlaybook: [
                "Network Security Groups (NSG): Restrict Azure inbound ports (VNC port 5902, WebUI 1234) exclusively to authenticated Tailscale/VPN IPs.",
                "Ephemeral OS Disks: Use Azure Ephemeral OS disks for stateless compute workers to improve I/O speed and eliminate disk persistence costs."
            ],
            containment: "Sandboxed Microsoft Azure cloud virtual machine with dedicated NSG rules.",
            credit: "Cloud instance configuration and AI runtime testing by Andrew Van Ek. Systems evaluation co-authored with Google DeepMind Antigravity AI."
        },
        {
            id: "dell-xp-troubleshooting",
            title: "Physical Dell Latitude XP Laptop: SMB Share Network Troubleshooting",
            category: "homelab",
            categoryLabel: "Physical Hardware & Retro Networking",
            badgeClass: "badge-warning",
            image: "images/gallery/dell-windows-xp-smb-troubleshooting.jpg",
            thumb: "images/gallery/dell-windows-xp-smb-troubleshooting.jpg",
            tags: ["Windows XP", "Dell Latitude", "SMB Troubleshooting", "Vintage Hardware", "Local Networking"],
            summary: "Hands-on hardware troubleshooting on the physical Dell Latitude laptop running Windows XP, debugging authentication and SMB share permissions.",
            sandboxObservation: "A real-world photo from Andrew's retro computing workbench: diagnosing SMB share connectivity on the physical Dell Latitude laptop running Windows XP. When attempting to connect to the network share (\\\\192.168.0.201\\onefive), Windows Explorer prompted for credentials and returned an access permission error, sparking a deep-dive into legacy NTLMv1 vs SMB2/3 authentication protocols.",
            technicalBreakdown: "Modern Samba and Windows servers disable legacy SMBv1 and NTLMv1 by default due to severe security vulnerabilities. Bridging a 2001-era Windows XP machine to a modern storage array requires configuring dedicated, isolated Samba shares with 'server min protocol = NT1' and explicit legacy user mappings, strictly isolated from production LAN traffic.",
            defensePlaybook: [
                "VLAN Segmentation for Retro Devices: Never connect legacy Windows XP hardware to unsegmented production networks; isolate legacy gear onto a quarantined VLAN.",
                "Read-Only Guest Shares: Expose only non-sensitive, read-only network shares to obsolete operating systems lacking modern cryptographic protocols."
            ],
            containment: "Physical vintage laptop operating on a separate network segment.",
            credit: "Hands-on hardware troubleshooting and photography by Andrew Van Ek. SMB protocol analysis with Google DeepMind Antigravity AI."
        },
        {
            id: "alpine-samba-restart",
            title: "Alpine Linux NUC: Samba Network Share Recovery via Tailscale",
            category: "homelab",
            categoryLabel: "Homelab Administration & CLI",
            badgeClass: "badge-info",
            image: "images/gallery/alpine-samba-tailscale-network-restart.png",
            thumb: "images/gallery/alpine-samba-tailscale-network-restart.png",
            tags: ["Alpine Linux", "Samba", "Tailscale", "OpenRC", "UNC Paths", "Network Drives"],
            summary: "Terminal session restarting crashed Samba services (rc-service samba restart) on Alpine Linux and mapping UNC network drives (\\\\100.87.81.52\\G) across Tailscale.",
            sandboxObservation: "Andrew diagnosed and resolved a Samba network share interruption on his 24/7 Alpine Linux NUC. Using OpenRC service commands (rc-service samba restart), the daemon was restored, and UNC paths (\\\\100.87.81.52\\G and WORKFORMAT1) were mapped persistently into Windows File Explorer over encrypted Tailscale.",
            technicalBreakdown: "Alpine Linux utilizes OpenRC as its init system. When Samba daemons halt due to locked file handles or interface restarts, restarting the 'samba' meta-service cleanly bounces both smbd (file sharing) and nmbd (NetBIOS name service), re-establishing SMB3 sessions over the Tailscale VPN interface.",
            defensePlaybook: [
                "Service Watchdogs: Deploy OpenRC cron watchdogs to automatically monitor smbd process health and restart halted services.",
                "Encrypted Mesh Routing: Restrict SMB network shares exclusively to Tailscale virtual IPs (100.x.y.z), ensuring all traffic is encrypted end-to-end with WireGuard."
            ],
            containment: "Configured on the self-hosted Alpine Linux server over authenticated Tailscale.",
            credit: "Homelab administration and recovery executed by Andrew Van Ek. Documentation formatted with Google DeepMind Antigravity AI."
        },

        // ----------------- Category: Creative Lab & Everyday Automation (4) -----------------
        {
            id: "super-smash-audio",
            title: "Super Smash Bros Brawl OST: Precision Waveform Trimming & Audio Re-Merge",
            category: "media",
            categoryLabel: "Creative Lab & Audio Engineering",
            badgeClass: "badge-info",
            image: "images/gallery/super-smash-bros-audio-trimming.png",
            thumb: "images/gallery/super-smash-bros-audio-trimming.png",
            tags: ["Audio Engineering", "Super Smash Bros", "Waveform Trimming", "MP3 Editing", "Soundtrack"],
            summary: "Surgical audio editing on Super Smash Bros Brawl OST, trimming unwanted dead air and looping segments before clean re-merging.",
            sandboxObservation: "Andrew engineered a custom soundtrack cut of the Super Smash Bros Brawl OST using web-based spectral editing. By visualizing exact millisecond cue markers (04:04:48.5 to 04:13:19.6), dead air and extraneous intro loops were cleanly excised before export.",
            technicalBreakdown: "Digital audio editing at zero-crossing points prevents acoustic popping and phase distortion during track splicing. Proper boundary trimming preserves bit-rate transparency while standardizing playlist playback.",
            defensePlaybook: [
                "Local-First Audio Processing: Utilize local or trusted audio tools to avoid uploading proprietary or high-bitrate masters to unverified cloud converters.",
                "Non-Destructive Editing: Always preserve original audio source masters with append-only version control."
            ],
            containment: "Processed safely within isolated browser sandboxes.",
            credit: "Audio editing and arrangement crafted by Andrew Van Ek. Summary notes with Google DeepMind Antigravity AI."
        },
        {
            id: "ace-step-apps",
            title: "Local AI Suite: ACE-Step 1.5 Music & Diffusers Image Generator Shortcuts",
            category: "media",
            categoryLabel: "Local AI & Workflow Automation",
            badgeClass: "badge-info",
            image: "images/gallery/ace-step-and-diffusers-desktop-apps.png",
            thumb: "images/gallery/ace-step-and-diffusers-desktop-apps.png",
            tags: ["ACE-Step 1.5", "Stable Diffusion", "PyTorch CUDA", "Desktop Shortcuts", "uv Python"],
            summary: "Architecture and desktop launch shortcuts for locally hosted AI creation tools: ACE-Step 1.5 Music Generator and PyTorch Diffusers Image Generator.",
            sandboxObservation: "Andrew configured a local generative AI suite on his Windows RTX workstation, deploying dual web interfaces: ACE-Step 1.5 Music Generator (port 7860) and a PyTorch Diffusers Image Generator (port 7861 with SD-Turbo & SD 1.5). Created one-click desktop shortcuts that boot the optimized uv Python environments and automatically open the Gradio browser interfaces.",
            technicalBreakdown: "Leverages the ultra-fast 'uv' Python package manager and PyTorch CUDA 12.8 acceleration. By packaging startup scripts into double-clickable desktop shortcuts (.lnk), local AI generation runs on-demand without keeping heavy model weights permanently locked in VRAM.",
            defensePlaybook: [
                "Local Model Verification: Compute SHA-256 hashes of Hugging Face model weights to prevent malicious Pickle deserialization attacks.",
                "Localhost Binding: Restrict local Gradio web servers strictly to 127.0.0.1 to avoid exposing inference APIs to the local network."
            ],
            containment: "Executed locally on dedicated workstation GPU hardware with zero cloud telemetry.",
            credit: "AI environment setup, batch scripts, and shortcut automation built by Andrew Van Ek. Technical documentation with Google DeepMind Antigravity AI."
        },
        {
            id: "wallpaper-fix",
            title: "macOS Live Wallpaper Process Fix: Activity Monitor Diagnostics",
            category: "media",
            categoryLabel: "macOS Diagnostics & Optimization",
            badgeClass: "badge-info",
            image: "images/gallery/macos-live-wallpaper-process-fix.png",
            thumb: "images/gallery/macos-live-wallpaper-process-fix.png",
            tags: ["macOS Sequoia", "Activity Monitor", "WallpaperSequoiaExtension", "Memory Diagnostics"],
            summary: "Process inspection and memory diagnostics in macOS Activity Monitor isolating WallpaperSequoiaExtension memory footprint.",
            sandboxObservation: "Andrew diagnosed background memory consumption on macOS Sequoia, using Activity Monitor to isolate the WallpaperSequoiaExtension (137.5 MB across 14 threads) and the parent Wallpaper daemon (11.9 MB across 4 threads) to optimize battery life and system responsiveness.",
            technicalBreakdown: "macOS Sequoia delegates dynamic desktop aerials to decoupled XPC extension services. When wallpaper loops fail to sleep properly during full-screen apps, restarting the extension process frees retained memory frames without requiring a full system reboot.",
            defensePlaybook: [
                "Process Triage: Use targeted pkill commands (pkill WallpaperSequoiaExtension) to refresh hung GUI extensions cleanly without terminating user sessions.",
                "Activity Monitor Audits: Routinely audit Activity Monitor memory pressure to detect background memory leaks before swap thrashing occurs."
            ],
            containment: "Standard macOS system diagnostics within userland permissions.",
            credit: "Diagnostic investigation and screenshot by Andrew Van Ek. Technical summary compiled with Google DeepMind Antigravity AI."
        },
        {
            id: "autocad-support",
            title: "Autodesk AutoCAD Licensing: Support Escalation & Expiration Mismatch",
            category: "media",
            categoryLabel: "Enterprise Licensing & IT Support",
            badgeClass: "badge-info",
            image: "images/gallery/autocad-license-expiration-mismatch.png",
            thumb: "images/gallery/autocad-license-expiration-mismatch.png",
            tags: ["AutoCAD", "Autodesk Support", "License Mismatch", "IT Administration", "Vendor Escalation"],
            summary: "Documenting vendor support escalation: resolving an AutoCAD for Mac subscription expiration modal that contradicted an active license expiring Feb 2027.",
            sandboxObservation: "Andrew encountered a classic enterprise licensing mismatch: AutoCAD for Mac blocked application access with a modal stating 'Your subscription has expired', while the Autodesk Account management portal verified an active educational subscription valid through February 25, 2027. Andrew documented the discrepancy and worked through vendor support channels to reconcile token validation.",
            technicalBreakdown: "Enterprise CAD software validates licensing tokens via periodic background OAuth handshakes with Autodesk Cloud. When cached local token stores (AdskLicensing) desynchronize from cloud subscription databases, local clients report false expiration states until credentials are refreshed or re-authenticated.",
            defensePlaybook: [
                "Vendor Support Documentation: Maintain screenshot proof of valid portal entitlements when escalating licensing defects to enterprise vendors.",
                "Token Cache Reset: Clear corrupt local license state (deleting cached LGS.data and AdskLicensingService tokens) to force a clean server-side handshake."
            ],
            containment: "Administered within official Autodesk enterprise and university subscription portals.",
            credit: "Issue identification, vendor coordination, and capture by Andrew Van Ek. Case study notes with Google DeepMind Antigravity AI."
        },
        // Academic Workflow & Blackboard Single Sign-On Automation
        {
            id: "blackboard-01-cas-login",
            title: "Blackboard SSO Automation: GVSU Central Authentication Service (CAS) Entry",
            category: "media",
            categoryLabel: "Academic Workflow & SSO Automation",
            badgeClass: "badge-info",
            image: "images/gallery/blackboard-automation/01-gvsu-cas-username.png",
            thumb: "images/gallery/blackboard-automation/01-gvsu-cas-username-thumb.jpg",
            tags: ["Blackboard", "macOS Automation", "GVSU CAS", "Single Sign-On", "Safari Scripting"],
            summary: "Initial institutional login screen for Grand Valley State University CAS, the entry point targeted by the macOS desktop launch automation.",
            sandboxObservation: "Initial state of the GVSU Central Authentication Service portal displaying the username input field and 'Keep me signed in' checkbox. This screen represented the first target of the automated Zsh and AppleScript launcher.",
            technicalBreakdown: "The CAS portal serves as the primary SAML/OAuth identity gateway for university services. Scripted navigation via '/usr/bin/open -b com.apple.Safari https://my.gvsu.edu/' reliably triggers this page, but automated keystroke injection was rejected after security evaluations revealed window-focus drift risks.",
            defensePlaybook: [
                "Focus Isolation: Never inject unvalidated authentication keystrokes via desktop GUI automation; active focus changes can leak credentials into unintended windows.",
                "Keychain Integration: Delegate initial credential recall to native system keychains rather than script variables."
            ],
            containment: "GVSU official identity provider accessed inside sandboxed Safari processes.",
            credit: "Automation research, UI capture, and security architecture by Andrew Van Ek. Technical documentation co-authored with Google DeepMind Antigravity AI."
        },
        {
            id: "blackboard-02-password-entry",
            title: "Blackboard SSO Automation: Identity Provider Password Authentication",
            category: "media",
            categoryLabel: "Academic Workflow & SSO Automation",
            badgeClass: "badge-info",
            image: "images/gallery/blackboard-automation/02-gvsu-password-entry.png",
            thumb: "images/gallery/blackboard-automation/02-gvsu-password-entry-thumb.jpg",
            tags: ["Blackboard", "Password Authentication", "Credential Isolation", "Apple Events"],
            summary: "Second-stage identity provider password challenge during the multi-tier university authentication handoff.",
            sandboxObservation: "The secondary federated authentication prompt displaying 'Verify with your password'. Testing revealed coordinate-based clicking was brittle due to dynamic window offsets and browser viewport changes.",
            technicalBreakdown: "Web forms rendered inside Safari WebContent processes are decoupled from the native macOS accessibility tree, preventing standard System Events accessibility queries from reliably targeting submit buttons without full DOM access.",
            defensePlaybook: [
                "Zero Credential Hardcoding: Eliminate all plaintext password storage in shell scripts, environment variables, or AppleScript files.",
                "Native Password Managers: Allow Safari Password AutoFill backed by Secure Enclave encryption to handle form submission."
            ],
            containment: "Protected by university enterprise SSO and encrypted TLS session negotiation.",
            credit: "Automation testing, security analysis, and UI capture by Andrew Van Ek. Technical documentation co-authored with Google DeepMind Antigravity AI."
        },
        {
            id: "blackboard-03-touch-id-prompt",
            title: "Blackboard SSO Automation: Biometric Touch ID & FIDO2 Challenge",
            category: "media",
            categoryLabel: "Academic Workflow & SSO Automation",
            badgeClass: "badge-info",
            image: "images/gallery/blackboard-automation/03-touch-id-biometric-prompt.png",
            thumb: "images/gallery/blackboard-automation/03-touch-id-biometric-prompt-thumb.jpg",
            tags: ["Touch ID", "WebAuthn", "Biometric Authentication", "FIDO2", "macOS Security"],
            summary: "Primary passwordless biometric challenge requesting Touch ID or hardware security key verification for university access.",
            sandboxObservation: "GVSU verification modal prompting '@vaneka' for biometric verification ('Windows Hello, Touch ID, etc.'). The launcher was redesigned to yield execution control specifically for user Touch ID confirmation.",
            technicalBreakdown: "WebAuthn / FIDO2 authentication binds cryptographic keypairs directly to the macOS Secure Enclave. Biometric Touch ID prompt execution requires physical capacitive presence, making full robotic automation intentionally impossible by security design.",
            defensePlaybook: [
                "Biometric Boundaries: Embrace biometric verification gates rather than attempting to circumvent hardware-enforced presence requirements.",
                "Programmatic Delay Windows: Allow generous user interaction pauses in automation scripts to permit seamless Touch ID tapping."
            ],
            containment: "Enforced by hardware-level Apple Secure Enclave coprocessor and WebAuthn standards.",
            credit: "Biometric integration analysis and capture by Andrew Van Ek. Technical documentation co-authored with Google DeepMind Antigravity AI."
        },
        {
            id: "blackboard-04-mfa-method-select",
            title: "Blackboard SSO Automation: Multi-Factor Authentication (MFA) Fallback Menu",
            category: "media",
            categoryLabel: "Academic Workflow & SSO Automation",
            badgeClass: "badge-info",
            image: "images/gallery/blackboard-automation/04-mfa-security-method-select.png",
            thumb: "images/gallery/blackboard-automation/04-mfa-security-method-select-thumb.jpg",
            tags: ["MFA", "Okta Verify", "Google Authenticator", "SMS 2FA", "Identity Security"],
            summary: "Multi-channel MFA selector menu surfacing Okta Verify push notifications, Google Authenticator codes, SMS, and security keys.",
            sandboxObservation: "Fallback verification options menu presented when primary Touch ID is bypassed. The initial AppleScript attempted to query accessibility labels such as 'Verify with something else' to reach SMS options.",
            technicalBreakdown: "Modern Single Sign-On portals dynamically render fallback options in asynchronous JavaScript frames. Querying accessibility elements across asynchronous transitions frequently resulted in timeout exceptions under System Events.",
            defensePlaybook: [
                "Multi-Channel Verification: Maintain active secondary MFA authenticators (TOTP, hardware tokens) to prevent account lockout when primary biometrics fail.",
                "Graceful Script Fallbacks: Ensure desktop automation gracefully halts when out-of-band MFA challenges are encountered."
            ],
            containment: "Multi-factor authentication handled across verified enterprise mobile channels.",
            credit: "Authentication flow auditing and capture by Andrew Van Ek. Technical documentation co-authored with Google DeepMind Antigravity AI."
        },
        {
            id: "blackboard-05-sms-code-dispatch",
            title: "Blackboard SSO Automation: Carrier SMS Transmission Dispatch",
            category: "media",
            categoryLabel: "Academic Workflow & SSO Automation",
            badgeClass: "badge-info",
            image: "images/gallery/blackboard-automation/05-sms-code-dispatch.png",
            thumb: "images/gallery/blackboard-automation/05-sms-code-dispatch-thumb.jpg",
            tags: ["SMS 2FA", "Out-of-Band Auth", "Carrier Messaging", "Two-Factor Verification"],
            summary: "SMS text dispatch confirmation screen requesting permission to transmit a one-time verification passcode over cellular networks.",
            sandboxObservation: "GVSU verification dialog displaying 'Send a code via SMS to +1 xxx-xxx' with action button 'Receive a code via SMS'. Coordinate-based click scripts proved unreliable due to dynamic banner messages shifting button offsets.",
            technicalBreakdown: "Carrier-dispatched SMS serves as an out-of-band verification channel. Automating the click without user verification risks triggering cellular rate-limiting or carrier messaging fees during repeated script execution.",
            defensePlaybook: [
                "Rate Limit Awareness: Avoid rapid automated polling on SMS endpoints to prevent telecommunication provider throttling and temporary account locks.",
                "Push vs. SMS: Prioritize cryptographically signed push notifications (Okta / WebAuthn) over unencrypted carrier SMS."
            ],
            containment: "Out-of-band cellular transmission secured with one-time validity windows.",
            credit: "UI interaction testing and capture by Andrew Van Ek. Technical documentation co-authored with Google DeepMind Antigravity AI."
        },
        {
            id: "blackboard-06-sms-code-entry",
            title: "Blackboard SSO Automation: One-Time Passcode (OTP) Code Entry",
            category: "media",
            categoryLabel: "Academic Workflow & SSO Automation",
            badgeClass: "badge-info",
            image: "images/gallery/blackboard-automation/06-sms-code-entry.png",
            thumb: "images/gallery/blackboard-automation/06-sms-code-entry-thumb.jpg",
            tags: ["OTP Entry", "Two-Factor Authentication", "Input Verification", "Session Security"],
            summary: "Verification code entry prompt accepting the six-digit SMS passcode received on the authenticated mobile device.",
            sandboxObservation: "The OTP entry modal presenting 'Enter Code' input field and 'Verify' submission button. This was the final hurdle in the authentication pipeline before establishing an authorized academic session.",
            technicalBreakdown: "One-Time Passcodes (OTPs) feature ephemeral 3-to-5 minute expiration lifecycles. Automating OTP retrieval from macOS Messages via AppleScript introduces permission overhead (Full Disk Access) that compromises system sandboxing.",
            defensePlaybook: [
                "Ephemeral Token Security: Never persist one-time verification codes to disk or logs.",
                "Manual User Entry: Keep the final 2FA verification step manual to ensure human intent behind session elevation."
            ],
            containment: "Time-limited, single-use authentication challenge.",
            credit: "Security verification flow and capture by Andrew Van Ek. Technical documentation co-authored with Google DeepMind Antigravity AI."
        },
        {
            id: "blackboard-07-blackboard-dashboard",
            title: "Blackboard SSO Automation: Authenticated GVSU Apps Portal & LMS Landing",
            category: "media",
            categoryLabel: "Academic Workflow & SSO Automation",
            badgeClass: "badge-info",
            image: "images/gallery/blackboard-automation/07-authenticated-apps-blackboard-landing.png",
            thumb: "images/gallery/blackboard-automation/07-authenticated-apps-blackboard-landing-thumb.jpg",
            tags: ["Blackboard Ultra", "GVSU Apps", "Single Sign-On Landing", "Safari macOS", "Academic Workflow"],
            summary: "Successfully authenticated university portal displaying direct access to Blackboard Ultra LMS, Google Drive, Banner, and academic tools.",
            sandboxObservation: "The fully loaded 'my.gvsu.edu Apps Dashboard' in Safari, highlighting the 'Bb Ultra LMS Blackboard' launch icon. The desktop automation successfully delivered the student directly to this coursework hub without stored passwords.",
            technicalBreakdown: "Once authenticated, the browser receives an encrypted session cookie scoped to '.gvsu.edu'. This grants seamless Single Sign-On (SSO) pass-through across Blackboard Ultra, Banner Self-Service, and Google Workspace without repeated credential challenges.",
            defensePlaybook: [
                "Cookie Scope Protection: Ensure institutional session cookies maintain 'Secure' and 'SameSite=Lax' flags to prevent cross-site request forgery.",
                "Automated Shortcut Value: The refined launcher saves repetitive daily URL typing and portal navigation while maintaining 100% credential isolation."
            ],
            containment: "Fully authorized university session running in Safari on macOS.",
            credit: "Workflow automation implementation and full desktop capture by Andrew Van Ek. Technical documentation co-authored with Google DeepMind Antigravity AI."
        },
        {
            id: "phone-link-setup",
            title: "Microsoft Phone Link: Cross-Device Windows 11 & Android Mobile Pairing",
            category: "media",
            categoryLabel: "Desktop & Mobile Integration",
            badgeClass: "badge-info",
            image: "images/gallery/phone-link-pairing-setup.png",
            thumb: "images/gallery/phone-link-pairing-setup-thumb.jpg",
            tags: ["Phone Link", "Windows 11", "Android Integration", "Cross-Device Sync", "Bluetooth BLE"],
            summary: "Pairing and verifying Microsoft Phone Link on Windows 11 to synchronize mobile notifications, SMS, and calls with the workstation.",
            sandboxObservation: "Windows Phone Link completion dialog announcing 'You're all set - Your mobile device is now ready to use with this PC' running on the primary workstation desktop alongside active homelab, Duino-Coin, and email windows.",
            technicalBreakdown: "Microsoft Phone Link establishes an encrypted peer connection combining local Bluetooth Low Energy (BLE) proximity handshakes with Wi-Fi local network sockets, bridging mobile telephony, SMS, and clipboard data seamlessly without third-party cloud brokers.",
            defensePlaybook: [
                "Local Transport Isolation: Verify cross-device sync communicates directly across local subnets rather than relaying plaintext data through external cloud servers.",
                "Device Unlinking Audits: Periodically review connected devices in Windows Settings to revoke access for decommissioned hardware."
            ],
            containment: "Encrypted local Bluetooth and Wi-Fi transport on secure personal workstation.",
            credit: "Cross-device workstation configuration and capture by Andrew Van Ek. Technical summary compiled with Google DeepMind Antigravity AI."
        },
        {
            id: "repair-11-hp-motherboard-battery-check",
            title: "HP Laptop: Motherboard Assembly & Internal Battery Reconnection",
            category: "hardware",
            categoryLabel: "HP Cooling Maintenance",
            badgeClass: "badge-info",
            image: "images/gallery/repairs/11-hp-motherboard-battery-check.jpg",
            thumb: "images/gallery/repairs/11-hp-motherboard-battery-check-thumb.jpg",
            tags: ["HP laptop", "Hardware Repair", "Battery Check", "Assembly", "Completed"],
            summary: "Inspecting motherboard seating, cooling pipe alignment, and battery reconnection on the HP laptop following PTM7950 application.",
            sandboxObservation: "Overhead view of the opened HP laptop showing the cleaned cooling assembly, fan header, motherboard circuitry, and battery connector securely seated in place prior to bottom cover reinstallation.",
            technicalBreakdown: "Physical inspection of internal ribbon cables, antenna leads, and battery connectors prevents pinch hazards and thermal throttling. Confirmed that the battery must be electrically connected to complete the power-on circuit on this specific HP motherboard revision.",
            defensePlaybook: [
                "Fastener Torque Management: Avoid overtightening heatsink retention screws to ensure even thermal pressure without cracking silicon dies.",
                "Boot Verification: Always verify basic POST and fan spin before fully driving case screws."
            ],
            containment: "Clean ESD-safe hardware workbench assembly.",
            credit: "Hardware repair, photography, and bench assembly by Andrew Van Ek. Documentation co-authored with Google DeepMind Antigravity AI."
        },
        {
            id: "repair-12-macbook-chassis-battery-bay",
            title: "2011 MacBook Pro: Full Chassis & Battery Bay Overview",
            category: "hardware",
            categoryLabel: "MacBook Pro Maintenance",
            badgeClass: "badge-info",
            image: "images/gallery/repairs/12-macbook-chassis-battery-bay.jpg",
            thumb: "images/gallery/repairs/12-macbook-chassis-battery-bay-thumb.jpg",
            tags: ["2011 MacBook Pro", "Unibody Chassis", "Battery Bay", "Hardware Teardown"],
            summary: "Full internal architectural layout of the 2011 unibody MacBook Pro chassis, detailing the battery compartment, hard drive bracket, and optical bay.",
            sandboxObservation: "Comprehensive internal view of the aluminum unibody enclosure with the bottom panel removed, revealing the large multi-cell lithium-polymer battery pack, SATA drive bay, SuperDrive optical unit, and main logic board.",
            technicalBreakdown: "The 2011 unibody MacBook Pro architecture utilizes tri-wing security fasteners to secure the battery pack. Understanding the proximity of the battery interface to the sensitive logic board power rails is critical to preventing accidental electrical shorts during servicing.",
            defensePlaybook: [
                "Complete Power Isolation: Disconnect the battery terminal immediately upon opening unibody MacBooks before attempting any screw removal.",
                "Non-Conductive Tooling: Exclusively utilize plastic spudgers and insulated tools near exposed board power rails."
            ],
            containment: "Physical hardware teardown in isolated bench environment.",
            credit: "Hardware disassembly and photography by Andrew Van Ek. Documentation co-authored with Google DeepMind Antigravity AI."
        },
        {
            id: "repair-13-macbook-stripped-screw-macro",
            title: "2011 MacBook Pro: Stripped Fastener & Retention Bracket Close-Up",
            category: "hardware",
            categoryLabel: "MacBook Pro Maintenance",
            badgeClass: "badge-info",
            image: "images/gallery/repairs/13-macbook-stripped-screw-macro.jpg",
            thumb: "images/gallery/repairs/13-macbook-stripped-screw-macro-thumb.jpg",
            tags: ["2011 MacBook Pro", "Stripped Screw", "Macro Forensics", "Hardware Servicing"],
            summary: "High-magnification macro capture detailing a stripped mounting fastener and the aluminum battery retention bracket.",
            sandboxObservation: "Extreme close-up showing the worn drive recess of a damaged mounting screw head securing the battery retention tab to the unibody chassis. The rounding of the fastener head illustrates the risk of incorrect driver sizing.",
            technicalBreakdown: "Consumer electronics utilize soft aluminum and zinc-plated alloy screws easily stripped by improper bit geometry (e.g. using standard Phillips #00 on Japanese Industrial Standard or proprietary tri-wing fasteners). Macro inspection confirms driver cam-out damage and informs extraction techniques (rubber-band friction extraction or micro-pliers).",
            defensePlaybook: [
                "Driver Bit Matching: Verify exact fastener head geometry (JIS vs. Phillips vs. Torx vs. Tri-point) under magnification before applying rotational torque.",
                "Cam-Out Prevention: Apply firm axial downward force to keep driver bits fully seated in shallow screw recesses."
            ],
            containment: "Physical fastener inspection on MacBook unibody chassis.",
            credit: "Macro photography and repair analysis by Andrew Van Ek. Documentation co-authored with Google DeepMind Antigravity AI."
        }
    ];

    var state = {
        currentIndex: 0,
        activeCategory: "all",
        scale: 1.0,
        panX: 0,
        panY: 0,
        isDragging: false,
        dragStartX: 0,
        dragStartY: 0,
        lastPinchDistance: 0,
        lastTapTime: 0
    };

    var categoryLabels = {
        all: "All Experiments & Samples",
        security: "Malware & Security Forensics",
        vms: "Virtual Machines & Retro OS",
        homelab: "Homelab, Cloud & Linux Fleet",
        media: "Creative Lab & Everyday Automation",
        hardware: "Hardware Repair & Maintenance"
    };

    var dom = {
        grid: document.getElementById("gallery-grid"),
        filterBtns: document.querySelectorAll(".gallery-filter-btn"),
        mobileFilterBtn: document.getElementById("gallery-mobile-filter-btn"),
        mobileFilterModal: document.getElementById("gallery-mobile-category-modal"),
        mobileFilterClose: document.getElementById("gallery-mobile-category-close"),
        mobileCategoryOptions: document.querySelectorAll(".gallery-mobile-cat-option"),
        modalOverlay: document.getElementById("gallery-modal"),
        mainImg: document.getElementById("gallery-main-img"),
        imgViewport: document.getElementById("gallery-viewport"),
        zoomSlider: document.getElementById("gallery-zoom-slider"),
        zoomVal: document.getElementById("gallery-zoom-val"),
        zoomInBtn: document.getElementById("gallery-zoom-in"),
        zoomOutBtn: document.getElementById("gallery-zoom-out"),
        zoomResetBtn: document.getElementById("gallery-zoom-reset"),
        prevBtn: document.getElementById("gallery-nav-prev"),
        nextBtn: document.getElementById("gallery-nav-next"),
        closeBtn: document.getElementById("gallery-close-btn"),
        counter: document.getElementById("gallery-counter"),
        drawerTitle: document.getElementById("gallery-drawer-title"),
        drawerCategory: document.getElementById("gallery-drawer-category"),
        drawerContent: document.getElementById("gallery-drawer-content")
    };

    function renderGrid() {
        if (!dom.grid) return;
        dom.grid.innerHTML = "";

        var filtered = galleryItems.filter(function (item) {
            return state.activeCategory === "all" || item.category === state.activeCategory;
        });

        filtered.forEach(function (item) {
            var card = document.createElement("article");
            card.className = "gallery-card";
            card.id = "card-" + item.id;
            card.setAttribute("role", "button");
            card.setAttribute("tabindex", "0");
            card.setAttribute("aria-label", "View " + item.title + " in full resolution");

            var tagsHtml = item.tags.map(function (t) {
                return '<span class="gallery-tag-chip">' + t + '</span>';
            }).join("");

            card.innerHTML = [
                '<div class="gallery-card-thumb-wrap">',
                '  <img class="gallery-card-thumb" src="' + item.thumb + '" alt="' + item.title + '" loading="lazy">',
                '  <span class="gallery-card-badge ' + item.badgeClass + '">' + item.categoryLabel + '</span>',
                '  <div class="gallery-card-overlay-hint">',
                '    <span>&#128269; Click to Inspect</span>',
                '  </div>',
                '</div>',
                '<div class="gallery-card-body">',
                '  <h3 class="gallery-card-title">' + item.title + '</h3>',
                '  <p class="gallery-card-desc">' + item.summary + '</p>',
                '  <div class="gallery-card-tags">' + tagsHtml + '</div>',
                '  <div class="gallery-card-action">',
                '    <span>Open Sandbox Analysis &rarr;</span>',
                '    <small>1080p High-Res</small>',
                '  </div>',
                '</div>'
            ].join("");

            var originalIndex = galleryItems.indexOf(item);
            card.addEventListener("click", function () {
                openLightbox(originalIndex);
            });
            card.addEventListener("keydown", function (e) {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openLightbox(originalIndex);
                }
            });

            dom.grid.appendChild(card);
        });
    }

    function updateCategoryUI() {
        // Desktop buttons
        if (dom.filterBtns) {
            dom.filterBtns.forEach(function (btn) {
                if (btn.getAttribute("data-category") === state.activeCategory) {
                    btn.classList.add("active");
                } else {
                    btn.classList.remove("active");
                }
            });
        }

        // Mobile button label
        if (dom.mobileFilterBtn) {
            var label = categoryLabels[state.activeCategory] || "Filter Categories";
            dom.mobileFilterBtn.innerHTML = '<span>&#9881; Filter: <strong>' + label + '</strong></span> <span class="filter-arrow">&#9662;</span>';
        }

        // Mobile modal options
        if (dom.mobileCategoryOptions) {
            dom.mobileCategoryOptions.forEach(function (opt) {
                if (opt.getAttribute("data-category") === state.activeCategory) {
                    opt.classList.add("active");
                } else {
                    opt.classList.remove("active");
                }
            });
        }

        renderGrid();
    }

    function openMobileCategoryModal() {
        if (!dom.mobileFilterModal) return;
        dom.mobileFilterModal.classList.add("active");
        dom.mobileFilterModal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }

    function closeMobileCategoryModal() {
        if (!dom.mobileFilterModal) return;
        dom.mobileFilterModal.classList.remove("active");
        dom.mobileFilterModal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }

    function updateTransform() {
        if (!dom.mainImg) return;
        dom.mainImg.style.transform = "translate(" + state.panX + "px, " + state.panY + "px) scale(" + state.scale + ")";

        if (dom.zoomSlider) {
            dom.zoomSlider.value = state.scale;
        }
        if (dom.zoomVal) {
            dom.zoomVal.textContent = Math.round(state.scale * 100) + "%";
        }
        if (dom.imgViewport) {
            if (state.scale > 1.05) {
                dom.imgViewport.classList.add("is-zoomed");
            } else {
                dom.imgViewport.classList.remove("is-zoomed", "is-panning");
            }
        }
    }

    function setZoom(newScale, animate) {
        state.scale = Math.max(1.0, Math.min(4.0, newScale));
        if (state.scale <= 1.0) {
            state.panX = 0;
            state.panY = 0;
        }
        if (dom.mainImg) {
            dom.mainImg.style.transition = animate ? "transform 0.18s ease-out" : "none";
        }
        updateTransform();
    }

    function resetZoom() {
        state.isDragging = false;
        if (dom.imgViewport) dom.imgViewport.classList.remove("is-panning");
        setZoom(1.0, true);
    }

    function openLightbox(index) {
        state.currentIndex = index;
        resetZoom();
        populateDrawer(index);

        var item = galleryItems[index];
        if (item && window.history && window.history.replaceState) {
            window.history.replaceState(null, null, "#" + item.id);
        }

        if (dom.modalOverlay) {
            dom.modalOverlay.classList.add("active");
            dom.modalOverlay.setAttribute("aria-hidden", "false");
            document.body.style.overflow = "hidden";
        }
    }

    function closeLightbox() {
        if (dom.modalOverlay) {
            dom.modalOverlay.classList.remove("active");
            dom.modalOverlay.setAttribute("aria-hidden", "true");
            document.body.style.overflow = "";
        }
        if (window.history && window.history.replaceState) {
            window.history.replaceState(null, null, window.location.pathname);
        }
        resetZoom();
    }

    function populateDrawer(index) {
        var item = galleryItems[index];
        if (!item) return;

        if (dom.mainImg) {
            dom.mainImg.src = item.image;
            dom.mainImg.alt = item.title;
        }
        if (dom.counter) {
            dom.counter.textContent = "Sample " + (index + 1) + " of " + galleryItems.length;
        }
        if (dom.drawerTitle) {
            dom.drawerTitle.textContent = item.title;
        }
        if (dom.drawerCategory) {
            dom.drawerCategory.textContent = item.categoryLabel;
        }

        var defenseListHtml = item.defensePlaybook.map(function (d) {
            return "<li>" + d + "</li>";
        }).join("");

        if (dom.drawerContent) {
            dom.drawerContent.innerHTML = [
                '<div class="gallery-drawer-section section-sandbox">',
                '  <h3><span class="section-icon">&#128300;</span> What Happened on the Workbench</h3>',
                '  <p>' + item.sandboxObservation + '</p>',
                '</div>',
                '<div class="gallery-drawer-section">',
                '  <h3><span class="section-icon">&#9881;</span> ' + (item.category === "hardware" ? "What I Learned" : "Technical Mechanics &amp; Architecture") + '</h3>',
                '  <p>' + item.technicalBreakdown + '</p>',
                '</div>',
                '<div class="gallery-drawer-section section-defense">',
                '  <h3><span class="section-icon">&#128737;</span> ' + (item.category === "hardware" ? "What I Was Solving" : "Defensive Hardening &amp; Playbook") + '</h3>',
                '  <ul>' + defenseListHtml + '</ul>',
                '</div>',
                '<div class="gallery-drawer-section">',
                '  <h3><span class="section-icon">&#128274;</span> ' + (item.category === "hardware" ? "Progress &amp; Documented Outcome" : "Containment &amp; Testing Discipline") + '</h3>',
                '  <p>' + item.containment + '</p>',
                '</div>',
                '<div class="gallery-credit-box">',
                '  <strong>&#10024; Co-Authored AI Analysis:</strong> ' + item.credit,
                '</div>'
            ].join("");
        }

        // Reinitialize tech term analogy tooltips for dynamically injected terms
        if (typeof window.initTechAnalogies === "function") {
            window.initTechAnalogies();
        }
    }

    function nextItem() {
        var newIndex = (state.currentIndex + 1) % galleryItems.length;
        openLightbox(newIndex);
    }

    function prevItem() {
        var newIndex = (state.currentIndex - 1 + galleryItems.length) % galleryItems.length;
        openLightbox(newIndex);
    }

    function checkInitialHash() {
        if (window.location.hash) {
            var hash = window.location.hash.replace("#", "").trim().toLowerCase();
            for (var i = 0; i < galleryItems.length; i++) {
                if (galleryItems[i].id.toLowerCase() === hash) {
                    // Switch category if needed so it is visible
                    if (state.activeCategory !== "all" && galleryItems[i].category !== state.activeCategory) {
                        state.activeCategory = "all";
                        updateCategoryUI();
                    }
                    openLightbox(i);
                    break;
                }
            }
        }
    }

    function initEvents() {
        // Desktop Filter Buttons
        if (dom.filterBtns) {
            dom.filterBtns.forEach(function (btn) {
                btn.addEventListener("click", function () {
                    state.activeCategory = btn.getAttribute("data-category") || "all";
                    updateCategoryUI();
                });
            });
        }

        // Mobile Filter Overlay Button
        if (dom.mobileFilterBtn) {
            dom.mobileFilterBtn.addEventListener("click", openMobileCategoryModal);
        }
        if (dom.mobileFilterClose) {
            dom.mobileFilterClose.addEventListener("click", closeMobileCategoryModal);
        }
        if (dom.mobileFilterModal) {
            dom.mobileFilterModal.addEventListener("click", function (e) {
                if (e.target === dom.mobileFilterModal) {
                    closeMobileCategoryModal();
                }
            });
        }
        if (dom.mobileCategoryOptions) {
            dom.mobileCategoryOptions.forEach(function (opt) {
                opt.addEventListener("click", function () {
                    state.activeCategory = opt.getAttribute("data-category") || "all";
                    updateCategoryUI();
                    closeMobileCategoryModal();
                });
            });
        }

        // Lightbox Navigation
        if (dom.nextBtn) dom.nextBtn.addEventListener("click", nextItem);
        if (dom.prevBtn) dom.prevBtn.addEventListener("click", prevItem);
        if (dom.closeBtn) dom.closeBtn.addEventListener("click", closeLightbox);

        // Click on backdrop outside wrapper to close
        if (dom.modalOverlay) {
            dom.modalOverlay.addEventListener("click", function (e) {
                if (e.target === dom.modalOverlay) {
                    closeLightbox();
                }
            });
        }

        // Zoom Controls
        if (dom.zoomInBtn) {
            dom.zoomInBtn.addEventListener("click", function () {
                setZoom(state.scale + 0.35, true);
            });
        }
        if (dom.zoomOutBtn) {
            dom.zoomOutBtn.addEventListener("click", function () {
                setZoom(state.scale - 0.35, true);
            });
        }
        if (dom.zoomResetBtn) {
            dom.zoomResetBtn.addEventListener("click", resetZoom);
        }
        if (dom.zoomSlider) {
            dom.zoomSlider.addEventListener("input", function (e) {
                setZoom(parseFloat(e.target.value), false);
            });
        }

        // Prevent native HTML5 image drag on main image
        if (dom.mainImg) {
            dom.mainImg.setAttribute("draggable", "false");
            dom.mainImg.addEventListener("dragstart", function (e) {
                e.preventDefault();
                return false;
            });
        }

        // Mouse Wheel Zoom & Drag Panning
        if (dom.imgViewport) {
            // Prevent browser native drag-and-drop ghost image
            dom.imgViewport.addEventListener("dragstart", function (e) {
                e.preventDefault();
                return false;
            });

            dom.imgViewport.addEventListener("wheel", function (e) {
                e.preventDefault();
                var delta = e.deltaY < 0 ? 0.25 : -0.25;
                setZoom(state.scale + delta, false);
            }, { passive: false });

            // Mouse Drag Panning
            dom.imgViewport.addEventListener("mousedown", function (e) {
                if (state.scale <= 1.0) return;
                // Only initiate drag with primary (left) mouse button
                if (e.button !== 0) return;
                e.preventDefault(); // Prevents browser image drag-and-drop and text selection
                state.isDragging = true;
                state.dragStartX = e.clientX - state.panX;
                state.dragStartY = e.clientY - state.panY;
                dom.imgViewport.classList.add("is-panning");
            });

            window.addEventListener("mousemove", function (e) {
                if (!state.isDragging) return;
                // Safety guard: if primary mouse button was released outside the window or during an interrupted drag,
                // e.buttons will be 0. Cleanly terminate dragging so the image doesn't stay attached to the cursor.
                if ((e.buttons & 1) === 0) {
                    state.isDragging = false;
                    if (dom.imgViewport) dom.imgViewport.classList.remove("is-panning");
                    return;
                }
                state.panX = e.clientX - state.dragStartX;
                state.panY = e.clientY - state.dragStartY;
                updateTransform();
            });

            window.addEventListener("mouseup", function () {
                if (state.isDragging) {
                    state.isDragging = false;
                    if (dom.imgViewport) dom.imgViewport.classList.remove("is-panning");
                }
            });

            window.addEventListener("blur", function () {
                if (state.isDragging) {
                    state.isDragging = false;
                    if (dom.imgViewport) dom.imgViewport.classList.remove("is-panning");
                }
            });

            window.addEventListener("dragend", function () {
                if (state.isDragging) {
                    state.isDragging = false;
                    if (dom.imgViewport) dom.imgViewport.classList.remove("is-panning");
                }
            });

            // Touch Pinch-to-Zoom & Pan
            dom.imgViewport.addEventListener("touchstart", function (e) {
                if (e.touches.length === 2) {
                    var dx = e.touches[0].clientX - e.touches[1].clientX;
                    var dy = e.touches[0].clientY - e.touches[1].clientY;
                    state.lastPinchDistance = Math.hypot(dx, dy);
                } else if (e.touches.length === 1) {
                    // Check for double tap
                    var now = Date.now();
                    if (now - state.lastTapTime < 300) {
                        e.preventDefault();
                        if (state.scale > 1.2) {
                            resetZoom();
                        } else {
                            setZoom(2.2, true);
                        }
                    }
                    state.lastTapTime = now;

                    if (state.scale > 1.0) {
                        state.isDragging = true;
                        state.dragStartX = e.touches[0].clientX - state.panX;
                        state.dragStartY = e.touches[0].clientY - state.panY;
                    }
                }
            }, { passive: false });

            dom.imgViewport.addEventListener("touchmove", function (e) {
                if (e.touches.length === 2) {
                    e.preventDefault();
                    var dx = e.touches[0].clientX - e.touches[1].clientX;
                    var dy = e.touches[0].clientY - e.touches[1].clientY;
                    var dist = Math.hypot(dx, dy);
                    if (state.lastPinchDistance > 0) {
                        var factor = dist / state.lastPinchDistance;
                        setZoom(state.scale * factor, false);
                    }
                    state.lastPinchDistance = dist;
                } else if (e.touches.length === 1 && state.isDragging && state.scale > 1.0) {
                    e.preventDefault();
                    state.panX = e.touches[0].clientX - state.dragStartX;
                    state.panY = e.touches[0].clientY - state.dragStartY;
                    updateTransform();
                }
            }, { passive: false });

            dom.imgViewport.addEventListener("touchend", function (e) {
                if (e.touches.length < 2) {
                    state.lastPinchDistance = 0;
                }
                if (e.touches.length === 0) {
                    state.isDragging = false;
                }
            });
        }

        // Global Keyboard Navigation
        window.addEventListener("keydown", function (e) {
            if (!dom.modalOverlay || !dom.modalOverlay.classList.contains("active")) return;

            if (e.key === "Escape") {
                closeLightbox();
            } else if (e.key === "ArrowRight") {
                nextItem();
            } else if (e.key === "ArrowLeft") {
                prevItem();
            } else if (e.key === "+" || e.key === "=") {
                setZoom(state.scale + 0.35, true);
            } else if (e.key === "-") {
                setZoom(state.scale - 0.35, true);
            } else if (e.key === "0") {
                resetZoom();
            }
        });

        // Listen for popstate / hashchange
        window.addEventListener("hashchange", checkInitialHash);
    }

    function init() {
        updateCategoryUI();
        initEvents();
        checkInitialHash();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
