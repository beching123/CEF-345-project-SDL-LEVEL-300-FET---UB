const mysql = require('mysql2/promise');

async function setupDatabase() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: ''
    });

    console.log('✅ Connected to MySQL\n');

    // Create database
    console.log('Creating database netlink_db...');
    await connection.query('CREATE DATABASE IF NOT EXISTS netlink_db');
    console.log('✅ Database created\n');

    // Select database
    await connection.query('USE netlink_db');

    // Create general_reports table
    console.log('Creating table: general_reports');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS general_reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        network_type VARCHAR(20) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        issue VARCHAR(100) NOT NULL,
        description TEXT,
        location_allowed TINYINT(1) DEFAULT 0,
        issue_scale VARCHAR(50),
        is_offline TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_network (network_type),
        INDEX idx_created (created_at)
      )
    `);
    console.log('✅ general_reports created\n');

    // Create network_details table
    console.log('Creating table: network_details');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS network_details (
        id INT AUTO_INCREMENT PRIMARY KEY,
        report_id INT NOT NULL,
        signal_strength INT,
        connection_type VARCHAR(50),
        issue_severity VARCHAR(20),
        bandwidth_mbps DECIMAL(10, 2),
        latency_ms INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (report_id) REFERENCES general_reports(id) ON DELETE CASCADE,
        INDEX idx_report (report_id)
      )
    `);
    console.log('✅ network_details created\n');

    // Create device_logs table
    console.log('Creating table: device_logs');
    await connection.query(`
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
      )
    `);
    console.log('✅ device_logs created\n');

    // Create location_history table
    console.log('Creating table: location_history');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS location_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        report_id INT NOT NULL,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        address_landmark VARCHAR(255),
        radius_meters INT,
        issue_magnitude INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (report_id) REFERENCES general_reports(id) ON DELETE CASCADE,
        INDEX idx_geo (latitude, longitude),
        INDEX idx_report (report_id)
      )
    `);
    console.log('✅ location_history created\n');

    // Verify tables
    const [tables] = await connection.query(`
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'netlink_db'
    `);

    console.log('📊 Database Setup Complete!');
    console.log(`\nTables created (${tables.length}):`);
    tables.forEach(t => console.log(`  ✅ ${t.TABLE_NAME}`));

    await connection.end();
    console.log('\n✅ All done! Database is ready.');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupDatabase();
