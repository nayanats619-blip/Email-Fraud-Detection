async function loadHistory() {
  const historyList = document.getElementById("historyList");
  const statusMsg = document.getElementById("statusMessage");

  historyList.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>Loading history...</p>
    </div>
  `;
  statusMsg.style.display = "none";

  try {
    const res = await fetch("/api/history");
    
    if (!res.ok) {
      throw new Error("Failed to fetch history: " + res.status);
    }
    
    const response = await res.json();
    const data = response.data || response;

    // Check if database is offline
    if (response.offlineMode) {
      statusMsg.innerHTML = "⚠️ Database is offline - history may not reflect all analyses";
      statusMsg.style.display = "block";
      statusMsg.style.color = "var(--warning-color)";
      statusMsg.style.background = "rgba(245, 158, 11, 0.1)";
      statusMsg.style.borderRadius = "10px";
      statusMsg.style.border = "1px solid var(--warning-color)";
      statusMsg.style.marginBottom = "20px";
    }

    if (!data || data.length === 0) {
      historyList.innerHTML = `
        <div class="empty-state">
          <p style="font-size: 3rem; margin-bottom: 15px;">📭</p>
          <p style="font-size: 1.2rem; margin-bottom: 10px;">No analysis history found</p>
          <p style="color: var(--text-muted);">Start analyzing emails to build your history!</p>
          <button onclick="window.location.href='/'" class="btn-secondary" style="margin-top: 20px; display: inline-block;">Start Analyzing</button>
        </div>
      `;
      return;
    }

    let html = "";
    const reversedData = data.reverse();

    reversedData.forEach((item, index) => {
      const date = new Date(item.createdAt);
      const formattedDate = date.toLocaleDateString() + " " + date.toLocaleTimeString();
      
      // Determine status color
      let statusColor = "var(--success-color)";
      let statusIcon = "✅";
      if (item.status === "Fraud") {
        statusColor = "var(--danger-color)";
        statusIcon = "🚫";
      } else if (item.status === "Suspicious") {
        statusColor = "var(--warning-color)";
        statusIcon = "⚠️";
      }

      // Build keywords display
      const keywordsHtml = item.keywords && item.keywords.length > 0 
        ? `<div style="margin-top: 10px; display: flex; flex-wrap: wrap; gap: 6px;">
             ${item.keywords.slice(0, 5).map(k => `<span style="background: rgba(34, 197, 94, 0.2); padding: 4px 8px; border-radius: 12px; font-size: 0.8rem; color: var(--success-color);">${k}</span>`).join("")}
             ${item.keywords.length > 5 ? `<span style="color: var(--text-muted); font-size: 0.8rem; display: flex; align-items: center;">+${item.keywords.length - 5} more</span>` : ""}
           </div>`
        : "";

      html += `
        <div class="history-item">
          <div class="history-header">
            <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
              <span style="font-size: 1.2rem;">#${reversedData.length - index}</span>
              <span style="color: ${statusColor}; font-weight: 700; font-size: 1rem;">${statusIcon} ${item.status}</span>
            </div>
            <span style="color: var(--text-muted); font-size: 0.85rem;">${formattedDate}</span>
          </div>
          <div class="history-body">
            <p style="margin: 8px 0;">
              <strong>Sender:</strong> <span style="font-family: monospace; color: var(--text-muted);">${escapeHtml(item.senderEmail)}</span>
            </p>
            <p style="margin: 8px 0;">
              <strong>Risk Score:</strong> 
              <span class="history-score">${item.riskScore}%</span>
              <span style="display: inline-block; width: 100px; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; margin-left: 10px; overflow: hidden; vertical-align: middle;">
                <span style="display: block; height: 100%; width: ${item.riskScore}%; background: ${item.riskScore > 70 ? 'var(--danger-color)' : item.riskScore > 30 ? 'var(--warning-color)' : 'var(--success-color)'}; border-radius: 3px;"></span>
              </span>
            </p>
            ${item.emailText ? `<p style="margin: 8px 0; color: var(--text-muted); font-size: 0.9rem;"><strong>Preview:</strong> ${escapeHtml(item.emailText.substring(0, 100))}...</p>` : ""}
            ${keywordsHtml}
          </div>
          <div class="history-actions">
            <button onclick="deleteAnalysis('${item._id}')" class="btn-tiny">Delete</button>
          </div>
        </div>
      `;
    });

    historyList.innerHTML = html;

  } catch (err) {
    console.error("Error:", err);
    historyList.innerHTML = `
      <div class="error-card">
        <p>❌ Error loading history: ${err.message}</p>
        <p style="font-size: 0.9rem; margin-top: 10px;">Make sure the server is running:</p>
        <p style="font-size: 0.85rem; background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px; margin-top: 10px; font-family: monospace;">npm start</p>
      </div>
    `;
  }
}

async function deleteAnalysis(id) {
  if (!confirm("Delete this analysis?")) return;
  
  try {
    const res = await fetch(`/api/history/${id}`, { method: "DELETE" });
    if (res.ok) {
      loadHistory();
    } else {
      alert("Failed to delete");
    }
  } catch (err) {
    console.error("Delete error:", err);
    alert("Error deleting: " + err.message);
  }
}

async function clearAllHistory() {
  if (!confirm("Are you sure you want to delete ALL history? This cannot be undone.")) return;
  
  try {
    const res = await fetch("/api/history", { method: "DELETE" });
    if (res.ok) {
      loadHistory();
    } else {
      alert("Failed to clear history");
    }
  } catch (err) {
    console.error("Clear error:", err);
    alert("Error clearing history: " + err.message);
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Load history on page load
document.addEventListener("DOMContentLoaded", loadHistory);