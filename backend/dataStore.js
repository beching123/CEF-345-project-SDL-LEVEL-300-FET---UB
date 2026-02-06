const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data.json');

// Helper to read data file
function readData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return { reports: [], locations: [] };
    }
    const content = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading data file:', err);
    return { reports: [], locations: [] };
  }
}

// Helper to write data file
function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing data file:', err);
  }
}

// Get all reports
function getAllReports() {
  const data = readData();
  return data.reports || [];
}

// Get report count
function getReportCount() {
  return getAllReports().length;
}

// Get count by network type
function getCountByNetwork() {
  const reports = getAllReports();
  const counts = {
    mtn: 0,
    orange: 0,
    camtel: 0
  };

  reports.forEach(report => {
    const network = report.networkType.toLowerCase();
    if (counts.hasOwnProperty(network)) {
      counts[network]++;
    }
  });

  return counts;
}

// Get all locations
function getLocations() {
  const data = readData();
  return data.locations || [];
}

// Add a new report
function addReport(reportData) {
  const data = readData();
  
  const newReport = {
    id: Date.now(),
    ...reportData,
    createdAt: new Date().toISOString()
  };

  if (!data.reports) data.reports = [];
  data.reports.push(newReport);

  // Also add location if coordinates exist
  if (reportData.latitude && reportData.longitude) {
    if (!data.locations) data.locations = [];
    data.locations.push({
      id: newReport.id,
      latitude: reportData.latitude,
      longitude: reportData.longitude,
      addressLandmark: reportData.addressLandmark || 'Unknown Location',
      radiusMeters: reportData.radiusMeters || 50,
      issueMagnitude: reportData.issueScale || 'Street',
      networkType: reportData.networkType,
      createdAt: new Date().toISOString()
    });
  }

  writeData(data);
  return newReport;
}

module.exports = {
  readData,
  writeData,
  getAllReports,
  getReportCount,
  getCountByNetwork,
  getLocations,
  addReport
};
