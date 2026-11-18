#!/bin/bash
set -euo pipefail
cd -- "$(dirname -- "$0")"
[[ $EUID -eq 0 ]] || { echo "Ejecuta este script con sudo."; exit 1; }
source .env
umask 077

# Solo se aceptan contraseñas hexadecimales para construir el SQL sin ambigüedad.
for name in AUTH_DB_PASSWORD USERS_DB_PASSWORD DOCTORS_DB_PASSWORD APPOINTMENTS_DB_PASSWORD MEDICAL_RECORDS_DB_PASSWORD; do
  [[ "${!name:-}" =~ ^[A-Fa-f0-9]{32,64}$ ]] ||
    { echo "Genera $name con openssl rand -hex 24."; exit 1; }
done
[[ "$RDS_MASTER_PASSWORD" =~ ^[A-Za-z0-9]{16,41}$ ]] ||
  { echo "RDS_MASTER_PASSWORD debe coincidir con la contraseña del stack."; exit 1; }

client_file=$(mktemp)
trap 'rm -f "$client_file"' EXIT
cat > "$client_file" <<EOF
[client]
host=$RDS_ENDPOINT
user=$RDS_MASTER_USERNAME
password=$RDS_MASTER_PASSWORD
ssl-mode=REQUIRED
connect-timeout=5
EOF

# Imagen auxiliar como cliente temporal; no se inicia un servidor MySQL local.
mysql_client() {
  docker run --rm -i --network host --memory 128m \
    -v "$client_file:/client.cnf:ro" \
    mysql:8.0 mysql --defaults-extra-file=/client.cnf "$@"
}
docker pull mysql:8.0
ready=false
for attempt in {1..30}; do
  if mysql_client --execute="SELECT 1" >/dev/null 2>&1; then
    ready=true
    break
  fi
  sleep 5
done
[[ "$ready" == true ]] || { echo "RDS no responde; revisa credenciales, endpoint y SG."; exit 1; }

service_sql() {
  local name=$1 password=$2
  cat <<EOF
CREATE DATABASE IF NOT EXISTS ${name}_db CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE USER IF NOT EXISTS '${name}_app'@'%' IDENTIFIED BY '$password';
ALTER USER '${name}_app'@'%' IDENTIFIED BY '$password';
GRANT ALL PRIVILEGES ON ${name}_db.* TO '${name}_app'@'%';
EOF
}
{
  service_sql auth "$AUTH_DB_PASSWORD"
  service_sql users "$USERS_DB_PASSWORD"
  service_sql doctors "$DOCTORS_DB_PASSWORD"
  service_sql appointments "$APPOINTMENTS_DB_PASSWORD"
  service_sql medical_records "$MEDICAL_RECORDS_DB_PASSWORD"
} | mysql_client --batch
echo "Bases y usuarios preparados. Flyway creará las tablas al iniciar los servicios."
