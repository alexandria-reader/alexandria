#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname=postgres <<-EOSQL
    CREATE DATABASE test;
EOSQL

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname=test -f /docker-entrypoint-initdb.d/01-schema.sql
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname=test -f /docker-entrypoint-initdb.d/02-seed.sql
