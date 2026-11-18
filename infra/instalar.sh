#!/bin/bash
# Lo ejecuta UserData como root; no necesita contraseñas.
set -euo pipefail
cd -- "$(dirname -- "$0")"
[[ $EUID -eq 0 ]] || { echo "Ejecuta este script con sudo."; exit 1; }

dnf install -y docker nginx openssl nano
systemctl enable --now docker

# Versión fija y checksum del plugin Compose para Amazon Linux x86_64.
compose_url=https://github.com/docker/compose/releases/download/v2.32.4/docker-compose-linux-x86_64
binary=$(mktemp)
trap 'rm -f "$binary"' EXIT
curl -fsSL --retry 3 "$compose_url" -o "$binary"
checksum=$(curl -fsSL --retry 3 "$compose_url.sha256" | awk '{print $1}')
printf '%s  %s\n' "$checksum" "$binary" | sha256sum --check -
install -D -m 0755 "$binary" /usr/local/lib/docker/cli-plugins/docker-compose
docker compose version

# El ejemplo del clon recibe datos públicos; nunca se escribe un secreto aquí.
if [[ $# -eq 3 ]]; then
  sed -i \
    -e "s|^RDS_ENDPOINT=.*|RDS_ENDPOINT=$1|" \
    -e "s|^RDS_MASTER_USERNAME=.*|RDS_MASTER_USERNAME=$2|" \
    -e "s|^DUCKDNS_SUBDOMAIN=.*|DUCKDNS_SUBDOMAIN=$3|" .env.example
fi

install -d -m 0755 /usr/share/nginx/html/.well-known/acme-challenge
check_file=/usr/share/nginx/html/.well-known/acme-challenge/medireservas-check
cat /proc/sys/kernel/random/uuid > "$check_file"
chmod 0644 "$check_file"
nginx -t
systemctl enable --now nginx

cat > /etc/systemd/system/medireservas-duckdns.service <<EOF
[Unit]
Description=Actualizar IP de MediReservas en DuckDNS
Wants=network-online.target
After=network-online.target
[Service]
Type=oneshot
ExecStart=/bin/bash $PWD/actualizar-duckdns.sh
EOF

cat > /etc/systemd/system/medireservas-duckdns.timer <<'EOF'
[Unit]
Description=Actualizar DuckDNS al arrancar y cada cinco minutos
[Timer]
OnBootSec=1min
OnUnitActiveSec=5min
[Install]
WantedBy=timers.target
EOF

cat > /etc/systemd/system/medireservas-renovar.service <<EOF
[Unit]
Description=Renovar certificado HTTPS de MediReservas
Requires=docker.service
After=network-online.target docker.service
[Service]
Type=oneshot
ExecStart=/bin/bash $PWD/desplegar.sh --renovar
EOF

cat > /etc/systemd/system/medireservas-renovar.timer <<'EOF'
[Unit]
Description=Comprobar renovacion HTTPS dos veces al dia
[Timer]
OnCalendar=*-*-* 03,15:00:00
RandomizedDelaySec=1h
Persistent=true
[Install]
WantedBy=timers.target
EOF

systemctl daemon-reload
touch /var/lib/medireservas-instalado
echo "Instalación lista. Copia .env.example a .env, complétalo y ejecuta sudo bash desplegar.sh."
