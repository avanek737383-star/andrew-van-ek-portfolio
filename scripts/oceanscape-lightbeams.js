// Andrew Van Ek Portfolio | 19-Hour Oceanscape Pointer-Following Sunbeams Overlay
// Light rays follow the visitor's mouse or touch position over the image and hold their last detected position on leave without sweeping or snapping back to center.

(function () {
    "use strict";

    function initOceanscapeBeams() {
        var figure = document.getElementById("oceanscape-experiment");
        if (!figure) return;

        var previewContainer = figure.querySelector(".oceanscape-render__preview");
        if (!previewContainer) return;

        previewContainer.style.position = "relative";
        previewContainer.style.display = "block";
        previewContainer.style.overflow = "hidden";
        previewContainer.style.borderRadius = "12px";
        previewContainer.style.boxShadow = "0 14px 36px rgba(0, 20, 40, 0.55)";
        previewContainer.style.touchAction = "pan-y";

        var canvas = document.getElementById("oceanscape-canvas");
        if (!canvas) {
            canvas = document.createElement("canvas");
            canvas.id = "oceanscape-canvas";
            previewContainer.appendChild(canvas);
        }
        canvas.style.position = "absolute";
        canvas.style.top = "0";
        canvas.style.left = "0";
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.pointerEvents = "auto";
        canvas.style.touchAction = "pan-y";
        canvas.style.mixBlendMode = "screen";
        canvas.style.zIndex = "2";

        var ctx = canvas.getContext("2d");
        if (!ctx) return;

        var surfaceHotspots = [
            { rx: 0.065, ry: 0.035, baseSpread: 60, maxAlpha: 0.36, tint: "186, 230, 253" },
            { rx: 0.162, ry: 0.012, baseSpread: 75, maxAlpha: 0.45, tint: "224, 250, 255" },
            { rx: 0.319, ry: 0.040, baseSpread: 70, maxAlpha: 0.38, tint: "199, 240, 255" },
            { rx: 0.470, ry: 0.024, baseSpread: 110, maxAlpha: 0.52, tint: "240, 253, 250" },
            { rx: 0.616, ry: 0.050, baseSpread: 80, maxAlpha: 0.44, tint: "199, 240, 255" },
            { rx: 0.722, ry: 0.012, baseSpread: 95, maxAlpha: 0.50, tint: "224, 250, 255" },
            { rx: 0.807, ry: 0.018, baseSpread: 130, maxAlpha: 0.58, tint: "255, 255, 255" },
            { rx: 0.893, ry: 0.027, baseSpread: 70, maxAlpha: 0.36, tint: "186, 230, 253" }
        ];

        var inWaterHotspots = [
            { rx: 0.480, ry: 0.124, baseSpread: 90, maxAlpha: 0.52, tint: "240, 253, 250", orbRadius: 9 },
            { rx: 0.168, ry: 0.124, baseSpread: 65, maxAlpha: 0.40, tint: "186, 230, 253", orbRadius: 7 },
            { rx: 0.767, ry: 0.240, baseSpread: 100, maxAlpha: 0.54, tint: "255, 255, 255", orbRadius: 11 },
            { rx: 0.288, ry: 0.356, baseSpread: 85, maxAlpha: 0.48, tint: "224, 250, 255", orbRadius: 10 },
            { rx: 0.446, ry: 0.698, baseSpread: 95, maxAlpha: 0.56, tint: "210, 248, 255", orbRadius: 10 },
            { rx: 0.494, ry: 0.480, baseSpread: 80, maxAlpha: 0.46, tint: "199, 240, 255", orbRadius: 8 },
            { rx: 0.264, ry: 0.664, baseSpread: 75, maxAlpha: 0.44, tint: "186, 230, 253", orbRadius: 8 },
            { rx: 0.640, ry: 0.580, baseSpread: 85, maxAlpha: 0.48, tint: "224, 250, 255", orbRadius: 9 }
        ];

        var width = 0;
        var height = 0;
        var targetNormX = 0.5;
        var targetNormY = 0.85;
        var currentNormX = 0.5;
        var currentNormY = 0.85;
        var rafId = null;

        function syncCanvasSize() {
            var rect = previewContainer.getBoundingClientRect();
            width = rect.width;
            height = rect.height;
            if (width <= 0 || height <= 0) return false;

            var dpr = Math.min(window.devicePixelRatio || 1, 2);
            var targetW = Math.floor(width * dpr);
            var targetH = Math.floor(height * dpr);
            if (canvas.width !== targetW || canvas.height !== targetH) {
                canvas.width = targetW;
                canvas.height = targetH;
            }
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            return true;
        }

        function drawBeams() {
            if (!syncCanvasSize()) return;
            ctx.clearRect(0, 0, width, height);

            var focalX = currentNormX * width;
            var focalY = currentNormY * height;

            ctx.save();
            ctx.globalCompositeOperation = "screen";

            surfaceHotspots.forEach(function (spot) {
                var hx = spot.rx * width;
                var hy = spot.ry * height;

                var spotGlow = ctx.createRadialGradient(hx, hy, 2, hx, hy, 36);
                spotGlow.addColorStop(0, "rgba(" + spot.tint + ", " + (spot.maxAlpha * 0.9).toFixed(3) + ")");
                spotGlow.addColorStop(0.45, "rgba(" + spot.tint + ", " + (spot.maxAlpha * 0.5).toFixed(3) + ")");
                spotGlow.addColorStop(1, "rgba(56, 189, 248, 0)");

                ctx.fillStyle = spotGlow;
                ctx.beginPath();
                ctx.arc(hx, hy, 36, 0, Math.PI * 2);
                ctx.fill();

                var dx = focalX - hx;
                var dy = Math.max(focalY - hy, height * 0.35);
                var angle = Math.atan2(dy, dx);
                var rayLength = height * 1.4;
                var endCenterX = hx + Math.cos(angle) * rayLength;
                var endCenterY = hy + Math.sin(angle) * rayLength;
                var bottomWidth = spot.baseSpread * 1.1;
                var perpX = -Math.sin(angle) * bottomWidth;
                var perpY = Math.cos(angle) * bottomWidth;

                var grad = ctx.createLinearGradient(hx, hy, endCenterX, endCenterY);
                grad.addColorStop(0, "rgba(" + spot.tint + ", " + (spot.maxAlpha * 0.85).toFixed(3) + ")");
                grad.addColorStop(0.25, "rgba(224, 250, 255, " + (spot.maxAlpha * 0.55).toFixed(3) + ")");
                grad.addColorStop(0.65, "rgba(56, 189, 248, " + (spot.maxAlpha * 0.25).toFixed(3) + ")");
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

            inWaterHotspots.forEach(function (spot) {
                var hx = spot.rx * width;
                var hy = spot.ry * height;

                var orbGlow = ctx.createRadialGradient(hx, hy, 1, hx, hy, spot.orbRadius * 2.5);
                orbGlow.addColorStop(0, "rgba(255, 255, 255, " + (spot.maxAlpha * 0.9).toFixed(3) + ")");
                orbGlow.addColorStop(0.35, "rgba(" + spot.tint + ", " + (spot.maxAlpha * 0.65).toFixed(3) + ")");
                orbGlow.addColorStop(0.7, "rgba(56, 189, 248, " + (spot.maxAlpha * 0.25).toFixed(3) + ")");
                orbGlow.addColorStop(1, "rgba(0, 0, 0, 0)");

                ctx.fillStyle = orbGlow;
                ctx.beginPath();
                ctx.arc(hx, hy, spot.orbRadius * 2.5, 0, Math.PI * 2);
                ctx.fill();

                var dx = focalX - hx;
                var dy = Math.max(focalY - hy, height * 0.25);
                var angle = Math.atan2(dy, dx);
                var rayLength = height * 1.2;
                var endCenterX = hx + Math.cos(angle) * rayLength;
                var endCenterY = hy + Math.sin(angle) * rayLength;
                var bottomWidth = spot.baseSpread;
                var perpX = -Math.sin(angle) * bottomWidth;
                var perpY = Math.cos(angle) * bottomWidth;

                var grad = ctx.createLinearGradient(hx, hy, endCenterX, endCenterY);
                grad.addColorStop(0, "rgba(" + spot.tint + ", " + (spot.maxAlpha * 0.8).toFixed(3) + ")");
                grad.addColorStop(0.3, "rgba(224, 250, 255, " + (spot.maxAlpha * 0.45).toFixed(3) + ")");
                grad.addColorStop(0.7, "rgba(56, 189, 248, " + (spot.maxAlpha * 0.2).toFixed(3) + ")");
                grad.addColorStop(1, "rgba(2, 132, 199, 0)");

                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.moveTo(hx - 6, hy);
                ctx.lineTo(hx + 6, hy);
                ctx.lineTo(endCenterX + perpX, endCenterY + perpY);
                ctx.lineTo(endCenterX - perpX, endCenterY - perpY);
                ctx.closePath();
                ctx.fill();
            });

            ctx.restore();
        }

        function stepTowardTarget() {
            rafId = null;
            var dx = targetNormX - currentNormX;
            var dy = targetNormY - currentNormY;
            if (Math.hypot(dx, dy) < 0.001) {
                currentNormX = targetNormX;
                currentNormY = targetNormY;
                drawBeams();
                return;
            }
            currentNormX += dx * 0.16;
            currentNormY += dy * 0.16;
            drawBeams();
            rafId = requestAnimationFrame(stepTowardTarget);
        }

        function scheduleStep() {
            if (rafId === null) {
                rafId = requestAnimationFrame(stepTowardTarget);
            }
        }

        function updateFromClientXY(clientX, clientY) {
            var rect = canvas.getBoundingClientRect();
            if (rect.width <= 0 || rect.height <= 0) return;
            var nx = (clientX - rect.left) / rect.width;
            var ny = (clientY - rect.top) / rect.height;
            targetNormX = Math.max(0, Math.min(1, nx));
            targetNormY = Math.max(0.2, Math.min(1, ny));
            scheduleStep();
        }

        canvas.addEventListener("pointermove", function (e) {
            updateFromClientXY(e.clientX, e.clientY);
        }, { passive: true });

        canvas.addEventListener("pointerdown", function (e) {
            updateFromClientXY(e.clientX, e.clientY);
        }, { passive: true });

        canvas.addEventListener("touchstart", function (e) {
            if (e.touches && e.touches[0]) {
                updateFromClientXY(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: true });

        canvas.addEventListener("touchmove", function (e) {
            if (e.touches && e.touches[0]) {
                updateFromClientXY(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: true });

        // Note: intentionally no pointerleave/touchend reset—the lights remain at their last detected pointer position.

        window.addEventListener("resize", drawBeams, { passive: true });
        var img = previewContainer.querySelector("img");
        if (img && !img.complete) {
            img.addEventListener("load", drawBeams);
        }
        drawBeams();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initOceanscapeBeams);
    } else {
        initOceanscapeBeams();
    }
})();
