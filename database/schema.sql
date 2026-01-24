CREATE DATABASE IF NOT EXISTS netlink_db;

USE netlink_db;

-- Table 1: General Reports (Main report submission)
CREATE TABLE IF NOT EXISTS general_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  network_type VARCHAR(20) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  issue VARCHAR(100) NOT NULL,
  description TEXT,
  location_allowed TINYINT(1) DEFAULT 0,
  issue_scale VARCHAR(50) COMMENT 'Street, Neighborhood, City, etc.',
  is_offline TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_network (network_type),
  INDEX idx_created (created_at)
);

-- Table 2: Network Details (Connection/signal specifics)
CREATE TABLE IF NOT EXISTS network_details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  report_id INT NOT NULL,
  signal_strength INT,
  connection_type VARCHAR(50) COMMENT '4G, 3G, 2G, WiFi, etc.',
  issue_severity VARCHAR(20) COMMENT 'Critical, Warning, Healthy',
  bandwidth_mbps DECIMAL(10, 2),
  latency_ms INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (report_id) REFERENCES general_reports(id) ON DELETE CASCADE,
  INDEX idx_report (report_id)
);

-- Table 3: Device Logs (Device-specific info)
CREATE TABLE IF NOT EXISTS device_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  report_id INT NOT NULL,
  device_model VARCHAR(100),
  os_type VARCHAR(50),
  os_version VARCHAR(50),
  app_version VARCHAR(20),
  location_lat DECIMAL(10, 8),
  location_long DECIMAL(11, 8),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (report_id) REFERENCES general_reports(id) ON DELETE CASCADE,
  INDEX idx_report (report_id)
);

-- Table 4: Location History (Map visualization data)
CREATE TABLE IF NOT EXISTS location_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  report_id INT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  address_landmark VARCHAR(255),
  radius_meters INT COMMENT 'Calculated from issue_magnitude * 50',
  issue_magnitude INT COMMENT 'Determines outer circle size',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (report_id) REFERENCES general_reports(id) ON DELETE CASCADE,
  SPATIAL INDEX idx_geo (latitude, longitude),
  INDEX idx_report (report_id)
);

-- Legacy Views for backward compatibility
CREATE OR REPLACE VIEW mtn_report AS
SELECT * FROM general_reports WHERE network_type = 'MTN';

CREATE OR REPLACE VIEW orange_report AS
SELECT * FROM general_reports WHERE network_type = 'ORANGE';

CREATE OR REPLACE VIEW camtel_report AS
SELECT * FROM general_reports WHERE network_type = 'CAMTEL';




