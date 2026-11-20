// Andrew Van Ek Portfolio | 19-Hour Oceanscape Interactive Gyroscope & Cursor Gravitational Sunbeams (Easter Egg)
// Light beams originate from the image's actual surface light hotspots and gravitate toward the mouse cursor or phone tilt.

(function () {
    "use strict";

    function initOceanscapeBeams() {
        var figure = document.getElementById("oceanscape-experiment");
        if (!figure) return;

        var previewContainer = figure.querySelector(".oceanscape-render__preview");
        if (!previewContainer) return;

        // Container setup
        previewContainer.style.position = "relative";
        previewContainer.style.display = "block";
        previewContainer.style.overflow = "hidden";
        previewContainer.style.borderRadius = "12px";
        previewContainer.style.boxShadow = "0 14px 36px rgba(0, 20, 40, 0.55)";
        previewContainer.style.cursor = "crosshair";
        previewContainer.style.touchAction = "none";

        // Prevent accidental link navigation on image tap (the explicit text link remains below)
        previewContainer.addEventListener("click", function (e) {
            if (e.target.tagName !== "A" || e.currentTarget === previewContainer) {
                e.preventDefault();
            }
        });

        // Create Canvas overlay
        var canvas = document.createElement("canvas");
        canvas.id = "oceanscape-canvas";
        canvas.style.position = "absolute";
        canvas.style.top = "0";
        canvas.style.left = "0";
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.pointerEvents = "auto";
        canvas.style.mixBlendMode = "screen";
        canvas.style.zIndex = "2";
        previewContainer.appendChild(canvas);

        var ctx = canvas.getContext("2d");
        if (!ctx) return;

        var width = 0;
        var height = 0;
        var animId = null;

        // Gravitational Attractor Position
        var hasUserInteracted = false;
        var currentAttractorX = 0;
        var currentAttractorY = 0;
        var targetAttractorX = 0;
        var targetAttractorY = 0;
        var time = 0;

        // Exact Surface Light Hotspots identified from the 4K render
        var surfaceHotspots = [
            { rx: 0.14, ry: 0.025, baseSpread: 70, maxAlpha: 0.45, tint: "224, 250, 255" }, // Left Sunbreak
            { rx: 0.32, ry: 0.045, baseSpread: 65, maxAlpha: 0.40, tint: "186, 230, 253" }, // Mid-Left Caustic
            { rx: 0.48, ry: 0.020, baseSpread: 110, maxAlpha: 0.58, tint: "240, 253, 250" }, // Center Core Beam
            { rx: 0.56, ry: 0.035, baseSpread: 80, maxAlpha: 0.46, tint: "199, 240, 255" }, // Center-Right Shaft
            { rx: 0.81, ry: 0.018, baseSpread: 130, maxAlpha: 0.65, tint: "255, 255, 255" }, // Major Right Sunburst
            { rx: 0.89, ry: 0.050, baseSpread: 75, maxAlpha: 0.38, tint: "186, 230, 253" }  // Far-Right Caustic Fringe
        ];

        // Underwater floating marine motes
        var particles = [];
        var numParticles = 48;

        function resize() {
            var rect = previewContainer.getBoundingClientRect();
            var dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = rect.width;
            height = rect.height;
            canvas.width = Math.floor(width * dpr);
            canvas.height = Math.floor(height * dpr);
            ctx.scale(dpr, dpr);

            if (!hasUserInteracted) {
                currentAttractorX = width * 0.5;
                currentAttractorY = height * 0.85;
                targetAttractorX = currentAttractorX;
                targetAttractorY = currentAttractorY;
            }

            if (particles.length === 0 && width > 0) {
                for (var i = 0; i < numParticles; i++) {
                    particles.push({
                        x: Math.random() * width,
                        y: Math.random() * height,
                        radius: Math.random() * 1.8 + 0.6,
                        speedY: Math.random() * 0.35 + 0.12,
                        speedX: (Math.random() - 0.5) * 0.25,
                        opacity: Math.random() * 0.6 + 0.2,
                        phase: Math.random() * Math.PI * 2
                    });
                }
            }
        }

        window.addEventListener("resize", resize, { passive: true });
        resize();
        var img = previewContainer.querySelector("img");
        if (img) {
            img.addEventListener("load", resize);
        }

        function render() {
            time += 0.016;

            // When idle, let the attractor gently sway like an ocean current
            if (!hasUserInteracted) {
                targetAttractorX = (width * 0.5) + Math.sin(time * 0.6) * (width * 0.2);
                targetAttractorY = (height * 0.82) + Math.cos(time * 0.8) * (height * 0.08);
            }

            // Smooth gravitational lerp toward cursor or tilt attractor
            currentAttractorX += (targetAttractorX - currentAttractorX) * 0.075;
            currentAttractorY += (targetAttractorY - currentAttractorY) * 0.075;

            ctx.clearRect(0, 0, width, height);

            if (width <= 0 || height <= 0) {
                animId = requestAnimationFrame(render);
                return;
            }

            ctx.save();
            ctx.globalCompositeOperation = "screen";

            // 1. Render Pulsing Caustic Hotspots on the water surface (the exact light spots)
            surfaceHotspots.forEach(function (spot, idx) {
                var hx = spot.rx * width;
                var hy = spot.ry * height;

                var pulse = (Math.sin(time * 2.2 + idx * 1.1) + 1) * 0.5;
                var ringRadius = 14 + (pulse * 18);
                var ringAlpha = (spot.maxAlpha * (1.0 - (pulse * 0.6))).toFixed(3);

                var spotGlow = ctx.createRadialGradient(hx, hy, 2, hx, hy, ringRadius * 1.8);
                spotGlow.addColorStop(0, "rgba(" + spot.tint + ", " + (spot.maxAlpha * 0.9).toFixed(3) + ")");
                spotGlow.addColorStop(0.4, "rgba(" + spot.tint + ", " + ringAlpha + ")");
                spotGlow.addColorStop(1, "rgba(56, 189, 248, 0)");

                ctx.fillStyle = spotGlow;
                ctx.beginPath();
                ctx.arc(hx, hy, ringRadius * 1.8, 0, Math.PI * 2);
                ctx.fill();
            });

            // 2. Render Volumetric Beams EMANATING from the surface spots and GRAVITATING to the attractor
            surfaceHotspots.forEach(function (spot, idx) {
                var hx = spot.rx * width;
                var hy = spot.ry * height;

                var dx = currentAttractorX - hx;
                var dy = Math.max(currentAttractorY - hy, height * 0.35);
                var angle = Math.atan2(dy, dx);

                var waveSway = Math.sin(time * 1.4 + idx * 0.8) * 0.04;
                var finalAngle = angle + waveSway;

                var rayLength = height * 1.4;
                var endCenterX = hx + Math.cos(finalAngle) * rayLength;
                var endCenterY = hy + Math.sin(finalAngle) * rayLength;

                var bottomWidth = spot.baseSpread * (1.1 + Math.cos(time * 0.9 + idx) * 0.15);
                var perpX = -Math.sin(finalAngle) * bottomWidth;
                var perpY = Math.cos(finalAngle) * bottomWidth;

                var grad = ctx.createLinearGradient(hx, hy, endCenterX, endCenterY);
                var alphaMultiplier = spot.maxAlpha * (0.85 + Math.sin(time * 1.5 + idx) * 0.15);

                grad.addColorStop(0, "rgba(" + spot.tint + ", " + (alphaMultiplier * 0.95).toFixed(3) + ")");
                grad.addColorStop(0.25, "rgba(224, 250, 255, " + (alphaMultiplier * 0.65).toFixed(3) + ")");
                grad.addColorStop(0.65, "rgba(56, 189, 248, " + (alphaMultiplier * 0.32).toFixed(3) + ")");
                grad.addColorStop(1, "rgba(2, 132, 199, 0)");

                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.moveTo(hx - 8, hy);
                ctx.lineTo(hx + 8, hy);
                ctx.lineTo(endCenterX + perpX, endCenterY + perpY);
                ctx.lineTo(endCenterX - perpX, endCenterY - perpY);
                ctx.closePath();
                ctx.fill();
            });

            // 3. Focal Caustic Pool at the Gravitational Attractor (where the mouse / tilt focuses)
            if (hasUserInteracted) {
                var focalGlow = ctx.createRadialGradient(
                    currentAttractorX, currentAttractorY, 4,
                    currentAttractorX, currentAttractorY, 110
                );
                focalGlow.addColorStop(0, "rgba(240, 253, 250, 0.40)");
                focalGlow.addColorStop(0.35, "rgba(56, 189, 248, 0.22)");
                focalGlow.addColorStop(0.75, "rgba(14, 165, 233, 0.08)");
                focalGlow.addColorStop(1, "rgba(0, 0, 0, 0)");

                ctx.fillStyle = focalGlow;
                ctx.beginPath();
                ctx.arc(currentAttractorX, currentAttractorY, 110, 0, Math.PI * 2);
                ctx.fill();
            }

            // 4. Floating Marine Motes illuminated by light
            particles.forEach(function (p) {
                p.y -= p.speedY;
                p.x += p.speedX;

                if (p.y < 0) p.y = height;
                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;

                var distToAttractor = Math.hypot(p.x - currentAttractorX, p.y - currentAttractorY);
                var proximityBoost = Math.max(0, 1.0 - (distToAttractor / 180));

                var currentAlpha = (p.opacity * 0.5 + proximityBoost * 0.5).toFixed(2);
                ctx.fillStyle = "rgba(186, 230, 253, " + currentAlpha + ")";
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius * (1.0 + proximityBoost * 0.8), 0, Math.PI * 2);
                ctx.fill();
            });

            ctx.restore();

            animId = requestAnimationFrame(render);
        }

        // Pointer / Mouse tracking on Desktop
        function handlePointerMove(e) {
            hasUserInteracted = true;
            var rect = canvas.getBoundingClientRect();
            targetAttractorX = Math.max(0, Math.min(width, e.clientX - rect.left));
            targetAttractorY = Math.max(height * 0.2, Math.min(height, e.clientY - rect.top));
        }

        canvas.addEventListener("pointermove", handlePointerMove, { passive: true });
        canvas.addEventListener("pointerdown", handlePointerMove, { passive: true });

        canvas.addEventListener("pointerleave", function () {
            hasUserInteracted = false;
        });

        // Gyroscope tracking on Mobile (Seamless Easter Egg)
        var gyroRequested = false;

        function handleOrientation(e) {
            if (e.gamma !== null && e.beta !== null) {
                hasUserInteracted = true;

                var clampedGamma = Math.max(-40, Math.min(40, e.gamma));
                var normX = (clampedGamma + 40) / 80.0;
                targetAttractorX = normX * width;

                var clampedBeta = Math.max(15, Math.min(65, e.beta));
                var normY = (clampedBeta - 15) / 50.0;
                targetAttractorY = (height * 0.3) + (normY * height * 0.7);
            }
        }

        function triggerMotionPermission() {
            if (gyroRequested) return;
            gyroRequested = true;

            if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
                DeviceOrientationEvent.requestPermission()
                    .then(function (permissionState) {
                        if (permissionState === "granted") {
                            window.addEventListener("deviceorientation", handleOrientation);
                        }
                    })
                    .catch(function () {});
            } else if (typeof window.DeviceOrientationEvent !== "undefined") {
                window.addEventListener("deviceorientation", handleOrientation, { passive: true });
            }
        }

        // Tap on canvas seamlessly triggers permission on iOS without interrupting the experience
        canvas.addEventListener("touchend", function (e) {
            triggerMotionPermission();
        }, { passive: true });

        // Non-iOS or pre-authorized browsers automatically listen
        if (typeof window.DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission !== "function") {
            window.addEventListener("deviceorientation", handleOrientation, { passive: true });
        }

        // Start render loop
        animId = requestAnimationFrame(render);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initOceanscapeBeams);
    } else {
        initOceanscapeBeams();
    }
})();
