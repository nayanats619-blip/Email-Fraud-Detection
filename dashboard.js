let classificationChart = null;
let riskChart = null;

async function loadDashboard() {
    try {
        const res = await fetch("/api/history");
        const response = await res.json();
        const emails = response.data || response || [];

        if (emails.length === 0) {
            document.getElementById("recentList").innerHTML = `
                <div class="empty-state" style="padding: 40px; text-align: center;">
                    <p style="font-size: 1.2rem; margin-bottom: 10px;">📭 No emails analyzed yet</p>
                    <p style="color: var(--text-muted);">Start analyzing emails to see dashboard data</p>
                </div>
            `;
            return;
        }

        // Calculate totals (FIX: correct status values are "Safe", "Fraud", "Suspicious")
        const safe = emails.filter(e => e.status === "Safe").length;
        const fraud = emails.filter(e => e.status === "Fraud").length;
        const suspicious = emails.filter(e => e.status === "Suspicious").length;
        const total = emails.length;

        // Calculate statistics
        const riskScores = emails.map(e => e.riskScore || 0);
        const avgRisk = Math.round(riskScores.reduce((a, b) => a + b, 0) / total);
        const maxRisk = Math.max(...riskScores);
        const detectionRate = Math.round(((fraud + suspicious) / total) * 100);

        // Count unique senders
        const uniqueSenders = new Set(emails.map(e => e.senderEmail)).size;

        // Update KPI Cards
        document.getElementById("totalEmails").innerText = total;
        document.getElementById("safeEmails").innerText = safe;
        document.getElementById("fraudEmails").innerText = fraud;
        document.getElementById("suspiciousEmails").innerText = suspicious;
        document.getElementById("avgRisk").innerText = avgRisk;
        document.getElementById("maxRisk").innerText = maxRisk;
        document.getElementById("totalSenders").innerText = uniqueSenders;
        document.getElementById("detectionRate").innerText = detectionRate + "%";
        
        document.getElementById("safePercent").innerText = Math.round((safe / total) * 100) + "%";
        document.getElementById("fraudPercent").innerText = Math.round((fraud / total) * 100) + "%";
        document.getElementById("suspPercent").innerText = Math.round((suspicious / total) * 100) + "%";

        // Update last refresh time
        const now = new Date().toLocaleTimeString();
        document.getElementById("lastUpdate").innerText = now;

        // Update metric progress bars
        document.getElementById("avgRiskBar").style.width = avgRisk + "%";
        document.getElementById("detectionBar").style.width = detectionRate + "%";

        // Get top senders by email count
        const senderCounts = {};
        emails.forEach(e => {
            const sender = e.senderEmail || "Unknown";
            if (!senderCounts[sender]) {
                senderCounts[sender] = { count: 0, fraud: 0, riskScores: [] };
            }
            senderCounts[sender].count++;
            if (e.status === "Fraud") senderCounts[sender].fraud++;
            senderCounts[sender].riskScores.push(e.riskScore || 0);
        });

        const topSendersArray = Object.entries(senderCounts)
            .sort((a, b) => b[1].fraud - a[1].fraud || b[1].count - a[1].count)
            .slice(0, 5);

        const topSendersHTML = topSendersArray
            .map(([sender, data]) => {
                const fraudRate = Math.round((data.fraud / data.count) * 100);
                const avgSenderRisk = Math.round(data.riskScores.reduce((a, b) => a + b, 0) / data.riskScores.length);
                return `
                    <div class="sender-item">
                        <div class="sender-email">${sender}</div>
                        <div class="sender-stats">
                            <span class="stat-badge fraud">${data.fraud} fraud</span>
                            <span class="stat-badge">Avg Risk: ${avgSenderRisk}</span>
                        </div>
                    </div>
                `;
            })
            .join("");

        document.getElementById("topSenders").innerHTML = topSendersHTML || "<p style='color: var(--text-muted);'>No fraud detected</p>";

        // Create Classification Chart
        setTimeout(() => {
            createClassificationChart(safe, fraud, suspicious);
            createRiskChart(riskScores);
        }, 100);

        // Load Recent Activity
        loadRecentActivity(emails.slice(0, 10));

    } catch (err) {
        console.error("Dashboard error:", err);
        document.getElementById("recentList").innerHTML = `
            <div class="error-card">
                ❌ Error loading dashboard: ${err.message}
            </div>
        `;
    }
}

function createClassificationChart(safe, fraud, suspicious) {
    const ctx = document.getElementById("classificationChart");
    if (!ctx) return;

    if (classificationChart) classificationChart.destroy();

    classificationChart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Safe", "Fraud", "Suspicious"],
            datasets: [{
                data: [safe, fraud, suspicious],
                backgroundColor: ["#10b981", "#ef4444", "#f59e0b"],
                borderColor: ["#059669", "#dc2626", "#d97706"],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: {
                        color: "#e2e8f0",
                        font: { size: 12, weight: "bold" },
                        padding: 15
                    }
                }
            }
        }
    });
}

function createRiskChart(riskScores) {
    const ctx = document.getElementById("riskChart");
    if (!ctx) return;

    if (riskChart) riskChart.destroy();

    // Create risk distribution bins
    const bins = [
        { range: "0-20", count: riskScores.filter(s => s < 20).length },
        { range: "20-40", count: riskScores.filter(s => s >= 20 && s < 40).length },
        { range: "40-60", count: riskScores.filter(s => s >= 40 && s < 60).length },
        { range: "60-80", count: riskScores.filter(s => s >= 60 && s < 80).length },
        { range: "80-100", count: riskScores.filter(s => s >= 80).length }
    ];

    riskChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: bins.map(b => b.range),
            datasets: [{
                label: "Email Count",
                data: bins.map(b => b.count),
                backgroundColor: ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#dc2626"],
                borderRadius: 8,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: { color: "#e2e8f0", font: { size: 12, weight: "bold" } }
                }
            },
            scales: {
                y: {
                    ticks: { color: "#94a3b8" },
                    grid: { color: "rgba(255,255,255,0.1)" }
                },
                x: {
                    ticks: { color: "#94a3b8" },
                    grid: { color: "rgba(255,255,255,0.1)" }
                }
            }
        }
    });
}

function loadRecentActivity(emails) {
    const recentList = document.getElementById("recentList");
    
    if (emails.length === 0) {
        recentList.innerHTML = '<p style="text-align: center; color: var(--text-muted);">No recent activity</p>';
        return;
    }

    const html = emails.map((email, idx) => {
        const date = new Date(email.createdAt).toLocaleString();
        const statusClass = `status-${email.status.toLowerCase()}`;
        const statusEmoji = email.status === "Safe" ? "✅" : email.status === "Fraud" ? "🚫" : "⚠️";
        const emailPreview = email.emailText.substring(0, 60) + (email.emailText.length > 60 ? "..." : "");
        
        return `
            <div class="recent-item">
                <div class="recent-left">
                    <div class="recent-emoji">${statusEmoji}</div>
                </div>
                <div class="recent-middle">
                    <div class="recent-sender">${email.senderEmail}</div>
                    <div class="recent-preview">${emailPreview}</div>
                    <div class="recent-date">${date}</div>
                </div>
                <div class="recent-right">
                    <div class="recent-status ${statusClass}">${email.status}</div>
                    <div class="recent-score">${email.riskScore}% risk</div>
                </div>
            </div>
        `;
    }).join("");

    recentList.innerHTML = html;
}

// Load dashboard on page load
window.addEventListener("DOMContentLoaded", loadDashboard);