/**
 * Gallery & Sandbox Showcase Script
 * Features:
 * - Dynamic Category Filtering
 * - Fullscreen Lightbox Modal
 * - Desktop Zoom Slider & Interactive Buttons
 * - Touch Pinch-to-Zoom (2-finger) & Double-Tap
 * - Pan/Drag when Zoomed
 * - Keyboard Shortcuts (Esc, Arrows, +, -, 0)
 * - Dynamic Integration with Tech Term Analogies
 * - Co-authored with Google DeepMind Antigravity AI
 */

(function () {
    "use strict";

    var galleryItems = [
        {
            id: "wannacry",
            title: "WannaCry Ransomware (EternalBlue MS17-010)",
            category: "ransomware",
            categoryLabel: "Cryptographic Ransomware",
            badgeClass: "badge-danger",
            image: "images/gallery/wannacry-sandbox-test.png",
            thumb: "images/gallery/wannacry-sandbox-test.png",
            tags: ["WannaCry", "Ransomware", "EternalBlue", "Windows Sandbox", "Da2dalus"],
            summary: "Detonation of the notorious Wanna Decryptor 1.0 payload inside Windows Sandbox, presenting extortion timers and Bitcoin payment demands.",
            sandboxObservation: "Detonated cleanly within disposable Windows Sandbox memory. The malware background process enumerated virtual directories and deployed its UI prompt over active windows. As seen in the background, test files and references were pulled directly from the Da2dalus malware repository for controlled academic analysis.",
            technicalBreakdown: "WannaCry deploys high-grade asymmetric cryptography (AES-128 coupled with RSA-2048) to encrypt targeted file extensions (.docx, .pdf, .zip, .jpg). It historically spread as a worm by exploiting the <span class=\"tech-term\" data-term=\"ransomware\">MS17-010 EternalBlue</span> SMBv1 vulnerability. Once locked, the software presents a persistent decryption GUI with automated countdown clocks.",
            defensePlaybook: [
                "Strict Patch Management: Ensure Microsoft security bulletin MS17-010 (KB4012598) is installed across all endpoints.",
                "Disable Legacy SMBv1: Deprecate and completely disable SMBv1 across enterprise group policies and client machines.",
                "Perimeter Firewall Rules: Block TCP ports 139 and 445 at the gateway boundary to eliminate unauthenticated external access.",
                "Immutable Backups: Maintain offline, air-gapped, or write-once (WORM) backups that cannot be overwritten by infected endpoints."
            ],
            containment: "Executed exclusively inside <span class=\"tech-term\" data-term=\"windows-sandbox\">Windows Sandbox</span>. No shared host folders or host networking were active during execution. The entire sandbox hypervisor state was discarded upon closing, leaving the host operating system completely untouched.",
            credit: "Exploration & sandbox telemetry captured by Andrew Van Ek. Technical breakdown and mitigation playbook co-authored with Google DeepMind Antigravity AI pair programmer."
        },
        {
            id: "redeye",
            title: "RedEye Ransomware (Active Filesystem Destruction)",
            category: "ransomware",
            categoryLabel: "Active Encryption",
            badgeClass: "badge-danger",
            image: "images/gallery/redeye-ransomware-encryption.png",
            thumb: "images/gallery/redeye-ransomware-encryption.png",
            tags: ["RedEye", "Filesystem Encryption", "VSS Purge", "Windows Sandbox"],
            summary: "Real-time capture of File Explorer showing test binaries actively encrypted and rewritten with the .RedEye extension.",
            sandboxObservation: "During this test, RedEye immediately began mass-encrypting binaries and files across the virtual user profile. Watching Windows Explorer refresh in real time as file extensions mutated to .RedEye demonstrated how rapidly a modern ransomware payload can tear through a filesystem.",
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
            category: "pranks",
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
            category: "ransomware",
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
                "Startup Integrity Monitoring: Inspect registry run keys (<code>HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run</code>) for persistence mechanisms.",
                "Safe Mode Boot: If locked on physical hardware, boot into Windows Safe Mode to bypass non-essential startup screen blockers."
            ],
            containment: "Executed in <span class=\"tech-term\" data-term=\"windows-sandbox\">Windows Sandbox</span>. Because the sandbox is ephemeral, closing the sandbox window instantly terminated the hook without needing kernel debugging.",
            credit: "Experiment captured by Andrew Van Ek. Technical reverse-engineering notes compiled with Google DeepMind Antigravity AI."
        },
        {
            id: "suckylocker",
            title: "$ucyLocker (High-Contrast Threat Locker)",
            category: "ransomware",
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
            category: "trojans",
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
            category: "ransomware",
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
            category: "trojans",
            categoryLabel: "Scareware / Trojan Dropper",
            badgeClass: "badge-warning",
            image: "images/gallery/fake-adwcleaner-scareware.png",
            thumb: "images/gallery/fake-adwcleaner-scareware.png",
            tags: ["Fake AdwCleaner", "Scareware", "Banking Trojan", "Social Engineering", "Windows Sandbox"],
            summary: "Phony utility mimicking the legitimate AdwCleaner interface, generating fake registry infections from Banking-Malware samples.",
            sandboxObservation: "The executable displayed a polished replica of the AdwCleaner interface. It ran a fake animated progress bar before reporting 7 fabricated \"Very High\" infections (such as Win32.Stealer Trojan and Win32.cc Logger). The sample originated from a banking malware repository containing DanaBot, Emotet, and Dridex.",
            technicalBreakdown: "This represents <span class=\"tech-term\" data-term=\"rogue-antivirus\">rogue security software / scareware</span>. The malware intentionally fabricates alarming infection reports to panic the victim into downloading an additional \"remediation tool\" that serves as a dropper for destructive banking trojans like Emotet or Dridex.",
            defensePlaybook: [
                "Verify Software Provenance: Always download utility software directly from official vendor domains (e.g., Malwarebytes for AdwCleaner).",
                "Hash Verification: Compare downloaded file hashes (SHA-256) against official release checksums and VirusTotal records.",
                "DNS Filtering: Implement DNS filtering (such as Quad9 or Cloudflare for Families) to block known malicious download domains.",
                "Zero Trust Execution: Prevent execution of unknown binaries downloaded from untrusted file-sharing repositories."
            ],
            containment: "Executed within <span class=\"tech-term\" data-term=\"windows-sandbox\">Windows Sandbox</span>. The deception and simulated scan were thoroughly analyzed without risking physical credentials.",
            credit: "Investigation and capture by Andrew Van Ek. Threat vector breakdown and defensive recommendations produced with Google DeepMind Antigravity AI."
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

    var dom = {
        grid: document.getElementById("gallery-grid"),
        filterBtns: document.querySelectorAll(".gallery-filter-btn"),
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
        setZoom(1.0, true);
    }

    function openLightbox(index) {
        state.currentIndex = index;
        resetZoom();
        populateDrawer(index);

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
                '  <h3><span class="section-icon">&#128300;</span> What Happened in the Sandbox</h3>',
                '  <p>' + item.sandboxObservation + '</p>',
                '</div>',
                '<div class="gallery-drawer-section">',
                '  <h3><span class="section-icon">&#9881;</span> How the Payload Operates</h3>',
                '  <p>' + item.technicalBreakdown + '</p>',
                '</div>',
                '<div class="gallery-drawer-section section-defense">',
                '  <h3><span class="section-icon">&#128737;</span> Defensive Hardening Playbook</h3>',
                '  <ul>' + defenseListHtml + '</ul>',
                '</div>',
                '<div class="gallery-drawer-section">',
                '  <h3><span class="section-icon">&#128274;</span> Containment &amp; Sandbox Safety</h3>',
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

    function initEvents() {
        // Filter Buttons
        if (dom.filterBtns) {
            dom.filterBtns.forEach(function (btn) {
                btn.addEventListener("click", function () {
                    dom.filterBtns.forEach(function (b) { b.classList.remove("active"); });
                    btn.classList.add("active");
                    state.activeCategory = btn.getAttribute("data-category") || "all";
                    renderGrid();
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

        // Mouse Wheel Zoom
        if (dom.imgViewport) {
            dom.imgViewport.addEventListener("wheel", function (e) {
                e.preventDefault();
                var delta = e.deltaY < 0 ? 0.25 : -0.25;
                setZoom(state.scale + delta, false);
            }, { passive: false });

            // Mouse Drag Panning
            dom.imgViewport.addEventListener("mousedown", function (e) {
                if (state.scale <= 1.0) return;
                state.isDragging = true;
                state.dragStartX = e.clientX - state.panX;
                state.dragStartY = e.clientY - state.panY;
                dom.imgViewport.classList.add("is-panning");
            });

            window.addEventListener("mousemove", function (e) {
                if (!state.isDragging) return;
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
    }

    function init() {
        renderGrid();
        initEvents();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
