(function () {
	"use strict";

	var endpoint = "https://nucwol2-0--hdd.taile72a68.ts.net/website-chat/stats";
	var nucEndpoint = "https://nucwol2-0--hdd.taile72a68.ts.net/website-chat/nuc-stats";
	var history = { gpu: [], cpu: [], vram: [] };
	var maximumPoints = 24;
	var ducoClientHistory = {};

	function byId(id) {
		return document.getElementById(id);
	}

	function percent(value) {
		return typeof value === "number" ? Math.round(value) + "%" : "—";
	}

	function formatUptime(seconds) {
		if (typeof seconds !== "number") return "—";
		var days = Math.floor(seconds / 86400);
		var hours = Math.floor(seconds % 86400 / 3600);
		if (days > 0) return days + "d " + hours + "h";
		var minutes = Math.floor(seconds % 3600 / 60);
		return hours > 0 ? hours + "h " + minutes + "m" : minutes + "m";
	}

	function storageDetail(disk) {
		return disk && typeof disk.used_gb === "number"
			? disk.used_gb.toLocaleString() + " / " + disk.total_gb.toLocaleString() + " GB"
			: "Unavailable";
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

	function updateNuc(data) {
		var nuc = data.nuc || {};
		var services = nuc.services || {};
		var serviceValues = [services.gateway, services.tailscale, services.samba];
		var onlineServices = serviceValues.filter(function (online) { return online === true; }).length;

		byId("nuc-status-dot").classList.add("is-online");
		byId("nuc-connection-text").textContent = "NUC online";
		byId("nuc-updated").textContent = "Updated " + new Date((data.updated_at || Date.now() / 1000) * 1000).toLocaleTimeString();
		byId("nuc-offline").hidden = true;
		byId("nuc-metrics").classList.remove("is-offline");
		byId("nuc-uptime").textContent = formatUptime(nuc.uptime_seconds);
		byId("nuc-cpu").textContent = percent(nuc.cpu_percent);
		byId("nuc-load").textContent = Array.isArray(nuc.load_average)
			? "Load " + nuc.load_average.join(" · ")
			: "Load average unavailable";
		byId("nuc-memory").textContent = percent(nuc.memory_percent);
		byId("nuc-memory-detail").textContent = typeof nuc.memory_used_mb === "number"
			? nuc.memory_used_mb.toLocaleString() + " / " + nuc.memory_total_mb.toLocaleString() + " MB"
			: "Unavailable";
		byId("nuc-temperature").textContent = typeof nuc.cpu_temperature_c === "number"
			? Math.round(nuc.cpu_temperature_c) + "°C"
			: "—";
		byId("nuc-system-disk").textContent = percent(nuc.system_disk && nuc.system_disk.percent);
		byId("nuc-system-disk-detail").textContent = storageDetail(nuc.system_disk);
		byId("nuc-onefive-disk").textContent = percent(nuc.onefive_disk && nuc.onefive_disk.percent);
		byId("nuc-onefive-disk-detail").textContent = storageDetail(nuc.onefive_disk);
		byId("nuc-services").textContent = onlineServices + " / 3 online";
		byId("nuc-services").className = onlineServices === 3 ? "metric-loaded" : "metric-idle";
		byId("nuc-services-detail").textContent = [
			"Gateway " + (services.gateway ? "online" : "offline"),
			"Tailscale " + (services.tailscale ? "online" : "offline"),
			"Samba " + (services.samba ? "online" : "offline")
		].join(" · ");
		updateDuco(data.duco || { status: "unavailable", miners: [] });
	}

	function formatHashrate(value) {
		if (typeof value !== "number" || !isFinite(value)) return "—";
		var units = ["H/s", "kH/s", "MH/s", "GH/s"];
		var unit = 0;
		var amount = Math.max(0, value);
		while (amount >= 1000 && unit < units.length - 1) {
			amount /= 1000;
			unit++;
		}
		return (amount >= 100 ? Math.round(amount) : amount.toFixed(1)) + " " + units[unit];
	}

	function formatLastSeen(value) {
		if (typeof value !== "number") return "No observation yet";
		return "Last seen " + new Date(value * 1000).toLocaleString();
	}

	function drawDucoChart(svg, points) {
		var values = (points || []).map(function (point) { return typeof point.hashrate === "number" ? point.hashrate : 0; });
		if (!values.length) return;
		var maximum = Math.max.apply(Math, values.concat([1]));
		var step = values.length > 1 ? 300 / (values.length - 1) : 300;
		var line = values.map(function (value, index) {
			return (index * step).toFixed(1) + "," + (86 - value / maximum * 70).toFixed(1);
		}).join(" ");
		svg.setAttribute("points", line);
	}

	function updateDuco(duco) {
		var container = byId("duco-miners");
		var miners = duco && Array.isArray(duco.miners) ? duco.miners : [];
		container.textContent = "";
		byId("duco-status-dot").classList.toggle("is-online", duco && duco.status === "online");
		byId("duco-connection-text").textContent = duco && duco.status === "online" ? "DUCO telemetry online" : "DUCO telemetry unavailable";
		byId("duco-updated").textContent = duco && duco.updated_at ? "Updated " + new Date(duco.updated_at * 1000).toLocaleTimeString() : "Waiting for API";
		miners.forEach(function (miner) {
			var card = document.createElement("article");
			card.className = "lab-card duco-miner-card";
			var label = document.createElement("span");
			label.textContent = miner.label || "DUCO miner";
			var state = document.createElement("strong");
			state.className = miner.online ? "metric-loaded" : "metric-idle";
			state.textContent = miner.online ? "Online" : "Offline";
			var rate = document.createElement("small");
			rate.textContent = (miner.online ? formatHashrate(miner.hashrate) : "Not mining now") + " · " + formatLastSeen(miner.last_seen_at);
			card.appendChild(label);
			card.appendChild(state);
			card.appendChild(rate);
			container.appendChild(card);

			var chartCard = document.createElement("div");
			chartCard.className = "lab-chart-card duco-chart-card";
			var header = document.createElement("header");
			var title = document.createElement("strong");
			title.textContent = (miner.label || "DUCO miner") + " hashrate";
			var current = document.createElement("span");
			current.textContent = miner.online ? formatHashrate(miner.hashrate) : "Offline";
			header.appendChild(title);
			header.appendChild(current);
			var clientPoints = ducoClientHistory[miner.label] || [];
			clientPoints.push({ hashrate: miner.online && typeof miner.hashrate === "number" ? miner.hashrate : 0 });
			if (clientPoints.length > 48) clientPoints.shift();
			ducoClientHistory[miner.label] = clientPoints;
			var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			svg.setAttribute("viewBox", "0 0 300 90");
			svg.setAttribute("role", "img");
			svg.setAttribute("aria-label", (miner.label || "DUCO miner") + " recent hashrate");
			var polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
			drawDucoChart(polyline, clientPoints);
			svg.appendChild(polyline);
			chartCard.appendChild(header);
			chartCard.appendChild(svg);
			container.appendChild(chartCard);
		});
	}

	function showNucOffline() {
		byId("nuc-status-dot").classList.remove("is-online");
		byId("nuc-connection-text").textContent = "Telemetry unavailable";
		byId("nuc-updated").textContent = "Waiting for the always-on NUC";
		byId("nuc-offline").hidden = false;
		byId("nuc-metrics").classList.add("is-offline");
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

	async function refreshNuc() {
		try {
			var response = await fetch(nucEndpoint, { cache: "no-store" });
			if (!response.ok) throw new Error("NUC telemetry unavailable");
			updateNuc(await response.json());
		} catch (error) {
			showNucOffline();
		}
	}

	refresh();
	refreshNuc();
	window.setInterval(refresh, 5000);
	window.setInterval(refreshNuc, 10000);
}());
