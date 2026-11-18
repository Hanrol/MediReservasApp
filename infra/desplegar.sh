#!/bin/bash
set -euo pipefail
cd -- "$(dirname -- "$0")"
[[ $EUID -eq 0 ]] || { echo "Ejecuta este script con sudo."; exit 1; }
[[ -f .env ]] || { echo "Copia .env.example a .env y completa sus valores."; exit 1; }
chown root:root .env
chmod 600 .env
source .env

certbot() {
  docker run --rm --memory 256m \
    -v /etc/letsencrypt:/etc/letsencrypt \
    -v /var/lib/letsencrypt:/var/lib/letsencrypt \
    -v /usr/share/nginx/html:/usr/share/nginx/html \
    certbot/certbot:latest "$@"
}
if [[ "${1:-}" == --renovar ]]; then
  certbot renew --quiet
  nginx -t
  systemctl reload nginx
  exit 0
fi

for name in RDS_ENDPOINT RDS_MASTER_USERNAME RDS_MASTER_PASSWORD DUCKDNS_SUBDOMAIN DUCKDNS_TOKEN LETSENCRYPT_EMAIL AUTH_DB_PASSWORD USERS_DB_PASSWORD DOCTORS_DB_PASSWORD APPOINTMENTS_DB_PASSWORD MEDICAL_RECORDS_DB_PASSWORD MASTER_ADMIN_PASSWORD JWT_SECRET MASTER_ADMIN_EMAIL MASTER_ADMIN_RUN DOCKERHUB_USER IMAGE_TAG CORS_ALLOWED_ORIGINS; do
  case "${!name:-}" in
    ""|CAMBIAR*) echo "Completa $name en .env."; exit 1 ;;
  esac
done
[[ ${#JWT_SECRET} -ge 32 ]] || { echo "JWT_SECRET debe tener al menos 32 caracteres."; exit 1; }
compose=(docker compose --env-file "$PWD/.env" -f "$PWD/compose.aws.yaml")
"${compose[@]}" config --quiet

bash preparar-rds.sh
"${compose[@]}" pull
bash actualizar-duckdns.sh
domain="$DUCKDNS_SUBDOMAIN.duckdns.org"

# Esperar DNS antes de pedir el certificado para no agotar intentos de ACME.
dns_ready=false
for attempt in {1..60}; do
  response=$(curl -fsS --max-time 10 "http://$domain/.well-known/acme-challenge/medireservas-check") || response=""
  if [[ "$response" == "$(cat /usr/share/nginx/html/.well-known/acme-challenge/medireservas-check)" ]]; then
    dns_ready=true
    break
  fi
  sleep 10
done
[[ "$dns_ready" == true ]] || { echo "Revisa DNS y puerto 80; luego repite el despliegue."; exit 1; }

certbot certonly --webroot -w /usr/share/nginx/html \
  --domain "$domain" --cert-name "$domain" --email "$LETSENCRYPT_EMAIL" \
  --agree-tos --non-interactive --keep-until-expiring
sed "s|__DOMAIN__|$domain|g" nginx.conf > /etc/nginx/conf.d/medireservas.conf
nginx -t
systemctl reload nginx

"${compose[@]}" up -d
systemctl enable --now medireservas-duckdns.timer medireservas-renovar.timer
for attempt in {1..60}; do
  if curl -fsS --max-time 10 http://127.0.0.1:9013/api/v3/specialties/public/active >/dev/null; then
    echo "API disponible en https://$domain/api/v3. Comprueba también el login desde Pages."
    exit 0
  fi
  sleep 10
done
"${compose[@]}" ps
echo "La API no respondió a tiempo. Revisa docker compose logs."
exit 1
