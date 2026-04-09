const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:password@localhost:5433/restaurant_db'
});

client.connect()
  .then(() => {
    console.log('Connected to PostgreSQL successfully on 5433!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Connection error on 5433:', err.message);
    process.exit(1);
  });
