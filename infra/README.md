# Guía paso a paso: desplegar MediReservas en AWS

## Qué se va a desplegar

- **EC2:** un servidor con Docker para los siete servicios backend y Nginx.
- **RDS:** MySQL privado; no se instala un servidor MySQL permanente en EC2.
- **GitHub Pages:** sigue sirviendo el frontend. Este llama a
  `https://crispardos.duckdns.org/api/v3`.

No se compila Java en AWS: la EC2 descarga las imágenes públicas de Docker Hub.

## Qué hace cada archivo

| Archivo | Para qué sirve |
|---|---|
| `template.yaml` | CloudFormation crea la EC2, RDS y los Security Groups. Su `UserData` clona `cloud` y ejecuta `instalar.sh`. |
| `instalar.sh` | Lo ejecuta automáticamente `UserData`: instala Docker, Nginx y Compose. No lo ejecutes tú. |
| `.env.example` | Plantilla de configuración. Tiene `CAMBIAR`, nunca pongas aquí las claves reales. |
| `desplegar.sh` | El único comando de despliegue que ejecutarás manualmente después de completar `.env`. |
| `preparar-rds.sh` | Lo llama `desplegar.sh` para crear las cinco bases y sus usuarios en RDS. |
| `actualizar-duckdns.sh` | Lo llama `desplegar.sh` y luego un timer para actualizar la IP de `crispardos.duckdns.org`. |
| `compose.aws.yaml` | Define los siete servicios y sus conexiones a RDS. |
| `nginx.conf` | Nginx lo usa para recibir HTTPS y reenviar `/api/v3` al Gateway. |
| `README.md` | Esta guía. |

## Antes de empezar

1. Inicia el **AWS Academy Learner Lab** y usa la región **US East (N. Virginia), `us-east-1`**.
2. Publica estos archivos en la rama `cloud` **antes de crear la pila**. En
   PowerShell o Git Bash, desde la raíz del repo:

   ```bash
   git switch cloud
   git status
   git add infra
   git commit -m "Add AWS deployment files"
   git push origin cloud
   ```

   `git add infra` agrega solo esta carpeta, no tus cambios de frontend ni otros
   archivos. Revisa `git status` antes del commit. La EC2 descargará los scripts
   desde GitHub; si no haces el `push`, no podrá encontrarlos.
3. Ten una **Key Pair de EC2**. Si no tienes una, créala desde EC2 → Key Pairs y guarda el archivo `.pem`.
4. Averigua tu IP pública. En CloudFormation la ingresarás como `tu.ip.publica/32`; por ejemplo `203.0.113.25/32`. Esto limita SSH a tu computador.
5. Genera una contraseña para RDS en Git Bash o WSL y guárdala temporalmente:

   ```bash
   openssl rand -hex 20
   ```

   Es una clave de 40 caracteres. La ingresarás al crear la pila y luego copiarás
   **el mismo valor** al `.env` de la EC2. No la pegues en Git ni en un chat.

## Paso 1: crear EC2 y RDS con CloudFormation

1. En AWS Console, abre **CloudFormation → Stacks → Create stack → With new resources**.
2. Selecciona **Upload a template file** y carga `infra/template.yaml` desde tu computador.
3. Ponle un nombre al stack, por ejemplo `medireservas-cloud`.
4. Completa los parámetros:

   | Parámetro | Qué seleccionar o escribir |
   |---|---|
   | `VpcId` | La VPC por defecto del Learner Lab. |
   | `PublicSubnetId` | Una subred pública de esa misma VPC para la EC2. |
   | `RdsSubnetIds` | Al menos dos subredes de esa VPC, en zonas distintas. Si la consola muestra una caja de texto, separa los IDs con comas. |
   | `KeyPairName` | La Key Pair que ya creaste. |
   | `AllowedSshCidr` | Tu IP pública seguida de `/32`. |
   | `InstanceType` | Deja `t3.medium`, si está permitido por el lab. |
   | `DbInstanceClass` | Deja `db.t3.micro`, si está permitido por el lab. |
   | `DbMasterUsername` | Deja `medires_admin`. |
   | `DbMasterPassword` | Pega la contraseña que generaste en el paso anterior. |
   | `DuckDnsSubdomain` | Deja `crispardos` (sin `.duckdns.org`). |
   | `AmiId` | Deja el valor predeterminado: Amazon Linux 2023 x86_64. |

   Para encontrar las subredes: abre **VPC → Subnets** y filtra por el `VpcId`
   seleccionado. La subred de EC2 debe tener ruta a Internet Gateway; para RDS
   escoge dos de la misma VPC en zonas distintas.

   En una VPC por defecto, las subredes de RDS pueden ser subredes “públicas” de
   la VPC: RDS igualmente se crea con **Publicly accessible = No** y su
   Security Group solo permite conexiones desde la EC2.

5. Avanza por las pantallas y crea el stack. Espera a que el estado sea
   **`CREATE_COMPLETE`**. Si falla, abre la pestaña **Events** y lee el primer
   evento `CREATE_FAILED`.
6. En **Outputs**, guarda `PublicIp`, `DatabaseEndpoint` y `SshCommand`.
   Mantén guardada la contraseña maestra RDS.

### Puertos que abre la plantilla

- `22` (SSH): solo tu IP `/32`.
- `80` y `443`: públicos para DuckDNS, HTTPS y el frontend.
- `3306` (MySQL): solo desde el Security Group de la EC2 a RDS.
- `9013` (Gateway): solo local dentro de la EC2; **no lo abras** en AWS.

## Paso 2: esperar a que la instalación automática termine

Al crear la EC2, `UserData` instala Git, clona la rama `cloud` en
`/opt/medireservas` y ejecuta `instalar.sh`. Tú no tienes que escribir esos
comandos.

Conéctate desde PowerShell usando `SshCommand` de CloudFormation; sustituye la
ruta de la llave por la ubicación real del `.pem`:

```powershell
ssh -i C:\ruta\tu-llave.pem ec2-user@IP_PUBLICA
```

Ya dentro de EC2, espera a que termine el script:

```bash
sudo cloud-init status --wait
```

`cloud-init` es el programa de Amazon Linux que ejecuta `UserData`. Luego
comprueba el marcador:

```bash
sudo test -f /var/lib/medireservas-instalado && echo "Instalación lista"
```

Ese archivo lo crea `instalar.sh` con `touch` al terminar. **Es solo una marca
de que Docker/Nginx se instalaron; no significa que la aplicación ya esté
desplegada.**

Si no aparece “Instalación lista”, mira el error:

```bash
sudo tail -n 100 /var/log/cloud-init-output.log
```

## Paso 3: preparar `.env` con las claves privadas

En la sesión SSH, ve a la carpeta que descargó `UserData`:

```bash
cd /opt/medireservas/infra
```

Haz una copia privada del ejemplo:

```bash
sudo cp .env.example .env
sudo chmod 600 .env
sudo nano .env
```

`.env.example` contiene ejemplos y placeholders; `.env` contendrá tus valores
reales. El archivo `.env` está ignorado por Git. En `nano`, guarda con
**Ctrl+O**, Enter, y sal con **Ctrl+X**.

El instalador ya habrá rellenado estos tres valores en `.env.example`:

- `RDS_ENDPOINT`: endpoint privado de RDS.
- `RDS_MASTER_USERNAME`: usuario maestro de RDS.
- `DUCKDNS_SUBDOMAIN`: `crispardos`.

No los cambies. Completa las líneas `CAMBIAR`:

| Variable | Qué valor poner |
|---|---|
| `RDS_MASTER_PASSWORD` | La misma contraseña que ingresaste en CloudFormation. |
| `DUCKDNS_TOKEN` | Tu token privado de DuckDNS. No lo envíes ni lo subas a Git. |
| `LETSENCRYPT_EMAIL` | Un correo tuyo para el certificado HTTPS. |
| `AUTH_DB_PASSWORD`, `USERS_DB_PASSWORD`, `DOCTORS_DB_PASSWORD`, `APPOINTMENTS_DB_PASSWORD`, `MEDICAL_RECORDS_DB_PASSWORD` | Genera una clave distinta para cada una con `openssl rand -hex 24`. |
| `MASTER_ADMIN_PASSWORD` | Genera otra clave con `openssl rand -hex 24`. |
| `JWT_SECRET` | Genera una clave con `openssl rand -hex 32`. |

Puedes generar claves desde la EC2: escribe `openssl rand -hex 24` en la
terminal, copia su resultado y pégalo en una línea de `.env`; repítelo para
cada variable. El token DuckDNS solo lo usa el script del host, no los
contenedores.

Deja `DOCKERHUB_USER=benjamincubillosduoc` e `IMAGE_TAG=latest`. Conserva
`CORS_ALLOWED_ORIGINS=https://hanrol.github.io`: es el origen de GitHub Pages,
no la URL de la API. `MASTER_ADMIN_EMAIL` y `MASTER_ADMIN_RUN` son los datos de
prueba del administrador inicial; cámbialos solo por datos de prueba propios.

## Paso 4: desplegar la aplicación

Desde `/opt/medireservas/infra`, ejecuta **este único comando**:

```bash
sudo bash desplegar.sh
```

El script hace automáticamente lo siguiente:

1. Comprueba que completaste `.env`.
2. `preparar-rds.sh` crea las cinco bases y usuarios en RDS. No crea tablas:
   Flyway las crea cuando arrancan los servicios.
3. Descarga de Docker Hub las siete imágenes públicas. **No compila Java y no
   requiere `docker login`.**
4. `actualizar-duckdns.sh` asocia `crispardos.duckdns.org` con la IP pública
   actual de EC2.
5. Verifica que el dominio llegue a esta EC2, obtiene el certificado y activa
   Nginx con HTTPS.
6. Arranca Compose y espera una respuesta del Gateway.

Al terminar, la API debería estar disponible en:

```text
https://crispardos.duckdns.org/api/v3
```

## Paso 5: comprobar que funciona

En la EC2 puedes revisar los contenedores y sus logs:

```bash
sudo docker compose --env-file .env -f compose.aws.yaml ps
sudo docker compose --env-file .env -f compose.aws.yaml logs --tail=100
sudo systemctl list-timers 'medireservas-*'
```

Desde PowerShell en tu computador, comprueba la API:

```powershell
curl.exe -i https://crispardos.duckdns.org/api/v3/specialties/public/active
```

Después prueba el login desde GitHub Pages. El workflow de Pages publica desde
`main`, no desde `cloud`: para que el frontend use la URL nueva, los cambios de
`.github/workflows/frontend-ci.yml` deben llegar a `main` (por ejemplo, mediante
un Pull Request). El `git add infra` anterior no incluye ese workflow.

## Si algo falla

- **No aparece “Instalación lista”:** ejecuta
  `sudo tail -n 100 /var/log/cloud-init-output.log`.
- **El despliegue indica que DuckDNS no apunta a EC2:** revisa el subdominio y
  token en `.env`, y confirma que el SG permite puerto 80.
- **RDS no responde:** comprueba que el endpoint y la contraseña en `.env`
  coincidan con CloudFormation y que EC2 y RDS estén en la misma VPC.
- **Un contenedor no inicia:** revisa `docker compose logs --tail=100`.
- **La web funciona pero el navegador informa un error CORS:** confirma que
  `CORS_ALLOWED_ORIGINS` sea el origen de Pages, normalmente
  `https://hanrol.github.io`.

`CREATE_COMPLETE` solo significa que CloudFormation creó los recursos; no
garantiza que `UserData` haya terminado. Si reinicias EC2, `UserData` no vuelve
a ejecutarse: Docker y Nginx arrancan como servicios y DuckDNS se actualiza
cada cinco minutos.

## Costo y eliminación

El stack usa EC2 `t3.medium`, RDS `db.t3.micro`, y discos `gp2` de 20 GB. El lab
puede cobrar por recursos activos. Antes de eliminar el stack, exporta o guarda
un snapshot de RDS si necesitas conservar los datos: al borrarlo, la plantilla
elimina la base sin snapshot final.
