// Andrew Van Ek Portfolio | 19-Hour Oceanscape Interactive Gyroscope Light Beams
// Procedural Volumetric God Rays & Underwater Caustics reacting to Device Orientation & Cursor

(function () {
    "use strict";

    function initOceanscapeBeams() {
        var figure = document.getElementById("oceanscape-experiment");
        if (!figure) return;

        var previewLink = figure.querySelector(".oceanscape-render__preview");
        if (!previewLink) return;

        // Container setup
        previewLink.style.position = "relative";
        previewLink.style.display = "block";
        previewLink.style.overflow = "hidden";
        previewLink.style.borderRadius = "12px";
        previewLink.style.boxShadow = "0 12px 32px rgba(0, 20, 40, 0.5)";
        previewLink.style.cursor = "crosshair";

        // Create Canvas overlay
        var canvas = document.createElement("canvas");
        canvas.id = "oceanscape-canvas";
        canvas.style.position = "absolute";
        canvas.style.top = "0";
        canvas.style.left = "0";
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.pointerEvents = "none";
        canvas.style.mixBlendMode = "screen";
        canvas.style.zIndex = "2";
        previewLink.appendChild(canvas);

        // Create Badge / Permission Button
        var badge = document.createElement("div");
        badge.className = "gyro-beam-badge";
        badge.innerHTML = "<span class='gyro-beam-dot'></span> <span class='gyro-beam-text'>✨ Tilt Phone or Move Cursor for Caustic Sunbeams</span>";
        badge.style.position = "absolute";
        badge.style.bottom = "12px";
        badge.style.left = "12px";
        badge.style.background = "rgba(4, 20, 36, 0.85)";
        badge.style.backdropFilter = "blur(8px)";
        badge.style.webkitBackdropFilter = "blur(8px)";
        badge.style.border = "1px solid rgba(147, 197, 253, 0.4)";
        badge.style.borderRadius = "999px";
        badge.style.padding = "5px 12px";
        badge.style.fontSize = "0.78rem";
        badge.style.color = "#93c5fd";
        badge.style.fontWeight = "600";
        badge.style.zIndex = "3";
        badge.style.display = "inline-flex";
        badge.style.alignItems = "center";
        badge.style.gap = "6px";
        badge.style.cursor = "pointer";
        badge.style.userSelect = "none";
        badge.style.transition = "all 0.2s ease";
        previewLink.appendChild(badge);

        var dot = badge.querySelector(".gyro-beam-dot");
        if (dot) {
            dot.style.width = "6px";
            dot.style.height = "6px";
            dot.style.borderRadius = "50%";
            dot.style.background = "#38bdf8";
            dot.style.boxShadow = "0 0 6px #38bdf8";
        }

        var ctx = canvas.getContext("2d");
        if (!ctx) return;

        var width = 0;
        var height = 0;
        var animId = null;

        // Tilt & Cursor target state
        var currentTiltX = 0; // -1.0 to 1.0
        var currentTiltY = 0;
        var targetTiltX = 0;
        var targetTiltY = 0;
        var time = 0;

        // Underwater floating marine dust motes
        var particles = [];
        var numParticles = 45;

        function resize() {
            var rect = previewLink.getBoundingClientRect();
            var dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = rect.width;
            height = rect.height;
            canvas.width = Math.floor(width * dpr);
            canvas.height = Math.floor(height * dpr);
            ctx.scale(dpr, dpr);

            if (particles.length === 0 && width > 0) {
                for (var i = 0; i < numParticles; i++) {
                    particles.push({
                        x: Math.random() * width,
                        y: Math.random() * height,
                        radius: Math.random() * 1.8 + 0.6,
                        speedY: Math.random() * 0.35 + 0.15,
                        speedX: (Math.random() - 0.5) * 0.25,
                        opacity: Math.random() * 0.6 + 0.2,
                        phase: Math.random() * Math.PI * 2
                    });
                }
            }
        }

        window.addEventListener("resize", resize, { passive: true });
        // Initial sizing after image loads or immediately
        resize();
        var img = previewLink.querySelector("img");
        if (img) {
            img.addEventListener("load", resize);
        }

        // Volumetric Sunbeam Shaft parameters
        var numRays = 7;
        var raySeeds = [
            { baseAngle: -0.22, spread: 0.14, speed: 0.0018, width: 90, alpha: 0.38 },
            { baseAngle: -0.10, spread: 0.18, speed: 0.0024, width: 140, alpha: 0.45 },
            { baseAngle: 0.02, spread: 0.12, speed: 0.0015, width: 80, alpha: 0.35 },
            { baseAngle: 0.15, spread: 0.20, speed: 0.0020, width: 160, alpha: 0.48 },
            { baseAngle: 0.28, spread: 0.16, speed: 0.0028, width: 110, alpha: 0.40 },
            { baseAngle: -0.32, spread: 0.15, speed: 0.0022, width: 100, alpha: 0.32 },
            { baseAngle: 0.38, spread: 0.18, speed: 0.0019, width: 130, alpha: 0.36 }
        ];

        function render() {
            time += 0.016;

            // Inertia damping (smooth tracking)
            currentTiltX += (targetTiltX - currentTiltX) * 0.08;
            currentTiltY += (targetTiltY - currentTiltY) * 0.08;

            ctx.clearRect(0, 0, width, height);

            if (width <= 0 || height <= 0) {
                animId = requestAnimationFrame(render);
                return;
            }

            // Light origin on the water surface (shifting horizontally with tilt)
            var originX = (width * 0.5) + (currentTiltX * width * 0.38);
            var originY = -15 + (currentTiltY * 20);

            // 1. Render Volumetric Sunbeam Shafts
            ctx.save();
            ctx.globalCompositeOperation = "screen";

            raySeeds.forEach(function (ray, idx) {
                // Wave oscillation for organic underwater caustic drift
                var sway = Math.sin(time * ray.speed * 60 + idx) * 0.08;
                var angle = ray.baseAngle + (currentTiltX * 0.45) + sway;
                var rayLength = height * 1.5;

                var bottomX = originX + Math.tan(angle) * rayLength;
                var bottomHalfWidth = ray.width * (1.2 + Math.cos(time * 0.8 + idx) * 0.2);

                // Polished trapezoid ray shaft
                var grad = ctx.createLinearGradient(originX, originY, bottomX, height);
                var alphaMultiplier = ray.alpha * (0.85 + Math.sin(time * 1.2 + idx * 0.7) * 0.15);

                grad.addColorStop(0, "rgba(224, 250, 255, " + (alphaMultiplier * 0.95).toFixed(3) + ")");
                grad.addColorStop(0.3, "rgba(56, 189, 248, " + (alphaMultiplier * 0.65).toFixed(3) + ")");
                grad.addColorStop(0.7, "rgba(14, 165, 233, " + (alphaMultiplier * 0.35).toFixed(3) + ")");
                grad.addColorStop(1, "rgba(2, 132, 199, 0)");

                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.moveTo(originX - 10, originY);
                ctx.lineTo(originX + 10, originY);
                ctx.lineTo(bottomX + bottomHalfWidth, height);
                ctx.lineTo(bottomX - bottomHalfWidth, height);
                ctx.closePath();
                ctx.fill();
            });

            // 2. Surface Caustic Crest Glow
            var surfaceGlow = ctx.createRadialGradient(originX, originY + 10, 5, originX, originY + 20, width * 0.65);
            surfaceGlow.addColorStop(0, "rgba(240, 253, 250, 0.45)");
            surfaceGlow.addColorStop(0.4, "rgba(56, 189, 248, 0.25)");
            surfaceGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
            ctx.fillStyle = surfaceGlow;
            ctx.fillRect(0, 0, width, height * 0.4);

            ctx.restore();

            // 3. Floating Marine Motes illuminated by light
            ctx.save();
            ctx.globalCompositeOperation = "screen";
            particles.forEach(function (p) {
                p.y -= p.speedY;
                p.x += p.speedX + (currentTiltX * 0.4);

                // Wrap around edges
                if (p.y < 0) p.y = height;
                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;

                var particleGlow = (Math.sin(time * 2 + p.phase) + 1) * 0.5;
                var currentAlpha = p.opacity * (0.6 + particleGlow * 0.4);

                ctx.fillStyle = "rgba(186, 230, 253, " + currentAlpha.toFixed(2) + ")";
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.restore();

            animId = requestAnimationFrame(render);
        }

        // Pointer / Mouse tracking on Desktop
        previewLink.addEventListener("pointermove", function (e) {
            var rect = previewLink.getBoundingClientRect();
            var normX = (e.clientX - rect.left) / rect.width; // 0.0 to 1.0
            var normY = (e.clientY - rect.top) / rect.height;
            targetTiltX = (normX - 0.5) * 2.0; // -1.0 to 1.0
            targetTiltY = (normY - 0.5) * 1.0;
        });

        previewLink.addEventListener("pointerleave", function () {
            targetTiltX = 0;
            targetTiltY = 0;
        });

        // Gyroscope tracking on Mobile
        var gyroActive = false;

        function handleOrientation(e) {
            if (e.gamma !== null && e.beta !== null) {
                gyroActive = true;
                // gamma is left-to-right tilt (-90 to 90)
                var clampedGamma = Math.max(-45, Math.min(45, e.gamma));
                targetTiltX = clampedGamma / 45.0; // -1.0 to 1.0

                // beta is front-to-back tilt (-180 to 180)
                var clampedBeta = Math.max(10, Math.min(70, e.beta));
                targetTiltY = ((clampedBeta - 40) / 30.0);

                var badgeText = badge.querySelector(".gyro-beam-text");
                if (badgeText && badgeText.textContent.indexOf("Gyro Active") === -1) {
                    badgeText.innerHTML = "✨ Gyroscope Beams Active &middot; Tilt Phone to Angle Sunlight";
                    badge.style.borderColor = "#38bdf8";
                }
            }
        }

        // Request permission on iOS 13+ if needed
        function enableGyro() {
            if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
                DeviceOrientationEvent.requestPermission()
                    .then(function (permissionState) {
                        if (permissionState === "granted") {
                            window.addEventListener("deviceorientation", handleOrientation);
                        }
                    })
                    .catch(function (err) {
                        console.log("Device orientation permission:", err);
                    });
            } else {
                window.addEventListener("deviceorientation", handleOrientation);
            }
        }

        badge.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            enableGyro();
        });

        // Auto-listen if supported without gesture
        if (typeof window.DeviceOrientationEvent !== "undefined") {
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
