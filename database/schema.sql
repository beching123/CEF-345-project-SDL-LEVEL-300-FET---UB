CREATE DATABASE IF NOT EXISTS netlink_db;
CREATE TABLE general_reports
(
  id INT AUTO_INCREMENT PRIMARY KEY,
  network_type VARCHAR(20),
  issue VARCHAR(100),
  description TEXT,
  location_allowed TINYINT(1),
  created_at TIMESTAMP DEFAULT
CURRENT_TIMESTAMP
);

CREATE OR REPLACE VIEW mtn_report AS
SELECT * FROM general_reports WHERE
network_type = 'MTN'

CREATE OR REPLACE VIEW orange_report AS
SELECT * FROM general_reports WHERE
network_type = 'ORANGE';

CREATE OR REPLACE VIEW camtel_report AS
SELECT * FROM general_reports WHERE
network_type = 'CAMTEL';




