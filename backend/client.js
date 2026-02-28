const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const schema = fs.readFileSync(
  path.join(__dirname, 'src/model/schema.sql'),
  'utf-8'
);

const pgclient = new Client({
  connectionString: process.env.TEST_DATABASE_URL,
});

pgclient.connect();

pgclient.query(schema, (err, _res) => {
  if (err) throw err;
  pgclient.end();
});
