import { Client } from 'pg';
import format from 'pg-format';
import env from '../lib/env';
import { ConnectionOptions } from '../types';

const logQuery = function (statement: string): void {
  const timeStamp: Date = new Date();
  const formattedTimeStamp: string = timeStamp.toString().substring(4, 24);
  console.log(formattedTimeStamp, statement);
};

const CONNECTION: ConnectionOptions = {
  connectionString: env.DATABASE_URL,
  ssl: env.DATABASE_SSL ? { rejectUnauthorized: false } : false,
};

export default async function (
  statement: string,
  ...parameters: Array<unknown>
) {
  const sql = format(statement, ...parameters);

  const client = new Client(CONNECTION);

  try {
    await client.connect();

    if (env.DEBUG) logQuery(sql);
    const result = await client.query(sql);
    return result;
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  } finally {
    await client.end();
  }
}
