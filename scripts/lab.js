(function () {
	"use strict";

	var endpoint = "https://nucwol2-0--hdd.taile72a68.ts.net/website-chat/stats";
	var history = { gpu: [], cpu: [], vram: [] };
	var maximumPoints = 24;

	function byId(id) {
		return document.getElementById(id);
	}

	function percent(value) {
		return typeof value === "number" ? Math.round(value) + "%" : "—";
	}

	function addPoint(series, value) {
		if (typeof value !== "number") return;
		history[series].push(Math.max(0, Math.min(100, value)));
		if (history[series].length > maximumPoints) history[series].shift();
	}

	function drawChart(series) {
		var values = history[series];
		if (!values.length) return;
		var step = values.length > 1 ? 300 / (values.length - 1) : 0;
		var points = values.map(function (value, index) {
			return (index * step).toFixed(1) + "," + (86 - value * 0.8).toFixed(1);
		}).join(" ");
		byId("chart-" + series).setAttribute("points", points);
	}

	function update(data) {
		var system = data.system || {};
		var model = data.model || {};
		var chat = data.chat || {};
		var modelLoaded = model.state === "loaded";
		var vramPercent = system.gpu_memory_total_mb
			? system.gpu_memory_used_mb / system.gpu_memory_total_mb * 100
			: null;

		byId("lab-status-dot").classList.add("is-online");
		byId("lab-offline").hidden = true;
		byId("lab-offline").classList.remove("is-visible");
		byId("lab-metrics").classList.remove("is-offline");
		byId("lab-connection-text").textContent = "Systems online";
		byId("lab-updated").textContent = "Updated " + new Date((data.updated_at || Date.now() / 1000) * 1000).toLocaleTimeString();
		byId("metric-model").textContent = modelLoaded ? "Loaded" : model.state === "not-loaded" ? "Idle" : "Unknown";
		byId("metric-model").className = modelLoaded ? "metric-loaded" : "metric-idle";
		byId("metric-model-name").textContent = model.name || "Liquid LFM2.5 1.2B";
		byId("metric-gpu").textContent = percent(system.gpu_percent);
		byId("metric-vram").textContent = typeof vramPercent === "number" ? Math.round(vramPercent) + "%" : "—";
		byId("metric-vram-detail").textContent = typeof system.gpu_memory_used_mb === "number"
			? system.gpu_memory_used_mb.toLocaleString() + " / " + system.gpu_memory_total_mb.toLocaleString() + " MB"
			: "Unavailable";
		byId("metric-temperature").textContent = typeof system.gpu_temperature_c === "number" ? Math.round(system.gpu_temperature_c) + "°C" : "—";
		byId("metric-cpu").textContent = percent(system.cpu_percent);
		byId("metric-memory").textContent = percent(system.memory_percent);
		byId("metric-latency").textContent = typeof chat.last_latency_ms === "number" ? (chat.last_latency_ms / 1000).toFixed(1) + "s" : "—";
		byId("metric-tokens").textContent = typeof chat.last_tokens_per_second === "number"
			? chat.last_tokens_per_second + " generated tokens/sec"
			: "No response measured yet";
		byId("metric-requests").textContent = chat.requests || 0;
		byId("metric-active").textContent = chat.active === 1 ? "1 active request" : (chat.active || 0) + " active requests";

		addPoint("gpu", system.gpu_percent);
		addPoint("cpu", system.cpu_percent);
		addPoint("vram", vramPercent);
		drawChart("gpu");
		drawChart("cpu");
		drawChart("vram");
		byId("chart-gpu-value").textContent = percent(system.gpu_percent);
		byId("chart-cpu-value").textContent = percent(system.cpu_percent);
		byId("chart-vram-value").textContent = percent(vramPercent);
	}

	function showOffline() {
		byId("lab-status-dot").classList.remove("is-online");
		byId("lab-connection-text").textContent = "Telemetry unavailable";
		byId("lab-updated").textContent = "The PC may be sleeping or reconnecting";
		byId("lab-offline").hidden = false;
		byId("lab-offline").classList.add("is-visible");
		byId("lab-metrics").classList.add("is-offline");
	}

	async function refresh() {
		try {
			var response = await fetch(endpoint, { cache: "no-store" });
			if (!response.ok) throw new Error("Telemetry unavailable");
			update(await response.json());
		} catch (error) {
			showOffline();
		}
	}

	refresh();
	window.setInterval(refresh, 5000);
}());
