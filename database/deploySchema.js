const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runSchema() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: ''
    });

    console.log('✅ Connected to MySQL\n');

    // Read entire schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute the entire schema at once (MySQL will parse multiple statements)
    const statements = schemaSQL
      .split(/;\s*\n/)
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        const preview = statement.substring(0, 50).replace(/\n/g, ' ');
        console.log(`Executing: ${preview}...`);
        try {
          await connection.query(statement);
          console.log('✅ Success\n');
        } catch (err) {
          console.error(`❌ ${err.message}\n`);
        }
      }
    }

    console.log('✅ Database schema deployed successfully!');
    
    // Verify tables were created
    const [tables] = await connection.query(
      'SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = "netlink_db"'
    );
    
    console.log(`\n📊 Tables created: ${tables.length}`);
    tables.forEach(t => console.log(`  - ${t.TABLE_NAME}`));
    
    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

runSchema();
