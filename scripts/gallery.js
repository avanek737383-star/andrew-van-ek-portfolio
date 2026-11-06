/**
 * Visual Gallery & Homelab Showcase Script
 * Author: Andrew Van Ek (with Google DeepMind Antigravity AI pair programming)
 *
 * Features:
 * - 117 Workbench Captures across 6 Curated Categories
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
{
            id: "anydesk-vnc-viewer-comparison",
            title: "Remote desktop: comparing VNC viewers through AnyDesk",
            category: "homelab",
            categoryLabel: "Workstations & Troubleshooting",
            badgeClass: "badge-info",
            image: "images/gallery/approved3/anydesk-vnc-viewer-comparison.png",
            thumb: "images/gallery/approved3/anydesk-vnc-viewer-comparison-thumb.jpg",
            tags: [
                        "Homelab"
            ],
            summary: "An AnyDesk session shows a Linux desktop with a Codex terminal discussing a frozen image and alternatives including RealVNC Viewer, UltraVNC Viewer, macOS Screen Sharing, and TigerVNC.",
            sandboxObservation: "An AnyDesk session shows a Linux desktop with a Codex terminal discussing a frozen image and alternatives including RealVNC Viewer, UltraVNC Viewer, macOS Screen Sharing, and TigerVNC.",
            technicalBreakdown: "A remote desktop troubleshooting discussion with several viewer options on screen.",
            defensePlaybook: [
                        "Original filename: B019249__alt viewerez_thru_anydex.png"
            ],
            playbookHeading: "Source Capture",
            outcomeHeading: "What This Capture Establishes",
            containment: "The capture shows suggestions, without a subsequent viewer test or confirmed resolution.",
            credit: "Original capture by Andrew Van Ek. Captions and gallery integration by OpenAI Codex; based on the image and original filename. General security background is linked where used."
},
{
            id: "xp-butterfly-desktop",
            title: "Windows XP: butterflies over the desktop",
            category: "security",
            categoryLabel: "XP VM Experiments",
            badgeClass: "badge-info",
            image: "images/gallery/approved3/xp-butterfly-desktop.png",
            thumb: "images/gallery/approved3/xp-butterfly-desktop-thumb.jpg",
            tags: [
                        "Windows XP"
            ],
            summary: "Butterfly graphics appear over an Explorer window and Windows Components Wizard in a running Windows XP VirtualBox VM.",
            sandboxObservation: "Butterfly graphics appear over an Explorer window and Windows Components Wizard in a running Windows XP VirtualBox VM.",
            technicalBreakdown: "The filename labels this a malware/virus experiment. The visible effect is a butterfly overlay; the image alone does not identify the executable or establish malicious behavior.",
            defensePlaybook: [
                        "Original filename: ButterflyOnDesktopMalwareVirusXP.png"
            ],
            playbookHeading: "Source Capture",
            outcomeHeading: "What This Capture Establishes",
            containment: "A single frame records the visual effect; persistence and other behavior are not established.",
            credit: "Original capture by Andrew Van Ek. Captions and gallery integration by OpenAI Codex; based on the image and original filename. General security background is linked where used."
},
{
            id: "xp-coronavirus-ransom-note",
            title: "CoronaVirus: ransom message in an XP VM",
            category: "security",
            categoryLabel: "XP VM Experiments",
            badgeClass: "badge-info",
            image: "images/gallery/approved3/xp-coronavirus-ransom-note.png",
            thumb: "images/gallery/approved3/xp-coronavirus-ransom-note-thumb.jpg",
            tags: [
                        "Windows XP"
            ],
            summary: "A running Windows XP VirtualBox VM displays a message claiming that all files have been encrypted, with payment/contact instructions and Explorer open beside it.",
            sandboxObservation: "A running Windows XP VirtualBox VM displays a message claiming that all files have been encrypted, with payment/contact instructions and Explorer open beside it.",
            technicalBreakdown: "General background: ransomware can encrypt files or block access while demanding payment. The note is an on-screen claim rather than independent proof of encryption. <a href=\"https://support.microsoft.com/en-us/windows/security/protect-your-pc-from-ransomware\" target=\"_blank\" rel=\"noopener noreferrer\">Microsoft: ransomware background</a>.",
            defensePlaybook: [
                        "Original filename: CoronaVirus.png"
            ],
            playbookHeading: "Source Capture",
            outcomeHeading: "What This Capture Establishes",
            containment: "The screenshot records the ransom message, without a file-content comparison or recovery result.",
            credit: "Original capture by Andrew Van Ek. Captions and gallery integration by OpenAI Codex; based on the image and original filename. General security background is linked where used."
},
{
            id: "xp-coronavirus-explorer-restriction",
            title: "CoronaVirus follow-up: Explorer restriction message",
            category: "security",
            categoryLabel: "XP VM Experiments",
            badgeClass: "badge-info",
            image: "images/gallery/approved3/xp-coronavirus-explorer-restriction.png",
            thumb: "images/gallery/approved3/xp-coronavirus-explorer-restriction-thumb.jpg",
            tags: [
                        "Windows XP"
            ],
            summary: "Windows XP Explorer is open in VirtualBox with a Restrictions dialog saying the operation was cancelled due to restrictions in effect on the computer.",
            sandboxObservation: "Windows XP Explorer is open in VirtualBox with a Restrictions dialog saying the operation was cancelled due to restrictions in effect on the computer.",
            technicalBreakdown: "The filename connects this capture to the CoronaVirus experiment and an Explorer closing issue. The dialog documents a restriction, without showing its underlying cause.",
            defensePlaybook: [
                        "Original filename: CoronaVirus2FileExplroerCloseIssue.png"
            ],
            playbookHeading: "Source Capture",
            outcomeHeading: "What This Capture Establishes",
            containment: "A still image cannot establish whether the window could subsequently be closed.",
            credit: "Original capture by Andrew Van Ek. Captions and gallery integration by OpenAI Codex; based on the image and original filename. General security background is linked where used."
},
{
            id: "smb-removable-volume-ntfs-discussion",
            title: "SMB troubleshooting: discussing a removable USB volume",
            category: "homelab",
            categoryLabel: "Workstations & Troubleshooting",
            badgeClass: "badge-info",
            image: "images/gallery/approved3/smb-removable-volume-ntfs-discussion.png",
            thumb: "images/gallery/approved3/smb-removable-volume-ntfs-discussion-thumb.jpg",
            tags: [
                        "Homelab"
            ],
            summary: "A Codex conversation discusses a Windows SMB issue involving a removable I: volume and proposes an NTFS reformat, with confirmation requested before erasing the drive.",
            sandboxObservation: "A Codex conversation discusses a Windows SMB issue involving a removable I: volume and proposes an NTFS reformat, with confirmation requested before erasing the drive.",
            technicalBreakdown: "The discussion treats removable-volume handling as a possible explanation and explicitly says NTFS is not guaranteed to resolve it.",
            defensePlaybook: [
                        "Original filename: criticalthinkingonsmbproject.png"
            ],
            playbookHeading: "Source Capture",
            outcomeHeading: "What This Capture Establishes",
            containment: "This capture documents a proposal, without a completed format or successful share test.",
            credit: "Original capture by Andrew Van Ek. Captions and gallery integration by OpenAI Codex; based on the image and original filename. General security background is linked where used."
},
{
            id: "smb-local-share-diagnostic-test",
            title: "SMB troubleshooting: a local share comparison test",
            category: "homelab",
            categoryLabel: "Workstations & Troubleshooting",
            badgeClass: "badge-info",
            image: "images/gallery/approved3/smb-local-share-diagnostic-test.png",
            thumb: "images/gallery/approved3/smb-local-share-diagnostic-test-thumb.jpg",
            tags: [
                        "Homelab"
            ],
            summary: "A terminal shows ACL and share checks for a temporary local C: share, a macOS mount_smbfs command, the user reporting that it worked, and cleanup commands with exit code 0.",
            sandboxObservation: "A terminal shows ACL and share checks for a temporary local C: share, a macOS mount_smbfs command, the user reporting that it worked, and cleanup commands with exit code 0.",
            technicalBreakdown: "The visible conversation uses a local-disk share as a comparison for the removable-volume problem. It records a successful test report for the temporary share.",
            defensePlaybook: [
                        "Original filename: evenmoretroubleshootinglateronSMBProj.png"
            ],
            playbookHeading: "Source Capture",
            outcomeHeading: "What This Capture Establishes",
            containment: "The result shown concerns the temporary local share; a final fix for the original USB share is not pictured.",
            credit: "Original capture by Andrew Van Ek. Captions and gallery integration by OpenAI Codex; based on the image and original filename. General security background is linked where used."
},
{
            id: "xp-fake-bsod-browser-popup",
            title: "XP browser experiment: fake BSOD and support popup",
            category: "security",
            categoryLabel: "XP VM Experiments",
            badgeClass: "badge-info",
            image: "images/gallery/approved3/xp-fake-bsod-browser-popup.png",
            thumb: "images/gallery/approved3/xp-fake-bsod-browser-popup-thumb.jpg",
            tags: [
                        "Windows XP"
            ],
            summary: "Internet Explorer in an XP VirtualBox VM shows a blue error-style page and a warning popup containing a support phone number.",
            sandboxObservation: "Internet Explorer in an XP VirtualBox VM shows a blue error-style page and a warning popup containing a support phone number.",
            technicalBreakdown: "The filename attributes this to an Enderman experiment after allowing blocked content and reports that closing the window and popup did not work. General background: scareware uses alarming warnings to pressure users. <a href=\"https://support.microsoft.com/en-us/edge/prevent-online-scams-with-the-scareware-blocker-in-microsoft-edge\" target=\"_blank\" rel=\"noopener noreferrer\">Microsoft: scareware background</a>.",
            defensePlaybook: [
                        "Original filename: FakeBSODAndPopupAfterAllowingMicrosoftXPEXPLORERBlockedContent(Enderman)AndClosingExplorerWindowandPopUpDoesNotWork.png"
            ],
            playbookHeading: "Source Capture",
            outcomeHeading: "What This Capture Establishes",
            containment: "The blue page is visible inside the browser. It is not evidence of an actual operating-system crash.",
            credit: "Original capture by Andrew Van Ek. Captions and gallery integration by OpenAI Codex; based on the image and original filename. General security background is linked where used."
},
{
            id: "service-desk-triple-screen-setup",
            title: "IT service desk: late Saturday desk setup",
            category: "homelab",
            categoryLabel: "Workstations & Troubleshooting",
            badgeClass: "badge-info",
            image: "images/gallery/approved3/service-desk-triple-screen-setup.jpg",
            thumb: "images/gallery/approved3/service-desk-triple-screen-setup-thumb.jpg",
            tags: [
                        "Homelab"
            ],
            summary: "A curved service desk holds a laptop, two external monitors, a keyboard, mouse, and desk accessories.",
            sandboxObservation: "A curved service desk holds a laptop, two external monitors, a keyboard, mouse, and desk accessories.",
            technicalBreakdown: "The filename describes a late Saturday night IT service desk setup with a Mac for three screens.",
            defensePlaybook: [
                        "Original filename: itservicedesklatesaturdaynightsetupandmac_fortriplescrn.jpg"
            ],
            playbookHeading: "Source Capture",
            outcomeHeading: "What This Capture Establishes",
            containment: "The photograph documents the workstation arrangement; it does not establish the work completed during the shift.",
            credit: "Original capture by Andrew Van Ek. Captions and gallery integration by OpenAI Codex; based on the image and original filename. General security background is linked where used."
},
{
            id: "xp-krotten-dialog",
            title: "Krotten: dialog in a Windows XP VM",
            category: "security",
            categoryLabel: "XP VM Experiments",
            badgeClass: "badge-info",
            image: "images/gallery/approved3/xp-krotten-dialog.png",
            thumb: "images/gallery/approved3/xp-krotten-dialog-thumb.jpg",
            tags: [
                        "Windows XP"
            ],
            summary: "A Windows XP VirtualBox VM shows Explorer with sample icons and a dialog containing garbled text.",
            sandboxObservation: "A Windows XP VirtualBox VM shows Explorer with sample icons and a dialog containing garbled text.",
            technicalBreakdown: "The filename identifies this as Krotten. The visible evidence is the Explorer window and dialog; the text encoding prevents a reliable reading of the message.",
            defensePlaybook: [
                        "Original filename: Krotten.png"
            ],
            playbookHeading: "Source Capture",
            outcomeHeading: "What This Capture Establishes",
            containment: "The capture does not establish registry changes, encryption, or recovery.",
            credit: "Original capture by Andrew Van Ek. Captions and gallery integration by OpenAI Codex; based on the image and original filename. General security background is linked where used."
},
{
            id: "mda-monitor-startallback-desk",
            title: "Laptop and monitor desk setup",
            category: "homelab",
            categoryLabel: "Workstations & Troubleshooting",
            badgeClass: "badge-info",
            image: "images/gallery/approved3/mda-monitor-startallback-desk.jpg",
            thumb: "images/gallery/approved3/mda-monitor-startallback-desk-thumb.jpg",
            tags: [
                        "Homelab"
            ],
            summary: "A laptop and several monitors share a desk with a keyboard, mouse, headphones, and connected cables.",
            sandboxObservation: "A laptop and several monitors share a desk with a keyboard, mouse, headphones, and connected cables.",
            technicalBreakdown: "The filename mentions MDA, a monitor, and StartAllBack. The photograph shows the physical workstation arrangement.",
            defensePlaybook: [
                        "Original filename: mda w my monitor &amp; startallback.jpg"
            ],
            playbookHeading: "Source Capture",
            outcomeHeading: "What This Capture Establishes",
            containment: "No installation process or completed software configuration is documented in the photograph.",
            credit: "Original capture by Andrew Van Ek. Captions and gallery integration by OpenAI Codex; based on the image and original filename. General security background is linked where used."
},
{
            id: "messages-early-generative-ai-troubleshooting",
            title: "Messages troubleshooting: early generative AI search",
            category: "media",
            categoryLabel: "Everyday AI Exploration",
            badgeClass: "badge-info",
            image: "images/gallery/approved3/messages-early-generative-ai-troubleshooting.jpg",
            thumb: "images/gallery/approved3/messages-early-generative-ai-troubleshooting-thumb.jpg",
            tags: [
                        "AI"
            ],
            summary: "A phone Google search for a Messages sending problem displays an experimental generative AI response with possible causes and suggested troubleshooting steps.",
            sandboxObservation: "A phone Google search for a Messages sending problem displays an experimental generative AI response with possible causes and suggested troubleshooting steps.",
            technicalBreakdown: "The filename frames this as an early generative AI troubleshooting capture. It shows search output and suggestions.",
            defensePlaybook: [
                        "Original filename: messages_troubleshooting_early_gen_ai_stages1.jpg"
            ],
            playbookHeading: "Source Capture",
            outcomeHeading: "What This Capture Establishes",
            containment: "The image does not show which suggestion was tried or whether message sending was restored.",
            credit: "Original capture by Andrew Van Ek. Captions and gallery integration by OpenAI Codex; based on the image and original filename. General security background is linked where used."
},
{
            id: "andronix-process-terminated",
            title: "Andronix setup: process terminated message",
            category: "vms",
            categoryLabel: "Mobile Linux & Emulation",
            badgeClass: "badge-info",
            image: "images/gallery/approved3/andronix-process-terminated.jpg",
            thumb: "images/gallery/approved3/andronix-process-terminated-thumb.jpg",
            tags: [
                        "Mobile"
            ],
            summary: "The Andronix home screen on a phone displays a notice headed Process Completed (Signal 9) - Termux Error, above Linux Distribution and Andronix Modded OS cards.",
            sandboxObservation: "The Andronix home screen on a phone displays a notice headed Process Completed (Signal 9) - Termux Error, above Linux Distribution and Andronix Modded OS cards.",
            technicalBreakdown: "The filename describes setting up Andronix and a terminated process. This is a capture of the app and its error notice.",
            defensePlaybook: [
                        "Original filename: settingupandronixprocterminated.jpg"
            ],
            playbookHeading: "Source Capture",
            outcomeHeading: "What This Capture Establishes",
            containment: "A working Linux session or resolved setup error is not shown.",
            credit: "Original capture by Andrew Van Ek. Captions and gallery integration by OpenAI Codex; based on the image and original filename. General security background is linked where used."
},
{
            id: "limbo-mobile-windows-attempt",
            title: "Trying Windows on mobile through Limbo PC Emulator",
            category: "vms",
            categoryLabel: "Mobile Linux & Emulation",
            badgeClass: "badge-info",
            image: "images/gallery/approved3/limbo-mobile-windows-attempt.jpg",
            thumb: "images/gallery/approved3/limbo-mobile-windows-attempt-thumb.jpg",
            tags: [
                        "Mobile"
            ],
            summary: "The Limbo x86 PC Emulator configuration screen shows machine settings including CPU model EPYC and eight CPU cores.",
            sandboxObservation: "The Limbo x86 PC Emulator configuration screen shows machine settings including CPU model EPYC and eight CPU cores.",
            technicalBreakdown: "The filename describes an attempt to run Windows on a mobile device through Limbo. The image shows emulator configuration.",
            defensePlaybook: [
                        "Original filename: tryingtorunwindowsonmobilethrutheLimboPCEmu.jpg"
            ],
            playbookHeading: "Source Capture",
            outcomeHeading: "What This Capture Establishes",
            containment: "There is no Windows boot screen or completed guest startup in this capture.",
            credit: "Original capture by Andrew Van Ek. Captions and gallery integration by OpenAI Codex; based on the image and original filename. General security background is linked where used."
},
{
            id: "tv-external-display-library",
            title: "TV as an external display at the library",
            category: "homelab",
            categoryLabel: "Workstations & Troubleshooting",
            badgeClass: "badge-info",
            image: "images/gallery/approved3/tv-external-display-library.jpg",
            thumb: "images/gallery/approved3/tv-external-display-library-thumb.jpg",
            tags: [
                        "Homelab"
            ],
            summary: "A laptop sits on a library desk beneath a large display showing a purple desktop, with cables and a speaker nearby.",
            sandboxObservation: "A laptop sits on a library desk beneath a large display showing a purple desktop, with cables and a speaker nearby.",
            technicalBreakdown: "The filename describes using a TV as an external display at the library.",
            defensePlaybook: [
                        "Original filename: TV_As_EXT_Lib.jpg"
            ],
            playbookHeading: "Source Capture",
            outcomeHeading: "What This Capture Establishes",
            containment: "The photo records the display arrangement, without establishing the connection method or task outcome.",
            credit: "Original capture by Andrew Van Ek. Captions and gallery integration by OpenAI Codex; based on the image and original filename. General security background is linked where used."
},
{
            id: "ai-scam-call-advice-chat",
            title: "Exploring scam-call advice with AI",
            category: "media",
            categoryLabel: "Everyday AI Exploration",
            badgeClass: "badge-info",
            image: "images/gallery/approved3/ai-scam-call-advice-chat.png",
            thumb: "images/gallery/approved3/ai-scam-call-advice-chat-thumb.jpg",
            tags: [
                        "AI"
            ],
            summary: "A phone chat displays suggestions about spam-filter apps and carrier call-protection services, followed by a section about whether scammers can record a voice.",
            sandboxObservation: "A phone chat displays suggestions about spam-filter apps and carrier call-protection services, followed by a section about whether scammers can record a voice.",
            technicalBreakdown: "The filename describes using AI to explore how to thwart scam calls. The screenshot records advice from the chat.",
            defensePlaybook: [
                        "Original filename: usingaitofigureouthowtothwartscaamcalls.PNG"
            ],
            playbookHeading: "Source Capture",
            outcomeHeading: "What This Capture Establishes",
            containment: "It does not show any service being enabled, advice being verified, or a reduction in scam calls.",
            credit: "Original capture by Andrew Van Ek. Captions and gallery integration by OpenAI Codex; based on the image and original filename. General security background is linked where used."
},
{
            id: "xp-viralock-file-properties",
            title: "ViraLock experiment: file properties in XP",
            category: "security",
            categoryLabel: "XP VM Experiments",
            badgeClass: "badge-info",
            image: "images/gallery/approved3/xp-viralock-file-properties.png",
            thumb: "images/gallery/approved3/xp-viralock-file-properties-thumb.jpg",
            tags: [
                        "Windows XP"
            ],
            summary: "A Windows XP VirtualBox VM displays Explorer and a file Properties dialog with file type, location, size, and timestamps.",
            sandboxObservation: "A Windows XP VirtualBox VM displays Explorer and a file Properties dialog with file type, location, size, and timestamps.",
            technicalBreakdown: "The filename identifies this as a ViraLock/Enderman experiment and says the current file broke. The Properties window records file metadata rather than a direct inspection of its contents.",
            defensePlaybook: [
                        "Original filename: ViraLockEndermanBrokeCurrentFile.png"
            ],
            playbookHeading: "Source Capture",
            outcomeHeading: "What This Capture Establishes",
            containment: "The image alone cannot establish the mechanism of file damage or whether the file was later restored.",
            credit: "Original capture by Andrew Van Ek. Captions and gallery integration by OpenAI Codex; based on the image and original filename. General security background is linked where used."
},
        {
            "id": "pixel-buds-firmware-chrome-app",
            "title": "Pixel Buds: firmware maintenance through a Chrome app",
            "category": "hardware",
            "categoryLabel": "Device Updates & Chrome Apps",
            "badgeClass": "badge-info",
            "image": "images/gallery/pixel-buds-firmware-chrome-app.png",
            "tags": [
                "Pixel Buds",
                "Firmware Update",
                "Chrome App",
                "macOS"
            ],
            "summary": "Updating Pixel Buds from my Mac through an installed Chrome app—one example of my hands-on work keeping a wide variety of devices up to date.",
            "sandboxObservation": "The Pixel Buds firmware-update window is open on macOS and displays “Checking the update…” while reconnecting to the earbuds. The app window also shows an Uninstall control.",
            "technicalBreakdown": "This capture brings together device firmware maintenance and Chrome app installation: the Pixel Buds update interface is running in its own app window on the Mac.",
            "defensePlaybook": [
                "Keep a wide variety of devices current, including accessories such as earbuds.",
                "Use the Pixel Buds interface as an installed Chrome app."
            ],
            "containment": "Captured November 6, 2026. The screenshot records an update check and reconnection in progress; it does not show a completed firmware update.",
            "credit": "Original screenshot and project context by Andrew Van Ek. Captions and gallery integration by OpenAI Codex.",
            "thumb": "images/gallery/pixel-buds-firmware-chrome-app.png"
        },
        {
            "id": "blueai-side-hustle-workflow",
            "title": "BlueAI: exploring a side-hustle workflow",
            "category": "media",
            "categoryLabel": "BlueAI & Everyday Automation",
            "badgeClass": "badge-info",
            "image": "images/gallery/blueai-side-hustle-workflow.png",
            "tags": [
                "BlueAI",
                "BlueStacks Air",
                "AI Agent",
                "Side Hustle"
            ],
            "summary": "I work with BlueAI on a side-hustle project. This capture shows the BlueStacks Air environment with AI Agent mode activated.",
            "sandboxObservation": "BlueStacks Air is open on the Mac with the banner “BlueStacks Air AI Agent mode activated.” The home screen shows the app search field and installed app shortcuts.",
            "technicalBreakdown": "The screenshot documents the Android app environment used for my BlueAI work. The activated agent-mode banner is visible, while the specific task and its results are not shown.",
            "defensePlaybook": [
                "Explore a side-hustle workflow with BlueAI."
            ],
            "containment": "Captured November 6, 2026. This is a view of the working environment; no earnings or completed business outcome are documented in the image.",
            "playbookHeading": "What I Am Working On",
            "outcomeHeading": "Progress &amp; Documented Outcome",
            "credit": "Original screenshot and project context by Andrew Van Ek. Captions and gallery integration by OpenAI Codex.",
            "thumb": "images/gallery/blueai-side-hustle-workflow.png"
        },
        {
            "id": "codex-windows-xp-vm-setup",
            "title": "Codex on Windows: setting up an XP malware-testing VM",
            "category": "vms",
            "categoryLabel": "AI-Assisted Retro VM Setup",
            "badgeClass": "badge-info",
            "image": "images/gallery/codex-windows-xp-vm-setup.png",
            "tags": [
                "Codex CLI",
                "Windows XP",
                "VirtualBox",
                "Malware Lab"
            ],
            "summary": "Using ChatGPT’s Codex CLI on my Windows machine to help install and set up a Windows XP virtual machine for malware detonation and testing.",
            "sandboxObservation": "Windows XP Professional Setup is running in Oracle VirtualBox behind a Codex CLI terminal. Codex reports restarting the saved VM and shows a successful VM-start message.",
            "technicalBreakdown": "Codex is assisting with the VM setup from the Windows host. The visible terminal uses VirtualBox’s VBoxManage command-line interface to inspect and start the Windows XP VM while installation continues.",
            "defensePlaybook": [
                "Prepare a separate Windows XP VM for malware detonation and testing.",
                "Complete and verify isolation checks before using the VM for that purpose."
            ],
            "containment": "Captured November 5, 2026, during setup. The visible Codex message says desktop setup and final isolation checks are still pending. This image documents preparation, not a malware detonation or verification that containment is complete.",
            "credit": "Original screenshot and project context by Andrew Van Ek. Captions and gallery integration by OpenAI Codex.",
            "thumb": "images/gallery/codex-windows-xp-vm-setup.png"
        },
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
            technicalBreakdown: "The discussion distinguished the CPU die from its larger package and explained that the <span class=\"tech-term\" data-term=\"thermal-paste\">phase-change</span> sheet needs to be sized for the contact area. It also covered the protective liners and using a single layer rather than combining it with paste.",
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
            technicalBreakdown: "RedEye executes an aggressive background loop that renames targeted files and encrypts their contents. To thwart recovery, modern <span class=\"tech-term\" data-term=\"ransomware\">ransomware</span> families systematically execute shell commands like <code>vssadmin.exe delete shadows /all /quiet</code> to wipe out <span class=\"tech-term\" data-term=\"volume-shadow-copies\">Volume Shadow Copies</span> and disable system startup repair.",
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
            technicalBreakdown: "This is a classic police <span class=\"tech-term\" data-term=\"screen-locker\">winlocker</span> that exploits authority deception and urgency. It blocks desktop access while displaying scary legal jargon to coerce victims into sending non-refundable cryptocurrency payments. Unlike true <span class=\"tech-term\" data-term=\"ransomware\">ransomware</span>, files are often intact beneath the lock window.",
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
            technicalBreakdown: "<span class=\"tech-term\" data-term=\"forensics-disk-image\">FTK Imager</span> provides low-level hex and structural parsing of physical and logical disk images. The analysis revealed how FAT32 marks file deletion by zeroing FAT chain clusters and overwriting the first directory entry byte, whereas NTFS tracks allocations via the Master File Table (MFT) $BITMAP and record flags, allowing forensic analysts to recover data from unallocated sectors.",
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
            technicalBreakdown: "Windows XP utilizes <span class=\"tech-term\" data-term=\"rdp\">RDP</span> version 5.1 (port 3389) over TCP. Diagnosing reliable remote administration required verifying Windows Firewall exception rules with Nmap and Netcat, adjusting service session isolation handles so console applications execute within interactive desktop contexts, and disabling legacy power-saving shutoffs on USB wireless adapters to prevent sleep-induced socket drops.",
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
            technicalBreakdown: "The famous rockyou.txt wordlist contains over 14 million passwords compiled from historical leaks, including raw binary strings, extended ASCII, and ISO-8859-1 encodings that violate strict UTF-8 parsers. Security tooling requires iconv normalization or binary-safe stream processing (e.g. <span class=\"tech-term\" data-term=\"john-the-ripper\">John the Ripper</span> / Hashcat) to avoid corrupted dictionary evaluations.",
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
            technicalBreakdown: "Antigravity CLI leverages advanced agentic coding workflows powered by Gemini models with real-time streaming tokens and subagent orchestration. Operating directly within terminal environments on remote Linux nodes over <span class=\"tech-term\" data-term=\"tailscale\">Tailscale</span>, it enables conversational shell automation, configuration debugging, and Git repository reconciliation without leaving the developer console.",
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
            technicalBreakdown: "Headless X11 environments on Alpine Linux leverage lightweight display servers paired with x11vnc daemons bound strictly to the <span class=\"tech-term\" data-term=\"tailscale\">Tailscale</span> WireGuard virtual interface (100.87.81.52). Running parallel listeners with fixed virtual viewports enables adaptive client scaling: high-resolution multi-monitor desktop sessions over port 5922 and lightweight mobile/low-bandwidth sessions over port 5921 without desktop resync stalls.",
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
            technicalBreakdown: "The architecture combines a headless LM Studio API daemon managed by a systemd supervisor unit with a custom lightweight Python/HTML streaming frontend. Model weights (GLM-4-9B Q4_K_M GGUF, 6.25 GB) are pre-allocated directly into RAM at boot to eliminate cold-start latencies. Requests stream via Server-Sent Events (SSE) over an encrypted wireguard <span class=\"tech-term\" data-term=\"tailscale\">Tailscale</span> mesh without public internet port exposure.",
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
            technicalBreakdown: "Alpine Linux utilizes <span class=\"tech-term\" data-term=\"openrc\">OpenRC</span> as its init system. When Samba daemons halt due to locked file handles or interface restarts, restarting the 'samba' meta-service cleanly bounces both smbd (file sharing) and nmbd (NetBIOS name service), re-establishing SMB3 sessions over the <span class=\"tech-term\" data-term=\"tailscale\">Tailscale</span> VPN interface.",
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
            technicalBreakdown: "Modern <span class=\"tech-term\" data-term=\"mfa\">Single Sign-On</span> portals dynamically render fallback options in asynchronous JavaScript frames. Querying accessibility elements across asynchronous transitions frequently resulted in timeout exceptions under System Events.",
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
            technicalBreakdown: "Once authenticated, the browser receives an encrypted session cookie scoped to '.gvsu.edu'. This grants seamless <span class=\"tech-term\" data-term=\"mfa\">Single Sign-On</span> (SSO) pass-through across Blackboard Ultra, Banner Self-Service, and Google Workspace without repeated credential challenges.",
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
            technicalBreakdown: "Microsoft <span class=\"tech-term\" data-term=\"phone-link\">Phone Link</span> establishes an encrypted peer connection combining local Bluetooth Low Energy (BLE) proximity handshakes with Wi-Fi local network sockets, bridging mobile telephony, SMS, and clipboard data seamlessly without third-party cloud brokers.",
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
        },
        {
            id: "fishbeck-agent-troubleshooting",
            title: "IT Service Desk AI Agent: Multi-Turn Troubleshooting & Logic Recovery",
            category: "media",
            categoryLabel: "Enterprise IT & AI Workflow",
            badgeClass: "badge-info",
            image: "images/gallery/approved2/agent-troubleshooting-fishbeck-internship.png",
            thumb: "images/gallery/approved2/agent-troubleshooting-fishbeck-internship-thumb.jpg",
            tags: ["Fishbeck", "Service Desk AI", "Prompt Engineering", "IT Automation"],
            summary: "Auditing and troubleshooting multi-turn conversational recovery logic in an enterprise IT service desk AI assistant during my Fishbeck internship.",
            sandboxObservation: "AI agent troubleshooting console displaying 'First cycle 1 4 Miss #3 I\\'m still having trouble determining how to help. Let\\'s start over and try a different approach. Reset and restart.' Andrew evaluated prompt constraints and failure-recovery branches to prevent loop traps.",
            technicalBreakdown: "Conversational state machines in enterprise customer service must maintain deterministic failure fallbacks. Implementing an explicit reset cycle prevents hallucination escalation and ensures graceful handoff to human support tiers.",
            defensePlaybook: [
                                "Escalation Boundaries: Establish hard thresholds on consecutive conversational misunderstandings to trigger instant human agent routing.",
                                "State Clearing: Wipe intermediate context buffers on reset to avoid carrying corrupted entity states into new dialog sessions."
                ],
            containment: "Simulated in internal IT service desk sandbox environments.",
            credit: "Agent logic auditing and workflow analysis by Andrew Van Ek. Technical documentation co-authored with Google DeepMind Antigravity AI."
        },
        {
            id: "sysinternals-suite-reference",
            title: "Microsoft Sysinternals Suite: Cross-Platform Systems Diagnostics Cheat Sheet",
            category: "media",
            categoryLabel: "Systems Administration & Diagnostics",
            badgeClass: "badge-info",
            image: "images/gallery/approved2/sysinternals-reference-notes-macos.png",
            thumb: "images/gallery/approved2/sysinternals-reference-notes-macos-thumb.jpg",
            tags: ["Sysinternals", "Process Explorer", "Autoruns", "RAMMap", "Windows Troubleshooting"],
            summary: "Compiling a quick-reference guide covering Microsoft Sysinternals tools (Process Explorer, Autoruns, TCPView, Handle, RAMMap, Sysmon) for forensic investigation.",
            sandboxObservation: "Structured systems diagnostic guide categorizing core Sysinternals utilities for rapid incident response: Process Explorer, Process Monitor, Autoruns, TCPView, Handle, PsList/PsKill, RAMMap, Disk Usage, Sigcheck, and Sysmon.",
            technicalBreakdown: "Sysinternals leverages low-level Windows kernel drivers (such as PROCEXP152.SYS) to expose undocumented object handles, physical memory allocation pools, and thread call stacks inaccessible through standard Task Manager.",
            defensePlaybook: [
                                "Process Signature Verification: Utilize Sigcheck to verify Authenticode digital signatures across all running binaries and autostart entries.",
                                "Live Memory Inspection: Employ RAMMap to analyze memory leak exhaustion across page pools, kernel buffers, and standby lists."
                ],
            containment: "Reference documentation compiled across macOS and Windows management workstations.",
            credit: "Toolchain compilation and systems documentation by Andrew Van Ek. Technical documentation co-authored with Google DeepMind Antigravity AI."
        },
        {
            id: "azure-vm-setup-wizard",
            title: "Microsoft Azure Portal: ARM Virtual Machine Provisioning & Compute Sizing",
            category: "vms",
            categoryLabel: "Cloud Architecture & Virtualization",
            badgeClass: "badge-info",
            image: "images/gallery/approved2/azure-vm-setup-wizard-cloud.png",
            thumb: "images/gallery/approved2/azure-vm-setup-wizard-cloud-thumb.jpg",
            tags: ["Microsoft Azure", "Cloud VM", "ARM Template", "Infrastructure as Code"],
            summary: "Configuring compute specifications, virtual network interfaces, and storage tiers within the Microsoft Azure Portal VM provisioning workflow.",
            sandboxObservation: "Azure management portal displaying the 'Create a virtual machine' ARM provisioning interface, configuring virtual networking, OS image selection, and inbound security rules for cloud computing experiments.",
            technicalBreakdown: "<span class=\"tech-term\" data-term=\"cloud-vm\">Azure</span> Resource Manager (ARM) coordinates hypervisor allocation across regional availability zones. Proper network security group (NSG) provisioning and ephemeral disk allocation prevents unexpected ingress exposure and controls operating costs.",
            defensePlaybook: [
                                "Just-In-Time Access: Restrict management ports (SSH/RDP) behind Azure Bastion or JIT access policies rather than exposing public IP listeners.",
                                "Storage Tier Selection: Match OS disk IOPs to workload demands (Standard SSD vs. Premium SSD) to avoid storage bottlenecks during boot."
                ],
            containment: "Provisioned in isolated Azure Cloud subscription boundaries.",
            credit: "Cloud infrastructure architecture and configuration by Andrew Van Ek. Technical documentation co-authored with Google DeepMind Antigravity AI."
        },
        {
            id: "busybox-ether-wake-wol",
            title: "BusyBox Wake-on-LAN: Headless Remote Power Management via ether-wake",
            category: "homelab",
            categoryLabel: "Network Architecture & Power Management",
            badgeClass: "badge-info",
            image: "images/gallery/approved2/busybox-ether-wake-wol-remote.png",
            thumb: "images/gallery/approved2/busybox-ether-wake-wol-remote-thumb.jpg",
            tags: ["Wake-on-LAN", "BusyBox", "ether-wake", "Alpine Linux", "Remote Power"],
            summary: "Deploying lightweight BusyBox ether-wake commands to broadcast Magic Packets across local subnets for remote workstation power management.",
            sandboxObservation: "Technical documentation snippet detailing headless Wake-on-LAN dispatch: 'Basic wake on LAN (same subnet, Ethernet): busybox ether-wake aa:bb:cc:dd:ee:ff' for waking remote desktop towers across the homelab.",
            technicalBreakdown: "<span class=\"tech-term\" data-term=\"wake-on-lan\">Wake-on-LAN</span> broadcasts an Ethernet Layer 2 packet containing a 6-byte synchronization header (0xFFFFFFFFFFFF) followed by 16 repetitions of the target NIC's MAC address, triggering the network controller's standby power rail to assert a system power-on pulse.",
            defensePlaybook: [
                                "Subnet Broadcast Isolation: Restrict WoL packet dispatch to dedicated management VLANs to prevent unauthorized broadcast storms.",
                                "Password-Protected WoL: Enable SecureOn password bytes in BIOS/NIC settings where supported to guard against unauthorized wakeups."
                ],
            containment: "Executed from always-on Alpine Linux server across private Ethernet segments.",
            credit: "Power management architecture and documentation by Andrew Van Ek. Technical documentation co-authored with Google DeepMind Antigravity AI."
        },
        {
            id: "android-stay-awake-developer-options",
            title: "Android Developer Options: Screen Wake Lock & Continuous Charging Persistence",
            category: "homelab",
            categoryLabel: "Mobile Systems & OS Optimization",
            badgeClass: "badge-info",
            image: "images/gallery/approved2/android-developer-options-stay-awake.png",
            thumb: "images/gallery/approved2/android-developer-options-stay-awake-thumb.jpg",
            tags: ["Android", "Developer Options", "Stay Awake", "Power Management", "Homelab Dashboard"],
            summary: "Configuring Android Developer Options 'Stay Awake' flags to keep mobile devices active indefinitely while charging for dedicated homelab telemetry display.",
            sandboxObservation: "Android Developer Options settings menu showing 'Stay awake: Screen will never sleep while charging' enabled, preventing sleep-mode lockouts during long-running dashboard and telemetry monitoring.",
            technicalBreakdown: "Enabling 'Stay Awake' overrides standard Android PowerManagerService timeout locks when USB or AC charging state (BATTERY_PLUGGED_AC/USB) is asserted. This eliminates lockscreen dimming without requiring background wakelock services.",
            defensePlaybook: [
                                "OLED Burn-in Mitigation: Pair stay-awake flags with dynamic pixel-shifting or dark-mode themes when repurposing OLED mobile devices as permanent monitors.",
                                "Security Pin Isolation: Restrict device physical access when disabling lockscreen timeouts in production spaces."
                ],
            containment: "Configured on dedicated Android homelab monitor hardware.",
            credit: "Mobile configuration and power architecture by Andrew Van Ek. Technical documentation co-authored with Google DeepMind Antigravity AI."
        },
        {
            id: "magisk-denylist-security-isolation",
            title: "Magisk Zygisk DenyList: Hiding Root & Enforcing App Sandbox Integrity",
            category: "homelab",
            categoryLabel: "Mobile Security & Root Architecture",
            badgeClass: "badge-info",
            image: "images/gallery/approved2/magisk-denylist-root-isolation.png",
            thumb: "images/gallery/approved2/magisk-denylist-root-isolation-thumb.jpg",
            tags: ["Magisk", "Zygisk", "DenyList", "Root Hiding", "Android Security"],
            summary: "Configuring Magisk Zygisk DenyList rules to isolate root permissions and bypass SafetyNet/Play Integrity detection for Google Wallet and enterprise apps.",
            sandboxObservation: "Magisk configuration interface displaying the DenyList module targeting Google Wallet (com.google.android.apps.walletnfcrel), Technogym, and Zoom, isolating modified system paths from sensitive client runtimes.",
            technicalBreakdown: "Zygisk intercepts process forking directly within Android's Zygote daemon. DenyList enforces mount namespace unsharing, unmounting Magisk modules and su binaries prior to child process execution so that SafetyNet and hardware integrity attestation checks pass cleanly.",
            defensePlaybook: [
                                "Selective Root Isolation: Apply DenyList to banking and workplace communication applications to preserve biometric and NFC security integrity.",
                                "Play Integrity Attestation: Combine Zygisk with Shamiko or Play Integrity Fix modules to pass hardware-backed cryptographic checks."
                ],
            containment: "Administered on rooted Android testing device with sandboxed module isolation.",
            credit: "Mobile security configuration and root isolation by Andrew Van Ek. Technical documentation co-authored with Google DeepMind Antigravity AI."
        },
        {
            id: "linux-deploy-chroot-path-fix",
            title: "Termux & Linux Deploy: Resolving App Data Binary Paths in Android Chroot",
            category: "homelab",
            categoryLabel: "Mobile Linux & Chroot Environments",
            badgeClass: "badge-info",
            image: "images/gallery/approved2/termux-linux-deploy-chroot-fix.png",
            thumb: "images/gallery/approved2/termux-linux-deploy-chroot-fix-thumb.jpg",
            tags: ["Linux Deploy", "Termux", "chroot", "Android Modding", "Path Resolution"],
            summary: "Fixing invocation disconnects between Termux and Linux Deploy by binding execution paths directly to the app data shell script.",
            sandboxObservation: "Technical troubleshooting guide resolving 'linuxdeploy shell' command failures: 'You need to point Termux to the actual script inside the Linux Deploy app data', providing path normalization across Android internal storage.",
            technicalBreakdown: "Modern Android security architectures isolate application sandboxes under /data/user/0/ru.meefik.linuxdeploy/. Invoking <span class=\"tech-term\" data-term=\"chroot\">chroot</span> helper binaries from external shell environments requires explicit absolute path references and proper <span class=\"tech-term\" data-term=\"selinux\">SELinux</span> context execution.",
            defensePlaybook: [
                                "Path Hardening: Store administrative scripts in persistent application-accessible directories to survive package updates.",
                                "SELinux Permissive Sandboxing: Verify chroot mounts possess proper filesystem permissions before launching containerized daemons."
                ],
            containment: "Configured in local Android terminal testing environment.",
            credit: "Linux container diagnosis and scripting by Andrew Van Ek. Technical documentation co-authored with Google DeepMind Antigravity AI."
        },
        {
            id: "powershell-aduc-rsat-install",
            title: "Windows PowerShell: Automating RSAT, ADUC & DNS Management Deployment",
            category: "media",
            categoryLabel: "Enterprise IT & Systems Automation",
            badgeClass: "badge-info",
            image: "images/gallery/approved2/powershell-aduc-rsat-install.png",
            thumb: "images/gallery/approved2/powershell-aduc-rsat-install-thumb.jpg",
            tags: ["Active Directory", "ADUC", "RSAT", "PowerShell", "IT Administration"],
            summary: "Automating the installation of Remote Server Administration Tools (RSAT), Active Directory Users & Computers (ADUC), DNS, and Group Policy tools via PowerShell.",
            sandboxObservation: "PowerShell command documentation for rapid enterprise workstation provisioning: 'Install the stuff IT folks usually want - If you want ADUC plus Group Policy Management and DNS tools', showcasing DISM / Add-WindowsCapability automation.",
            technicalBreakdown: "Deploying 'Rsat.ActiveDirectory.DS-LDS.Tools' and 'Rsat.GroupPolicy.Management.Tools' via Windows Capability cmdlets enables remote <span class=\"tech-term\" data-term=\"active-directory\">Active Directory</span> domain controller management directly from client workstations without requiring <span class=\"tech-term\" data-term=\"rdp\">RDP</span> sessions.",
            defensePlaybook: [
                                "Automated Workstation Staging: Package RSAT provisioning into reusable PowerShell deployment scripts for standard IT onboarding.",
                                "Principle of Least Privilege: Run RSAT consoles under dedicated tiered administrative credentials rather than standard daily user accounts."
                ],
            containment: "Administered across corporate and homelab Active Directory domain environments.",
            credit: "IT administration automation and documentation by Andrew Van Ek. Technical documentation co-authored with Google DeepMind Antigravity AI."
        },
        {
            id: "odata-filter-query-syntax",
            title: "Enterprise Automation: OData Query Syntax & Comparison Operators",
            category: "media",
            categoryLabel: "Enterprise IT & API Automation",
            badgeClass: "badge-info",
            image: "images/gallery/approved2/odata-filter-query-syntax-guide.png",
            thumb: "images/gallery/approved2/odata-filter-query-syntax-guide-thumb.jpg",
            tags: ["OData", "API Integration", "Power Automate", "Filter Queries", "REST APIs"],
            summary: "Analyzing OData comparison operator conventions (gt, ge, lt, le, eq, ne) for filtering enterprise service desk tickets and database queries.",
            sandboxObservation: "Technical reference table detailing OData query operators: 'It would actually be gt (for greater than)! OData operators always use standard two-letter abbreviations: Symbol OData Operator ge lt eq ne'.",
            technicalBreakdown: "The Open Data Protocol (<span class=\"tech-term\" data-term=\"odata\">OData</span>) standardizes URL query parameters ($filter, $select, $expand). Utilizing proper two-letter operator abbreviations prevents malformed URI errors in Microsoft Graph, SharePoint, and Power Automate integrations.",
            defensePlaybook: [
                                "Server-Side Filtering: Always enforce $filter constraints on server queries rather than fetching complete datasets into client memory.",
                                "Sanitized Query Building: Parameterize dynamic filter variables to prevent OData query injection and unauthorized data enumeration."
                ],
            containment: "Reference material verified against enterprise REST API specifications.",
            credit: "API documentation and query optimization by Andrew Van Ek. Technical documentation co-authored with Google DeepMind Antigravity AI."
        },
        {
            id: "procurement-bidding-policy-audit",
            title: "Academic IT Governance: Public Procurement & Competitive Bidding Analysis",
            category: "media",
            categoryLabel: "Academic Coursework & IT Governance",
            badgeClass: "badge-info",
            image: "images/gallery/approved2/procurement-bidding-policy-review.png",
            thumb: "images/gallery/approved2/procurement-bidding-policy-review-thumb.jpg",
            tags: ["IT Governance", "Procurement", "Competitive Bidding", "CIS 450", "Public Policy"],
            summary: "Reviewing institutional procurement regulations, trade journal advertising policies, and competitive bidding workflows for university systems architecture.",
            sandboxObservation: "Coursework analysis document outlining competitive bidding requirements: 'These preliminary services are needed governing policies and process to solicit bids newspapers, trade journals...' detailing legal and institutional IT compliance.",
            technicalBreakdown: "Enterprise IT acquisitions exceeding statutory thresholds require formal Request for Proposal (RFP) publication and sealed bidding processes to comply with public procurement guidelines and prevent vendor lock-in.",
            defensePlaybook: [
                                "Vendor Neutral Specifications: Draft RFP requirements around open protocols and standards rather than proprietary vendor features.",
                                "Audit Trail Compliance: Maintain immutable records of vendor bid submissions, scoring rubrics, and selection criteria."
                ],
            containment: "Academic coursework analysis compiled in macOS document suite.",
            credit: "IT policy research and analysis by Andrew Van Ek. Technical documentation co-authored with Google DeepMind Antigravity AI."
        },
        {
            id: "docker-alpine-permission-hardening",
            title: "Alpine Linux Homelab: Docker Container Permissions & Host Security Boundary",
            category: "homelab",
            categoryLabel: "Container Security & Systems Hardening",
            badgeClass: "badge-info",
            image: "images/gallery/approved2/docker-alpine-host-permission-hardening.png",
            thumb: "images/gallery/approved2/docker-alpine-host-permission-hardening-thumb.jpg",
            tags: ["Docker", "Alpine Linux", "Host Security", "Container Permissions", "Linux Administration"],
            summary: "Analyzing permission elevation boundaries between Docker containers and the underlying Alpine Linux host filesystem to enforce least privilege.",
            sandboxObservation: "AI technical advisory dialog discussing container security: 'Yes\u2014but it requires a change on the Alpine host or in the Docker container configuration. Giving permission in this chat won\\'t change the kernel/filesystem boundary'.",
            technicalBreakdown: "<span class=\"tech-term\" data-term=\"docker\">Docker</span> containers share the host Linux kernel. Modifying container permissions requires explicit daemon configuration (userns-remap, non-root user directives, volume mount permissions) on the host rather than user-space shell assumptions.",
            defensePlaybook: [
                                "Rootless Container Execution: Enforce non-root user execution inside container Dockerfiles to prevent root escalation to the host filesystem.",
                                "Read-Only Volume Mounts: Mount host configuration directories as read-only (:ro) to block container processes from mutating host configs."
                ],
            containment: "Administered on production Alpine Linux NUC server.",
            credit: "Container hardening and permission analysis by Andrew Van Ek. Technical documentation co-authored with Google DeepMind Antigravity AI."
        },
        {
            id: "windows-smb-share-definition-audit",
            title: "Windows Server SMB: Comparative Share Definition & Access Rule Forensics",
            category: "homelab",
            categoryLabel: "Network Storage & Access Control",
            badgeClass: "badge-info",
            image: "images/gallery/approved2/windows-smb-share-definition-audit.png",
            thumb: "images/gallery/approved2/windows-smb-share-definition-audit-thumb.jpg",
            tags: ["SMB", "File Sharing", "Windows Server", "Access Control", "Share Permissions"],
            summary: "Conducting side-by-side comparative analysis of Windows SMB share definitions to diagnose cross-network file access failures.",
            sandboxObservation: "Technical troubleshooting conversation analyzing Windows share configurations: 'sounds good, oh my word it literally seems there\\'s no difference between them - Exactly\u2014that comparison shows the SMB share definitions are identical'.",
            technicalBreakdown: "Windows file sharing relies on a two-tier permission model: <span class=\"tech-term\" data-term=\"smb\">SMB</span> Share Permissions (configured via 'net share' or Server Manager) and NTFS Access Control Lists (ACLs). Two shares with identical SMB definitions will behave completely differently if the underlying NTFS ACLs lack read inheritance.",
            defensePlaybook: [
                                "Dual-Layer Permission Audits: Always verify both SMB Share Permissions and underlying NTFS security tabs when debugging access denied errors.",
                                "Inheritance Verification: Ensure subdirectories inherit permissions cleanly from the root volume using icacls."
                ],
            containment: "Investigated across Windows fixed storage and network endpoints.",
            credit: "SMB troubleshooting and permission auditing by Andrew Van Ek. Technical documentation co-authored with Google DeepMind Antigravity AI."
        },
        {
            id: "windows-admin-shares-xmrig-notes",
            title: "Windows Workstation: Admin Shares (C$), ONEFIVE Storage & XMRig Mining Telemetry",
            category: "homelab",
            categoryLabel: "Network Storage & Distributed Computing",
            badgeClass: "badge-info",
            image: "images/gallery/approved2/windows-admin-shares-xmrig-miner-notes.png",
            thumb: "images/gallery/approved2/windows-admin-shares-xmrig-miner-notes-thumb.jpg",
            tags: ["Admin Shares", "C$", "XMRig", "Duino-Coin", "PowerShell", "Homelab"],
            summary: "Investigating default Windows administrative shares (C$, IPC$) and network storage mounts alongside active XMRig and Duino-Coin mining workloads.",
            sandboxObservation: "Multi-window workstation session displaying 'XMRig 6.26.0' CPU miner, Duino-Coin Python miner, PowerShell console inspecting 'ONEFIVE' storage shares, and administrative shortcut properties.",
            technicalBreakdown: "Windows automatically enables administrative shares (C$, ADMIN$) for domain management. Understanding how local firewall rules and LocalAccountTokenFilterPolicy impact remote access over <span class=\"tech-term\" data-term=\"smb\">SMB</span> is essential for secure cross-machine administration.",
            defensePlaybook: [
                                "Disable Default Administrative Shares: Set AutoShareWks to 0 in registry (HKLM\\SYSTEM\\CurrentControlSet\\Services\\LanmanServer\\Parameters) on non-domain workstations.",
                                "Process Priority Isolation: Run background computational tasks (XMRig) at BelowNormal priority to ensure zero interference with storage I/O."
                ],
            containment: "Monitored on primary Windows workstation.",
            credit: "Storage administration and miner telemetry configuration by Andrew Van Ek. Technical documentation co-authored with Google DeepMind Antigravity AI."
        },
        {
            id: "smb-removable-drive-isolation",
            title: "Windows Storage Forensics: Removable USB vs. Fixed Drive SMB Permissions",
            category: "homelab",
            categoryLabel: "Network Storage & Filesystem Architecture",
            badgeClass: "badge-info",
            image: "images/gallery/approved2/smb-removable-drive-permission-isolation.png",
            thumb: "images/gallery/approved2/smb-removable-drive-permission-isolation-thumb.jpg",
            tags: ["SMB", "Removable Media", "USB Drive", "NTFS Permissions", "Windows Server"],
            summary: "Isolating why Windows SMB sharing fails on removable USB drives while succeeding on fixed NTFS partitions.",
            sandboxObservation: "Troubleshooting chat resolving storage access issues: 'If this works, the removable drive won\\'t need it. Ok cool - cause was the original removable drive permissions', confirming distinct OS treatment of external media.",
            technicalBreakdown: "Windows Server and client editions enforce security restrictions on removable drives (IOCTL_STORAGE_GET_HOTPLUG_INFO). Removable drives formatted as FAT32 lack NTFS security descriptors, preventing Windows LanmanServer from attaching authenticated security tokens to share endpoints.",
            defensePlaybook: [
                                "Fixed-Disk VHD Staging: Create a fixed-disk Virtual Hard Disk (.vhdx) on removable drives and mount as NTFS to bypass removable media SMB restrictions.",
                                "Dedicated NAS Provisioning: Host persistent network shares on native Linux ext4/ZFS fixed pools rather than ad-hoc USB drives."
                ],
            containment: "Diagnosed across Windows fixed and removable USB drive topologies.",
            credit: "Filesystem diagnostics and storage architecture by Andrew Van Ek. Technical documentation co-authored with Google DeepMind Antigravity AI."
        },
        {
            id: "smb-fat-vs-ntfs-comparison",
            title: "Filesystem Security Forensics: Removable FAT vs. Fixed NTFS Share Replication",
            category: "homelab",
            categoryLabel: "Filesystems & Storage Security",
            badgeClass: "badge-info",
            image: "images/gallery/approved2/smb-fat-vs-ntfs-drive-comparison.png",
            thumb: "images/gallery/approved2/smb-fat-vs-ntfs-drive-comparison-thumb.jpg",
            tags: ["FAT32", "NTFS", "SMB Sharing", "Filesystem Forensics", "Troubleshooting"],
            summary: "Testing second removable FAT USB drive (G:) to conclusively prove that FAT filesystem architecture blocks authenticated SMB sharing.",
            sandboxObservation: "Diagnostic chat confirming experimental evidence: 'Yep\u2014this is now strong evidence. A second, completely different removable USB (G:, FAT) fails the same way, while the fixed C: test share succeeds cleanly'.",
            technicalBreakdown: "FAT32 filesystems maintain zero user SID mappings or security descriptors. When LanmanServer negotiates SMB2/3 authenticated sessions, it cannot evaluate user access tokens against filesystem objects, resulting in generic 'Access Denied' errors across client connections.",
            defensePlaybook: [
                                "Format Standardization: Standardize all shared storage volumes on modern NTFS or Linux filesystems that support POSIX / Windows ACLs.",
                                "Audit Trail Logging: Review Microsoft-Windows-SMBServer/Operational event logs (Event ID 1001) to identify access denial root causes."
                ],
            containment: "Tested across physical USB hardware and virtual disk controllers.",
            credit: "Filesystem forensic investigation and test verification by Andrew Van Ek. Technical documentation co-authored with Google DeepMind Antigravity AI."
        },
        {
            id: "chrome-remote-desktop-miner-session",
            title: "Chrome Remote Desktop: Headless Workstation Administration & Miner Monitoring",
            category: "homelab",
            categoryLabel: "Remote Management & Telemetry",
            badgeClass: "badge-info",
            image: "images/gallery/approved2/chrome-remote-desktop-headless-miner.png",
            thumb: "images/gallery/approved2/chrome-remote-desktop-headless-miner-thumb.jpg",
            tags: ["Chrome Remote Desktop", "Headless Management", "Duino-Coin", "Remote Access"],
            summary: "Administering a remote workstation session via Chrome Remote Desktop inside Safari on macOS, monitoring active Duino-Coin mining threads.",
            sandboxObservation: "macOS Safari browser accessing 'remotedesktop.google.com' session connected to 'FREEHPGAMER', monitoring active Duino-Coin Python mining console and system metrics.",
            technicalBreakdown: "Chrome <span class=\"tech-term\" data-term=\"rdp\">Remote Desktop</span> uses WebRTC with VP8/VP9 video encoding to establish low-latency, NAT-traversing remote desktop connections through Google STUN/TURN relays, enabling seamless headless machine administration across remote networks.",
            defensePlaybook: [
                                "Remote Access Segmentation: Limit remote desktop protocols to secure VPN/mesh connections (Tailscale) where possible to minimize third-party relay dependency.",
                                "Host Pin Authentication: Require long, complex PINs and multi-factor authentication on all registered Chrome Remote Desktop endpoints."
                ],
            containment: "Executed within sandboxed WebRTC browser stream on macOS.",
            credit: "Remote desktop management and telemetry monitoring by Andrew Van Ek. Technical documentation co-authored with Google DeepMind Antigravity AI."
        },
        {
            id: "smb-authenticate-user-sharing-audit",
            title: "Windows Server LanmanServer: EnableAuthenticateUserSharing Configuration Audit",
            category: "homelab",
            categoryLabel: "Windows Server & SMB Hardening",
            badgeClass: "badge-info",
            image: "images/gallery/approved2/smb-enable-authenticate-user-sharing-audit.png",
            thumb: "images/gallery/approved2/smb-enable-authenticate-user-sharing-audit-thumb.jpg",
            tags: ["SMB", "LanmanServer", "Registry Configuration", "Security Hardening"],
            summary: "Researching and validating Windows SMB server registry parameters (EnableAuthenticateUserSharing) to resolve multi-user network share authentication.",
            sandboxObservation: "Technical documentation search inspecting Microsoft Learn articles: 'Searched the web for site:learn.microsoft.com EnableAuthenticateUserSharing SMB server configuration We\\'ve exhausted the standard GUI options'.",
            technicalBreakdown: "LanmanServer registry parameters dictate how the Windows <span class=\"tech-term\" data-term=\"smb\">SMB</span> server negotiates guest vs. authenticated user contexts. Setting explicit server security parameters forces clients to present valid domain or local machine credentials before establishing null-session connections.",
            defensePlaybook: [
                                "Block Insecure Guest Logons: Enforce 'Turn on insecure guest logons = Disabled' in Group Policy to mitigate SMB relay and NTLM coercion attacks.",
                                "SMB Signing & Encryption: Require SMB signing (RequireSecuritySignature) across all LAN file transfers to prevent man-in-the-middle tampering."
                ],
            containment: "Audited against official Microsoft Learn documentation and Windows Server registry hives.",
            credit: "SMB server configuration research by Andrew Van Ek. Technical documentation co-authored with Google DeepMind Antigravity AI."
        },
        {
            id: "ssh-terminal-alpine-xmrig-session",
            title: "macOS Terminal: Encrypted Ed25519 SSH Session to Alpine Server Running XMRig",
            category: "homelab",
            categoryLabel: "Linux Server Administration",
            badgeClass: "badge-info",
            image: "images/gallery/approved2/ssh-terminal-alpine-xmrig-miner-session.png",
            thumb: "images/gallery/approved2/ssh-terminal-alpine-xmrig-miner-session-thumb.jpg",
            tags: ["SSH", "Ed25519", "Alpine Linux", "XMRig", "Tailscale", "Terminal"],
            summary: "Establishing an encrypted SSH session with Ed25519 key authentication from macOS Terminal to the Alpine Linux server (100.87.81.52) supervising XMRig compute.",
            sandboxObservation: "macOS Terminal window (202x47) executing 'ssh -i ~/.ssh/id_ed25519 avanek@100.87.81.52', monitoring active XMRig CPU miner with custom arguments '--donate-level 1 --print-time'.",
            technicalBreakdown: "Ed25519 uses elliptic-curve cryptography (Curve25519) providing 128-bit security with high signature generation speed. Connecting across <span class=\"tech-term\" data-term=\"tailscale\">Tailscale</span> encrypts all interactive terminal telemetry inside WireGuard tunnels without requiring open firewall ports on the public WAN.",
            defensePlaybook: [
                                "Passwordless SSH Enforcement: Disable PasswordAuthentication and ChallengeResponseAuthentication in /etc/ssh/sshd_config to enforce strict key-only access.",
                                "Dedicated Mining Supervision: Wrap long-running computational daemons in system OpenRC/systemd services to manage CPU thread affinity and automatic restart cycles."
                ],
            containment: "Encrypted SSH session executing across private Tailscale mesh network.",
            credit: "Server administration, key management, and compute supervision by Andrew Van Ek. Technical documentation co-authored with Google DeepMind Antigravity AI."
        },
        {
            id: "windows-xp-wmp-drm-license-error",
            title: "Windows XP Media Player: Digital Rights Management (DRM) License Acquisition Error",
            category: "security",
            categoryLabel: "Digital Rights Management & Software Forensics",
            badgeClass: "badge-info",
            image: "images/gallery/approved2/windows-xp-wmp-drm-license-error.png",
            thumb: "images/gallery/approved2/windows-xp-wmp-drm-license-error-thumb.jpg",
            tags: ["Windows XP", "Windows Media Player", "DRM", "License Acquisition", "Software Forensics"],
            summary: "Documenting vintage Windows Media Player DRM license acquisition failure on Windows XP when attempting playback of protected WMA audio.",
            sandboxObservation: "Windows XP desktop displaying Windows Media Player error modal: 'A license is required to play the selected content. To obtain a license, you must visit content provider\\'s Web page...', showcasing early digital copyright enforcement mechanisms.",
            technicalBreakdown: "Windows Media DRM leverages encrypted content keys bound to individual machine hardware profiles (CPU ID, <span class=\"tech-term\" data-term=\"uefi-firmware\">BIOS</span> string, hard drive serial). When vintage DRM license servers are decommissioned, legacy protected media becomes permanently unplayable despite possessing original physical files.",
            defensePlaybook: [
                                "DRM-Free Preservation: Maintain master audio and video archives in open, non-DRM formats (FLAC, MP3, WAV) to guarantee long-term digital preservation.",
                                "Hardware Decoupling: Avoid proprietary container-locked licensing schemes that depend on permanent third-party server infrastructure."
                ],
            containment: "Observed in vintage Windows XP test environment.",
            credit: "DRM behavior documentation and capture by Andrew Van Ek. Technical documentation co-authored with Google DeepMind Antigravity AI."
        },
        {
            id: "copilot-early-mobile-interaction",
            title: "Generative AI Evolution: Early Mobile Conversational Image Prompting",
            category: "media",
            categoryLabel: "Generative AI & Prompt Evolution",
            badgeClass: "badge-info",
            image: "images/gallery/approved2/copilot-early-mobile-interaction.png",
            thumb: "images/gallery/approved2/copilot-early-mobile-interaction-thumb.jpg",
            tags: ["Microsoft Copilot", "Generative AI", "DALL-E", "Prompt Engineering", "Mobile AI"],
            summary: "Documenting early hands-on interactions with Microsoft Copilot on mobile, exploring generative multimodal image synthesis from conversational natural language prompts.",
            sandboxObservation: "Mobile interface showing early conversational exchange: 'draw a picture of a cup of coffee in front of a lake with a sunset - Copilot: I\\'ll try to create that...', illustrating the emergence of real-time mobile generative AI assistants.",
            technicalBreakdown: "Modern mobile generative AI gateways leverage cloud-based diffusion models (DALL-E 3) orchestrated through conversational LLM prompt expansion, converting concise user prompts into detailed descriptive latent-space generation briefs.",
            defensePlaybook: [
                                "Prompt Expansion Verification: Review model-expanded prompts to ensure generative additions align with user intent and avoid unintended style drift.",
                                "Local Model Comparison: Evaluate cloud generation against local PyTorch Diffusers pipelines to benchmark latency, privacy, and fidelity."
                ],
            containment: "Captured on mobile personal device.",
            credit: "Generative AI exploration and capture by Andrew Van Ek. Technical documentation co-authored with Google DeepMind Antigravity AI."
        },
        {
            id: "excel-custom-number-formatting",
            title: "Microsoft Excel: Custom Cell Number Formatting & Visual Unit Suffixes",
            category: "media",
            categoryLabel: "Enterprise Tools & Spreadsheet Engineering",
            badgeClass: "badge-info",
            image: "images/gallery/approved2/excel-custom-number-formatting-guide.png",
            thumb: "images/gallery/approved2/excel-custom-number-formatting-guide-thumb.jpg",
            tags: ["Microsoft Excel", "Number Formatting", "Spreadsheet Engineering", "Data Entry"],
            summary: "Mastering custom Excel number formats that display physical unit suffixes ('sq. ft.') visually while preserving raw numeric values for formulas.",
            sandboxObservation: "Technical Excel formatting reference demonstrating custom syntax: 'Type: 1 50 sq. ft. Excel will display: 150 sq. ft. Plain Text vs. Formatted Number', showing how to separate visual formatting from calculation data types.",
            technicalBreakdown: "Excel custom number formats (e.g. 0 \"sq. ft.\") alter the presentation layer without converting the cell value into a string. This preserves floating-point math, aggregation functions (SUM, AVERAGE), and chart compatibility.",
            defensePlaybook: [
                                "Preserve Data Types: Never manually type text units into calculation cells; use custom format strings to keep underlying data numeric.",
                                "Formula Resilience: Verify spreadsheet formulas reference raw numeric cells to prevent #VALUE! type mismatch exceptions."
                ],
            containment: "Compiled in enterprise productivity workspace.",
            credit: "Spreadsheet engineering and formatting documentation by Andrew Van Ek. Technical documentation co-authored with Google DeepMind Antigravity AI."
        },
        {
            id: "excel-color-palette-analyzer",
            title: "Data Visualization: AI-Assisted Spreadsheet Color Palette Optimization",
            category: "media",
            categoryLabel: "Data Analytics & Interface Design",
            badgeClass: "badge-info",
            image: "images/gallery/approved2/excel-color-palette-analyzer-gemini.png",
            thumb: "images/gallery/approved2/excel-color-palette-analyzer-gemini-thumb.jpg",
            tags: ["Google Gemini", "Data Visualization", "Color Palettes", "Excel Analytics", "UI Design"],
            summary: "Collaborating with Google Gemini to optimize high-contrast color palettes for data analytics spreadsheets, balancing aesthetic variety with accessibility.",
            sandboxObservation: "Conversational AI dialog discussing color calibration: 'Ok sweet - and color adjustments that you recently changed work for everything they did previously PLUS these additional colors+adjustments?', validating palette expansion across complex data grids.",
            technicalBreakdown: "Effective data visualization requires perceptually uniform color palettes (such as Viridis or ColorBrewer) with distinct luminance steps to ensure legibility across diverse display hardware and for users with color vision deficiencies.",
            defensePlaybook: [
                                "WCAG Contrast Compliance: Verify visual cell highlights maintain at least 4.5:1 contrast ratios against background fills for text readability.",
                                "Semantic Color Encoding: Reserve alert colors (red, green, amber) strictly for status metrics rather than decorative category grouping."
                ],
            containment: "Designed in personal analytics workspace.",
            credit: "Visualization design and AI collaboration by Andrew Van Ek. Technical documentation co-authored with Google DeepMind Antigravity AI."
        },
        {
            id: "gvsu-university-football-atmosphere",
            title: "Campus Life: Grand Valley State University Stadium Atmosphere",
            category: "media",
            categoryLabel: "Campus Life & University Community",
            badgeClass: "badge-info",
            image: "images/gallery/approved2/gvsu-university-football-game-atmosphere.jpg",
            thumb: "images/gallery/approved2/gvsu-university-football-game-atmosphere-thumb.jpg",
            tags: ["GVSU", "Grand Valley State University", "Campus Life", "Athletics"],
            summary: "Capturing the vibrant game-day atmosphere at the Grand Valley State University football stadium during fall semester.",
            sandboxObservation: "Sunny afternoon panoramic capture of the packed GVSU football stadium, showcasing the lively university community, team spirit, and campus athletic tradition in Allendale, Michigan.",
            technicalBreakdown: "University athletic events unite thousands of students, faculty, and alumni, fostering strong community bonds and collaborative pride across academic disciplines.",
            defensePlaybook: [
                                "Community Engagement: Participate in campus community activities to maintain a well-rounded academic and professional life.",
                                "Work-Life Balance: Balance rigorous homelab engineering with active campus participation."
                ],
            containment: "Captured on mobile device at GVSU campus stadium.",
            credit: "Campus photography by Andrew Van Ek. Technical documentation co-authored with Google DeepMind Antigravity AI."
        },
        {
            id: "windows-xp-intel-graphics-driver",
            title: "Retro Hardware Diagnostics: Windows XP Intel 82845G Graphics Driver Analysis",
            category: "vms",
            categoryLabel: "Retro Computing & Hardware Diagnostics",
            badgeClass: "badge-info",
            image: "images/gallery/approved2/windows-xp-intel-graphics-driver-properties.jpg",
            thumb: "images/gallery/approved2/windows-xp-intel-graphics-driver-properties-thumb.jpg",
            tags: ["Windows XP", "Intel 82845G", "Device Drivers", "Retro Hardware", "Graphics Diagnostics"],
            summary: "Inspecting legacy Intel 82845G graphics controller driver properties and hardware IDs on a vintage Windows XP installation.",
            sandboxObservation: "Windows XP desktop with Notepad documenting graphics driver properties: 'graphics Driver properties: Intel (R) 82845G/GL/GE/PE/GV Graphics controller...', verifying driver version and Direct3D acceleration status.",
            technicalBreakdown: "The Intel 82845G Extreme Graphics chipset relies on shared system RAM (Unified Memory Architecture) with fixed 200 MHz core clocks. Proper driver binding under Windows XP (ialmrnt5.inf) is necessary to enable 2D hardware blitting and early DirectX 8.1 API support.",
            defensePlaybook: [
                                "Legacy Driver Archive Integrity: Maintain verified offline copies of legacy INF and SYS driver packages before performing retro OS reinstalls.",
                                "Hardware ID Verification: Cross-reference PCI Vendor and Device IDs (VEN_8086&DEV_2562) to identify correct driver revisions when OEM recovery disks are lost."
                ],
            containment: "Investigated on physical vintage Windows XP hardware.",
            credit: "Hardware forensics and documentation by Andrew Van Ek. Technical documentation co-authored with Google DeepMind Antigravity AI."
        },
        {
            id: "pixel-9-adb-anydesk-permissions",
            title: "Android ADB Administration: Pixel 9 Package Auditing & AnyDesk Remote Permissions",
            category: "homelab",
            categoryLabel: "Mobile Administration & ADB Automation",
            badgeClass: "badge-info",
            image: "images/gallery/approved2/pixel-9-adb-shell-anydesk-permissions.png",
            thumb: "images/gallery/approved2/pixel-9-adb-shell-anydesk-permissions-thumb.jpg",
            tags: ["Google Pixel 9", "ADB", "Android Debug Bridge", "AnyDesk", "Remote Support"],
            summary: "Utilizing Android Debug Bridge (ADB) on macOS to audit package permissions and configure AnyDesk unattended remote access on Google Pixel 9.",
            sandboxObservation: "Technical troubleshooting guide for Pixel 9 administration: 'To confirm on your Pixel 9: Connect via USB (with USB debugging enabled). In Terminal on your Mac: adb shell pm list packages | grep anydesk' to verify application privileges.",
            technicalBreakdown: "Android's Package Manager (pm) and AppOps services regulate accessibility and screen-recording permissions. Granting accessibility service bindings via ADB ('appops set ... PROJECT_MEDIA allow') enables remote viewing without repeated interactive user consent prompts on reboot.",
            defensePlaybook: [
                                "Revoke USB Debugging Post-Setup: Disable 'USB debugging' in Developer Options once configuration scripts finish to prevent unauthorized physical port exploitation.",
                                "Verify Authorized Host Keys: Inspect ~/.android/adbkey.pub fingerprints to ensure only trusted workstation keys are authorized for device control."
                ],
            containment: "Executed over secure USB connection between macOS and Pixel 9.",
            credit: "Mobile administration and ADB automation by Andrew Van Ek. Technical documentation co-authored with Google DeepMind Antigravity AI."
        },
        {
            id: "kali-linux-john-the-ripper",
            title: "CIS 458 Cybersecurity Lab: Kali Linux John the Ripper Password Hash Auditing",
            category: "security",
            categoryLabel: "Cybersecurity & Cryptographic Analysis",
            badgeClass: "badge-info",
            image: "images/gallery/approved2/kali-linux-john-the-ripper-hash-cracking.png",
            thumb: "images/gallery/approved2/kali-linux-john-the-ripper-hash-cracking-thumb.jpg",
            tags: ["Kali Linux", "John the Ripper", "CIS 458", "Hash Cracking", "Cybersecurity", "VirtualBox"],
            summary: "Executing dictionary and rule-based password hash cracking attacks in a Kali Linux VirtualBox VM for CIS 458 university cybersecurity coursework.",
            sandboxObservation: "VirtualBox virtual machine running 'CIS 458 VM Section 1 - Kali [Running]', executing John the Ripper in an Xfce terminal window to audit and recover password hashes from shadow files using customized wordlists.",
            technicalBreakdown: "<span class=\"tech-term\" data-term=\"john-the-ripper\">John the Ripper</span> autodetects cryptographic hash formats (SHA-512 crypt, MD5, NTLM). Running mutation rules against wordlists (such as rockyou.txt) benchmarks how password entropy and salted key-derivation functions (bcrypt/Argon2) defend against brute-force recovery.",
            defensePlaybook: [
                                "Enforce High-Cost Hashing: Mandate modern memory-hard password hashing algorithms (Argon2id, PBKDF2 with high iterations) rather than raw MD5/SHA-256.",
                                "Audit Enterprise Password Quality: Routinely conduct offline hash audits against Active Directory NTDS.dit snapshots to identify weak or compromised employee passwords."
                ],
            containment: "Conducted within an isolated, host-only VirtualBox academic lab environment.",
            credit: "Cybersecurity lab execution and analysis by Andrew Van Ek. Technical documentation co-authored with Google DeepMind Antigravity AI."
        },
        {
            id: "intel-nuc-tv-display-setup",
            title: "Living Room Homelab: Intel NUC HDMI Display Output to 4K Living Room TV",
            category: "homelab",
            categoryLabel: "Hardware Integration & Multi-Display Setups",
            badgeClass: "badge-info",
            image: "images/gallery/approved2/intel-nuc-hdmi-tv-windows-11-display.jpg",
            thumb: "images/gallery/approved2/intel-nuc-hdmi-tv-windows-11-display-thumb.jpg",
            tags: ["Intel NUC", "Living Room TV", "HDMI 2.0", "Windows 11", "Homelab Setup"],
            summary: "Connecting the Intel NUC server via HDMI to a large living room TV display running Windows 11 lockscreen for shared multimedia and dashboard viewing.",
            sandboxObservation: "Wide photograph of the living room entertainment center showing a large television displaying the Windows 11 lock screen ('5:53 Saturday, January 11'), driven directly by the compact Intel NUC hardware.",
            technicalBreakdown: "Intel Iris Xe integrated graphics support native 4K 60Hz HDR output over HDMI 2.0b / DisplayPort 1.4. Configuring EDID handshakes and audio passthrough enables seamless switching between headless Linux server duties and direct big-screen display tasks.",
            defensePlaybook: [
                                "Resolution & Scaling Tuning: Set custom Windows display scaling (150% - 200%) to ensure text legibility across ten-foot viewing distances.",
                                "Display Sleep Management: Configure dedicated CEC or HDMI power states to allow the NUC to run headless server workloads without keeping the television panel energized."
                ],
            containment: "Physical living room homelab hardware integration.",
            credit: "Hardware deployment and photography by Andrew Van Ek. Technical documentation co-authored with Google DeepMind Antigravity AI."
        },
        {
            id: "lenovo-yoga-battery-teardown",
            title: "Hardware Servicing: Lenovo IdeaPad Internal Disassembly & RAM Replacement",
            category: "hardware",
            categoryLabel: "Hardware Repair & Maintenance",
            badgeClass: "badge-info",
            image: "images/gallery/approved2/lenovo-yoga-battery-internal-teardown.jpg",
            thumb: "images/gallery/approved2/lenovo-yoga-battery-internal-teardown-thumb.jpg",
            tags: ["Lenovo IdeaPad", "Hardware Teardown", "RAM Replacement", "Hardware Maintenance"],
            summary: "Performing internal chassis disassembly on a Lenovo IdeaPad laptop, opened up for memory (RAM) replacement/upgrade and internal component inspection.",
            sandboxObservation: "High-detail internal photograph of an opened Lenovo IdeaPad laptop chassis showing the motherboard layout, installed battery pack (Model L18C3PF7), internal ribbon routing, and access to the system memory assembly.",
            technicalBreakdown: "Servicing Lenovo IdeaPad laptops requires removing perimeter underside screws, carefully releasing internal chassis retention clips, and disconnecting the main battery header before handling <span class=\"tech-term\" data-term=\"sodimm\">SODIMM</span> memory modules or internal circuitry to avoid electrostatic damage.",
            defensePlaybook: [
                                "ESD & Power Isolation: Disconnect the battery terminal before reseating or installing new RAM modules to prevent transient board shorts.",
                                "Memory Compatibility Verification: Match DDR SODIMM voltage, clock speed, and channel density specs before installing memory upgrades."
                ],
            containment: "Executed on an ESD-safe physical hardware workstation.",
            credit: "Hardware servicing and photography by Andrew Van Ek. Technical documentation co-authored with Google DeepMind Antigravity AI."
        },
        {
            id: "linux-mint-lenovo-yoga-telemetry",
            title: "Mobile Linux Workstation: Linux Mint Cinnamon on Lenovo Yoga with Conky HUD",
            category: "homelab",
            categoryLabel: "Linux Fleet & System Telemetry",
            badgeClass: "badge-info",
            image: "images/gallery/approved2/linux-mint-cinnamon-lenovo-yoga-conky.jpg",
            thumb: "images/gallery/approved2/linux-mint-cinnamon-lenovo-yoga-conky-thumb.jpg",
            tags: ["Linux Mint", "Lenovo Yoga", "Conky", "Cinnamon Desktop", "Hardware Telemetry"],
            summary: "Deploying and optimizing Linux Mint Cinnamon on the Lenovo Yoga convertible laptop, featuring real-time multi-core CPU Conky telemetry and system monitoring.",
            sandboxObservation: "Photograph of the Lenovo Yoga running Linux Mint desktop with an active system monitor displaying per-core CPU load across Core 0 through Core 3, 932.8 MiB RAM usage out of 3.7 GiB, and battery power status at 10:56 PM.",
            technicalBreakdown: "Linux Mint Cinnamon provides an exceptionally lightweight footprint (under 1 GB RAM at idle), breathing high-speed responsiveness into older 4-core mobile hardware while maintaining full touchscreen and trackpad gesture support.",
            defensePlaybook: [
                                "Conky Telemetry Tuning: Configure lightweight Conky update intervals (2-3 seconds) to prevent the monitoring daemon itself from creating noticeable CPU load.",
                                "Thermal Governor Selection: Utilize TLP and the 'powersave' or 'balanced' CPU governor to optimize battery life on convertible laptops."
                ],
            containment: "Running on physical Lenovo Yoga mobile hardware.",
            credit: "Linux deployment and photography by Andrew Van Ek. Technical documentation co-authored with Google DeepMind Antigravity AI."
        },
        {
            id: "dual-workstation-cross-platform-setup",
            title: "Workstation Ergonomics: Dual macOS & Windows Side-by-Side Setup",
            category: "media",
            categoryLabel: "Workstation Ergonomics & Systems Integration",
            badgeClass: "badge-info",
            image: "images/gallery/approved2/dual-workstation-cross-platform-desk-setup.jpg",
            thumb: "images/gallery/approved2/dual-workstation-cross-platform-desk-setup-thumb.jpg",
            tags: ["macOS", "Windows", "Desk Setup", "Multi-Screen", "Workstation", "Productivity"],
            summary: "Capturing a dual-system desk setup running macOS and Windows concurrently side-by-side, utilizing both operating environments simultaneously with independent peripherals.",
            sandboxObservation: "Desk photograph showcasing a MacBook Pro running macOS alongside a primary Windows desktop workstation, operating both systems concurrently side-by-side for parallel multitasking with independent mouse and keyboard inputs.",
            technicalBreakdown: "Operating separate physical macOS and Windows machines side-by-side provides access to platform-specific workflows—such as macOS UNIX command-line utilities and Safari alongside Windows enterprise applications—without virtualization overhead or software KVM bridging.",
            defensePlaybook: [
                                "Workspace Layout & Ergonomics: Position dual screens within natural sightlines to minimize neck strain when switching visual focus between independent machines.",
                                "Peripheral Organization: Keep distinct input devices organized and clearly assigned to avoid accidental input dispatch across adjacent workstations."
                ],
            containment: "Physical dual-machine personal productivity workstation.",
            credit: "Workstation setup and photography by Andrew Van Ek. Technical documentation co-authored with Google DeepMind Antigravity AI."
        },
        {
            id: "triple-monitor-cad-engineering-station",
            title: "Engineering Command Center: Triple-Monitor Workstation for Automation, CAD & SQL Workflows",
            category: "hardware",
            categoryLabel: "Workstation Hardware & Industrial Automation",
            badgeClass: "badge-info",
            image: "images/gallery/approved2/triple-monitor-engineering-cad-station.jpg",
            thumb: "images/gallery/approved2/triple-monitor-engineering-cad-station-thumb.jpg",
            tags: ["Triple Monitor", "Engineering Setup", "Automation", "CAD Workstation", "SQL Server SSMS", "Hardware Setup"],
            summary: "A panoramic triple-monitor engineering workstation setup capable of high-density workflows such as AutoCAD electrical drafting, industrial automation monitoring, and Microsoft SQL Server Management Studio (SSMS) database administration.",
            sandboxObservation: "Photograph of a high-productivity three-display workstation configured in an engineering environment, providing the screen real estate required to run AutoCAD drawings, PLC automation consoles, or Microsoft SQL Server Management Studio (SSMS) queries in parallel.",
            technicalBreakdown: "Triple-display topologies provide the visual bandwidth required for complex technical tasks, allowing engineers to dedicate separate screens to database development (querying relational tables in Microsoft <span class=\"tech-term\" data-term=\"ssms\">SSMS</span>), active CAD schematics, and system documentation without window congestion.",
            defensePlaybook: [
                                "Multi-Display Bandwidth Planning: Ensure GPU video outputs and DisplayPort/HDMI standards support native multi-monitor resolutions at full 60Hz refresh rates.",
                                "Workflow Real Estate Allocation: Structure window placement strategically across the three displays—such as SQL querying on one screen, design drawings on the center panel, and reference consoles on the third."
                ],
            containment: "Physical engineering workstation deployment.",
            credit: "Engineering workspace photography by Andrew Van Ek. Technical documentation co-authored with Google DeepMind Antigravity AI."
        },
        {
            id: "windows-to-go-external-provisioning",
            title: "OS Deployment: Windows To Go External Drive Boot & Device Initialization",
            category: "vms",
            categoryLabel: "OS Deployment & Portable Computing",
            badgeClass: "badge-info",
            image: "images/gallery/approved2/windows-to-go-external-drive-provisioning.jpg",
            thumb: "images/gallery/approved2/windows-to-go-external-drive-provisioning-thumb.jpg",
            tags: ["Windows To Go", "External SSD", "OS Deployment", "Device Setup", "Portable OS"],
            summary: "Testing portable Windows To Go booting from an external drive, documenting early hardware detection and driver initialization ('Getting devices ready 20%').",
            sandboxObservation: "Close-up photograph of a laptop keyboard and screen showing Windows boot-phase hardware initialization: 'Getting devices ready 20%', verifying clean OS driver binding on external USB storage.",
            technicalBreakdown: "Windows To Go installs a specialized Windows PE/RE boot configuration onto external USB mass storage devices with SAN policy 4 enabled (offline internal disks) to prevent accidental data contamination of the host machine.",
            defensePlaybook: [
                                "UASP Protocol Verification: Ensure external drive enclosures support USB Attached SCSI Protocol (UASP) to maximize 4K random read/write IOPS during portable OS operation.",
                                "BitLocker Portable Encryption: Enforce BitLocker To Go encryption on external boot drives to safeguard personal files if the portable media is misplaced."
                ],
            containment: "Tested across physical laptop hardware and external USB SSD media.",
            credit: "Portable OS deployment and photography by Andrew Van Ek. Technical documentation co-authored with Google DeepMind Antigravity AI."
        },
        {
            id: "smb-tailscale-network-trace",
            title: "Network Diagnostics: Cross-Subnet SMB Packet Trace over Tailscale Mesh",
            category: "homelab",
            categoryLabel: "Network Architecture & Protocol Analysis",
            badgeClass: "badge-info",
            image: "images/gallery/approved2/smb-tailscale-network-packet-trace.png",
            thumb: "images/gallery/approved2/smb-tailscale-network-packet-trace-thumb.jpg",
            tags: ["Tailscale", "SMB", "Packet Trace", "Port 445", "Network Diagnostics"],
            summary: "Analyzing bidirectional network packet traces to verify SMB connectivity between macOS client (100.67.172.15) and Windows server (100.64.20.50) over Tailscale.",
            sandboxObservation: "Network diagnostic analysis log: 'We finally got a meaningful result from both sides: Mac 100.67.172.15 reached Windows 100.64.20.50:445. The trace shows the SMB connection establishes cleanly'.",
            technicalBreakdown: "Tracing TCP port 445 handshakes over <span class=\"tech-term\" data-term=\"tailscale\">Tailscale</span> confirms that WireGuard point-to-point tunnels successfully route <span class=\"tech-term\" data-term=\"smb\">SMB</span> traffic without carrier CGNAT interference or router firewall drops.",
            defensePlaybook: [
                                "Targeted Port Scanning: Utilize Test-NetConnection or nc -zv to confirm port 445 availability before mounting remote SMB paths.",
                                "Tailscale ACL Hardening: Enforce granular Tailscale ACL rules restricting port 445 access strictly between authorized workstations and file servers."
                ],
            containment: "Captured across verified Tailscale mesh diagnostic sessions.",
            credit: "Network trace analysis and troubleshooting by Andrew Van Ek. Technical documentation co-authored with Google DeepMind Antigravity AI."
        },
        {
            id: "lenovo-vantage-firmware-diagnostics",
            title: "OEM Diagnostics: Lenovo Vantage System Update & Hardware Telemetry",
            category: "hardware",
            categoryLabel: "Hardware Maintenance & Firmware Updates",
            badgeClass: "badge-info",
            image: "images/gallery/approved2/lenovo-vantage-firmware-update-diagnostics.jpg",
            thumb: "images/gallery/approved2/lenovo-vantage-firmware-update-diagnostics-thumb.jpg",
            tags: ["Lenovo Vantage", "System Update", "Firmware", "Hardware Diagnostics", "BIOS"],
            summary: "Using Lenovo Vantage and System Update tools to evaluate hardware health, thermal profiles, and install official UEFI/BIOS firmware updates.",
            sandboxObservation: "Browser interface displaying Lenovo Vantage software download and support documentation, researching official firmware update tools for system maintenance.",
            technicalBreakdown: "OEM diagnostic suites (Lenovo Vantage) communicate with ACPI embedded controllers (EC) and Intel Management Engine (ME) to flash signed firmware updates and manage battery charge thresholds.",
            defensePlaybook: [
                                "Official Firmware Verification: Download system updates exclusively through verified OEM channels with SHA-256 hash checks.",
                                "AC Power Safety: Never initiate BIOS/firmware flashing without reliable AC mains power and a fully charged battery."
                ],
            containment: "Administered on personal Lenovo workstation.",
            credit: "Firmware maintenance research by Andrew Van Ek. Technical documentation co-authored with Google DeepMind Antigravity AI."
        },
        {
            id: "andronix-mobile-linux-setup",
            title: "Mobile Linux: Andronix Chroot Setup & Initializing X11VNC Desktop Access",
            category: "homelab",
            categoryLabel: "Mobile Linux & Chroot Environments",
            badgeClass: "badge-info",
            image: "images/gallery/approved2/andronix-mobile-linux-chroot-user-setup.jpg",
            thumb: "images/gallery/approved2/andronix-mobile-linux-chroot-user-setup-thumb.jpg",
            tags: ["Andronix", "Ubuntu", "Mobile Linux", "chroot", "X11VNC", "VNC Desktop"],
            summary: "Provisioning user credentials and configuring an Andronix Ubuntu chroot environment on Android, working towards launching an X11VNC server for full graphical desktop access.",
            sandboxObservation: "Mobile terminal capture showing automated system provisioning in Andronix ('Setting root password... Adding user avanek...'), preparing the mobile Linux chroot environment on the road to running an X11VNC desktop server for graphical access.",
            technicalBreakdown: "Setting up Andronix on Android establishes an unprivileged or chrooted GNU/Linux environment. Configuring base user accounts and passwords is the prerequisite foundation before installing an X11 display server, window manager, and <span class=\"tech-term\" data-term=\"x11vnc\">X11VNC</span> daemon for remote graphical desktop access.",
            defensePlaybook: [
                                "VNC Security Hardening: Restrict X11VNC listener bindings to localhost when tunneling over SSH or require authenticated passwords for remote sessions.",
                                "Chroot User Isolation: Operate within the configured user account rather than root for standard graphical userland sessions."
                ],
            containment: "Executed within local mobile Linux chroot container.",
            credit: "Mobile Linux configuration and capture by Andrew Van Ek. Technical documentation co-authored with Google DeepMind Antigravity AI."
        },
        {
            id: "android-selinux-permissive-mounting",
            title: "Mobile Linux Troubleshooting: Investigating Android Chroot Mounts & SELinux Restrictions",
            category: "homelab",
            categoryLabel: "Mobile Security & Kernel Architecture",
            badgeClass: "badge-info",
            image: "images/gallery/approved2/android-selinux-permissive-chroot-mounting.png",
            thumb: "images/gallery/approved2/android-selinux-permissive-chroot-mounting-thumb.jpg",
            tags: ["Android", "Mobile Linux", "chroot", "SELinux", "Troubleshooting"],
            summary: "Troubleshooting hurdles encountered when attempting to get Linux running in a chroot on Android, researching whether SELinux Enforcing policies were blocking filesystem mount operations.",
            sandboxObservation: "Screenshot of AI advisory notes consulted while troubleshooting mobile Linux on Android, reviewing whether SELinux Enforcing mode prevents chroot mounts and exploring permissive mode adjustments.",
            technicalBreakdown: "Getting Linux distributions to run within Android often encounters permission roadblocks at the kernel level. Troubleshooting includes examining whether <span class=\"tech-term\" data-term=\"selinux\">SELinux</span> access policies (Enforcing vs. Permissive) are preventing loop mounts or filesystem bindings, or if alternative <span class=\"tech-term\" data-term=\"proot\">PRoot</span> userland methods are required.",
            defensePlaybook: [
                                "Mount Failure Diagnosis: Check dmesg and logcat for avc: denied entries to confirm if mount errors stem from SELinux policies rather than missing filesystem modules.",
                                "Minimal Policy Modification: Avoid leaving devices permanently in Permissive mode after testing, or utilize userland PRoot tools that avoid kernel mount restrictions altogether."
                ],
            containment: "Investigated during mobile Linux Android troubleshooting.",
            credit: "Android troubleshooting research and AI consultation by Andrew Van Ek. Technical documentation co-authored with Google DeepMind Antigravity AI."
        },
        {
            id: "lenovo-yoga-windows-10-external-ssd",
            title: "Hardware Execution: Lenovo Yoga Running Windows 10 from External USB SSD",
            category: "vms",
            categoryLabel: "OS Deployment & Portable Computing",
            badgeClass: "badge-info",
            image: "images/gallery/approved2/lenovo-yoga-running-windows-10-external-ssd.jpg",
            thumb: "images/gallery/approved2/lenovo-yoga-running-windows-10-external-ssd-thumb.jpg",
            tags: ["Lenovo Yoga", "Windows 10", "External SSD", "USB 3.0", "Performance"],
            summary: "Successfully booting and running a complete Windows 10 installation on the Lenovo Yoga from a high-speed external USB solid-state drive.",
            sandboxObservation: "Photograph of the Lenovo Yoga running an interactive Windows 10 desktop session booted entirely from an external SSD, showing Task Manager telemetry with 1.92 GHz CPU frequency and responsive system operation.",
            technicalBreakdown: "Executing a production OS over USB 3.0 requires reliable 5 Gbps bus throughput and low 4K random latency. By deploying Windows to an external SSD rather than a slow flash drive, boot times and app responsiveness match internal SATA storage.",
            defensePlaybook: [
                                "USB Power Management: Disable 'USB selective suspend' in Windows Power Options to prevent the OS from accidentally putting its own boot drive to sleep.",
                                "Write Caching Policies: Enable write caching on the external drive in Device Manager to boost performance while observing safe ejection protocols."
                ],
            containment: "Tested on physical Lenovo Yoga hardware with external solid-state storage.",
            credit: "Hardware deployment and photography by Andrew Van Ek. Technical documentation co-authored with Google DeepMind Antigravity AI."
        },
        {
            id: "satellite-imagery-gaming-hud",
            title: "Mobile Systems & UI: iPhone Satellite Connectivity Status & Gaming HUD Reference",
            category: "media",
            categoryLabel: "Mobile Systems & Interface Design",
            badgeClass: "badge-info",
            image: "images/gallery/approved2/satellite-imagery-and-retro-gaming-hud.png",
            thumb: "images/gallery/approved2/satellite-imagery-and-retro-gaming-hud-thumb.jpg",
            tags: ["iPhone", "Satellite", "Mobile UI", "Gaming HUD", "Telemetry"],
            summary: "Capturing an iPhone screen displaying an active Satellite connectivity indicator in the mobile status header alongside a retro gaming interface and HUD layout.",
            sandboxObservation: "Mobile screen capture highlighting the iPhone status bar displaying the 'Satellite' indicator (Apple Emergency SOS via satellite telemetry) alongside a stylized mobile gaming HUD asset.",
            technicalBreakdown: "Modern mobile platforms support direct Low Earth Orbit (LEO) satellite communications. When standard terrestrial cellular and Wi-Fi networks are unavailable, iOS transitions status telemetry to indicate an active satellite link, coordinating RF handshakes with overhead orbital constellations for off-grid messaging.",
            defensePlaybook: [
                                "Line-of-Sight Calibration: Direct satellite links require an unobstructed line of sight to open sky; avoid heavy tree canopies or indoor structures when testing satellite telemetry.",
                                "Status Bar Fallback Verification: Ensure applications gracefully accommodate changing network statuses when moving between cellular, Wi-Fi, and emergency satellite modes."
                ],
            containment: "Captured on personal mobile hardware.",
            credit: "Mobile screenshot and interface analysis by Andrew Van Ek. Technical documentation co-authored with Google DeepMind Antigravity AI."
        },
        {
            id: "teams-collaborative-live-editing",
            title: "Remote Collaboration: Microsoft Teams Live Co-Authoring & Homelab Multitasking",
            category: "media",
            categoryLabel: "Remote Collaboration & Multi-Tasking",
            badgeClass: "badge-info",
            image: "images/gallery/approved2/teams-collaborative-live-editing-call.png",
            thumb: "images/gallery/approved2/teams-collaborative-live-editing-call-thumb.jpg",
            tags: ["Microsoft Teams", "Live Co-Authoring", "Folding@home", "CompTIA", "Remote Collaboration"],
            summary: "Participating in a collaborative Microsoft Teams working session while managing live cloud document edits, Folding@home client telemetry, and CompTIA study materials.",
            sandboxObservation: "Multi-window desktop showing an active Microsoft Teams video call alongside browser tabs for live document co-authoring, the local Folding@home client monitor, and CompTIA certification study materials.",
            technicalBreakdown: "Modern multi-threaded workstations manage simultaneous real-time WebRTC audio/video encoding, distributed compute workloads (Folding@home), and cloud document synchronization without audio dropouts or interface lag.",
            defensePlaybook: [
                                "Bandwidth Prioritization: Enforce Quality of Service (QoS) router rules prioritizing VoIP/Teams traffic over background computational transfers.",
                                "Microphone & Camera Privacy: Utilize hardware mute toggles and verify camera indicators during remote collaborative calls."
                ],
            containment: "Active collaborative workstation session.",
            credit: "Collaborative workflow capture by Andrew Van Ek. Technical documentation co-authored with Google DeepMind Antigravity AI."
        },
        {
            id: "windows-10-end-of-support-wild",
            title: "Enterprise Lifecycle Management: Windows 10 End of Support Full-Screen Notification",
            category: "vms",
            categoryLabel: "Enterprise IT & OS Lifecycle Management",
            badgeClass: "badge-info",
            image: "images/gallery/approved2/windows-10-end-of-support-notification.jpg",
            thumb: "images/gallery/approved2/windows-10-end-of-support-notification-thumb.jpg",
            tags: ["Windows 10", "End of Support", "OS Migration", "Lifecycle Management", "IT Planning"],
            summary: "Documenting Microsoft's full-screen End of Support notification on a production Windows 10 system, highlighting migration deadlines (October 14, 2025).",
            sandboxObservation: "Full-screen photograph of a computer monitor displaying Microsoft's official EOS notification: 'It\\'s time to upgrade your PC before end of support - End of support for Windows 10 arrives on October 14th, 2025. This means your PC won\\'t receive security updates...'.",
            technicalBreakdown: "Operating system lifecycle milestones (EOS/EOL) present significant enterprise cybersecurity challenges. Systems remaining on Windows 10 post-October 2025 require Extended Security Updates (ESU) or migration to Windows 11 / Linux to prevent exposure to unpatched zero-day vulnerabilities.",
            defensePlaybook: [
                                "Hardware Readiness Audits: Execute automated PowerShell scripts querying TPM 2.0 and Secure Boot status across all fleet PCs to identify upgradeable hardware.",
                                "Phased OS Migration: Transition aging hardware to lightweight Linux distributions (Linux Mint, Alpine) rather than discarding functional compute."
                ],
            containment: "Captured in-the-wild on physical client workstation.",
            credit: "Lifecycle documentation and photography by Andrew Van Ek. Technical documentation co-authored with Google DeepMind Antigravity AI."
        },
        {
            id: "windows-xp-media-center-device-manager",
            title: "Retro Computing: Windows XP Media Center Edition 2005 Device Manager Hardware Audit",
            category: "vms",
            categoryLabel: "Retro Computing & Systems Restoration",
            badgeClass: "badge-info",
            image: "images/gallery/approved2/windows-xp-media-center-device-manager.jpg",
            thumb: "images/gallery/approved2/windows-xp-media-center-device-manager-thumb.jpg",
            tags: ["Windows XP", "Media Center Edition", "Device Manager", "IDE ATA", "Retro Hardware"],
            summary: "Auditing hardware controllers, IDE ATA/ATAPI storage channels, and legacy multimedia hardware in Windows XP Media Center Edition 2005.",
            sandboxObservation: "Vintage CRT/LCD monitor displaying Windows XP Media Center Edition 2005 desktop with Device Manager open, inspecting IDE ATA/ATAPI controllers, legacy audio drivers, and expansion hardware.",
            technicalBreakdown: "Windows XP Media Center Edition 2005 (Codename 'Symphony') represents the pinnacle of the eHome media architecture, requiring specialized hardware MPEG-2 decoder cards, TV tuners, and dedicated IR remote transceivers.",
            defensePlaybook: [
                                "Air-Gapped Network Isolation: Keep legacy Windows XP machines strictly air-gapped or segmented onto isolated retro VLANs with zero WAN routing.",
                                "Driver Preservation: Back up the C:\\Windows\\Driver Cache and INF trees to preserve irreplaceable legacy hardware support."
                ],
            containment: "Physical vintage tower PC running Windows XP Media Center Edition.",
            credit: "Retro computing restoration and photography by Andrew Van Ek. Technical documentation co-authored with Google DeepMind Antigravity AI."
        },
        {
            id: "vintage-desktop-pc-teardown",
            title: "Hardware Servicing: Vintage PC Chassis Disassembly & HDD Adapter Installation",
            category: "hardware",
            categoryLabel: "Hardware Repair & Maintenance",
            badgeClass: "badge-info",
            image: "images/gallery/approved2/vintage-desktop-pc-chassis-teardown.jpg",
            thumb: "images/gallery/approved2/vintage-desktop-pc-chassis-teardown-thumb.jpg",
            tags: ["Hardware Workbench", "Vintage PC", "HDD Adapter", "Storage Upgrade", "Chassis Maintenance"],
            summary: "Servicing an opened vintage computer chassis on the workbench, preparing internal bays and cabling to mount a hard disk drive (HDD) using an interface adapter bracket.",
            sandboxObservation: "Workbench photograph of an opened vintage computer chassis during hardware modification, showing internal drive bays, wiring harnesses, and component layout while preparing to install a hard drive with an adapter bracket.",
            technicalBreakdown: "Integrating replacement storage drives into vintage computer enclosures frequently requires drive sled adapters or interface bridge adapters (such as 2.5-inch to 3.5-inch bay brackets or IDE/SATA conversion adapters) to accommodate non-standard internal chassis mounting holes and power harnesses.",
            defensePlaybook: [
                                "Drive Sled & Adapter Alignment: Ensure drive adapter brackets are mechanically secured to prevent vibration and chassis ground shorts before closing the casing.",
                                "Power Header Pinout Safety: Verify legacy 4-pin Molex to SATA power adapter wiring matches standard 12V and 5V rail pinouts before powering storage drives."
                ],
            containment: "Executed on a physical hardware repair workbench.",
            credit: "Hardware assembly and workbench photography by Andrew Van Ek. Technical documentation co-authored with Google DeepMind Antigravity AI."
        }
,
        {
            id: "danabot-banking-trojan-cmd-execution",
            title: "DanaBot Banking Trojan: Transient Command Prompt & Process Execution Trace",
            category: "security",
            categoryLabel: "Banking Trojan & Evasion",
            badgeClass: "badge-danger",
            image: "images/gallery/approved3/danabot-banking-trojan-cmd-execution.png",
            thumb: "images/gallery/approved3/danabot-banking-trojan-cmd-execution-thumb.jpg",
            tags: ["DanaBot", "Banking Trojan", "Malware Analysis", "Windows Sandbox", "Process Trace"],
            summary: "Analyzing the fleeting command execution window of the DanaBot modular banking trojan inside Windows Sandbox during initial loader launch.",
            sandboxObservation: "Windows Sandbox environment executing DanaBot.exe from The-MALWARE-Repo, capturing the transient console command window spawned during initial stage extraction before evasion hooks suppress the prompt.",
            technicalBreakdown: "DanaBot is a modular <span class=\"tech-term\" data-term=\"banking-trojan\">banking trojan</span> notorious for multi-stage loader evasion. During initial detonation, it briefly spawns command-line processes or batch scripts to perform anti-analysis environment checks, decrypt secondary payloads, and inject malicious DLLs into legitimate system processes before terminating the parent console window.",
            defensePlaybook: [
                "Process Creation Telemetry (Sysmon Event ID 1): Monitor for rapid parent-child process anomalies where command line tools spawn briefly from user download directories and exit within milliseconds.",
                "Network Egress Filtering: Block C2 callback attempts on non-standard ports commonly leveraged by DanaBot affiliates for beaconing and configuration downloads."
            ],
            containment: "Isolated within disposable <span class=\"tech-term\" data-term=\"windows-sandbox\">Windows Sandbox</span> session (WDAGUtilityAccount).",
            credit: "Sandbox capture and malware forensics by Andrew Van Ek. Technical documentation co-authored with Google DeepMind Antigravity AI."
        },
        {
            id: "slider-puzzle-screen-locker-trojan",
            title: "Slider 1.0 Screen Locker Trojan: Interactive Sliding Tile Hostage Lock",
            category: "security",
            categoryLabel: "Screen Locker & Winlocker",
            badgeClass: "badge-danger",
            image: "images/gallery/approved3/slider-puzzle-screen-locker-trojan.png",
            thumb: "images/gallery/approved3/slider-puzzle-screen-locker-trojan-thumb.jpg",
            tags: ["DesktopPuzzle", "Screen Locker", "Trojan", "Malware Analysis", "Windows Sandbox"],
            summary: "Documenting the interactive lock screen payload of the DesktopPuzzle / Slider 1.0 trojan forcing the user to complete a sliding tile puzzle to regain desktop access.",
            sandboxObservation: "Windows Sandbox session running DesktopPuzzle (240 KB Application) from the Trojan repository, triggering a modal alert stating: 'Oops, looks like somebody doesn\'t like you very much ! You have to finish this sliding tile puzzle before you can continue whatever it is you\'re doing ! Use the cursor keys to move the pieces (black piece is the empty one)'.",
            technicalBreakdown: "Screen locker trojans (Winlockers) intercept user input, keyboard focus, and desktop interactions without necessarily encrypting underlying disk files. DesktopPuzzle couples window management hooking with an interactive gamified restriction mechanism to disrupt operations and test user persistence.",
            defensePlaybook: [
                "Safe Mode / Recovery Boot: Screen lockers lacking driver-level persistence or full-disk encryption can be bypassed by booting into Safe Mode or Windows Recovery Environment (WinRE) to disable startup run keys.",
                "Endpoint Privilege Management: Enforce standard user privileges to block rogue binaries from hooking low-level Windows keyboard messages (WH_KEYBOARD_LL) or terminating Task Manager."
            ],
            containment: "Isolated within disposable <span class=\"tech-term\" data-term=\"windows-sandbox\">Windows Sandbox</span> session (WDAGUtilityAccount).",
            credit: "Sandbox capture and malware forensics by Andrew Van Ek. Technical documentation co-authored with Google DeepMind Antigravity AI."
        },
        {
            id: "dharma-ransomware-driver-blocklist-byovd",
            title: "Dharma Ransomware: Vulnerable Driver Blocklist & BYOVD Neutralization",
            category: "security",
            categoryLabel: "BYOVD Kernel Defense",
            badgeClass: "badge-danger",
            image: "images/gallery/approved3/dharma-ransomware-driver-blocklist-byovd.png",
            thumb: "images/gallery/approved3/dharma-ransomware-driver-blocklist-byovd-thumb.jpg",
            tags: ["Dharma", "CrySiS", "Ransomware", "BYOVD", "Driver Blocklist", "Windows Sandbox"],
            summary: "Observing Windows Hypervisor-protected Code Integrity (HVCI) and vulnerable driver blocklists actively intercepting Dharma ransomware's kernel driver exploitation attempt.",
            sandboxObservation: "Windows Sandbox desktop populated by cascading Program Compatibility Assistant alerts reading: 'A driver cannot load on this device: Driver: atvxvgfgfrxsofygk.sys ... A security setting is detecting this as a vulnerable driver and blocking it from loading' alongside 'Load Driver Error!' and PC Hunter / nc123.exe execution from the Dharma ransomware directory.",
            technicalBreakdown: "Modern <span class=\"tech-term\" data-term=\"ransomware\">ransomware</span> variants (including Dharma / CrySiS distributions) frequently deploy Bring Your Own Vulnerable Driver (<span class=\"tech-term\" data-term=\"byovd\">BYOVD</span>) tactics, attempting to drop legitimate but known-vulnerable signed third-party drivers (such as antirootkit drivers like PC Hunter) to terminate endpoint detection and response (EDR) agents from kernel space. Windows Driver Blocklist and Hypervisor-protected Code Integrity (<span class=\"tech-term\" data-term=\"hvci\">HVCI</span>) effectively neutralize this vector by refusing to load blacklisted vulnerable drivers.",
            defensePlaybook: [
                "Enable Microsoft Vulnerable Driver Blocklist: Enforce WDAC (Windows Defender Application Control) kernel driver blocklists to neutralize BYOVD attacks regardless of administrative privilege.",
                "Hypervisor-protected Code Integrity (HVCI): Ensure Memory Integrity / HVCI is enabled in Windows Core Isolation settings to prevent unsigned or vulnerable driver execution."
            ],
            containment: "Isolated within disposable <span class=\"tech-term\" data-term=\"windows-sandbox\">Windows Sandbox</span> session (WDAGUtilityAccount).",
            credit: "Sandbox capture and malware forensics by Andrew Van Ek. Technical documentation co-authored with Google DeepMind Antigravity AI."
        },
        {
            id: "fun-fun-funny-gdi-screen-payload-trojan",
            title: "FunFunFun GDI Payload Trojan: Rapid Alert Spam & Screen Pixel Crosshatching",
            category: "security",
            categoryLabel: "GDI Destruction & Screen Payload",
            badgeClass: "badge-danger",
            image: "images/gallery/approved3/fun-fun-funny-gdi-screen-payload-trojan.png",
            thumb: "images/gallery/approved3/fun-fun-funny-gdi-screen-payload-trojan-thumb.jpg",
            tags: ["GDI Payload", "Screen Destroyer", "Trojan", "Malware Forensics", "Windows Sandbox"],
            summary: "Executing a visual destruction / screen perturbation payload spawning cascading message boxes and dynamic desktop GDI pixel crosshatching.",
            sandboxObservation: "Windows Sandbox displaying an aggressive crosshatched pattern of rasterized static across the browser and desktop canvas, overlaid with multiple spawned message boxes titled 'FUN FUN FUN FUN FUN!!!!' with body text 'A very funny thing is happening!'.",
            technicalBreakdown: "Screen destroyer and annoyance trojans manipulate the Windows Graphics Device Interface (<span class=\"tech-term\" data-term=\"gdi\">GDI</span>) via functions such as GetDC, PatBlt, BitBlt, and CreatePen to render chaotic visual artifacts directly to the desktop device context (GetDC(NULL)). Concurrently, multi-threaded loops spawn non-blocking user32 MessageBox alerts to exhaust window message queues and disorient the operator.",
            defensePlaybook: [
                "GDI & Desktop Window Manager Isolation: Modern container architectures and application sandboxes prevent untrusted guest processes from obtaining direct device context handles to the host compositor.",
                "Application Whitelisting: Restrict execution of standalone unsigned script/executables from user temporary directories using AppLocker or Software Restriction Policies."
            ],
            containment: "Isolated within disposable <span class=\"tech-term\" data-term=\"windows-sandbox\">Windows Sandbox</span> session (WDAGUtilityAccount).",
            credit: "Sandbox capture and malware forensics by Andrew Van Ek. Technical documentation co-authored with Google DeepMind Antigravity AI."
        },
        {
            id: "krotten-ransomware-cyrillic-lock-note",
            title: "Trojan-Ransom Krotten: Registry Hijacking & Mojibake Cyrillic Ransom Note",
            category: "security",
            categoryLabel: "Trojan-Ransomware Registry Hijack",
            badgeClass: "badge-danger",
            image: "images/gallery/approved3/krotten-ransomware-cyrillic-lock-note.png",
            thumb: "images/gallery/approved3/krotten-ransomware-cyrillic-lock-note-thumb.jpg",
            tags: ["Krotten", "Ransomware", "Trojan-Ransom", "Registry Hijack", "Windows Sandbox"],
            summary: "Isolating the Krotten ransomware sample inside Windows Sandbox, documenting its signature Cyrillic ransom message dialog and extortion contact channel.",
            sandboxObservation: "Windows Sandbox File Explorer displaying Krotten (54 KB Application) in the Ransomware directory, triggering a modal notification dialog with title 'Âñå âïîðÿäêå!' (Все в порядке! / Everything is fine!) displaying a corrupted Windows-1252 Cyrillic ransom message demanding contact at 'wordsia@notrix.de'.",
            technicalBreakdown: "Trojan-Ransom.Win32.Krotten is an infamous early <span class=\"tech-term\" data-term=\"ransomware\">ransomware</span>/wiper family created to corrupt system settings rather than encrypting files with strong public-key cryptography. It modifies critical Windows Registry hives (disabling Taskmgr, Regedit, and Safe Mode keys) and presents a deceptive message box while sabotaging user shell navigation.",
            defensePlaybook: [
                "Registry Integrity Monitoring: Monitor changes to sensitive registry keys under HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\System (DisableTaskMgr, DisableRegistryTools).",
                "Offline System State Backups: Maintain volume shadow copies and regular offsite system state backups to roll back malicious registry and policy tampering without paying extortion."
            ],
            containment: "Isolated within disposable <span class=\"tech-term\" data-term=\"windows-sandbox\">Windows Sandbox</span> session (WDAGUtilityAccount).",
            credit: "Sandbox capture and malware forensics by Andrew Van Ek. Technical documentation co-authored with Google DeepMind Antigravity AI."
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
        if (typeof window.initTechAnalogies === "function") {
            window.initTechAnalogies();
        }
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
                '  <h3><span class="section-icon">&#128737;</span> ' + (item.playbookHeading || (item.category === "hardware" ? "What I Was Solving" : "Defensive Hardening &amp; Playbook")) + '</h3>',
                '  <ul>' + defenseListHtml + '</ul>',
                '</div>',
                '<div class="gallery-drawer-section">',
                '  <h3><span class="section-icon">&#128274;</span> ' + (item.outcomeHeading || (item.category === "hardware" ? "Progress &amp; Documented Outcome" : "Containment &amp; Testing Discipline")) + '</h3>',
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
