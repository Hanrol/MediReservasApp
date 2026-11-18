# AWS: EC2 + RDS

El frontend sigue en GitHub Pages. Una EC2 ejecuta Nginx y siete imágenes
públicas de Docker Hub; RDS aloja MySQL. No se compila Java en EC2.

| Archivo | Función |
|---|---|
| `template.yaml` | Crea EC2, RDS privado y SG; `UserData` clona `cloud` y llama a `instalar.sh`. |
| `compose.aws.yaml` | Ejecuta el backend, sin MySQL local, conectado a RDS. |
| `instalar.sh` | Instala Docker, Compose y Nginx; prepara las tareas periódicas. |
| `desplegar.sh` | Tras completar `.env`, coordina RDS, imágenes, DNS y HTTPS. |
| `preparar-rds.sh` | Crea bases y usuarios; Flyway crea las tablas al arrancar. |
| `actualizar-duckdns.sh` | Asocia el dominio con la IP pública actual de EC2. |
| `nginx.conf` | Plantilla HTTPS que reenvía `/api/v3/` al Gateway local. |
| `.env.example` | Variables de ejemplo; nunca guardar aquí los secretos reales. |

## Desplegar

1. **Publica primero estos archivos en la rama `cloud` del repo público.**
2. En CloudFormation, carga `infra/template.yaml`. Selecciona una VPC existente,
   una subred pública para EC2 y al menos dos subredes de esa misma VPC en
   distintas zonas para RDS. Usa tu IPv4 `/32` para SSH y una Key Pair existente.
   Guarda `DbMasterPassword` (puedes generar con `openssl rand -hex 20`).
   Se oculta con `NoEcho` y no se introduce en `UserData`.
3. Espera los recursos y entra por SSH con el comando de **Outputs**. Comprueba
   que terminó `UserData`:

   ```bash
   sudo cloud-init status --wait
   sudo test -f /var/lib/medireservas-instalado && echo "Instalación lista"
   cd /opt/medireservas/infra
   ```

4. Configura los secretos solo en la EC2:

   ```bash
   sudo cp .env.example .env
   sudo chmod 600 .env
   sudo nano .env
   ```

   El ejemplo ya contiene el endpoint/usuario RDS y subdominio de la pila.
   Completa `CAMBIAR`: contraseña maestra de RDS, token DuckDNS, correo
   Let's Encrypt y contraseñas. Genera **cada contraseña de servicio** con
   `openssl rand -hex 24` y `JWT_SECRET` con `openssl rand -hex 32`.
   No subas `.env` a Git (ya está ignorado).

5. Ejecuta:

   ```bash
   sudo bash desplegar.sh
   ```

6. Prueba `https://crispardos.duckdns.org/api/v3/specialties/public/active` y el
   login desde Pages. El frontend debe compilar con
   `VITE_API_URL=https://crispardos.duckdns.org/api/v3`.
   Pages actualmente publica desde `main`, no desde `cloud`.

## Comprobar o actualizar

Desde `/opt/medireservas/infra`:

```bash
sudo docker compose --env-file .env -f compose.aws.yaml ps
sudo docker compose --env-file .env -f compose.aws.yaml logs --tail=100
sudo systemctl list-timers 'medireservas-*'
```

Para actualizar imágenes, cambia `IMAGE_TAG` si procede y usa `pull` y `up -d`
con los mismos argumentos de Compose. GitHub Actions publica las imágenes,
pero no actualiza esta EC2 automáticamente.

**Notas:** pensado para AL2023 x86_64 y el lab en `us-east-1` (`t3.medium`,
discos `gp2`). Los límites Java se reducen para 4 GiB: comprueba `docker stats`.
El puerto 80 permite ACME, 443 la API; RDS solo acepta 3306 desde el SG de EC2.
`CREATE_COMPLETE` no garantiza que `UserData` haya terminado: revisa
`/var/log/cloud-init-output.log`. `UserData` no se repite al reiniciar;
Docker/Nginx arrancan automáticamente, DuckDNS se actualiza cada cinco minutos
y el certificado se comprueba dos veces al día tras el primer despliegue.
**Eliminar/reemplazar RDS en la pila borra sus datos sin snapshot final.**
