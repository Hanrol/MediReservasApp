#!/bin/bash
set -euo pipefail
cd -- "$(dirname -- "$0")"
[[ $EUID -eq 0 ]] || { echo "Ejecuta este script con sudo."; exit 1; }
source .env

[[ "$DUCKDNS_SUBDOMAIN" =~ ^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$ ]] ||
  { echo "Subdominio DuckDNS inválido."; exit 1; }
[[ "$DUCKDNS_TOKEN" =~ ^[A-Za-z0-9-]+$ && "$DUCKDNS_TOKEN" != CAMBIAR ]] ||
  { echo "Completa DUCKDNS_TOKEN en .env."; exit 1; }

metadata=http://169.254.169.254/latest
token=$(curl -fsS --max-time 10 -X PUT \
  -H "X-aws-ec2-metadata-token-ttl-seconds: 60" "$metadata/api/token")
ip=$(curl -fsS --max-time 10 \
  -H "X-aws-ec2-metadata-token: $token" "$metadata/meta-data/public-ipv4")

# Se pasa el token por stdin, no por argumentos visibles en la lista de procesos.
response=$(curl -fsS --max-time 30 --retry 3 --get --config - <<EOF
url = "https://www.duckdns.org/update"
data-urlencode = "domains=$DUCKDNS_SUBDOMAIN"
data-urlencode = "token=$DUCKDNS_TOKEN"
data-urlencode = "ip=$ip"
EOF
)
[[ "$response" == OK ]] || { echo "DuckDNS rechazó la actualización."; exit 1; }
echo "$DUCKDNS_SUBDOMAIN.duckdns.org actualizado a $ip."
