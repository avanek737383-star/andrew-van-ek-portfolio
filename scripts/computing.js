(function () {
    "use strict";

    var banAddress = "ban_1r7wzga4npq5ijscq6pz517wcim6s6gwjpyw8pjoy1pgsqb8xrpt6me5rux8";
    var xmrAddress = "4A1dBvvq5vGR9MDYsoagdn3EKuQzqkh2wJPtjyAvu3nBEhos2X6LfCYWaxtUHgiRdXAYc9bUrWNh4ZdsQKyar2oR6ArEYjd";
    var amounts = {};
    var prices = {};
    var priceCheckedAt = 0;
    var busy = false;
    var priceMaxAge = 15 * 60 * 1000;

    function setText(id, text) {
        document.getElementById(id).textContent = text;
    }

    async function request(url, options) {
        var controller = new AbortController();
        var timeout = setTimeout(function () { controller.abort(); }, 12000);
        try {
            var response = await fetch(url, Object.assign({ signal: controller.signal }, options));
            if (!response.ok) throw new Error("Data source unavailable");
            var data = await response.json();
            if (data.error) throw new Error("Data source returned an error");
            return data;
        } finally {
            clearTimeout(timeout);
        }
    }

    function nonnegative(value) {
        if (value === null || value === undefined || value === "" || typeof value === "boolean") {
            throw new Error("Missing balance");
        }
        var number = Number(value);
        if (!Number.isFinite(number) || number < 0) throw new Error("Invalid balance");
        return number;
    }

    function usd(amount) {
        return "$" + amount.toLocaleString("en-US", {
            minimumFractionDigits: amount > 0 && amount < 0.01 ? 4 : 2,
            maximumFractionDigits: amount > 0 && amount < 0.01 ? 4 : 2
        }) + " USD";
    }

    function showEstimate(coin) {
        var quote = prices[coin];
        var valid = quote && Date.now() - quote.time < priceMaxAge;
        setText(coin + "-usd", amounts[coin] !== undefined && valid
            ? "Approx. " + usd(amounts[coin] * quote.usd)
            : "USD estimate unavailable");
    }

    function failed(coin) {
        if (amounts[coin] === undefined) {
            setText(coin + "-balance", "Unavailable");
            setText(coin + "-usd", "USD estimate unavailable");
            setText(coin === "ban" ? "ban-pending" : "xmr-hashrate", "Try refreshing or use the link below.");
            setText(coin + "-updated", "Live data temporarily unavailable");
        } else {
            var element = document.getElementById(coin + "-updated");
            element.textContent = "Last successful update: " + element.dataset.updated + " · refresh unavailable";
            setText(coin + "-usd", "Last known balance · USD estimate unavailable");
        }
    }

    function updated(coin) {
        var element = document.getElementById(coin + "-updated");
        element.dataset.updated = new Date().toLocaleString();
        element.textContent = "Updated " + element.dataset.updated;
    }

    async function updateBan() {
        try {
            var data = await request("https://kaliumapi.appditto.com/api", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "account_balance", account: banAddress })
            });
            var balance = nonnegative(data.balance) / 1e29;
            var pending = nonnegative(data.receivable !== undefined ? data.receivable : data.pending) / 1e29;
            amounts.ban = balance;
            setText("ban-balance", balance.toLocaleString("en-US", { maximumFractionDigits: 2 }) + " BAN");
            setText("ban-pending", pending > 0
                ? pending.toLocaleString("en-US", { maximumFractionDigits: 2 }) + " BAN waiting to be received"
                : "All incoming transfers received");
            updated("ban");
            showEstimate("ban");
            return true;
        } catch (error) {
            failed("ban");
            return false;
        }
    }

    async function updateXmr() {
        try {
            var data = await request("https://api.moneroocean.stream/miner/" + xmrAddress + "/stats");
            var balance = nonnegative(data.amtDue) / 1e12;
            amounts.xmr = balance;
            setText("xmr-balance", balance.toLocaleString("en-US", { minimumFractionDigits: 8, maximumFractionDigits: 8 }) + " XMR");
            var hashrate = Number(data.hash2);
            setText("xmr-hashrate", Number.isFinite(hashrate) && hashrate >= 0
                ? "Pool-reported hashrate: " + (hashrate / 1000).toLocaleString("en-US", { maximumFractionDigits: 2 }) + " kH/s"
                : "Pool hashrate unavailable");
            updated("xmr");
            showEstimate("xmr");
            return true;
        } catch (error) {
            failed("xmr");
            return false;
        }
    }

    async function updatePrices() {
        if (Date.now() - priceCheckedAt < priceMaxAge) return;
        priceCheckedAt = Date.now();
        try {
            var data = await request("https://api.coingecko.com/api/v3/simple/price?ids=banano,monero&vs_currencies=usd&include_last_updated_at=true");
            [["ban", "banano"], ["xmr", "monero"]].forEach(function (entry) {
                var quote = data[entry[1]];
                var price = quote && Number(quote.usd);
                var time = quote && Number(quote.last_updated_at) * 1000;
                if (Number.isFinite(price) && price > 0 && Number.isFinite(time) && time <= Date.now() + 60000 && Date.now() - time < priceMaxAge) {
                    prices[entry[0]] = { usd: price, time: time };
                } else {
                    delete prices[entry[0]];
                }
            });
            var times = Object.values(prices).map(function (quote) { return quote.time; });
            setText("computing-price-updated", times.length
                ? "Market prices updated " + new Date(Math.min.apply(null, times)).toLocaleString() + " · Source: CoinGecko"
                : "Market prices temporarily unavailable.");
        } catch (error) {
            prices = {};
            setText("computing-price-updated", "Market prices temporarily unavailable. Coin balances can still update.");
        }
    }

    async function refresh() {
        if (busy) return;
        busy = true;
        var button = document.getElementById("computing-refresh");
        button.disabled = true;
        setText("computing-status", "Refreshing balances…");
        await updatePrices();
        var results = await Promise.all([updateBan(), updateXmr()]);
        setText("computing-status", results.every(Boolean)
            ? "Live balances updated."
            : "Some live data is temporarily unavailable. Last known figures are labeled above.");
        button.disabled = false;
        busy = false;
    }

    document.getElementById("computing-refresh").addEventListener("click", refresh);
    document.addEventListener("visibilitychange", function () {
        if (!document.hidden) refresh();
    });
    refresh();
    setInterval(function () { if (!document.hidden) refresh(); }, 120000);
}());
