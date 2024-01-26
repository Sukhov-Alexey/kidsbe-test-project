#!/bin/bash
set -e
set -u

function create_user_and_database() {
	local database=$1
	echo "  Creating user and database '$database'"
	psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
	    CREATE USER $database;
	    CREATE DATABASE $database;
	    GRANT ALL PRIVILEGES ON DATABASE $database TO $database;
EOSQL
	psql -U $POSTGRES_USER -d $database -f $2
}

create_user_and_database "kidsbe_users" "/docker-entrypoint-initdb.d/sql/auth.sql"
create_user_and_database "kidsbe_admins" "/docker-entrypoint-initdb.d/sql/auth.sql"
create_user_and_database "kidsbe_articles" "/docker-entrypoint-initdb.d/sql/articles.sql"