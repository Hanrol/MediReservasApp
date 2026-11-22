# Despliegue en el servidor local

Esta guía corresponde al backend local MediReservas en `hanrol-server.duckdns.org`. No describe AWS: la configuración AWS se mantiene en la rama `cloud`, dentro de `infra/README.md`.

El sitio Hanrol Panel existente permanece en Nginx. Nginx recibe HTTPS y pasa `/api/v3/` al Gateway local; el Gateway solo escucha en `127.0.0.1:9013`.

## Requisitos

- Ubuntu con Docker Engine y Docker Compose v2.
- Nginx y HTTPS ya configurados para `hanrol-server.duckdns.org`.
- Las imágenes backend publicadas en Docker Hub bajo `benjamincubillosduoc`.

## 1. Preparar el backend y `.env`

Clona o actualiza el repositorio en `/opt/medireservas-app`. Desde su raíz, crea `.env` a partir de `.env.example` y reemplaza todos los valores de ejemplo:

```bash
sudo cp -n .env.example .env
sudo nano .env
sudo chmod 600 .env
```

`cp -n` evita sobrescribir un `.env` existente y sus secretos.

Configura contraseñas únicas para MySQL y sus bases, un `JWT_SECRET` aleatorio y las credenciales de la cuenta ADMIN inicial. `DOCKERHUB_USER` debe ser `benjamincubillosduoc`; para el primer despliegue, `IMAGE_TAG=latest` es válido. No compartas ni subas `.env`.

Las imágenes son públicas, por lo que Docker Hub no requiere login desde el servidor.

## 2. Descargar e iniciar servicios

Desde `/opt/medireservas-app`:

```bash
sudo docker compose --env-file .env -f compose.prod.yaml config --quiet
sudo docker compose --env-file .env -f compose.prod.yaml pull
sudo docker compose --env-file .env -f compose.prod.yaml up -d
sudo docker compose --env-file .env -f compose.prod.yaml ps
```

MySQL debe aparecer `healthy`; los servicios Java deben quedar `Up`. El Gateway se publica solo en `127.0.0.1:9013`; no abras ese puerto en UFW ni en el router. Los límites configurados para el stack suman aproximadamente 4,6 GiB como máximo; comprueba el consumo real con `docker stats`.

Comprobación local del Gateway:

```bash
curl -i http://127.0.0.1:9013/actuator/health
```

Si un servicio no inicia:

```bash
sudo docker compose --env-file .env -f compose.prod.yaml logs --tail=100
```

## 3. Compilar y copiar el frontend local

En el PC de desarrollo, desde `frontend/`, instala dependencias y genera el build **sin** `VITE_API_URL`. La app usará `/api/v3` en el mismo dominio:

```bash
npm ci
npm run build
```

En PowerShell, prepara el directorio final bajo la raíz Nginx existente:

```powershell
ssh -p 24400 hanrol@hanrol-server.duckdns.org "sudo mkdir -p /opt/hanrol-panel/frontend/dist/medireservas && sudo chown -R hanrol:hanrol /opt/hanrol-panel/frontend/dist/medireservas"
```

Desde `frontend/`, copia el contenido de `dist/`:

```powershell
scp -P 24400 -r .\dist\* hanrol@hanrol-server.duckdns.org:/opt/hanrol-panel/frontend/dist/medireservas/
```

Esta carpeta está separada de los archivos de Hanrol Panel. No reemplaces `/opt/hanrol-panel/frontend/dist/index.html` ni su contenido existente.

## 4. Añadir rutas a Nginx

Haz una copia de seguridad de `/etc/nginx/sites-available/hanrol-panel` y agrega las ubicaciones siguientes dentro del `server` HTTPS existente. Conserva sus ubicaciones `/`, `/api/` y `/resourcepacks/`.

```nginx
location ^~ /api/v3/ {
    proxy_pass http://127.0.0.1:9013;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location = /MediReservasApp {
    return 301 /MediReservasApp/;
}

location ^~ /MediReservasApp/ {
    alias /opt/hanrol-panel/frontend/dist/medireservas/;
    index index.html;
}
```

No agregues un `try_files` al bloque con `alias`: la app usa `HashRouter` y los assets estáticos se deben servir directamente. La ubicación `/api/v3/` es más específica que la `/api/` de Hanrol Panel, por lo que las rutas actuales de Uvicorn se conservan.

Valida y recarga:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 5. CORS y destinos frontend

El Gateway local debe permitir los dos orígenes de navegador usados por el proyecto:

```text
https://hanrol.github.io,https://hanrol-server.duckdns.org
```

La lista se configura en `CORS_ALLOWED_ORIGINS` de `compose.prod.yaml`; si se cambia, recrea el Gateway:

```bash
sudo docker compose --env-file .env -f compose.prod.yaml up -d --force-recreate gateway
```

GitHub Pages tiene su propio build y su `VITE_API_URL` se define en el workflow de la rama configurada. Las bases de datos del backend AWS y del backend local son independientes; no se debe alternar automáticamente entre ellos como si compartieran el mismo estado.

## 6. Verificación

- Frontend local: `https://hanrol-server.duckdns.org/MediReservasApp/`
- API local: `https://hanrol-server.duckdns.org/api/v3/`
- Health de Gateway desde el servidor: `http://127.0.0.1:9013/actuator/health`
- Verifica login y una operación API; comprueba la consola del navegador si aparece un error CORS.
- Observa memoria y estado con `docker stats` y `docker compose ... ps`.
