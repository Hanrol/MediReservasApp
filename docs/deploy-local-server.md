# Despliegue en el servidor local

Esta guía conserva el sitio Hanrol Panel existente. Nginx seguirá atendiendo HTTPS; el Gateway de MediReservas solo quedará publicado en `127.0.0.1:9013`.

## 1. Preparar el proyecto y las variables en el servidor

Clona o actualiza este repositorio en el servidor. En la raíz del repositorio:

```bash
cp .env.example .env
nano .env
```

Completa los valores reales directamente en el servidor. No subas `.env` al repositorio ni lo compartas. Como mínimo, cambia todas las contraseñas de ejemplo, establece un `JWT_SECRET` aleatorio de al menos 32 caracteres y configura los datos del administrador inicial. Conserva el usuario `benjamincubillosduoc` y, para empezar, puedes usar `IMAGE_TAG=latest`.

Las imágenes Docker Hub son públicas, así que el servidor no necesita iniciar sesión en Docker Hub.

## 2. Descargar y arrancar el backend

Desde la raíz del repositorio en el servidor:

```bash
docker compose -f compose.prod.yaml pull
docker compose -f compose.prod.yaml up -d
docker compose -f compose.prod.yaml ps
```

Para revisar los logs si algún servicio no queda activo:

```bash
docker compose -f compose.prod.yaml logs --tail=100
```

El límite configurado permite hasta aproximadamente 4.6 GiB sumando los contenedores del stack; los servicios Java limitan su heap al 60% del límite de cada contenedor. Comprueba el consumo real con `docker stats`. Para liberar memoria, detén GTNH antes de iniciar el backend.

## 3. Preparar el frontend local

En el PC de desarrollo, desde `frontend/`, genera un build local sin definir `VITE_API_URL`. Así el frontend usará `/api/v3` relativo al mismo dominio:

```bash
npm ci
npm run build
```

Copia el contenido de `frontend/dist/` al servidor, por ejemplo a `/opt/medireservas/frontend/dist/`. No reemplaces `/opt/hanrol-panel/frontend/dist/`.

El build de GitHub Pages es distinto: el workflow ya define `VITE_API_URL=https://hanrol-server.duckdns.org/api/v3`.

## 4. Añadir ubicaciones al server block HTTPS de Nginx

Añade estas ubicaciones dentro del `server` que escucha en 443 para `hanrol-server.duckdns.org`. Mantén sin cambios las ubicaciones existentes `/`, `/api/` y `/resourcepacks/`.

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
    alias /opt/medireservas/frontend/dist/;
    index index.html;
    try_files $uri $uri/ /MediReservasApp/index.html;
}
```

La ubicación `/api/v3/` es más específica que la `/api/` existente, por lo que Uvicorn en `127.0.0.1:5005` conserva su ruta actual. No abras el puerto 9013 en UFW ni en el router.

Valida y recarga Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 5. Comprobaciones

- Frontend local: `https://hanrol-server.duckdns.org/MediReservasApp/`
- Frontend GitHub Pages: `https://hanrol.github.io/MediReservasApp/`
- Health de Gateway (desde el servidor): `curl -i http://127.0.0.1:9013/actuator/health`
- Comprueba el inicio de sesión y una llamada API desde ambos frontends.
- Verifica consumo con `docker stats`; los límites son topes, no una promesa de consumo constante.
