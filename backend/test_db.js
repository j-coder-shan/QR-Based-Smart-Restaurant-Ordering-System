const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:password@localhost:5432/restaurant_db'
});

client.connect()
  .then(() => {
    console.log('Connected to PostgreSQL successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Connection error:', err.message);
    process.exit(1);
  });
