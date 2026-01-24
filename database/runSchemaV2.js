const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runSchema() {
  let connection;
  try {
    // First connection to create database
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: ''
    });

    console.log('✅ Connected to MySQL');

    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by semicolon but keep them
    const statements = schemaSQL.split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`Found ${statements.length} SQL statements to execute\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        console.log(`[${i + 1}/${statements.length}] Executing: ${statement.substring(0, 60)}...`);
        await connection.query(statement);
        console.log(`✅ Success\n`);
      } catch (error) {
        console.error(`❌ Error: ${error.message}\n`);
        // Continue even if one statement fails
      }
    }
    
    console.log('✅ Schema deployment completed!');
    await connection.end();
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    process.exit(1);
  }
}

runSchema();
