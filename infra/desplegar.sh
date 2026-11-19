#!/bin/bash
set -euo pipefail
cd -- "$(dirname -- "$0")"
echo "[0/5] Validando configuración..."
[[ $EUID -eq 0 ]] || { echo "Ejecuta este script con sudo."; exit 1; }
[[ -f .env ]] || { echo "Copia .env.example a .env y complétalo."; exit 1; }
grep -q '=CAMBIAR' .env && { echo "Completa los valores CAMBIAR de .env."; exit 1; }
chmod 600 .env
source .env

# El servicio auth usa HS256: la clave necesita 32 bytes o más.
[[ -n "${JWT_SECRET:-}" && ${#JWT_SECRET} -ge 32 ]] ||
  { echo "JWT_SECRET debe tener al menos 32 caracteres."; exit 1; }

compose=(docker compose --env-file "$PWD/.env" -f "$PWD/compose.aws.yaml")

echo "[1/5] Preparando bases y usuarios en RDS..."
bash preparar-rds.sh
echo "[2/5] Descargando imágenes Docker. La primera descarga puede tardar varios minutos..."
"${compose[@]}" pull
echo "[3/5] Actualizando DuckDNS..."
bash actualizar-duckdns.sh
domain="$DUCKDNS_SUBDOMAIN.duckdns.org"

# Esperar a que DuckDNS apunte a esta EC2 antes de pedir el certificado.
echo "[4/5] Verificando el dominio antes de configurar HTTPS..."
systemctl enable --now nginx
install -d -m 0755 /usr/share/nginx/html/.well-known/acme-challenge
echo ok > /usr/share/nginx/html/.well-known/acme-challenge/check
for attempt in {1..60}; do
  [[ "$(curl -fsS --max-time 10 "http://$domain/.well-known/acme-challenge/check" 2>/dev/null || true)" == ok ]] && break
  # Informar cada 30 segundos sin mostrar errores transitorios de curl.
  if (( attempt % 6 == 0 )); then
    echo "[HTTPS] Aún esperando respuesta del dominio (intento $attempt/60)..."
  fi
  sleep 5
done
[[ "$(curl -fsS --max-time 10 "http://$domain/.well-known/acme-challenge/check" 2>/dev/null || true)" == ok ]] ||
  { echo "[ERROR] DuckDNS no apunta a esta EC2; revisa el token y el puerto 80."; exit 1; }

echo "[HTTPS] Dominio verificado. Solicitando o comprobando el certificado..."
docker run --rm --memory 256m \
  -v /etc/letsencrypt:/etc/letsencrypt \
  -v /var/lib/letsencrypt:/var/lib/letsencrypt \
  -v /usr/share/nginx/html:/usr/share/nginx/html \
  certbot/certbot:latest certonly --webroot -w /usr/share/nginx/html \
  --domain "$domain" --cert-name "$domain" --email "$LETSENCRYPT_EMAIL" \
  --agree-tos --non-interactive --keep-until-expiring

echo "[HTTPS] Certificado listo. Configurando Nginx..."
sed "s|__DOMAIN__|$domain|g" nginx.conf > /etc/nginx/conf.d/medireservas.conf
nginx -t
systemctl reload nginx

echo "[5/5] Iniciando servicios..."
"${compose[@]}" up -d

echo "[API] Esperando respuesta del Gateway y los servicios backend..."
for attempt in {1..60}; do
  if curl -fsS --max-time 10 http://127.0.0.1:9013/api/v3/specialties/public/active >/dev/null 2>&1; then
    echo "[OK] API operativa: https://$domain/api/v3"
    exit 0
  fi
  # Informar cada minuto y ocultar resets/503 mientras los servicios arrancan.
  if (( attempt % 6 == 0 )); then
    echo "[API] Los servicios siguen iniciando (intento $attempt/60)..."
  fi
  sleep 10
done
"${compose[@]}" ps
echo "[ERROR] La API no respondió tras 60 intentos. Revisa los logs con:"
echo "  sudo docker compose --env-file .env -f compose.aws.yaml logs --tail=100 eureka gateway doctors"
exit 1
