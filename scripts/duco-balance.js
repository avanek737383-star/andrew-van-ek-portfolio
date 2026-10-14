(function () {
    "use strict";
    var busy = false;
    var lastUpdated = "";
    function setText(id, text) { document.getElementById(id).textContent = text; }

    async function refresh() {
        if (busy) return;
        busy = true;
        var button = document.getElementById("duco-refresh");
        button.disabled = true;
        var controller = new AbortController();
        var timeout = setTimeout(function () { controller.abort(); }, 12000);
        try {
            var response = await fetch("https://server.duinocoin.com/v2/users/avanek737383", { signal: controller.signal });
            if (!response.ok) throw new Error("DUCO API unavailable");
            var data = await response.json();
            var raw = data.result && data.result.balance && data.result.balance.balance;
            var balance = Number(raw);
            if (data.success !== true || raw === undefined || raw === null || raw === "" || typeof raw === "boolean" || !Number.isFinite(balance) || balance < 0) {
                throw new Error("Invalid DUCO balance");
            }
            setText("duco-balance", balance.toLocaleString("en-US", { maximumFractionDigits: 4 }) + " DUCO");
            var price = Number(data.result.prices && data.result.prices.pancake);
            var estimate = balance * price;
            setText("duco-usd", Number.isFinite(price) && price > 0
                ? "Approx. $" + estimate.toLocaleString("en-US", { minimumFractionDigits: estimate > 0 && estimate < 0.01 ? 4 : 2, maximumFractionDigits: estimate > 0 && estimate < 0.01 ? 4 : 2 }) + " USD · wrapped DUCO reference"
                : "USD reference unavailable");
            lastUpdated = new Date().toLocaleString();
            setText("duco-balance-updated", "Updated " + lastUpdated + " · Source: Duino-Coin API");
        } catch (error) {
            if (!lastUpdated) setText("duco-balance", "Unavailable");
            setText("duco-usd", lastUpdated ? "Last known balance · USD reference unavailable" : "USD reference unavailable");
            setText("duco-balance-updated", lastUpdated
                ? "Last successful update: " + lastUpdated + " · refresh unavailable"
                : "Live balance temporarily unavailable. Try refreshing or view the public account.");
        } finally {
            clearTimeout(timeout);
            button.disabled = false;
            busy = false;
        }
    }
    document.getElementById("duco-refresh").addEventListener("click", refresh);
    document.addEventListener("visibilitychange", function () { if (!document.hidden) refresh(); });
    refresh();
    setInterval(function () { if (!document.hidden) refresh(); }, 120000);
}());
