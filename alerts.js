async function loadAlerts() {
    const container = document.getElementById("alertsList");
    if (!container) return;

    container.innerHTML = "Loading alerts...";

    try {
        const res = await fetch("/api/history");
        if (!res.ok) {
            throw new Error(`API request failed: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        const historyItems = Array.isArray(data?.data) ? data.data : [];

        if (historyItems.length === 0) {
            container.innerHTML = '<div class="no-alerts">No alerts found. All emails are safe!</div>';
            return;
        }

        const alerts = historyItems.filter(item => 
            item?.status === "Fraud" || Number(item?.riskScore) > 70
        );

        if (alerts.length === 0) {
            container.innerHTML = '<div class="no-alerts">✅ No high-risk alerts! Your inbox is safe.</div>';
            return;
        }

        container.innerHTML = alerts.map(alert => {
            const reasons = Array.isArray(alert?.reasons) ? alert.reasons : [];
            const alertDate = alert?.createdAt ? new Date(alert.createdAt) : null;
            const dateText = alertDate && !Number.isNaN(alertDate.getTime())
                ? alertDate.toLocaleString()
                : "Unknown date";

            return `
                <div class="alert-card">
                    <h3>${alert.status === "Fraud" ? "🚨" : "⚠️"} ${alert.status || "Alert"}</h3>
                    <p><strong>Email:</strong> ${alert.senderEmail || "Unknown sender"}</p>
                    <p><strong>Risk Score:</strong> <span style="color: #ef4444; font-weight: bold;">${alert.riskScore ?? "N/A"}%</span></p>
                    <p><strong>Reasons:</strong> ${reasons.length > 0 ? reasons.join(", ") : "No reasons available"}</p>
                    <p><strong>Date:</strong> ${dateText}</p>
                </div>
            `;
        }).join("");

    } catch (err) {
        container.innerHTML = '❌ Failed to load alerts';
        console.error(err);
    }
}

// Load on page open
document.addEventListener("DOMContentLoaded", loadAlerts);
