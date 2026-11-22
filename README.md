# MediReservasApp

Aplicación web para gestionar reservas de atención médica. El proyecto combina una SPA en React con un backend de microservicios Spring Boot, una API REST centralizada y persistencia en MySQL.

## Funcionalidades

- Acceso para pacientes, médicos, recepción y administración.
- Consulta de médicos, especialidades y horarios.
- Solicitud y gestión de citas.
- Gestión de perfiles y antecedentes clínicos según el rol.
- Autenticación con JWT y autorización por roles.

## Arquitectura

El backend activo está compuesto por Auth, Users, Doctors, Appointments y Medical Records, además de Eureka para descubrimiento de servicios y API Gateway para enrutamiento y autorización. MySQL contiene bases lógicas separadas por dominio.

## Tecnologías

| Área | Tecnologías |
| --- | --- |
| Frontend | React, TypeScript, Vite, React Router, Tailwind CSS |
| Backend | Java 21, Spring Boot, Spring Cloud Gateway, Eureka, Spring Data JPA |
| Datos | MySQL, Flyway |
| API y seguridad | REST, SpringDoc OpenAPI/Swagger, JWT |
| Calidad | JUnit, Mockito, Vitest, Playwright, ESLint |
| Ejecución | Docker Compose, GitHub Actions |

## Inicio rápido local

Requisitos: Docker Desktop o Docker Engine con Docker Compose, Node.js 22 y npm.

1. Desde la raíz del repositorio, crea la configuración local:

   ```bash
   if [ ! -f .env ]; then cp .env.example .env; fi
   ```

   En PowerShell:

   ```powershell
   if (-not (Test-Path .env)) { Copy-Item .env.example .env }
   ```

   Si `.env` ya existe, conserva sus valores y no lo sobrescribas. Los valores del ejemplo son solo para desarrollo; cámbialos para un entorno compartido o publicado. **No subas `.env` al repositorio.**

2. Levanta MySQL, Eureka y los microservicios:

   ```bash
   docker compose up --build -d
   docker compose ps
   ```

3. En otra terminal, inicia el frontend:

   ```bash
   cd frontend
   npm ci
   npm run dev
   ```

   Vite estará disponible en `http://localhost:5173`. Su proxy de desarrollo envía `/api` a `http://localhost:9013`. Para cambiar el destino, configura `VITE_DEV_API_PROXY_TARGET`.

Puertos principales del Compose local: MySQL `3311`, Eureka `8761` y Gateway `9013`. Los microservicios no publican sus puertos individuales en el host.

## Pruebas

Desde `frontend/`:

```bash
npm run lint
npm test
npm run test:e2e
```

Desde el directorio de un microservicio del backend:

```bash
mvn test
```

La suite E2E contra backend y base de datos aislados crea y modifica datos sintéticos. Consulta sus requisitos y precauciones en [`frontend/e2e/real/README.md`](frontend/e2e/real/README.md).

## Documentación

- [Frontend](frontend/README.md): ejecución, configuración y pruebas.
- [Backend](backend/README.md): microservicios, puertos, base de datos y Swagger.
- [Despliegue en el servidor local](docs/deploy-local-server.md).

La rama [`cloud`](https://github.com/Hanrol/MediReservasApp/tree/cloud) contiene la configuración de AWS. Su documentación está en [`infra/README.md`](https://github.com/Hanrol/MediReservasApp/blob/cloud/infra/README.md); las instrucciones de AWS no se duplican en esta rama.

## Seguridad y configuración

- Las contraseñas, el secreto JWT y las credenciales de administración se configuran mediante variables de entorno.
- No publiques `.env`, tokens JWT, contraseñas ni claves privadas.
- En producción, expón únicamente HTTPS/Nginx y el API Gateway según la guía de despliegue; no publiques MySQL, Eureka ni los puertos internos de los microservicios.
