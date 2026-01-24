const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runSchema() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: ''
  });

  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = schemaSQL.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        // Use query instead of execute for DDL statements
        await connection.query(statement + ';');
      }
    }
    
    console.log('✅ Schema executed successfully!');
    await connection.end();
  } catch (error) {
    console.error('❌ Error executing schema:', error.message);
    await connection.end();
    process.exit(1);
  }
}

runSchema();
