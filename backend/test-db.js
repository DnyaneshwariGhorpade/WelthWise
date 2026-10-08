const { Client } = require('pg');
require('dotenv').config();

if (!process.env.DATABASE_URL) {
  console.error("ERROR: DATABASE_URL is not defined in your .env file!");
  process.exit(1);
}

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

console.log("Attempting to connect to the database...");

client.connect()
  .then(() => {
    console.log("✅ SUCCESS! The database connection works perfectly.");
    client.end();
  })
  .catch(err => {
    console.error("❌ ERROR connecting to the database:");
    console.error(err);
    client.end();
  });
