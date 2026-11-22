# Backend de MediReservasApp

Backend Java 21 organizado en microservicios Spring Boot. Cada servicio de dominio mantiene su lógica y sus modelos; el Gateway enruta las solicitudes REST y aplica autenticación/autorización. Eureka permite descubrir los servicios y MySQL contiene bases lógicas separadas por dominio.

## Servicios activos

| Módulo | Puerto al ejecutarlo en el host | Base lógica | Responsabilidad |
| --- | ---: | --- | --- |
| `auth` | 9001 | `auth_db` | Login, usuarios de autenticación, roles y JWT |
| `users` | 9002 | `users_db` | Usuarios y perfiles |
| `doctors` | 9003 | `doctors_db` | Médicos y especialidades |
| `appointments` | 9006 | `appointments_db` | Citas, horarios, bloques y ausencias |
| `medical-records` | 9008 | `medical_records_db` | Fichas, visitas, diagnósticos y signos vitales |
| `eureka` | 8761 | — | Registro y descubrimiento de servicios |
| `gateway` | 9013 | — | Entrada REST, enrutamiento y autorización |

El Compose local inicia una instancia MySQL con las cinco bases lógicas. No hay microservicios activos independientes para especialidades, pagos, recetas, notificaciones o reportes en la configuración actual.

## Requisitos

- Java 21
- Maven
- Docker Compose v2

## Ejecutar todo con Docker Compose

Desde la raíz del repositorio:

```bash
if [ ! -f .env ]; then cp .env.example .env; fi
docker compose up --build -d
docker compose ps
```

En PowerShell, crea `.env` solo si aún no existe: `if (-not (Test-Path .env)) { Copy-Item .env.example .env }`. No sobrescribas un `.env` existente. Los valores del ejemplo son para desarrollo; utiliza secretos propios en cualquier entorno compartido y no subas `.env`.

El Compose local publica MySQL en el puerto `3311`, Eureka en `8761` y Gateway en `9013`. Los puertos de los servicios de dominio permanecen internos a la red Docker.

Para detener los contenedores sin borrar el volumen de datos:

```bash
docker compose down
```

No uses `docker compose down -v` salvo que quieras eliminar también los datos de MySQL.

## Ejecutar un microservicio desde Maven y abrir Swagger

Para inspeccionar directamente Swagger de un servicio en desarrollo, inicia MySQL y Eureka con Compose:

```bash
docker compose up -d mysql eureka
```

En otra terminal, inicia el módulo deseado desde su carpeta. Ejemplo para Doctors:

```bash
cd backend/doctors
mvn spring-boot:run
```

Swagger UI de Doctors: `http://localhost:9003/swagger-ui/index.html`

OpenAPI JSON: `http://localhost:9003/v3/api-docs`

Otros servicios con Swagger usan el mismo sufijo `/swagger-ui/index.html` en su puerto local. El Compose de producción no publica esos puertos ni expone Swagger por el Gateway.

En Windows también existe `backend/start-backend.ps1`, que inicia MySQL y los servicios Spring en procesos Maven locales. Desde `backend/`:

```powershell
.\start-backend.ps1
```

Para detener los procesos Spring sin borrar la base:

```powershell
.\start-backend.ps1 -Stop
```

## Rutas del Gateway

El Gateway local responde en `http://localhost:9013`. Las rutas principales conservan el prefijo `/api/v3`:

| Dominio | Prefijo |
| --- | --- |
| Auth | `/api/v3/auth/**` |
| Users, perfiles y registros | `/api/v3/users/**`, `/api/v3/user-profiles/**`, `/api/v3/patient-profiles/**`, `/api/v3/receptionist-profiles/**`, `/api/v3/administrator-profiles/**`, `/api/v3/patient-registrations/**` |
| Doctors y especialidades | `/api/v3/doctors/**`, `/api/v3/specialties/**` |
| Citas y agenda | `/api/v3/appointments/**`, `/api/v3/doctor-schedules/**`, `/api/v3/doctor-time-off/**`, `/api/v3/schedule-slots/**` |
| Registros clínicos | `/api/v3/medical-records/**`, `/api/v3/medical-visit/**`, `/api/v3/diagnoses/**`, `/api/v3/vital-signs/**` |

Ejemplo de endpoint:

```text
GET http://localhost:9013/api/v3/doctors/directory
```

Las rutas protegidas requieren `Authorization: Bearer <token>`. El Gateway valida el JWT con Auth y autoriza la operación según el rol, la ruta y el método HTTP.

## Configuración

Las variables se pasan en tiempo de ejecución mediante `.env` y Compose; no se incluyen secretos en las imágenes.

| Variable | Uso |
| --- | --- |
| `DB_ROOT_PASSWORD` | Contraseña root de MySQL |
| `*_DB_PASSWORD` | Credencial de cada base lógica |
| `JWT_SECRET` | Firma de tokens JWT |
| `MASTER_ADMIN_EMAIL`, `MASTER_ADMIN_PASSWORD`, `MASTER_ADMIN_RUN` | Cuenta ADMIN inicial |
| `DOCKERHUB_USER`, `IMAGE_TAG` | Namespace y tag de imágenes en Compose de producción |

Consulta `.env.example` para ver los nombres disponibles y reemplaza los valores de ejemplo antes de compartir o publicar el sistema.

## Pruebas

Ejecuta las pruebas desde la carpeta del módulo correspondiente:

```bash
cd backend/appointments
mvn test
```

GitHub Actions ejecuta los tests Maven para los siete módulos activos. El workflow de imágenes publica los contenedores en Docker Hub al actualizar los módulos backend en la rama configurada.

## Despliegue

El Compose de producción descarga imágenes ya construidas:

```bash
docker compose --env-file .env -f compose.prod.yaml pull
docker compose --env-file .env -f compose.prod.yaml up -d
```

El Gateway queda ligado a `127.0.0.1:9013` para que Nginx sea el punto de entrada. Para los pasos específicos del servidor local, incluida la integración con el Nginx existente, consulta [`../docs/deploy-local-server.md`](../docs/deploy-local-server.md). AWS se documenta aparte en la rama `cloud`, dentro de `infra/README.md`.
