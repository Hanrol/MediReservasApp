#!/bin/bash
# Lo ejecuta UserData como root; no necesita contraseñas.
set -euo pipefail
cd -- "$(dirname -- "$0")"

dnf install -y docker nginx openssl nano
systemctl enable --now docker nginx

# Plugin de Docker Compose para Amazon Linux x86_64.
install -d /usr/local/lib/docker/cli-plugins
curl -fsSL --retry 3 \
  https://github.com/docker/compose/releases/download/v2.32.4/docker-compose-linux-x86_64 \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod 0755 /usr/local/lib/docker/cli-plugins/docker-compose
docker compose version

# El ejemplo recibe solo datos públicos de CloudFormation.
sed -i \
  -e "s|^RDS_ENDPOINT=.*|RDS_ENDPOINT=$1|" \
  -e "s|^RDS_MASTER_USERNAME=.*|RDS_MASTER_USERNAME=$2|" \
  -e "s|^DUCKDNS_SUBDOMAIN=.*|DUCKDNS_SUBDOMAIN=$3|" .env.example

touch /var/lib/medireservas-instalado
echo "Instalación lista. Copia .env.example a .env, complétalo y ejecuta sudo bash desplegar.sh."
