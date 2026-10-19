(function () {
    "use strict";
    var busy = false;
    var lastUpdated = "";
    var USERS = [
        { id: "w1", username: "avanek737383" },
        { id: "w2", username: "avanek2005" }
    ];

    function setText(id, text) {
        var el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    function formatUsd(estimate) {
        if (!Number.isFinite(estimate) || estimate <= 0) return "USD reference unavailable";
        var digits = estimate < 0.01 ? 4 : 2;
        return "Approx. $" + estimate.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits }) + " USD";
    }

    async function fetchUser(username, signal) {
        var response = await fetch("https://server.duinocoin.com/v2/users/" + encodeURIComponent(username), { signal: signal });
        if (!response.ok) throw new Error("API error " + response.status);
        var data = await response.json();
        var raw = data.result && data.result.balance && data.result.balance.balance;
        var balance = Number(raw);
        if (data.success !== true || !Number.isFinite(balance) || balance < 0) {
            throw new Error("Invalid balance");
        }
        var price = Number(data.result.prices && data.result.prices.pancake);
        return {
            username: username,
            balance: balance,
            price: Number.isFinite(price) && price > 0 ? price : null
        };
    }

    async function refresh() {
        if (busy) return;
        busy = true;
        var button = document.getElementById("duco-refresh");
        if (button) button.disabled = true;
        var controller = new AbortController();
        var timeout = setTimeout(function () { controller.abort(); }, 14000);

        try {
            var results = await Promise.allSettled(USERS.map(function (u) {
                return fetchUser(u.username, controller.signal);
            }));

            var totalBalance = 0;
            var totalUsd = 0;
            var anySuccess = false;
            var sharedPrice = null;

            results.forEach(function (res, index) {
                var prefix = "duco-" + USERS[index].id;
                if (res.status === "fulfilled") {
                    anySuccess = true;
                    var item = res.value;
                    totalBalance += item.balance;
                    if (item.price) sharedPrice = item.price;
                    setText(prefix + "-balance", item.balance.toLocaleString("en-US", { maximumFractionDigits: 4 }) + " DUCO");
                    if (item.price) {
                        var usd = item.balance * item.price;
                        totalUsd += usd;
                        setText(prefix + "-usd", formatUsd(usd));
                    } else {
                        setText(prefix + "-usd", "USD reference unavailable");
                    }
                } else {
                    setText(prefix + "-balance", "Temporarily unavailable");
                    setText(prefix + "-usd", "Could not reach API");
                }
            });

            // Backward compatibility for single balance elements if referenced elsewhere
            setText("duco-balance", totalBalance.toLocaleString("en-US", { maximumFractionDigits: 4 }) + " DUCO");
            setText("duco-usd", sharedPrice ? formatUsd(totalUsd) + " · wrapped DUCO reference" : "USD reference unavailable");

            // Combined total banner elements
            setText("duco-total-balance", totalBalance.toLocaleString("en-US", { maximumFractionDigits: 4 }) + " DUCO");
            setText("duco-total-usd", sharedPrice ? formatUsd(totalUsd) + " combined · PancakeSwap reference" : "USD reference unavailable");

            if (anySuccess) {
                lastUpdated = new Date().toLocaleString();
                setText("duco-balance-updated", "Updated " + lastUpdated + " · Source: Duino-Coin API");
            } else {
                throw new Error("Both wallet queries failed");
            }
        } catch (error) {
            setText("duco-balance-updated", lastUpdated
                ? "Last successful update: " + lastUpdated + " · refresh unavailable"
                : "Live balance temporarily unavailable. Try refreshing later.");
        } finally {
            clearTimeout(timeout);
            if (button) button.disabled = false;
            busy = false;
        }
    }

    var refreshBtn = document.getElementById("duco-refresh");
    if (refreshBtn) refreshBtn.addEventListener("click", refresh);
    document.addEventListener("visibilitychange", function () { if (!document.hidden) refresh(); });
    refresh();
    setInterval(function () { if (!document.hidden) refresh(); }, 120000);
}());
