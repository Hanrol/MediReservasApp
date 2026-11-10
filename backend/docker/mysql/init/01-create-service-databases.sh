#!/bin/sh
set -eu

escape_sql_string() {
  printf "%s" "$1" | sed "s/'/''/g"
}

create_service_user() {
  database="$1"
  username="$2"
  password_variable="$3"
  eval "password=\${$password_variable}"
  escaped_password=$(escape_sql_string "$password")

  mysql --protocol=socket -uroot -p"$MYSQL_ROOT_PASSWORD" <<SQL
CREATE DATABASE IF NOT EXISTS \`$database\` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE USER IF NOT EXISTS '$username'@'%' IDENTIFIED BY '$escaped_password';
ALTER USER '$username'@'%' IDENTIFIED BY '$escaped_password';
GRANT ALL PRIVILEGES ON \`$database\`.* TO '$username'@'%';
SQL
}

create_service_user auth_db auth_app AUTH_DB_PASSWORD
create_service_user users_db users_app USERS_DB_PASSWORD
create_service_user doctors_db doctors_app DOCTORS_DB_PASSWORD
create_service_user appointments_db appointments_app APPOINTMENTS_DB_PASSWORD
create_service_user medical_records_db medical_records_app MEDICAL_RECORDS_DB_PASSWORD
