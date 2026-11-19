#!/bin/bash
set -euo pipefail
cd -- "$(dirname -- "$0")"
source .env
umask 077

# Las claves se insertan en SQL: sin longitud mínima, pero sin comillas ni espacios.
for name in AUTH_DB_PASSWORD USERS_DB_PASSWORD DOCTORS_DB_PASSWORD \
            APPOINTMENTS_DB_PASSWORD MEDICAL_RECORDS_DB_PASSWORD; do
  [[ "${!name:-}" =~ ^[A-Za-z0-9_]+$ ]] ||
    { echo "$name: usa solo letras, números o _."; exit 1; }
done

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

# Cliente temporal; no se instala un servidor MySQL en la EC2.
mysql_client() {
  docker run --rm -i --network host --memory 128m \
    -v "$client_file:/client.cnf:ro" \
    mysql:8.0 mysql --defaults-extra-file=/client.cnf "$@"
}

echo "[RDS] Comprobando el cliente MySQL y el acceso a RDS. La primera vez puede descargarse mysql:8.0..."
for attempt in {1..30}; do
  mysql_client --execute="SELECT 1" >/dev/null 2>&1 && break
  # Informar cada 30 segundos sin mostrar errores transitorios del cliente.
  if (( attempt % 6 == 0 )); then
    echo "[RDS] Aún esperando acceso (intento $attempt/30)..."
  fi
  sleep 5
done
mysql_client --execute="SELECT 1" >/dev/null 2>&1 ||
  { echo "[ERROR] No se pudo verificar RDS. Revisa endpoint, usuario/contraseña y que Docker pueda descargar mysql:8.0."; exit 1; }

echo "[RDS] Conexión verificada. Creando bases de datos y usuarios..."
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
echo "[RDS] Bases y usuarios preparados. Flyway creará las tablas al iniciar los servicios."
