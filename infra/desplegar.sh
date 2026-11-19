#!/bin/bash
set -euo pipefail
cd -- "$(dirname -- "$0")"
[[ $EUID -eq 0 ]] || { echo "Ejecuta este script con sudo."; exit 1; }
[[ -f .env ]] || { echo "Copia .env.example a .env y complétalo."; exit 1; }
grep -q '=CAMBIAR' .env && { echo "Completa los valores CAMBIAR de .env."; exit 1; }
chmod 600 .env
source .env

# El servicio auth usa HS256: la clave necesita 32 bytes o más.
[[ -n "${JWT_SECRET:-}" && ${#JWT_SECRET} -ge 32 ]] ||
  { echo "JWT_SECRET debe tener al menos 32 caracteres."; exit 1; }

compose=(docker compose --env-file "$PWD/.env" -f "$PWD/compose.aws.yaml")

bash preparar-rds.sh
"${compose[@]}" pull
bash actualizar-duckdns.sh
domain="$DUCKDNS_SUBDOMAIN.duckdns.org"

# Esperar a que DuckDNS apunte a esta EC2 antes de pedir el certificado.
systemctl enable --now nginx
install -d -m 0755 /usr/share/nginx/html/.well-known/acme-challenge
echo ok > /usr/share/nginx/html/.well-known/acme-challenge/check
for attempt in {1..60}; do
  [[ "$(curl -fsS --max-time 10 "http://$domain/.well-known/acme-challenge/check" || true)" == ok ]] && break
  sleep 5
done
[[ "$(curl -fsS --max-time 10 "http://$domain/.well-known/acme-challenge/check" || true)" == ok ]] ||
  { echo "DuckDNS no apunta a esta EC2; revisa el token y el puerto 80."; exit 1; }

docker run --rm --memory 256m \
  -v /etc/letsencrypt:/etc/letsencrypt \
  -v /var/lib/letsencrypt:/var/lib/letsencrypt \
  -v /usr/share/nginx/html:/usr/share/nginx/html \
  certbot/certbot:latest certonly --webroot -w /usr/share/nginx/html \
  --domain "$domain" --cert-name "$domain" --email "$LETSENCRYPT_EMAIL" \
  --agree-tos --non-interactive --keep-until-expiring

sed "s|__DOMAIN__|$domain|g" nginx.conf > /etc/nginx/conf.d/medireservas.conf
nginx -t
systemctl reload nginx

"${compose[@]}" up -d

for attempt in {1..60}; do
  if curl -fsS --max-time 10 http://127.0.0.1:9013/api/v3/specialties/public/active >/dev/null; then
    echo "API disponible en https://$domain/api/v3"
    exit 0
  fi
  sleep 10
done
"${compose[@]}" ps
echo "La API no respondió a tiempo. Revisa docker compose logs."
exit 1
