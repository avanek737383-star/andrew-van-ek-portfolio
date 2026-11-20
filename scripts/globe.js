// Andrew Van Ek Portfolio | 3D Planetary Radar & Global Internet Backbone
// Powered by Three.js & globe.gl

(function () {
    "use strict";

    var container = document.getElementById("globe-container");
    if (!container) return;

    if (typeof Globe === "undefined") {
        console.error("Globe library not loaded.");
        return;
    }

    var world = null;
    var allCables = [];
    var allLandings = [];
    var allNodes = [];
    var allArcs = [];
    var activeFilter = "all";
    var autoRotateActive = true;
    var atmosphereOn = true;
    var nightMode = true;

    // DOM Elements
    var drawer = document.getElementById("telemetry-drawer");
    var drawerTitle = document.getElementById("drawer-title");
    var drawerDomain = document.getElementById("drawer-domain");
    var drawerDomainDot = document.getElementById("drawer-domain-dot");
    var drawerTypeBadge = document.getElementById("drawer-type-badge");
    var drawerStatusBadge = document.getElementById("drawer-status-badge");
    var drawerSummary = document.getElementById("drawer-summary");
    var drawerTasksSection = document.getElementById("drawer-tasks-section");
    var drawerTasksList = document.getElementById("drawer-tasks-list");
    var drawerTechSection = document.getElementById("drawer-tech-section");
    var drawerTechTags = document.getElementById("drawer-tech-tags");
    var drawerProjectLink = document.getElementById("drawer-project-link");
    var drawerCloseBtn = document.getElementById("drawer-close-btn");

    var searchInput = document.getElementById("hud-search-input");
    var searchResults = document.getElementById("hud-search-results");
    var resetBtn = document.getElementById("hud-reset-btn");
    var rotateBtn = document.getElementById("hud-rotate-btn");
    var homelabBtn = document.getElementById("hud-homelab-btn");
    var atmosBtn = document.getElementById("hud-atmos-btn");
    var textureBtn = document.getElementById("hud-texture-btn");
    var filterPills = document.querySelectorAll(".filter-pill");

    // Homelab, Cloud Compute & Major Tier 1 IXPs
    var infrastructureNodes = [
        {
            id: "homelab-nuc",
            name: "Alpine Linux NUC Homelab",
            category: "homelab",
            type: "Homelab Primary Infrastructure",
            status: "Online & Operational",
            statusClass: "completed",
            lat: 42.9634,
            lng: -85.6681,
            color: "#10b981",
            size: 0.9,
            ping: "0.4 ms (Local Loopback)",
            location: "Grand Rapids, Michigan, USA",
            specs: "Intel NUC8i3BEH, Alpine Linux 3.20 (musl libc), Docker, Tailscale Mesh, AdGuard Home, PaperMC, 1 TB NVMe SSD + 1 TB Mirror",
            projectLink: "projects.html#nuc-remote-desktop-title",
            projectTitle: "View Homelab NUC Architecture & Maintenance Log"
        },
        {
            id: "gcp-vm",
            name: "Google Cloud Debian 12 Compute VM",
            category: "homelab",
            type: "Cloud AI & Batch Compute",
            status: "Online & Synced",
            statusClass: "completed",
            lat: 41.2619,
            lng: -95.8608,
            color: "#38bdf8",
            size: 0.75,
            ping: "28 ms via Fiber Backbone",
            location: "Council Bluffs, Iowa, USA (us-central1)",
            specs: "Google Cloud Platform e2-medium, Debian 12 (Bookworm), Continuous LCM Stable Diffusion 1080p Generator, Rclone FUSE Google Drive Sync",
            projectLink: "projects.html#gcp-realistic-vision-v6-title",
            projectTitle: "View Google Cloud VM Realistic Vision Project"
        },
        {
            id: "azure-vm",
            name: "Azure Linux Compute VM",
            category: "homelab",
            type: "Cloud Distributed Research",
            status: "Online & Compute Active",
            statusClass: "completed",
            lat: 36.6534,
            lng: -78.3756,
            color: "#c084fc",
            size: 0.75,
            ping: "34 ms via Transcontinental Fiber",
            location: "Boydton / Richmond, Virginia, USA (East US)",
            specs: "Microsoft Azure Standard D2s, Ubuntu/Debian, Folding@Home distributed astrophysics node, Tailscale Mesh peering",
            projectLink: "projects.html#azure-folding-home-title",
            projectTitle: "View Azure Folding@home Project"
        },
        {
            id: "tailscale-router",
            name: "Tailscale Subnet Gateway & Mesh Relay",
            category: "homelab",
            type: "Encrypted WireGuard Mesh Gateway",
            status: "Encrypted & Routing",
            statusClass: "completed",
            lat: 42.94,
            lng: -85.64,
            color: "#f59e0b",
            size: 0.65,
            ping: "1.2 ms (Subnet Transit)",
            location: "Grand Rapids, Michigan, USA",
            specs: "Full-mesh WireGuard overlay routing 192.168.0.0/24 subnet, NAT-traversal DERP relay, secure zero-config tunneling",
            projectLink: "projects.html#private-router-tailscale-title",
            projectTitle: "View Tailscale Subnet Router Project"
        },
        {
            id: "gvsu-node",
            name: "GVSU IT Lab & Academic Gateway",
            category: "homelab",
            type: "Academic & Service Desk Node",
            status: "Active Academic Hub",
            statusClass: "completed",
            lat: 42.9644,
            lng: -85.8889,
            color: "#3b82f6",
            size: 0.65,
            ping: "4.8 ms (Campus Fiber)",
            location: "Allendale, Michigan, USA",
            specs: "Campus multi-switch LAN, IT Service Desk virtual chatbot workflows, Tanium enterprise endpoint automation",
            projectLink: "projects.html#gvsu-it-chatbot-title",
            projectTitle: "View GVSU IT Service Desk Chatbot Project"
        },
        // Tier 1 Global Internet Exchange Points (IXPs)
        {
            id: "ixp-ashburn",
            name: "Equinix Ashburn (DC1 - DC15)",
            category: "ixp",
            type: "Tier 1 Global Internet Exchange",
            status: "70% World Internet Traffic",
            statusClass: "completed",
            lat: 39.0438,
            lng: -77.4874,
            color: "#ec4899",
            size: 0.8,
            ping: "24 ms from Grand Rapids",
            location: "Ashburn, Virginia, USA (Data Center Capital of the World)",
            specs: "Northern Virginia hyperscale hub interconnecting major subsea cables, AWS us-east-1, Azure East US, and transatlantic fiber corridors.",
            projectLink: "projects.html#interactive-3d-planetary-backbone-title",
            projectTitle: "Explore Subsea Fiber & Backbone Topology"
        },
        {
            id: "ixp-frankfurt",
            name: "DE-CIX Frankfurt",
            category: "ixp",
            type: "Tier 1 European Internet Exchange",
            status: "17+ Tbps Peak Throughput",
            statusClass: "completed",
            lat: 50.1109,
            lng: 8.6821,
            color: "#ec4899",
            size: 0.8,
            ping: "98 ms via Transatlantic MAREA",
            location: "Frankfurt am Main, Germany",
            specs: "World leading interconnection platform connecting over 1,100 national and international networks across Central Europe.",
            projectLink: "projects.html#interactive-3d-planetary-backbone-title",
            projectTitle: "Explore Subsea Fiber & Backbone Topology"
        },
        {
            id: "ixp-amsterdam",
            name: "AMS-IX Amsterdam",
            category: "ixp",
            type: "Tier 1 European Internet Exchange",
            status: "11+ Tbps Peak Traffic",
            statusClass: "completed",
            lat: 52.3676,
            lng: 4.9041,
            color: "#ec4899",
            size: 0.75,
            ping: "94 ms via Transatlantic Fiber",
            location: "Amsterdam, Netherlands",
            specs: "Key European digital gateway connecting Atlantic cable landings to Scandinavia and continental Europe.",
            projectLink: "projects.html#interactive-3d-planetary-backbone-title",
            projectTitle: "Explore Subsea Fiber & Backbone Topology"
        },
        {
            id: "ixp-london",
            name: "LINX London Internet Exchange",
            category: "ixp",
            type: "Tier 1 UK Internet Exchange",
            status: "8.5+ Tbps Peak Traffic",
            statusClass: "completed",
            lat: 51.5074,
            lng: -0.1278,
            color: "#ec4899",
            size: 0.75,
            ping: "89 ms via Transatlantic Fiber",
            location: "London, United Kingdom",
            specs: "Core UK peering exchange terminating subsea routes from Bude, Cornwall and transatlantic landings.",
            projectLink: "projects.html#interactive-3d-planetary-backbone-title",
            projectTitle: "Explore Subsea Fiber & Backbone Topology"
        },
        {
            id: "ixp-tokyo",
            name: "JPNAP / BBIX Tokyo",
            category: "ixp",
            type: "Tier 1 Asia-Pacific Internet Exchange",
            status: "5+ Tbps Peak Traffic",
            statusClass: "completed",
            lat: 35.6762,
            lng: 139.6503,
            color: "#ec4899",
            size: 0.75,
            ping: "145 ms via Transpacific FASTER",
            location: "Tokyo, Japan",
            specs: "Primary Pacific gateway routing transpacific subsea links to East Asia and Southeast Asian data corridors.",
            projectLink: "projects.html#interactive-3d-planetary-backbone-title",
            projectTitle: "Explore Subsea Fiber & Backbone Topology"
        },
        {
            id: "ixp-singapore",
            name: "Equinix / SGIX Singapore",
            category: "ixp",
            type: "Tier 1 Southeast Asia Hub",
            status: "4+ Tbps Peak Traffic",
            statusClass: "completed",
            lat: 1.3521,
            lng: 103.8198,
            color: "#ec4899",
            size: 0.75,
            ping: "185 ms via Transoceanic Fiber",
            location: "Singapore",
            specs: "Primary Southeast Asian maritime cable hub connecting 20+ international submarine cables traversing the Malacca Strait.",
            projectLink: "projects.html#interactive-3d-planetary-backbone-title",
            projectTitle: "Explore Subsea Fiber & Backbone Topology"
        },
        {
            id: "ixp-sydney",
            name: "Mega-IX / Equinix Sydney",
            category: "ixp",
            type: "Tier 1 Oceanic Internet Exchange",
            status: "2+ Tbps Peak Traffic",
            statusClass: "completed",
            lat: -33.8688,
            lng: 151.2093,
            color: "#ec4899",
            size: 0.75,
            ping: "190 ms via Southern Cross Subsea",
            location: "Sydney, New South Wales, Australia",
            specs: "Principal Oceania subsea landing terminal routing transpacific links to New Zealand, Hawaii, and US West Coast.",
            projectLink: "projects.html#interactive-3d-planetary-backbone-title",
            projectTitle: "Explore Subsea Fiber & Backbone Topology"
        },
        {
            id: "ixp-saopaulo",
            name: "IX.br Sao Paulo",
            category: "ixp",
            type: "Tier 1 Latin America Exchange",
            status: "22+ Tbps Peak Traffic",
            statusClass: "completed",
            lat: -23.5505,
            lng: -46.6333,
            color: "#ec4899",
            size: 0.75,
            ping: "128 ms via Monet / Seabras Subsea",
            location: "Sao Paulo, Brazil",
            specs: "Largest Internet Exchange in Latin America, aggregating South Atlantic and South American subsea cable routes.",
            projectLink: "projects.html#interactive-3d-planetary-backbone-title",
            projectTitle: "Explore Subsea Fiber & Backbone Topology"
        }
    ];

    var transitArcs = [
        {
            name: "Grand Rapids Homelab \u2192 Google Cloud us-central1",
            startLat: 42.9634, startLng: -85.6681,
            endLat: 41.2619, endLng: -95.8608,
            color: ["#10b981", "#38bdf8"],
            alt: 0.12,
            type: "Cloud Compute Sync (Rclone Continuous)"
        },
        {
            name: "Grand Rapids Homelab \u2192 Azure East US",
            startLat: 42.9634, startLng: -85.6681,
            endLat: 36.6534, endLng: -78.3756,
            color: ["#10b981", "#c084fc"],
            alt: 0.14,
            type: "Tailscale Mesh VPN Route"
        },
        {
            name: "Grand Rapids Homelab \u2192 Equinix Ashburn Tier 1 Gateway",
            startLat: 42.9634, startLng: -85.6681,
            endLat: 39.0438, endLng: -77.4874,
            color: ["#10b981", "#ec4899"],
            alt: 0.16,
            type: "Midwest to Tier 1 Atlantic Core Transit"
        },
        {
            name: "Equinix Ashburn \u2192 Virginia Beach Subsea Landing Station",
            startLat: 39.0438, startLng: -77.4874,
            endLat: 36.8529, endLng: -75.9780,
            color: ["#ec4899", "#00f0ff"],
            alt: 0.08,
            type: "Terrestrial Subsea Feeder Trunk"
        },
        {
            name: "Virginia Beach (USA) \u2192 Bilbao (Spain) [MAREA Transatlantic 200+ Tbps]",
            startLat: 36.8529, startLng: -75.9780,
            endLat: 43.2630, endLng: -2.9350,
            color: ["#00f0ff", "#38bdf8"],
            alt: 0.32,
            type: "Ultra-High Capacity Transatlantic Optical Subsea Route"
        },
        {
            name: "Bilbao (Spain) \u2192 DE-CIX Frankfurt (Germany)",
            startLat: 43.2630, startLng: -2.9350,
            endLat: 50.1109, endLng: 8.6821,
            color: ["#38bdf8", "#ec4899"],
            alt: 0.15,
            type: "European Terrestrial Backbone Corridor"
        },
        {
            name: "Frankfurt (DE-CIX) \u2192 London (LINX)",
            startLat: 50.1109, startLng: 8.6821,
            endLat: 51.5074, endLng: -0.1278,
            color: ["#ec4899", "#38bdf8"],
            alt: 0.12,
            type: "Cross-Channel Optical Peering"
        },
        {
            name: "London (LINX) \u2192 Amsterdam (AMS-IX)",
            startLat: 51.5074, startLng: -0.1278,
            endLat: 52.3676, endLng: 4.9041,
            color: ["#38bdf8", "#ec4899"],
            alt: 0.10,
            type: "North Sea Interconnect"
        },
        {
            name: "Equinix Ashburn \u2192 JPNAP Tokyo (Transpacific Optical Bridge)",
            startLat: 39.0438, startLng: -77.4874,
            endLat: 35.6762, endLng: 139.6503,
            color: ["#ec4899", "#00f0ff"],
            alt: 0.42,
            type: "Transpacific Subsea Corridor (FASTER / Unity)"
        },
        {
            name: "Tokyo (JPNAP) \u2192 Singapore (SGIX)",
            startLat: 35.6762, startLng: 139.6503,
            endLat: 1.3521, endLng: 103.8198,
            color: ["#00f0ff", "#ec4899"],
            alt: 0.22,
            type: "South China Sea Optical Route"
        },
        {
            name: "Equinix Ashburn \u2192 IX.br Sao Paulo (Monet / Seabras-1)",
            startLat: 39.0438, startLng: -77.4874,
            endLat: -23.5505, endLng: -46.6333,
            color: ["#ec4899", "#10b981"],
            alt: 0.35,
            type: "Pan-American Subsea Optical Corridor"
        }
    ];

    var cableColorMap = {
        "marea": "#00f0ff",
        "dunant": "#fbbf24",
        "grace-hopper": "#f43f5e",
        "2africa": "#34d399",
        "equiano": "#38bdf8",
        "curie": "#a855f7",
        "firmina": "#10b981",
        "faster": "#00f0ff",
        "pacific-light-cable-network-plcn": "#38bdf8",
        "southern-cross-cable-network": "#f59e0b",
        "apollo": "#ec4899",
        "tat-14": "#94a3b8",
        "havfrue": "#34d399",
        "blue-raman": "#38bdf8",
        "sea-me-we-5": "#fbbf24",
        "sea-me-we-6": "#00f0ff"
    };

    function getCableColor(id, name) {
        var lowerId = (id || "").toLowerCase();
        var lowerName = (name || "").toLowerCase();
        for (var key in cableColorMap) {
            if (lowerId.indexOf(key) !== -1 || lowerName.indexOf(key) !== -1) {
                return cableColorMap[key];
            }
        }
        var colors = ["#00f0ff", "#38bdf8", "#2dd4bf", "#818cf8", "#c084fc", "#fbbf24"];
        var hash = 0;
        var str = lowerId || lowerName || "cable";
        for (var i = 0; i < str.length; i++) {
            hash = (hash << 5) - hash + str.charCodeAt(i);
            hash |= 0;
        }
        return colors[Math.abs(hash) % colors.length];
    }

    function initGlobe() {
        world = Globe()(container)
            .globeImageUrl("images/globe/earth-night.jpg")
            .bumpImageUrl("images/globe/earth-topology.png")
            .backgroundImageUrl("images/globe/night-sky.png")
            .showAtmosphere(true)
            .atmosphereColor("#38bdf8")
            .atmosphereAltitude(0.18)
            .pathPoints(function (d) { return d.coords; })
            .pathPointLat(function (p) { return p[0]; })
            .pathPointLng(function (p) { return p[1]; })
            .pathPointAlt(function (p) { return p[2] || 0.003; })
            .pathColor(function (d) { return d.color; })
            .pathStroke(function (d) { return d.stroke || 1.3; })
            .pathDashLength(0.04)
            .pathDashGap(0.02)
            .pathDashAnimateTime(12000)
            .pathLabel(function (d) {
                return "<div style='background:rgba(15,23,42,0.92);padding:6px 10px;border-radius:6px;border:1px solid #38bdf8;font-family:Inter,sans-serif;'><strong style='color:#38bdf8;'>" +
                    escapeHtml(d.name) + "</strong><div style='font-size:0.78rem;color:#94a3b8;margin-top:2px;'>Subsea Optical Fiber \u00b7 Click to inspect</div></div>";
            })
            .onPathClick(function (cable) {
                handleCableClick(cable);
            })
            .pointLat(function (d) { return d.lat; })
            .pointLng(function (d) { return d.lng; })
            .pointColor(function (d) { return d.color; })
            .pointRadius(function (d) { return d.size; })
            .pointAltitude(function (d) { return d.alt || 0.008; })
            .pointLabel(function (d) {
                var categoryTag = d.category === "homelab" ? "Homelab Infrastructure" :
                                  d.category === "ixp" ? "Tier 1 Peering Exchange" : "Coastal Cable Landing Station";
                var tagColor = d.category === "homelab" ? "#10b981" :
                               d.category === "ixp" ? "#ec4899" : "#fbbf24";
                return "<div style='background:rgba(15,23,42,0.92);padding:6px 10px;border-radius:6px;border:1px solid " + tagColor + ";font-family:Inter,sans-serif;'><strong style='color:#f8fafc;'>" +
                    escapeHtml(d.name) + "</strong><div style='font-size:0.78rem;color:" + tagColor + ";margin-top:2px;'>" + categoryTag + " \u00b7 Click for ground view</div></div>";
            })
            .onPointClick(function (pt) {
                handlePointClick(pt);
            })
            .ringLat(function (d) { return d.lat; })
            .ringLng(function (d) { return d.lng; })
            .ringColor(function (d) {
                var c = d.category === "homelab" ? "16, 185, 129" : "236, 72, 153";
                return function (t) { return "rgba(" + c + "," + (1 - t) + ")"; };
            })
            .ringMaxRadius(function (d) { return d.category === "homelab" ? 4.5 : 3.0; })
            .ringPropagationSpeed(function (d) { return d.category === "homelab" ? 2.0 : 1.4; })
            .ringRepeatPeriod(function (d) { return d.category === "homelab" ? 1000 : 1400; })
            .arcStartLat(function (d) { return d.startLat; })
            .arcStartLng(function (d) { return d.startLng; })
            .arcEndLat(function (d) { return d.endLat; })
            .arcEndLng(function (d) { return d.endLng; })
            .arcColor(function (d) { return d.color; })
            .arcAltitude(function (d) { return d.alt || 0.18; })
            .arcStroke(1.2)
            .arcDashLength(0.35)
            .arcDashGap(0.2)
            .arcDashAnimateTime(2600)
            .arcLabel(function (d) {
                return "<div style='background:rgba(15,23,42,0.92);padding:6px 10px;border-radius:6px;border:1px solid #10b981;font-family:Inter,sans-serif;'><strong style='color:#34d399;'>" +
                    escapeHtml(d.name) + "</strong><div style='font-size:0.78rem;color:#94a3b8;margin-top:2px;'>" + d.type + "</div></div>";
            });

        world.pointOfView({ lat: 30, lng: -45, altitude: 2.2 }, 1200);

        var controls = world.controls();
        if (controls) {
            controls.autoRotate = true;
            controls.autoRotateSpeed = 0.55;

            var onUserInteract = function () {
                if (autoRotateActive) {
                    controls.autoRotate = false;
                    autoRotateActive = false;
                    if (rotateBtn) {
                        rotateBtn.classList.remove("active");
                        rotateBtn.setAttribute("aria-pressed", "false");
                    }
                }
            };

            container.addEventListener("mousedown", onUserInteract, { passive: true });
            container.addEventListener("touchstart", onUserInteract, { passive: true });
            container.addEventListener("wheel", onUserInteract, { passive: true });
        }

        Promise.all([
            fetch("data/submarine-cables.json").then(function (r) { return r.json(); }),
            fetch("data/landing-points.json").then(function (r) { return r.json(); })
        ]).then(function (results) {
            var cableGeo = results[0];
            var landingGeo = results[1];

            var processedPaths = [];
            if (cableGeo && cableGeo.features) {
                cableGeo.features.forEach(function (feat) {
                    var props = feat.properties || {};
                    var geom = feat.geometry || {};
                    var color = getCableColor(props.id, props.name);
                    var name = props.name || props.id || "Submarine Cable";

                    if (geom.type === "LineString" && geom.coordinates) {
                        var coords = geom.coordinates.map(function (c) { return [c[1], c[0], 0.003]; });
                        var mid = coords[Math.floor(coords.length / 2)];
                        processedPaths.push({
                            id: props.id,
                            name: name,
                            color: color,
                            coords: coords,
                            midLat: mid ? mid[0] : 0,
                            midLng: mid ? mid[1] : 0,
                            featureId: props.feature_id,
                            category: "cable"
                        });
                    } else if (geom.type === "MultiLineString" && geom.coordinates) {
                        geom.coordinates.forEach(function (segment, segIdx) {
                            var coords = segment.map(function (c) { return [c[1], c[0], 0.003]; });
                            var mid = coords[Math.floor(coords.length / 2)];
                            processedPaths.push({
                                id: props.id + "-" + segIdx,
                                name: name,
                                color: color,
                                coords: coords,
                                midLat: mid ? mid[0] : 0,
                                midLng: mid ? mid[1] : 0,
                                featureId: props.feature_id,
                                category: "cable"
                            });
                        });
                    }
                });
            }
            allCables = processedPaths;

            var processedLandings = [];
            if (landingGeo && landingGeo.features) {
                landingGeo.features.forEach(function (feat) {
                    var props = feat.properties || {};
                    var geom = feat.geometry || {};
                    if (geom.coordinates && geom.coordinates.length >= 2) {
                        var lng = geom.coordinates[0];
                        var lat = geom.coordinates[1];
                        processedLandings.push({
                            id: props.id,
                            name: props.name || "Landing Station",
                            category: "landing",
                            type: "Subsea Cable Landing Station",
                            lat: lat,
                            lng: lng,
                            color: "#fbbf24",
                            size: 0.28,
                            alt: 0.006,
                            isTbd: props.is_tbd
                        });
                    }
                });
            }
            allLandings = processedLandings;

            allNodes = infrastructureNodes.concat(allLandings);
            allArcs = transitArcs;

            applyLayerFilter("all");

            var badgePill = document.querySelector(".hud-badge-pill");
            if (badgePill) {
                badgePill.innerHTML = "<span class='pulse-dot'></span> " +
                    allCables.length + " Subsea Cable Segments \u00b7 " +
                    allLandings.length + " Landing Points \u00b7 Homelab Mesh Radar";
            }
        }).catch(function (err) {
            console.error("Error loading planetary data:", err);
        });

        window.addEventListener("resize", function () {
            if (world && container) {
                world.width(container.clientWidth);
                world.height(container.clientHeight);
            }
        });
    }

    function applyLayerFilter(filter) {
        activeFilter = filter;

        filterPills.forEach(function (btn) {
            if (btn.getAttribute("data-filter") === filter) {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        });

        if (filter === "all") {
            world.pathsData(allCables);
            world.pointsData(allNodes);
            world.arcsData(allArcs);
            world.ringsData(infrastructureNodes);
        } else if (filter === "cables") {
            world.pathsData(allCables);
            world.pointsData([]);
            world.arcsData([]);
            world.ringsData([]);
        } else if (filter === "landings") {
            world.pathsData([]);
            world.pointsData(allLandings);
            world.arcsData([]);
            world.ringsData([]);
        } else if (filter === "homelab") {
            world.pathsData([]);
            world.pointsData(infrastructureNodes.filter(function (n) { return n.category === "homelab"; }));
            world.arcsData(allArcs.filter(function (a) { return a.name.indexOf("Grand Rapids") !== -1; }));
            world.ringsData(infrastructureNodes.filter(function (n) { return n.category === "homelab"; }));
        } else if (filter === "ixps") {
            world.pathsData([]);
            world.pointsData(infrastructureNodes.filter(function (n) { return n.category === "ixp"; }));
            world.arcsData(allArcs);
            world.ringsData(infrastructureNodes.filter(function (n) { return n.category === "ixp"; }));
        }
    }

    function handleCableClick(cable) {
        if (!cable) return;

        world.pointOfView({
            lat: cable.midLat,
            lng: cable.midLng,
            altitude: 0.95
        }, 1400);

        drawerTitle.textContent = cable.name;
        drawerDomain.textContent = "International Submarine Cable";
        drawerDomainDot.style.background = cable.color || "#00f0ff";
        drawerTypeBadge.textContent = "Optical Subsea Fiber";
        drawerStatusBadge.className = "drawer-status-badge completed";
        drawerStatusBadge.innerHTML = "<span>\u2713</span> Active Route";

        var summaryHtml = "<div class='cable-spec-grid'>" +
            "<div class='cable-spec-box'><div class='cable-spec-label'>Cable System</div><div class='cable-spec-value'>" + escapeHtml(cable.name) + "</div></div>" +
            "<div class='cable-spec-box'><div class='cable-spec-label'>Telemetry ID</div><div class='cable-spec-value'>" + escapeHtml(cable.id) + "</div></div>" +
            "<div class='cable-spec-box'><div class='cable-spec-label'>Geometry Segments</div><div class='cable-spec-value'>" + cable.coords.length + " Vector Nodes</div></div>" +
            "<div class='cable-spec-box'><div class='cable-spec-label'>Optical Shader</div><div class='cable-spec-value' style='color:" + cable.color + ";'>" + cable.color + "</div></div>" +
            "</div>" +
            "<p style='color:#cbd5e1;line-height:1.55;font-size:0.92rem;margin-top:10px;'>This subsea optical fiber link forms a critical physical artery of the international internet, transporting multi-terabit wavelength division multiplexing (DWDM) optical signals across ocean seabeds to coastal landing terminals.</p>";
        drawerSummary.innerHTML = summaryHtml;

        drawerTasksSection.style.display = "block";
        document.querySelector("#drawer-tasks-section h3").textContent = "Cable Inspection Actions";
        drawerTasksList.innerHTML = "<li><strong>Physical Seabed Route:</strong> Mapped via TeleGeography geospatial coordinates.</li>" +
            "<li><strong>Kinetic Photon Simulation:</strong> Dashed optical pulses indicate light signal propagation across continental corridors.</li>";

        drawerTechSection.style.display = "block";
        drawerTechTags.innerHTML = "<span class='tech-tag'>DWDM Optical</span><span class='tech-tag'>Subsea Fiber</span><span class='tech-tag'>TeleGeography</span><span class='tech-tag'>Three.js</span>";

        drawerProjectLink.href = "projects.html#interactive-3d-planetary-backbone-title";
        drawerProjectLink.textContent = "Read 3D Planetary Radar Project Writeup in Projects \u2192";

        openDrawer();
    }

    function handlePointClick(pt) {
        if (!pt) return;

        world.pointOfView({
            lat: pt.lat,
            lng: pt.lng,
            altitude: pt.category === "homelab" ? 0.55 : 0.45
        }, 1400);

        drawerTitle.textContent = pt.name;
        var dotColor = pt.color || "#fbbf24";
        drawerDomainDot.style.background = dotColor;

        var streetViewUrl = "https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=" + pt.lat.toFixed(6) + "," + pt.lng.toFixed(6);
        var mapillaryUrl = "https://www.mapillary.com/app/?lat=" + pt.lat.toFixed(6) + "&lng=" + pt.lng.toFixed(6) + "&z=15";
        var osmUrl = "https://www.openstreetmap.org/?mlat=" + pt.lat.toFixed(6) + "&mlon=" + pt.lng.toFixed(6) + "#map=15/" + pt.lat.toFixed(6) + "/" + pt.lng.toFixed(6);

        if (pt.category === "homelab") {
            drawerDomain.textContent = "Homelab & Private Infrastructure";
            drawerTypeBadge.textContent = pt.type;
            drawerStatusBadge.className = "drawer-status-badge completed";
            drawerStatusBadge.innerHTML = "<span>\u2713</span> " + pt.status;

            drawerSummary.innerHTML = "<div class='drawer-ping-badge'>\u26a1 Simulated Telemetry: " + pt.ping + "</div>" +
                "<div style='margin-top:8px;'><span class='drawer-coords-badge'>LAT: " + pt.lat.toFixed(4) + " \u00b7 LNG: " + pt.lng.toFixed(4) + "</span></div>" +
                "<p style='color:#cbd5e1;line-height:1.55;font-size:0.92rem;margin-top:10px;'>" + pt.specs + "</p>" +
                "<div class='globe-actions-row'>" +
                "<a href='" + streetViewUrl + "' target='_blank' rel='noopener' class='ground-btn ground-btn-street'>\ud83d\udc41\ufe0f Google Street View</a>" +
                "<a href='" + osmUrl + "' target='_blank' rel='noopener' class='ground-btn'>\ud83d\uddfa\ufe0f OpenStreetMap View</a>" +
                "</div>";

            drawerTasksSection.style.display = "block";
            document.querySelector("#drawer-tasks-section h3").textContent = "Physical Node Telemetry";
            drawerTasksList.innerHTML = "<li><strong>Location:</strong> " + pt.location + "</li>" +
                "<li><strong>Network Routing:</strong> Encrypted WireGuard overlay over Tailscale mesh.</li>" +
                "<li><strong>Zero-Cloud Barrier:</strong> Fully observable via client-side WebGL planetary interface.</li>";

            drawerTechSection.style.display = "block";
            drawerTechTags.innerHTML = "<span class='tech-tag'>Alpine Linux</span><span class='tech-tag'>Tailscale</span><span class='tech-tag'>Docker</span><span class='tech-tag'>Three.js</span><span class='tech-tag'>Hardware accelerated</span>";

            drawerProjectLink.href = pt.projectLink || "projects.html";
            drawerProjectLink.textContent = pt.projectTitle || "Explore Project Writeup \u2192";

        } else if (pt.category === "ixp") {
            drawerDomain.textContent = "Global Internet Exchange Point (IXP)";
            drawerTypeBadge.textContent = "Tier 1 Peering Fabric";
            drawerStatusBadge.className = "drawer-status-badge completed";
            drawerStatusBadge.innerHTML = "<span>\u2713</span> " + pt.status;

            drawerSummary.innerHTML = "<div class='drawer-ping-badge' style='background:rgba(236,72,153,0.15);border-color:rgba(236,72,153,0.35);color:#f472b6;'>\ud83c\udf10 Core Peering: " + pt.ping + "</div>" +
                "<div style='margin-top:8px;'><span class='drawer-coords-badge'>LAT: " + pt.lat.toFixed(4) + " \u00b7 LNG: " + pt.lng.toFixed(4) + "</span></div>" +
                "<p style='color:#cbd5e1;line-height:1.55;font-size:0.92rem;margin-top:10px;'>\" + pt.specs + \"</p>\" +
                \"<div class='globe-actions-row'>\" +
                \"<a href='\" + streetViewUrl + \"' target='_blank' rel='noopener' class='ground-btn ground-btn-street'>\ud83d\udc41\ufe0f Google Street View</a>\" +
                \"<a href='\" + osmUrl + \"' target='_blank' rel='noopener' class='ground-btn'>\ud83d\uddfa\ufe0f OpenStreetMap View</a>\" +
                \"</div>\";

            drawerTasksSection.style.display = \"block\";
            document.querySelector(\"#drawer-tasks-section h3\").textContent = \"Interconnection Details\";
            drawerTasksList.innerHTML = \"<li><strong>Facility Location:</strong> \" + pt.location + \"</li>\" +
                \"<li><strong>Transit Interconnect:</strong> Direct optical cross-connects between subsea fiber terminals and hyperscaler clouds.</li>\";

            drawerTechSection.style.display = \"block\";
            drawerTechTags.innerHTML = \"<span class='tech-tag'>Tier 1 IXP</span><span class='tech-tag'>BGP Peering</span><span class='tech-tag'>Subsea Backhaul</span>\";

            drawerProjectLink.href = \"projects.html#interactive-3d-planetary-backbone-title\";
            drawerProjectLink.textContent = \"Read 3D Planetary Radar Project Writeup in Projects \u2192\";

        } else {
            drawerDomain.textContent = \"Coastal Subsea Landing Station\";
            drawerTypeBadge.textContent = \"Physical Cable Landing Site\";
            drawerStatusBadge.className = \"drawer-status-badge completed\";
            drawerStatusBadge.innerHTML = \"<span>\u2713</span> Operational Landing Site\";

            drawerSummary.innerHTML = \"<span class='drawer-coords-badge'>LAT: \" + pt.lat.toFixed(4) + \" \u00b7 LNG: \" + pt.lng.toFixed(4) + \"</span>\" +
                \"<p style='color:#cbd5e1;line-height:1.55;font-size:0.92rem;margin-top:10px;'>Physical coastal facility where submarine optical telecommunication cables make landfall, connecting wet deep-sea armored cables to terrestrial power feed equipment (PFE) and optical backhaul networks.</p>\" +
                \"<div class='globe-actions-row'>\" +
                \"<a href='\" + streetViewUrl + \"' target='_blank' rel='noopener' class='ground-btn ground-btn-street'>\ud83d\udc41\ufe0f Street View (Landing Site)</a>\" +
                \"<a href='\" + mapillaryUrl + \"' target='_blank' rel='noopener' class='ground-btn ground-btn-mapillary'>\ud83c\udfa5 Mapillary Panorama</a>\" +
                \"<a href='\" + osmUrl + \"' target='_blank' rel='noopener' class='ground-btn'>\ud83d\uddfa\ufe0f OpenStreetMap</a>\" +
                \"</div>\";

            drawerTasksSection.style.display = \"block\";
            document.querySelector(\"#drawer-tasks-section h3\").textContent = \"Ground Inspection & Geography\";
            drawerTasksList.innerHTML = \"<li><strong>Physical Site:</strong> Coastal landing terminal located in \" + escapeHtml(pt.name) + \".</li>\" +
                \"<li><strong>Interactive Ground View:</strong> Click the Street View or Mapillary buttons above to inspect the physical coastline, beach manhole infrastructure, and surrounding geography in full-resolution panorama.</li>\";

            drawerTechSection.style.display = \"block\";
            drawerTechTags.innerHTML = \"<span class='tech-tag'>Cable Landing Station</span><span class='tech-tag'>Power Feed Equipment</span><span class='tech-tag'>Beach Manhole</span><span class='tech-tag'>TeleGeography</span>\";

            drawerProjectLink.href = \"projects.html#interactive-3d-planetary-backbone-title\";
            drawerProjectLink.textContent = \"Read 3D Planetary Radar Project Writeup in Projects \u2192\";
        }

        openDrawer();
    }

    function openDrawer() {
        if (!drawer) return;
        drawer.classList.add(\"open\");
        drawer.setAttribute(\"aria-hidden\", \"false\");
    }

    function closeDrawer() {
        if (!drawer) return;
        drawer.classList.remove(\"open\");
        drawer.setAttribute(\"aria-hidden\", \"true\");
    }

    function escapeHtml(str) {
        if (!str) return \"\";
        return String(str)
            .replace(/&/g, \"&amp;\")
            .replace(/</g, \"&lt;\")
            .replace(/>/g, \"&gt;\")
            .replace(/\"/g, \"&quot;\");
    }

    if (drawerCloseBtn) {
        drawerCloseBtn.addEventListener(\"click\", closeDrawer);
    }

    if (resetBtn) {
        resetBtn.addEventListener(\"click\", function () {
            if (world) {
                world.pointOfView({ lat: 30, lng: -45, altitude: 2.2 }, 1500);
            }
        });
    }

    if (rotateBtn) {
        rotateBtn.addEventListener(\"click\", function () {
            if (!world) return;
            var controls = world.controls();
            if (!controls) return;
            autoRotateActive = !autoRotateActive;
            controls.autoRotate = autoRotateActive;
            if (autoRotateActive) {
                rotateBtn.classList.add(\"active\");
                rotateBtn.setAttribute(\"aria-pressed\", \"true\");
            } else {
                rotateBtn.classList.remove(\"active\");
                rotateBtn.setAttribute(\"aria-pressed\", \"false\");
            }
        });
    }

    if (homelabBtn) {
        homelabBtn.addEventListener(\"click\", function () {
            if (!world) return;
            world.pointOfView({ lat: 42.9634, lng: -85.6681, altitude: 0.55 }, 1500);
            var nucNode = infrastructureNodes.find(function (n) { return n.id === \"homelab-nuc\"; });
            if (nucNode) {
                setTimeout(function () { handlePointClick(nucNode); }, 1600);
            }
        });
    }

    if (atmosBtn) {
        atmosBtn.addEventListener(\"click\", function () {
            if (!world) return;
            atmosphereOn = !atmosphereOn;
            world.showAtmosphere(atmosphereOn);
            if (atmosphereOn) {
                atmosBtn.classList.add(\"active\");
            } else {
                atmosBtn.classList.remove(\"active\");
            }
        });
    }

    if (textureBtn) {
        textureBtn.addEventListener(\"click\", function () {
            if (!world) return;
            nightMode = !nightMode;
            if (nightMode) {
                world.globeImageUrl(\"images/globe/earth-night.jpg\");
                textureBtn.textContent = \"\ud83c\udf03 Night Lights\";
            } else {
                world.globeImageUrl(\"//unpkg.com/three-globe/example/img/earth-blue-marble.jpg\");
                textureBtn.textContent = \"\u2600\ufe0f Day Marble\";
            }
        });
    }

    filterPills.forEach(function (btn) {
        btn.addEventListener(\"click\", function () {
            var filter = btn.getAttribute(\"data-filter\") || \"all\";
            applyLayerFilter(filter);
        });
    });

    if (searchInput && searchResults) {
        searchInput.addEventListener(\"input\", function () {
            var q = (searchInput.value || \"\").trim().toLowerCase();
            if (q.length < 2) {
                searchResults.style.display = \"none\";
                searchResults.innerHTML = \"\";
                return;
            }

            var matches = [];
            infrastructureNodes.forEach(function (n) {
                if (n.name.toLowerCase().indexOf(q) !== -1 || (n.location && n.location.toLowerCase().indexOf(q) !== -1)) {
                    matches.push({ type: \"node\", item: n, label: n.name, sub: n.location || n.type });
                }
            });
            allCables.forEach(function (c) {
                if (c.name.toLowerCase().indexOf(q) !== -1 || c.id.toLowerCase().indexOf(q) !== -1) {
                    matches.push({ type: \"cable\", item: c, label: c.name, sub: \"Subsea Cable System\" });
                }
            });
            allLandings.forEach(function (l) {
                if (matches.length < 15 && l.name.toLowerCase().indexOf(q) !== -1) {
                    matches.push({ type: \"point\", item: l, label: l.name, sub: \"Coastal Landing Station\" });
                }
            });

            if (matches.length === 0) {
                searchResults.innerHTML = \"<li class='hud-search-item no-match' style='padding:8px 12px;color:#94a3b8;font-size:0.85rem;'>No cables or stations found</li>\";
                searchResults.style.display = \"block\";
                return;
            }

            var html = \"\";
            matches.slice(0, 10).forEach(function (m, idx) {
                var badge = m.type === \"cable\" ? \"\ud83c\udf0a Cable\" :
                            m.item.category === \"homelab\" ? \"\ud83d\udcbb Homelab\" :
                            m.item.category === \"ixp\" ? \"\u26a1 IXP\" : \"\ud83d\udccd Landing\";
                html += \"<li class='hud-search-item' data-idx='\" + idx + \"' style='padding:8px 12px;cursor:pointer;border-bottom:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:space-between;'>\" +
                    \"<div><div style='font-size:0.88rem;font-weight:600;color:#f8fafc;'>\" + escapeHtml(m.label) + \"</div><div style='font-size:0.75rem;color:#94a3b8;'>\" + escapeHtml(m.sub) + \"</div></div>\" +
                    \"<span style='font-size:0.72rem;padding:2px 6px;border-radius:4px;background:rgba(255,255,255,0.1);color:#e2e8f0;'>\" + badge + \"</span>\" +
                    \"</li>\";
            });
            searchResults.innerHTML = html;
            searchResults.style.display = \"block\";

            var itemEls = searchResults.querySelectorAll(\".hud-search-item:not(.no-match)\");
            itemEls.forEach(function (el) {
                el.addEventListener(\"click\", function () {
                    var idx = parseInt(el.getAttribute(\"data-idx\"), 10);
                    var match = matches[idx];
                    if (!match) return;

                    searchResults.style.display = \"none\";
                    searchInput.value = match.label;

                    if (match.type === \"cable\") {
                        handleCableClick(match.item);
                    } else {
                        handlePointClick(match.item);
                    }
                });
            });
        });

        document.addEventListener(\"click\", function (e) {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.style.display = \"none\";
            }
        });
    }

    if (document.readyState === \"loading\") {
        document.addEventListener(\"DOMContentLoaded\", initGlobe);
    } else {
        initGlobe();
    }
})();
