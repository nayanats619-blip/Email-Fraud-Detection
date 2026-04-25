const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "data.json");

// Load data from file
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.log("Error loading data:", err.message);
  }
  return [];
}

// Save data to file
function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.log("Error saving data:", err.message);
  }
}

// Create new analysis (like MongoDB create)
function createAnalysis(analysisData) {
  const data = loadData();
  const newEntry = {
    _id: Date.now().toString(),
    ...analysisData,
    createdAt: new Date().toISOString()
  };
  data.push(newEntry);
  saveData(data);
  return newEntry;
}

// Find all (like MongoDB find)
function findAll() {
  return loadData();
}

// Delete by ID (like MongoDB delete)
function deleteById(id) {
  const data = loadData();
  const filtered = data.filter(item => item._id !== id);
  saveData(filtered);
}

// Delete all (like MongoDB deleteMany)
function deleteAll() {
  saveData([]);
}

// Count documents (like MongoDB countDocuments)
function countDocuments() {
  return loadData().length;
}

// Group and aggregate (for statistics)
function groupByStatus() {
  const data = loadData();
  const groups = {};
  
  data.forEach(item => {
    if (!groups[item.status]) {
      groups[item.status] = 0;
    }
    groups[item.status]++;
  });
  
  return Object.entries(groups).map(([status, count]) => ({
    _id: status,
    count: count
  }));
}

module.exports = {
  createAnalysis,
  findAll,
  deleteById,
  deleteAll,
  countDocuments,
  groupByStatus
};
