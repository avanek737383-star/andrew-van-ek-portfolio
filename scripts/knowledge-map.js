// Andrew Van Ek Portfolio | 3D Interactive Knowledge Map
// Powered by Three.js & 3d-force-graph

(function () {
    "use strict";

    var container = document.getElementById("knowledge-graph-container");
    if (!container) return;

    var rawGraphData = null;
    var Graph = null;
    var selectedNode = null;
    var activeDomain = "all";
    var activeStatus = "all";
    var autoRotateActive = true;
    var autoRotatePermanentlyStopped = false;
    var currentDimensions = 3;

    var highlightNodes = new Set();
    var highlightLinks = new Set();
    var hoverNode = null;

    // Smooth hover transition state
    var hoverFactor = 0; // 0.0 (no hover) to 1.0 (fully highlighted)
    var hoverAnimId = null;
    var colorRgbCache = {};

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
    var dimBtn = document.getElementById("hud-dim-btn");
    var filterPills = document.querySelectorAll(".filter-pill");

    function getRgb(colorStr) {
        if (!colorStr) return [56, 189, 248];
        if (colorRgbCache[colorStr]) return colorRgbCache[colorStr];
        var rgb = [56, 189, 248];
        if (typeof colorStr === "string" && colorStr.charAt(0) === "#") {
            var hex = colorStr.slice(1);
            if (hex.length === 3) {
                rgb = [parseInt(hex[0] + hex[0], 16), parseInt(hex[1] + hex[1], 16), parseInt(hex[2] + hex[2], 16)];
            } else if (hex.length === 6) {
                rgb = [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
            }
        }
        colorRgbCache[colorStr] = rgb;
        return rgb;
    }

    function getNodeColor(n) {
        var baseColor = n.color || "#38bdf8";
        if (hoverFactor <= 0.001) return baseColor;

        if (highlightNodes.has(n)) {
            return baseColor;
        }

        var rgb = getRgb(baseColor);
        // Smoothly fade alpha from 1.0 down to 0.18 based on cubic hover factor
        var alpha = 1.0 - (0.82 * hoverFactor);
        return "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + "," + alpha.toFixed(3) + ")";
    }

    function getLinkColor(l) {
        if (hoverFactor <= 0.001) {
            if (l.type === "domain-project") return "rgba(56,189,248,0.3)";
            if (l.type === "project-tech") return "rgba(148,163,184,0.35)";
            if (l.type === "project-task") return "rgba(16,185,129,0.25)";
            return "rgba(255,255,255,0.15)";
        }

        if (highlightLinks.has(l)) {
            // Smoothly brighten highlighted link
            var hiAlpha = 0.3 + (0.65 * hoverFactor);
            return "rgba(56,189,248," + hiAlpha.toFixed(3) + ")";
        }

        // Smoothly fade out non-highlighted links
        var dimAlpha = Math.max(0.02, 0.2 * (1.0 - hoverFactor));
        return "rgba(148,163,184," + dimAlpha.toFixed(3) + ")";
    }

    function getLinkWidth(l) {
        var baseW = (l.type === "domain-project") ? 1.4 : 0.8;
        if (highlightLinks.has(l)) {
            return baseW + (1.4 * hoverFactor);
        }
        return baseW * (1.0 - (0.4 * hoverFactor));
    }

    function startHoverTransition() {
        if (hoverAnimId) {
            cancelAnimationFrame(hoverAnimId);
            hoverAnimId = null;
        }

        var target = (hoverNode !== null || highlightNodes.size > 0) ? 1.0 : 0.0;
        var startVal = hoverFactor;
        var startTime = performance.now();
        var duration = 260; // ms transition

        function animate(now) {
            var elapsed = now - startTime;
            var p = Math.min(1.0, elapsed / duration);
            // Smooth cubic ease out
            var ease = 1 - Math.pow(1 - p, 3);
            hoverFactor = startVal + (target - startVal) * ease;

            if (Graph) {
                Graph
                    .nodeColor(getNodeColor)
                    .linkColor(getLinkColor)
                    .linkWidth(getLinkWidth);
            }

            if (p < 1.0) {
                hoverAnimId = requestAnimationFrame(animate);
            } else {
                hoverFactor = target;
                hoverAnimId = null;
            }
        }

        hoverAnimId = requestAnimationFrame(animate);
    }

    function stopAutoRotationPermanently() {
        if (autoRotatePermanentlyStopped) return;
        autoRotatePermanentlyStopped = true;
        autoRotateActive = false;

        if (Graph) {
            var controls = Graph.controls();
            if (controls) {
                controls.autoRotate = false;
            }
        }

        if (rotateBtn) {
            rotateBtn.classList.remove("active");
            rotateBtn.setAttribute("aria-pressed", "false");
            rotateBtn.title = "Auto-rotation paused. Click to manually resume.";
        }
    }

    function clearHoverState() {
        if (!hoverNode && highlightNodes.size === 0) return;
        hoverNode = null;
        highlightNodes.clear();
        highlightLinks.clear();
        container.style.cursor = "default";
        startHoverTransition();
    }

    function initGraph(data) {
        rawGraphData = data;

        if (typeof ForceGraph3D === "undefined") {
            container.innerHTML = "<div style='color:#fff;padding:40px;text-align:center;'><h3>Loading 3D Engine...</h3><p>Please refresh in a moment if the graphics do not render automatically.</p></div>";
            return;
        }

        Graph = ForceGraph3D()(container)
            .graphData(filterGraphData(data))
            .backgroundColor("#040711")
            .showNavInfo(false)
            .warmupTicks(35)
            .cooldownTime(4000)
            .nodeId("id")
            .nodeVal(function (n) { return n.val || 10; })
            .nodeLabel(function (n) {
                var typeLabel = n.type ? n.type.toUpperCase() : "NODE";
                var statusLabel = n.statusLabel ? (" &middot; " + n.statusLabel) : "";
                return "<div style='background:rgba(15,23,42,0.92);padding:8px 12px;border-radius:8px;border:1px solid rgba(255,255,255,0.2);box-shadow:0 8px 24px rgba(0,0,0,0.6);font-family:sans-serif;font-size:12px;color:#f8fafc;'>" +
                    "<strong style='font-size:13px;color:" + (n.color || "#38bdf8") + "'>" + n.name + "</strong><br/>" +
                    "<span style='font-size:11px;color:#94a3b8;'>" + typeLabel + statusLabel + "</span>" +
                "</div>";
            })
            .nodeColor(getNodeColor)
            .nodeResolution(24)
            .linkColor(getLinkColor)
            .linkWidth(getLinkWidth)
            .linkDirectionalParticles(function (l) {
                if (highlightLinks.has(l)) return 4;
                return l.type === "project-tech" ? 2 : 1;
            })
            .linkDirectionalParticleWidth(function (l) {
                return highlightLinks.has(l) ? 2.5 : 1.5;
            })
            .linkDirectionalParticleSpeed(function (l) {
                return l.type === "project-tech" ? 0.007 : 0.004;
            })
            .onNodeHover(handleNodeHover)
            .onNodeClick(handleNodeClick)
            .onBackgroundClick(handleBackgroundClick);

        Graph.d3Force("charge").strength(-160);
        Graph.d3Force("link").distance(function (l) {
            return l.distance || 60;
        });

        Graph.cameraPosition({ x: 0, y: 25, z: 420 });

        var controls = Graph.controls();
        if (controls) {
            controls.autoRotate = true;
            controls.autoRotateSpeed = 0.8;
            controls.enableDamping = true;
            controls.dampingFactor = 0.08;

            controls.addEventListener("start", function () {
                stopAutoRotationPermanently();
            });
        }

        setupInteractionListeners();
        setupSearch();
        setupFilters();
    }

    function filterGraphData(data) {
        if (!data) return { nodes: [], links: [] };

        var validNodes = [];
        var validNodeIds = new Set();

        data.nodes.forEach(function (n) {
            var matchDomain = (activeDomain === "all") || (n.domain === activeDomain) || (n.type === "domain" && n.id === "domain-" + activeDomain);
            var matchStatus = (activeStatus === "all") || (n.status === activeStatus) || (n.type === "domain") || (n.type === "tech");

            if (activeDomain !== "all") {
                if (n.type === "tech") matchDomain = false;
            }

            if (matchDomain && matchStatus) {
                validNodes.push(n);
                validNodeIds.add(n.id);
            }
        });

        var validLinks = data.links.filter(function (l) {
            var src = typeof l.source === "object" ? l.source.id : l.source;
            var tgt = typeof l.target === "object" ? l.target.id : l.target;
            return validNodeIds.has(src) && validNodeIds.has(tgt);
        });

        return { nodes: validNodes, links: validLinks };
    }

    function handleNodeHover(node) {
        if ((!node && !highlightNodes.size) || (node && hoverNode === node)) return;

        highlightNodes.clear();
        highlightLinks.clear();

        if (node) {
            highlightNodes.add(node);
            var currentGraph = Graph.graphData();
            currentGraph.links.forEach(function (link) {
                var src = typeof link.source === "object" ? link.source.id : link.source;
                var tgt = typeof link.target === "object" ? link.target.id : link.target;
                if (src === node.id || tgt === node.id) {
                    highlightLinks.add(link);
                    var neighbor = (src === node.id) ? link.target : link.source;
                    highlightNodes.add(neighbor);
                }
            });
            hoverNode = node;
            container.style.cursor = "pointer";
        } else {
            hoverNode = null;
            container.style.cursor = "default";
        }

        // Animate smooth transition into/out of hover
        startHoverTransition();
    }

    function handleNodeClick(node) {
        if (!node) return;
        selectedNode = node;
        stopAutoRotationPermanently();
        clearHoverState();

        var targetDist = (node.type === "domain") ? 180 : (node.type === "project" ? 110 : 70);
        var hyp = Math.hypot(node.x, node.y, node.z) || 1;
        var ratio = 1 + (targetDist / hyp);

        Graph.cameraPosition(
            { x: node.x * ratio, y: node.y * ratio, z: node.z * ratio },
            { x: node.x, y: node.y, z: node.z },
            1400
        );

        openDrawer(node);
    }

    function handleBackgroundClick() {
        closeDrawer();
        selectedNode = null;
        clearHoverState();
    }

    function openDrawer(node) {
        if (!drawer) return;

        drawerTitle.textContent = node.name || "System Node";
        drawerTypeBadge.textContent = node.type ? node.type : "Node";

        var domainColor = node.color || "#38bdf8";
        if (node.domain && rawGraphData && rawGraphData.domains) {
            var dObj = rawGraphData.domains.find(function (d) { return d.id === "domain-" + node.domain; });
            if (dObj) {
                domainColor = dObj.color;
                drawerDomain.textContent = dObj.name;
            } else {
                drawerDomain.textContent = node.domainName || "Homelab Constellation";
            }
        } else {
            drawerDomain.textContent = node.domainName || (node.type === "domain" ? "Major Domain Galaxy" : "System Interconnect");
        }
        drawer.style.setProperty("--domain-color", domainColor);

        if (node.statusLabel) {
            drawerStatusBadge.style.display = "inline-flex";
            drawerStatusBadge.className = "drawer-status-badge " + (node.status === "in-progress" ? "in-progress" : "completed");
            drawerStatusBadge.innerHTML = (node.status === "in-progress" ? "<span>&#9679;</span> In Progress" : "<span>&#10003;</span> Completed");
        } else {
            drawerStatusBadge.style.display = "none";
        }

        drawerSummary.textContent = node.summary || "Exploratory technical architecture node within Andrew Van Ek's portfolio ecosystem.";

        if (node.tasks && node.tasks.length > 0) {
            drawerTasksSection.style.display = "block";
            drawerTasksList.innerHTML = "";
            node.tasks.forEach(function (t) {
                var li = document.createElement("li");
                li.className = "drawer-task-item";
                li.innerHTML = "<div class='drawer-task-title'><input type='checkbox' checked disabled style='accent-color:#10b981;' /> " +
                    escapeHtml(t.title) + "</div>" +
                    (t.desc ? "<div class='drawer-task-desc'>" + escapeHtml(t.desc) + "</div>" : "");
                drawerTasksList.appendChild(li);
            });
        } else if (node.type === "task") {
            drawerTasksSection.style.display = "block";
            drawerTasksList.innerHTML = "<li class='drawer-task-item'><div class='drawer-task-title'><input type='checkbox' checked disabled style='accent-color:#10b981;' /> " +
                escapeHtml(node.name) + "</div><div class='drawer-task-desc'>Parent Project: " + escapeHtml(node.parentProject || "Architecture") + "</div></li>";
        } else {
            drawerTasksSection.style.display = "none";
        }

        if (node.tech && node.tech.length > 0) {
            drawerTechSection.style.display = "block";
            drawerTechTags.innerHTML = "";
            node.tech.forEach(function (techName) {
                var span = document.createElement("span");
                span.className = "drawer-tech-tag";
                span.textContent = techName;
                drawerTechTags.appendChild(span);
            });
        } else {
            drawerTechSection.style.display = "none";
        }

        if (node.url) {
            drawerProjectLink.style.display = "block";
            drawerProjectLink.href = node.url;
            drawerProjectLink.textContent = "Explore Full Project Writeup in Projects →";
        } else if (node.type === "domain") {
            drawerProjectLink.style.display = "block";
            drawerProjectLink.href = "projects.html";
            drawerProjectLink.textContent = "View All Projects in Archive →";
        } else {
            drawerProjectLink.style.display = "none";
        }

        drawer.classList.add("open");
    }

    function closeDrawer() {
        if (drawer) drawer.classList.remove("open");
        clearHoverState();
    }

    function setupSearch() {
        if (!searchInput || !searchResults) return;

        searchInput.addEventListener("input", function (e) {
            var q = e.target.value.trim().toLowerCase();
            if (!q || !rawGraphData) {
                searchResults.classList.remove("active");
                searchResults.innerHTML = "";
                return;
            }

            var matches = rawGraphData.nodes.filter(function (n) {
                return (n.name && n.name.toLowerCase().indexOf(q) !== -1) ||
                       (n.summary && n.summary.toLowerCase().indexOf(q) !== -1) ||
                       (n.tech && n.tech.some(function (t) { return t.toLowerCase().indexOf(q) !== -1; }));
            }).slice(0, 8);

            if (matches.length === 0) {
                searchResults.innerHTML = "<li style='padding:10px 14px;color:#94a3b8;font-size:0.8rem;'>No matching nodes found</li>";
                searchResults.classList.add("active");
                return;
            }

            searchResults.innerHTML = "";
            matches.forEach(function (m) {
                var li = document.createElement("li");
                li.className = "hud-search-item";
                li.innerHTML = "<div class='hud-search-title'>" + escapeHtml(m.name) + "</div>" +
                    "<div class='hud-search-meta'><span>" + escapeHtml(m.type ? m.type.toUpperCase() : "NODE") + "</span>" +
                    (m.domainName ? "<span>&bull; " + escapeHtml(m.domainName) + "</span>" : "") + "</div>";
                li.addEventListener("click", function () {
                    searchInput.value = m.name;
                    searchResults.classList.remove("active");
                    handleNodeClick(m);
                });
                searchResults.appendChild(li);
            });
            searchResults.classList.add("active");
        });

        searchInput.addEventListener("keydown", function (e) {
            if (e.key === "Enter") {
                var first = searchResults.querySelector(".hud-search-item");
                if (first) first.click();
            } else if (e.key === "Escape") {
                searchResults.classList.remove("active");
            }
        });

        document.addEventListener("click", function (e) {
            if (!e.target.closest(".hud-search-box")) {
                searchResults.classList.remove("active");
            }
        });
    }

    function setupFilters() {
        filterPills.forEach(function (pill) {
            pill.addEventListener("click", function () {
                stopAutoRotationPermanently();
                clearHoverState();
                var domainKey = pill.getAttribute("data-domain");
                if (activeDomain === domainKey) {
                    activeDomain = "all";
                    filterPills.forEach(function (p) { p.classList.remove("active"); });
                    var allPill = document.querySelector('.filter-pill[data-domain="all"]');
                    if (allPill) allPill.classList.add("active");
                } else {
                    activeDomain = domainKey;
                    filterPills.forEach(function (p) { p.classList.remove("active"); });
                    pill.classList.add("active");
                }
                if (Graph && rawGraphData) {
                    Graph.graphData(filterGraphData(rawGraphData));
                }
            });
        });
    }

    function setupInteractionListeners() {
        if (drawerCloseBtn) {
            drawerCloseBtn.addEventListener("click", closeDrawer);
        }

        if (resetBtn) {
            resetBtn.addEventListener("click", function () {
                closeDrawer();
                clearHoverState();
                Graph.cameraPosition({ x: 0, y: 25, z: 420 }, { x: 0, y: 0, z: 0 }, 1400);
            });
        }

        if (rotateBtn) {
            rotateBtn.addEventListener("click", function () {
                autoRotateActive = !autoRotateActive;
                var controls = Graph.controls();
                if (controls) {
                    controls.autoRotate = autoRotateActive;
                }
                rotateBtn.classList.toggle("active", autoRotateActive);
                rotateBtn.setAttribute("aria-pressed", autoRotateActive ? "true" : "false");
            });
        }

        if (dimBtn) {
            dimBtn.addEventListener("click", function () {
                stopAutoRotationPermanently();
                clearHoverState();
                currentDimensions = (currentDimensions === 3) ? 2 : 3;
                dimBtn.textContent = currentDimensions === 3 ? "★ 3D Constellation" : "⊞ 2D Force Map";
                dimBtn.classList.toggle("active", currentDimensions === 2);
                Graph.numDimensions(currentDimensions);
            });
        }

        // Stop auto-rotation permanently when the user interacts
        container.addEventListener("pointerdown", stopAutoRotationPermanently, { passive: true });
        container.addEventListener("wheel", stopAutoRotationPermanently, { passive: true });
        container.addEventListener("touchstart", stopAutoRotationPermanently, { passive: true });

        // Unstick hover immediately when cursor leaves canvas or enters any HUD overlay or drawer
        container.addEventListener("mouseleave", clearHoverState);

        if (drawer) {
            drawer.addEventListener("mouseenter", clearHoverState);
        }

        var hudOverlays = document.querySelectorAll(".hud-top-bar, .hud-filter-bar, .hud-actions-toolbar, .hud-legend, .hud-search-box");
        hudOverlays.forEach(function (el) {
            el.addEventListener("mouseenter", clearHoverState);
        });
    }

    function escapeHtml(text) {
        if (!text) return "";
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    fetch("data/knowledge-map.json?v=" + Date.now())
        .then(function (res) {
            if (!res.ok) throw new Error("HTTP " + res.status);
            return res.json();
        })
        .then(function (data) {
            initGraph(data);
        })
        .catch(function (err) {
            console.error("Failed to load knowledge map data:", err);
            container.innerHTML = "<div style='color:#fff;padding:40px;text-align:center;'><h3>Unable to Load Knowledge Constellation</h3><p>Could not fetch data/knowledge-map.json. Error: " + escapeHtml(err.message) + "</p></div>";
        });
})();
