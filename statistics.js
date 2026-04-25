let pieChart = null;
let trendChart = null;
let riskChart = null;

async function loadStatistics() {
  const statsDiv = document.getElementById("statsContent");
  const statusMsg = document.getElementById("statusMessage");

  statsDiv.innerHTML = "<div style='text-align: center; padding: 40px;'><p>Loading statistics...</p></div>";
  statusMsg.style.display = "none";

  try {
    const res = await fetch("/api/history");
    const response = await res.json();
    const data = response.data || response;

    // Check if database is offline
    if (response.offlineMode) {
      statusMsg.innerHTML = "⚠️ Database is offline - showing cached statistics";
      statusMsg.style.display = "block";
      statusMsg.style.color = "orange";
    }

    let total = data ? data.length : 0;
    let safe = 0, fraud = 0, suspicious = 0;
    let totalRiskScore = 0;
    const senderMap = {};
    const riskScores = [];
    const dailyTrends = {};

    if (data) {
      data.forEach(item => {
        if (item.status === "Safe") safe++;
        else if (item.status === "Fraud") fraud++;
        else suspicious++;

        totalRiskScore += item.riskScore || 0;
        riskScores.push(item.riskScore || 0);

        // Count emails per sender
        const sender = item.senderEmail || "Unknown";
        senderMap[sender] = (senderMap[sender] || 0) + 1;

        // Track daily trends
        const date = new Date(item.createdAt).toLocaleDateString();
        dailyTrends[date] = (dailyTrends[date] || 0) + 1;
      });
    }

    if (total === 0) {
      statsDiv.innerHTML = `
        <div class="stats-card" style="text-align: center; padding: 50px 20px;">
          <h3 style="font-size: 1.5rem; margin-bottom: 10px;">📊 No data yet</h3>
          <p>Start analyzing emails to see statistics and charts!</p>
        </div>
      `;
      return;
    }

    const avgRiskScore = (totalRiskScore / total).toFixed(2);
    const maxRiskScore = Math.max(...riskScores);
    const topSenders = Object.entries(senderMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([sender, count]) => `${sender}: ${count}`)
      .join("<br>");

    // Create comprehensive HTML layout
    statsDiv.innerHTML = `
      <div class="stats-container">
        <!-- KPI Cards -->
        <div class="kpi-grid">
          <div class="kpi-card safe">
            <div class="kpi-number">${safe}</div>
            <div class="kpi-label">✅ Safe Emails</div>
            <div class="kpi-percentage">${((safe/total)*100).toFixed(1)}%</div>
          </div>
          <div class="kpi-card fraud">
            <div class="kpi-number">${fraud}</div>
            <div class="kpi-label">🚫 Fraud Detected</div>
            <div class="kpi-percentage">${((fraud/total)*100).toFixed(1)}%</div>
          </div>
          <div class="kpi-card suspicious">
            <div class="kpi-number">${suspicious}</div>
            <div class="kpi-label">⚠️ Suspicious</div>
            <div class="kpi-percentage">${((suspicious/total)*100).toFixed(1)}%</div>
          </div>
          <div class="kpi-card score">
            <div class="kpi-number">${avgRiskScore}</div>
            <div class="kpi-label">📈 Avg Risk Score</div>
            <div class="kpi-percentage">Max: ${maxRiskScore}</div>
          </div>
        </div>

        <!-- Charts Row 1 -->
        <div class="charts-grid">
          <div class="chart-container">
            <h3>Classification Distribution</h3>
            <canvas id="pieChart"></canvas>
          </div>
          <div class="chart-container">
            <h3>Risk Score Analysis</h3>
            <canvas id="riskChart"></canvas>
          </div>
        </div>

        <!-- Charts Row 2 -->
        <div class="charts-grid">
          <div class="chart-container full-width">
            <h3>Daily Analysis Trends</h3>
            <canvas id="trendChart"></canvas>
          </div>
        </div>

        <!-- Top Senders -->
        <div class="stats-card">
          <h3>🔝 Top Senders</h3>
          <div style="padding: 15px; background: rgba(255,255,255,0.05); border-radius: 8px; line-height: 1.8;">
            ${topSenders}
          </div>
        </div>

        <!-- Summary -->
        <div class="stats-card">
          <h3>📋 Summary</h3>
          <p><strong>Total Emails Analyzed:</strong> ${total}</p>
          <p><strong>Average Risk Score:</strong> ${avgRiskScore}/100</p>
          <p><strong>Fraud Detection Rate:</strong> ${((fraud/total)*100).toFixed(1)}%</p>
          <p><strong>Safe Email Rate:</strong> ${((safe/total)*100).toFixed(1)}%</p>
        </div>
      </div>
    `;

    // Initialize charts after HTML is rendered
    setTimeout(() => {
      createPieChart(safe, fraud, suspicious);
      createRiskChart(riskScores);
      createTrendChart(dailyTrends);
    }, 100);

  } catch (err) {
    console.error("Error:", err);
    statsDiv.innerHTML = "<p style='color: red; text-align: center; padding: 40px;'>❌ Error loading stats: " + err.message + "</p>";
  }
}

function createPieChart(safe, fraud, suspicious) {
  const ctx = document.getElementById("pieChart");
  if (!ctx) return;

  if (pieChart) pieChart.destroy();

  pieChart = new Chart(ctx, {
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
      plugins: {
        legend: {
          labels: {
            color: "#e2e8f0",
            font: { size: 12, weight: "bold" }
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
        borderRadius: 6,
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
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

function createTrendChart(dailyTrends) {
  const ctx = document.getElementById("trendChart");
  if (!ctx) return;

  if (trendChart) trendChart.destroy();

  const sortedDates = Object.keys(dailyTrends).sort();
  const trendData = sortedDates.map(date => dailyTrends[date]);

  trendChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: sortedDates,
      datasets: [{
        label: "Emails Analyzed",
        data: trendData,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: "#3b82f6",
        pointBorderColor: "#fff",
        pointBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
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

document.addEventListener("DOMContentLoaded", loadStatistics);