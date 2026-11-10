# MediReservas

## Descripción del proyecto

MediReservas es un sistema de reservas médicas desarrollado bajo una arquitectura de microservicios con Spring Boot. El objetivo del proyecto es permitir la gestión modular de procesos médicos como autenticación, administración de usuarios, médicos, especialidades, horarios, reservas, pagos, fichas médicas, recetas, notificaciones y reportes administrativos.

El sistema utiliza una arquitectura distribuida donde cada microservicio posee su propia base de datos, manteniendo independencia de datos y separación de responsabilidades. Además, se incorporan componentes de infraestructura como Eureka Server para descubrimiento de servicios y API Gateway como punto de entrada centralizado con validación JWT.

## Integrantes

* Benjamín Cubillos
* Renato Troncoso
* Cristóbal Pardo


## Microservicios implementados

| Servicio                | Puerto | Base de datos      | Responsabilidad                                                 |
| ----------------------- | -----: | ------------------ | --------------------------------------------------------------- |
| Auth Service            |   9001 | auth_db            | Autenticación, roles y generación/validación de tokens JWT.     |
| Users Service           |   9002 | users_db           | Gestión de usuarios, perfiles generales y perfiles específicos. |
| Doctors Service         |   9003 | doctors_db         | Gestión profesional de médicos y especialidades asociadas.      |
| Specialties Service     |   9004 | specialties_db     | Catálogo de especialidades médicas.                             |
| Schedule Service        |   9005 | schedules_db       | Horarios médicos, ausencias y bloques de agenda.                |
| Appointments Service    |   9006 | appointments_db    | Gestión de reservas médicas y estados de cita.                  |
| Payments Service        |   9007 | payments_db        | Pagos, comprobantes y reembolsos.                               |
| Medical Records Service |   9008 | medical_records_db | Fichas médicas, visitas, diagnósticos y signos vitales.         |
| Prescriptions Service   |   9009 | prescriptions_db   | Prescripciones médicas e ítems de receta.                       |
| Notifications Service   |   9010 | notifications_db   | Notificaciones y plantillas de notificación.                    |
| Reports Service         |   9011 | reports_db         | Solicitudes y reportes generados.                               |
| Eureka Server           |   8761 | No aplica          | Descubrimiento y registro de microservicios.                    |
| API Gateway             |   9013 | No aplica          | Punto de entrada, enrutamiento y validación JWT.                |

## Rutas principales del API Gateway

El API Gateway se ejecuta en:

```bash
http://localhost:9013
```

Rutas principales:

| Servicio               | Ruta por Gateway                    |
| ---------------------- | ----------------------------------- |
| Auth                   | `/api/v3/auth/**`                   |
| Users                  | `/api/v3/users/**`                  |
| User Profiles          | `/api/v3/user-profiles/**`          |
| Patient Profiles       | `/api/v3/patient-profiles/**`       |
| Receptionist Profiles  | `/api/v3/receptionist-profiles/**`  |
| Administrator Profiles | `/api/v3/administrator-profiles/**` |
| Doctors                | `/api/v3/doctors/**`                |
| Specialties            | `/api/v3/specialties/**`            |
| Doctor Schedules       | `/api/v3/doctor-schedules/**`       |
| Doctor Time Off        | `/api/v3/doctor-time-off/**`        |
| Schedule Slots         | `/api/v3/schedule-slots/**`         |
| Appointments           | `/api/v3/appointments/**`           |
| Payments               | `/api/payments/**`                  |
| Medical Records        | `/api/v3/medical-records/**`        |
| Medical Visits         | `/api/v3/medical-visit/**`          |
| Diagnoses              | `/api/v3/diagnoses/**`              |
| Vital Signs            | `/api/v3/vital-signs/**`            |
| Prescriptions          | `/api/v3/prescriptions/**`          |
| Prescription Items     | `/api/v3/prescription-items/**`     |
| Notifications          | `/api/v3/notifications/**`          |
| Notification Templates | `/api/v3/notification-templates/**` |
| Reports Request        | `/api/v3/reports-request/**`        |
| Generated Reports      | `/api/v3/generated-reports/**`      |

Rutas públicas principales:

```bash
POST /api/v3/auth/login
POST /api/v3/auth/register
GET  /actuator/health
```

El resto de rutas protegidas requiere token JWT en el header:

```bash
Authorization: Bearer <token>
```

El Gateway responde `401` cuando falta o no es válido el token y `403` cuando el rol no está autorizado. La matriz inicial permite a `ADMIN` todas las rutas; `RECEPTIONIST` gestiona usuarios/perfiles y citas; `DOCTOR` usa agenda, citas médicas y registros clínicos; `PATIENT` consulta el catálogo y las rutas de citas/perfil de paciente. Las rutas no incluidas en la matriz se deniegan por defecto.

La autorización del Gateway es por ruta, método y rol. Appointments valida la propiedad del paciente al crear/cancelar citas y consultar su lista, y la propiedad del médico al listar/actualizar el estado de sus citas y gestionar su agenda/horarios. Users valida la propiedad al consultar el perfil de paciente por `userId`. Medical Records verifica las relaciones paciente/médico/cita al crear visitas, aplica comprobaciones por médico a visitas y datos clínicos anidados, y filtra los detalles de registros por médico. Tras una prueba E2E temporal por Gateway con dos JWT de médicos, se habilitaron lecturas clínicas filtradas y escrituras de visitas, diagnósticos y signos vitales protegidas por ownership. La administración de fichas (crear/activar/desactivar/eliminar) sigue restringida a `ADMIN`/`RECEPTIONIST`. El detalle interno de citas para comunicación entre servicios está denegado explícitamente en Gateway para todos los roles. Revisar todas las rutas que acepten IDs de usuario/recurso antes de producción.

## Documentación Swagger

Cada microservicio expone documentación Swagger de forma local mediante:

```bash
http://localhost:<PUERTO>/swagger-ui/index.html
```

Enlaces locales principales:

* Auth Service: http://localhost:9001/swagger-ui/index.html
* Users Service: http://localhost:9002/swagger-ui/index.html
* Doctors Service: http://localhost:9003/swagger-ui/index.html
* Specialties Service: http://localhost:9004/swagger-ui/index.html
* Schedule Service: http://localhost:9005/swagger-ui/index.html
* Appointments Service: http://localhost:9006/swagger-ui/index.html
* Payments Service: http://localhost:9007/swagger-ui/index.html
* Medical Records Service: http://localhost:9008/swagger-ui/index.html
* Prescriptions Service: http://localhost:9009/swagger-ui/index.html
* Notifications Service: http://localhost:9010/swagger-ui/index.html
* Reports Service: http://localhost:9011/swagger-ui/index.html

Eureka Server:

```bash
http://localhost:8761
```

API Gateway:

```bash
http://localhost:9013
```

## Instrucciones de ejecución local

### Requisitos previos

* Java 21
* Maven
* Docker Desktop
* MySQL mediante contenedores Docker
* IDE recomendado: Visual Studio Code o IntelliJ IDEA

### 1. Clonar el repositorio

```bash
git clone https://github.com/GabFloresLuna/MediReservas.git
cd MediReservas
```

### 2. Configuración Docker del backend

Desde la raíz del repositorio, copiar `.env.example` a `.env` y cambiar las credenciales antes de usarlo fuera del entorno local:

```bash
cp .env.example .env
```

Levantar solo MySQL (útil para el flujo de desarrollo con Maven):

```bash
docker compose up -d mysql
```

El Compose maestro construye e inicia MySQL, Eureka, los cinco servicios activos y Gateway:

```bash
docker compose up --build -d
```

Para bajar los contenedores sin borrar los datos de MySQL:

```bash
docker compose down
```

El Compose de producción usa imágenes publicadas en Docker Hub, incluyendo `DOCKERHUB_USER` e `IMAGE_TAG` del `.env`:

```bash
docker compose -f compose.prod.yaml pull
docker compose -f compose.prod.yaml up -d
```

Las imágenes de producción deben publicarse previamente con los nombres definidos en `compose.prod.yaml`. No ejecutar `down -v` salvo que se quiera borrar permanentemente el volumen de la base de datos.

### 3. Levantar Eureka Server

Eureka debe iniciarse antes que los microservicios, ya que permite el registro y descubrimiento de servicios.

```bash
cd eureka
mvn spring-boot:run
```

Panel de Eureka:

```bash
http://localhost:8761
```

### 4. Levantar los microservicios

Desde la carpeta de cada microservicio:

```bash
mvn spring-boot:run
```

Ejemplo:

```bash
cd auth
mvn spring-boot:run
```

Se recomienda iniciar primero:

1. Eureka Server
2. Auth Service
3. Users Service
4. Servicios dependientes
5. API Gateway

### 5. Levantar API Gateway

```bash
cd gateway
mvn spring-boot:run
```

El Gateway estará disponible en:

```bash
http://localhost:9013
```

### 6. Ejecutar pruebas automatizadas

Desde la carpeta de cada microservicio:

```bash
mvn test
```

Ejemplo:

```bash
cd appointments
mvn test
```

Las pruebas fueron desarrolladas con JUnit y Mockito, validando lógica de servicios, controladores REST, respuestas HTTP y casos de error.

## Ejecución remota

Para ejecución remota o despliegue en servidor, se deben considerar los siguientes puntos:

1. Configurar las variables de conexión a base de datos de cada microservicio.
2. Configurar la URL de Eureka Server en cada `application.yml`.
3. Exponer únicamente el API Gateway hacia el exterior.
4. Mantener los microservicios internos accesibles mediante Eureka y red privada.
5. Configurar certificados HTTPS si el sistema será publicado en producción.
6. Usar Docker Compose o contenedores independientes para levantar bases de datos y servicios.

En un entorno remoto, el flujo recomendado es:

```bash
Eureka Server → Microservicios → API Gateway
```

## Tecnologías utilizadas

* Java 21
* Spring Boot
* Spring Cloud Gateway
* Spring Cloud Netflix Eureka
* Spring Security
* JWT
* Spring Data JPA
* MySQL
* Flyway
* Docker Compose
* WebClient
* Swagger / OpenAPI
* JUnit
* Mockito
* Maven

## Repositorio

Repositorio oficial del proyecto:

```bash
https://github.com/Hanrol/MediReservasApp
```
