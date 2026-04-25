const express = require("express");
const cors = require("cors");
const path = require("path");
const localDB = require("./localdb");
const { analyzeFraud } = require("./fraudDetection");

const app = express();

// DB status - NOW ALWAYS ONLINE with local JSON!
const dbConnected = true;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname)));

// ================= ROUTES =================

// Home
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// About
app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "about.html"));
});

// ✅ FIXED HISTORY ROUTE (ONLY ONE)
app.get("/history", (req, res) => {
  res.sendFile(path.join(__dirname, "histroy.html"));
});

// Statistics
app.get("/statistics", (req, res) => {
  res.sendFile(path.join(__dirname, "statistics.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "dashboard.html"));
});

// Alerts
app.get("/alerts", (req, res) => {
  res.sendFile(path.join(__dirname, "alerts.html"));
});
// ================= API =================

// Status
app.get("/api/status", (req, res) => {
  res.json({
    status: "connected",
    dbType: "local-json"
  });
});

// ================= FRAUD DETECTION =================

app.post("/check-email", (req, res) => {
  try {
    const { senderEmail, emailText } = req.body;

    if (!senderEmail || !emailText) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const analysis = analyzeFraud(senderEmail, emailText);

    // Save to local JSON database
    const saved = localDB.createAnalysis({
      senderEmail,
      emailText,
      status: analysis.status,
      riskScore: analysis.riskScore,
      reasons: analysis.reasons,
      keywords: analysis.keywords
    });

    res.json({
      status: analysis.status,
      score: analysis.riskScore,
      reasons: analysis.reasons,
      keywords: analysis.keywords,
      id: saved._id,
      saved: true
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= HISTORY =================

app.get("/api/history", (req, res) => {
  try {
    const data = localDB.findAll().reverse();

    res.json({
      total: data.length,
      data
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete single analysis
app.delete("/api/history/:id", (req, res) => {
  try {
    localDB.deleteById(req.params.id);
    res.json({ message: "Deleted successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete all history
app.delete("/api/history", (req, res) => {
  try {
    localDB.deleteAll();
    res.json({ message: "All history cleared" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= STATISTICS =================

app.get("/api/statistics", (req, res) => {
  try {
    const total = localDB.countDocuments();
    const byStatus = localDB.groupByStatus();

    res.json({ 
      total, 
      byStatus 
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= START SERVER =================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
🚀 Server running
📍 http://localhost:${PORT}
💾 DB: ✅ Connected (Local JSON Database)
📁 Data saved to: data.json
`);
}); 