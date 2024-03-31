#!/bin/bash
123
set -e;
if [ -n "${DB_USERNAME:-}" ] && [ -n "${DB_PASSWORD:-}" ]; then
	psql -v ON_ERROR_STOP=1 --username "$DB_USERNAME"  <<-EOSQL
		CREATE DATABASE ${DB_DATABASE};
		GRANT ALL PRIVILEGES ON DATABASE ${DB_DATABASE} TO ${DB_USERNAME};
	EOSQL
else
	echo "SETUP INFO: No Environment variables given!"
fi
