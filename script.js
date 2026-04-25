// ============================================
// EMAIL FRAUD DETECTOR - MAIN SCRIPT
// ============================================

let serverOnline = true;

// Check server status on page load
async function checkServerStatus() {
  try {
    const res = await fetch("/api/status");
    if (!res.ok) throw new Error("Server error");
    const data = await res.json();
    serverOnline = data.status === "connected";
    if (!serverOnline) {
      showToast("⚠️ Database offline - analysis will work but history won't save", "warning");
    }
  } catch (err) {
    serverOnline = false;
    console.error("Cannot reach server:", err);
  }
}

// ---- TAB MANAGEMENT ----
function showTab(tabName) {
  // Hide all tabs
  document.querySelectorAll(".tab-content").forEach(tab => {
    tab.classList.remove("active");
  });

  // Deactivate all buttons
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.classList.remove("active");
  });

  // Show selected tab
  document.getElementById(tabName).classList.add("active");
  event.target.classList.add("active");

  // Load data for specific tabs
  if (tabName === "history") {
    loadHistory();
  } else if (tabName === "stats") {
    loadStatistics();
  }
}

// ---- MAIN FRAUD DETECTION ----
async function checkEmail() {
  const emailText = document.getElementById("emailText").value.trim();
  const senderEmail = document.getElementById("senderEmail").value.trim();
  const resultDiv = document.getElementById("result");

  // Validation
  if (!senderEmail) {
    showToast("❌ Please enter sender email", "error");
    return;
  }

  if (!emailText) {
    showToast("❌ Please paste email content", "error");
    return;
  }

  if (emailText.length < 10) {
    showToast("❌ Email content must be at least 10 characters", "error");
    return;
  }

  // Show loading
  resultDiv.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>Analyzing email...</p>
    </div>
  `;

  try {
    const res = await fetch("/check-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ emailText, senderEmail }),
    });

    if (!res.ok) {
      throw new Error("Server error: " + res.status);
    }

    const data = await res.json();

    // Determine result class
    let className = "result-safe";
    let icon = "✅";
    if (data.status === "Fraud") {
      className = "result-fraud";
      icon = "🚫";
    } else if (data.status === "Suspicious") {
      className = "result-suspicious";
      icon = "⚠️";
    }

    // Get color based on score
    const progressColor = getProgressColor(data.score);

    let reasonsHTML = data.reasons
      .map(r => `<li class="reason-item">${r}</li>`)
      .join("");

    let offlineIndicator = "";
    if (data.offlineMode) {
      offlineIndicator = `<div style="background: rgba(245, 158, 11, 0.15); padding: 10px; border-radius: 8px; margin-top: 15px; border-left: 3px solid var(--warning-color); color: var(--warning-color); font-size: 0.9rem;">
        ⚠️ <strong>Database Offline:</strong> This analysis is not saved to database
      </div>`;
    }

    resultDiv.innerHTML = `
      <div class="result-card ${className}">
        <div class="result-header">
          <span class="result-icon">${icon}</span>
          <h2 class="result-status">${data.status}</h2>
        </div>

        <div class="result-score">
          <span class="score-label">Risk Score</span>
          <span class="score-value">${data.score}%</span>
        </div>

        <div class="progress-container">
          <div class="progress-bar" style="width: ${data.score}%; background: ${progressColor};"></div>
        </div>

        <div class="result-details">
          <h3>Analysis Results:</h3>
          <ul class="reasons-list">
            ${reasonsHTML}
          </ul>
        </div>

        ${
          data.keywords.length > 0
            ? `<div class="keywords-section">
                <h3>Detected Keywords:</h3>
                <div class="keywords-list">
                  ${data.keywords.map(k => `<span class="keyword-tag">${k}</span>`).join("")}
                </div>
              </div>`
            : ""
        }

        ${offlineIndicator}

        <div class="result-actions">
          <button onclick="clearForm()" class="btn-secondary">Analyze Another</button>
        </div>
      </div>
    `;

    showToast("✅ Analysis completed!", "success");
  } catch (err) {
    console.error("Error:", err);
    resultDiv.innerHTML = `
      <div class="error-card">
        <p>❌ Error: ${err.message}</p>
        <p style="font-size: 0.9rem; margin-top: 10px;">Is the server running? Try: <code style="background: black; padding: 5px; border-radius: 3px;">npm start</code></p>
      </div>
    `;
    showToast("❌ Analysis failed - server not responding", "error");
  }
}

// ---- CLEAR FORM ----
function clearForm() {
  document.getElementById("senderEmail").value = "";
  document.getElementById("emailText").value = "";
  document.getElementById("result").innerHTML = "";
  document.getElementById("senderEmail").focus();
}

// ---- HISTORY MANAGEMENT ----
async function loadHistory() {
  const historyList = document.getElementById("historyList");
  historyList.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>Loading history...</p>
    </div>
  `;

  try {
    const res = await fetch("/api/history?limit=50");
    if (!res.ok) throw new Error("Failed to load history");

    const data = await res.json();

    if (data.offlineMode) {
      historyList.innerHTML = `
        <div style="background: rgba(245, 158, 11, 0.15); padding: 20px; border-radius: 10px; text-align: center; border-left: 3px solid var(--warning-color);">
          <p style="color: var(--warning-color); font-weight: 600; margin-bottom: 10px;">⚠️ Database Offline</p>
          <p style="color: var(--text-muted);">History is not available. To save analyses, connect to MongoDB Atlas.</p>
        </div>
      `;
      return;
    }

    if (data.count === 0) {
      historyList.innerHTML = `
        <div class="empty-state">
          <p>📋 No analysis history yet</p>
          <p>Start analyzing emails to see them here</p>
        </div>
      `;
      return;
    }

    let html = "";
    data.data.forEach((item, index) => {
      const date = new Date(item.createdAt).toLocaleString();
      const statusClass = `status-${item.status.toLowerCase()}`;
      const emailPreview = item.emailText.substring(0, 50) + (item.emailText.length > 50 ? "..." : "");

      html += `
        <div class="history-item">
          <div class="history-header">
            <span class="history-number">#${data.total - index}</span>
            <span class="history-date">${date}</span>
          </div>
          <div class="history-body">
            <p><strong>From:</strong> ${item.senderEmail}</p>
            <p><strong>Status:</strong> <span class="${statusClass}">${item.status}</span></p>
            <p><strong>Risk Score:</strong> <span class="history-score">${item.riskScore}%</span></p>
            <p><strong>Content:</strong> ${emailPreview}</p>
          </div>
          <div class="history-actions">
            <button onclick="viewFullAnalysis('${item._id}')" class="btn-tiny">View</button>
            <button onclick="deleteAnalysis('${item._id}')" class="btn-tiny btn-danger">Delete</button>
          </div>
        </div>
      `;
    });

    historyList.innerHTML = html;
  } catch (err) {
    historyList.innerHTML = `<div class="error-card">❌ Error loading history: ${err.message}</div>`;
  }
}

// ---- STATISTICS ----
async function loadStatistics() {
  const statsContent = document.getElementById("statsContent");
  statsContent.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>Loading statistics...</p>
    </div>
  `;

  try {
    const res = await fetch("/api/statistics");
    if (!res.ok) throw new Error("Failed to load statistics");

    const stats = await res.json();

    if (stats.offlineMode) {
      statsContent.innerHTML = `
        <div class="stats-card full-width" style="background: rgba(245, 158, 11, 0.15); border-left: 3px solid var(--warning-color);">
          <p style="color: var(--warning-color); font-weight: 600; margin-bottom: 10px;">⚠️ Database Offline</p>
          <p style="color: var(--text-muted);">Statistics are not available. Connect to MongoDB Atlas to see analytics.</p>
        </div>
      `;
      return;
    }

    let statusBreakdown = "";
    let totalByStatus = { Safe: 0, Suspicious: 0, Fraud: 0 };

    stats.byStatus.forEach(status => {
      totalByStatus[status._id] = status.count;
      const percentage = ((status.count / stats.total) * 100).toFixed(1);
      statusBreakdown += `
        <div class="stat-item">
          <span class="stat-label">${status._id}</span>
          <span class="stat-count">${status.count}</span>
          <span class="stat-percentage">${percentage}%</span>
          <div class="stat-bar">
            <div class="stat-fill status-${status._id.toLowerCase()}" style="width: ${percentage}%"></div>
          </div>
        </div>
      `;
    });

    statsContent.innerHTML = `
      <div class="stats-card">
        <div class="stat-box">
          <h3>Total Analyses</h3>
          <p class="stat-big">${stats.total}</p>
        </div>
        <div class="stat-box">
          <h3>Average Risk Score</h3>
          <p class="stat-big">${stats.avgRiskScore}%</p>
        </div>
      </div>

      <div class="stats-card full-width">
        <h3>Breakdown by Status</h3>
        ${statusBreakdown}
      </div>

      <div class="stats-card">
        <h3>Quick Summary</h3>
        <p>✅ Safe: ${totalByStatus.Safe}</p>
        <p>⚠️ Suspicious: ${totalByStatus.Suspicious}</p>
        <p>🚫 Fraud: ${totalByStatus.Fraud}</p>
      </div>
    `;
  } catch (err) {
    statsContent.innerHTML = `<div class="error-card">❌ Error: ${err.message}</div>`;
  }
}

// ---- VIEW FULL ANALYSIS ----
async function viewFullAnalysis(id) {
  try {
    const res = await fetch(`/api/analysis/${id}`);
    if (!res.ok) throw new Error("Analysis not found");

    const analysis = await res.json();
    const date = new Date(analysis.createdAt).toLocaleString();

    alert(`
📊 Full Analysis Details
━━━━━━━━━━━━━━━━━━━━━━━━
From: ${analysis.senderEmail}
Status: ${analysis.status}
Risk Score: ${analysis.riskScore}%
Date: ${date}

📝 Reasons:
${analysis.reasons.join("\n")}

🔍 Keywords: ${analysis.keywords.join(", ") || "None"}
    `);
  } catch (err) {
    showToast("❌ Failed to load analysis: " + err.message, "error");
  }
}

// ---- DELETE ANALYSIS ----
async function deleteAnalysis(id) {
  if (!confirm("Are you sure you want to delete this analysis?")) return;

  try {
    const res = await fetch(`/api/analysis/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Failed to delete");

    showToast("✅ Analysis deleted", "success");
    loadHistory();
  } catch (err) {
    showToast("❌ Error: " + err.message, "error");
  }
}

// ---- CLEAR ALL HISTORY ----
async function clearAllHistory() {
  if (!confirm("⚠️ This will delete ALL analysis history. Are you sure?")) return;

  try {
    const res = await fetch("/api/clear-history", {
      method: "POST",
    });

    if (!res.ok) throw new Error("Failed to clear");

    const data = await res.json();
    showToast(`✅ Cleared ${data.deletedCount} records`, "success");
    loadHistory();
  } catch (err) {
    showToast("❌ Error: " + err.message, "error");
  }
}

// ---- EXPORT TO CSV ----
async function exportCSV() {
  try {
    const res = await fetch("/api/export/csv");
    if (!res.ok) throw new Error("Export failed");

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fraud_analysis_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    showToast("✅ CSV exported successfully", "success");
  } catch (err) {
    showToast("❌ Export failed: " + err.message, "error");
  }
}

// ---- TOAST NOTIFICATIONS ----
function showToast(message, type = "info") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = `toast show toast-${type}`;

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// ---- UTILITY FUNCTIONS ----
function getProgressColor(score) {
  if (score < 30) return "#10b981"; // Green
  if (score < 60) return "#f59e0b"; // Orange
  return "#ef4444"; // Red
}

// ---- AUTO LOAD ON PAGE LOAD ----
document.addEventListener("DOMContentLoaded", () => {
  checkServerStatus();
  document.getElementById("senderEmail").focus();
});

// ---- CLEAR FORM ----
function clearForm() {
  document.getElementById("senderEmail").value = "";
  document.getElementById("emailText").value = "";
  document.getElementById("result").innerHTML = "";
  document.getElementById("senderEmail").focus();
}

// ---- HISTORY MANAGEMENT ----
async function loadHistory() {
  const historyList = document.getElementById("historyList");
  historyList.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>Loading history...</p>
    </div>
  `;

  try {
    const res = await fetch("/api/history?limit=50");
    if (!res.ok) throw new Error("Failed to load history");

    const data = await res.json();

    if (data.count === 0) {
      historyList.innerHTML = `
        <div class="empty-state">
          <p>📋 No analysis history yet</p>
          <p>Start analyzing emails to see them here</p>
        </div>
      `;
      return;
    }

    let html = "";
    data.data.forEach((item, index) => {
      const date = new Date(item.createdAt).toLocaleString();
      const statusClass = `status-${item.status.toLowerCase()}`;
      const emailPreview = item.emailText.substring(0, 50) + (item.emailText.length > 50 ? "..." : "");

      html += `
        <div class="history-item">
          <div class="history-header">
            <span class="history-number">#${data.total - index}</span>
            <span class="history-date">${date}</span>
          </div>
          <div class="history-body">
            <p><strong>From:</strong> ${item.senderEmail}</p>
            <p><strong>Status:</strong> <span class="${statusClass}">${item.status}</span></p>
            <p><strong>Risk Score:</strong> <span class="history-score">${item.riskScore}%</span></p>
            <p><strong>Content:</strong> ${emailPreview}</p>
          </div>
          <div class="history-actions">
            <button onclick="viewFullAnalysis('${item._id}')" class="btn-tiny">View</button>
            <button onclick="deleteAnalysis('${item._id}')" class="btn-tiny btn-danger">Delete</button>
          </div>
        </div>
      `;
    });

    historyList.innerHTML = html;
  } catch (err) {
    historyList.innerHTML = `<div class="error-card">❌ Error loading history: ${err.message}</div>`;
  }
}

// ---- STATISTICS ----
async function loadStatistics() {
  const statsContent = document.getElementById("statsContent");
  statsContent.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>Loading statistics...</p>
    </div>
  `;

  try {
    const res = await fetch("/api/statistics");
    if (!res.ok) throw new Error("Failed to load statistics");

    const stats = await res.json();

    let statusBreakdown = "";
    let totalByStatus = { Safe: 0, Suspicious: 0, Fraud: 0 };

    stats.byStatus.forEach(status => {
      totalByStatus[status._id] = status.count;
      const percentage = ((status.count / stats.total) * 100).toFixed(1);
      statusBreakdown += `
        <div class="stat-item">
          <span class="stat-label">${status._id}</span>
          <span class="stat-count">${status.count}</span>
          <span class="stat-percentage">${percentage}%</span>
          <div class="stat-bar">
            <div class="stat-fill status-${status._id.toLowerCase()}" style="width: ${percentage}%"></div>
          </div>
        </div>
      `;
    });

    statsContent.innerHTML = `
      <div class="stats-card">
        <div class="stat-box">
          <h3>Total Analyses</h3>
          <p class="stat-big">${stats.total}</p>
        </div>
        <div class="stat-box">
          <h3>Average Risk Score</h3>
          <p class="stat-big">${stats.avgRiskScore}%</p>
        </div>
      </div>

      <div class="stats-card full-width">
        <h3>Breakdown by Status</h3>
        ${statusBreakdown}
      </div>

      <div class="stats-card">
        <h3>Quick Summary</h3>
        <p>✅ Safe: ${totalByStatus.Safe}</p>
        <p>⚠️ Suspicious: ${totalByStatus.Suspicious}</p>
        <p>🚫 Fraud: ${totalByStatus.Fraud}</p>
      </div>
    `;
  } catch (err) {
    statsContent.innerHTML = `<div class="error-card">❌ Error: ${err.message}</div>`;
  }
}

// ---- VIEW FULL ANALYSIS ----
async function viewFullAnalysis(id) {
  try {
    const res = await fetch(`/api/analysis/${id}`);
    if (!res.ok) throw new Error("Analysis not found");

    const analysis = await res.json();
    const date = new Date(analysis.createdAt).toLocaleString();

    alert(`
📊 Full Analysis Details
━━━━━━━━━━━━━━━━━━━━━━━━
From: ${analysis.senderEmail}
Status: ${analysis.status}
Risk Score: ${analysis.riskScore}%
Date: ${date}

📝 Reasons:
${analysis.reasons.join("\n")}

🔍 Keywords: ${analysis.keywords.join(", ") || "None"}
    `);
  } catch (err) {
    showToast("❌ Failed to load analysis: " + err.message, "error");
  }
}

// ---- DELETE ANALYSIS ----
async function deleteAnalysis(id) {
  if (!confirm("Are you sure you want to delete this analysis?")) return;

  try {
    const res = await fetch(`/api/analysis/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Failed to delete");

    showToast("✅ Analysis deleted", "success");
    loadHistory();
  } catch (err) {
    showToast("❌ Error: " + err.message, "error");
  }
}

// ---- CLEAR ALL HISTORY ----
async function clearAllHistory() {
  if (!confirm("⚠️ This will delete ALL analysis history. Are you sure?")) return;

  try {
    const res = await fetch("/api/clear-history", {
      method: "POST",
    });

    if (!res.ok) throw new Error("Failed to clear");

    const data = await res.json();
    showToast(`✅ Cleared ${data.deletedCount} records`, "success");
    loadHistory();
  } catch (err) {
    showToast("❌ Error: " + err.message, "error");
  }
}

// ---- EXPORT TO CSV ----
async function exportCSV() {
  try {
    const res = await fetch("/api/export/csv");
    if (!res.ok) throw new Error("Export failed");

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fraud_analysis_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    showToast("✅ CSV exported successfully", "success");
  } catch (err) {
    showToast("❌ Export failed: " + err.message, "error");
  }
}

// ---- TOAST NOTIFICATIONS ----
function showToast(message, type = "info") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = `toast show toast-${type}`;

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// ---- UTILITY FUNCTIONS ----
function getProgressColor(score) {
  if (score < 30) return "#10b981"; // Green
  if (score < 60) return "#f59e0b"; // Orange
  return "#ef4444"; // Red
}

// ---- AUTO LOAD ON PAGE LOAD ----
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("senderEmail").focus();
});