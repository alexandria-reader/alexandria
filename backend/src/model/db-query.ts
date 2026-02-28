/* eslint-disable max-len */
// generic database query function, takes SQL statement and parameters

import { Client } from 'pg';
import format from 'pg-format';
import config from '../lib/config';
import { ConnectionOptions } from '../types';

const logQuery = function (statement: string): void {
  const timeStamp: Date = new Date();
  const formattedTimeStamp: string = timeStamp.toString().substring(4, 24);
  console.log(formattedTimeStamp, statement);
};

let isProduction: boolean = config.NODE_ENV === 'production';
if (!config.NODE_ENV) isProduction = true;

let connectionString: string | undefined;

if (isProduction) {
  connectionString = config.DATABASE_URL;
} else {
  connectionString = config[`${config.NODE_ENV?.toUpperCase()}_DATABASE_URL`];
}

const CONNECTION: ConnectionOptions = {
  connectionString,
  ssl: connectionString?.includes('amazonaws')
    ? { rejectUnauthorized: false }
    : false,
};

export default async function (
  statement: string,
  ...parameters: Array<unknown>
) {
  const sql = format(statement, ...parameters);

  const client = new Client(CONNECTION);

  try {
    await client.connect();

    if (!!config.DEBUG) logQuery(sql);
    const result = await client.query(sql);
    return result;
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  } finally {
    await client.end();
  }
}
