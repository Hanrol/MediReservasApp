# Frontend de MediReservasApp

SPA para pacientes, médicos, recepción y administración. El frontend contiene flujos conectados al backend REST y también datos/almacenamiento local usados por componentes y pruebas de desarrollo; no todos los datos de demostración representan datos de producción.

## Tecnologías

- React 19, TypeScript 6 y Vite 8
- React Router con `HashRouter`, compatible con GitHub Pages
- Tailwind CSS 4
- Vitest, React Testing Library y Playwright

## Requisitos y ejecución local

Se recomienda Node.js 22 y npm.

```bash
npm ci
npm run dev
```

Vite inicia en `http://localhost:5173`. En desarrollo, las llamadas `/api` se envían por proxy a `http://localhost:9013`, que debe ser accesible. Para cambiar el destino:

```powershell
$env:VITE_DEV_API_PROXY_TARGET = "http://localhost:9013"
npm run dev
```

El Gateway y los servicios se pueden iniciar siguiendo [`../backend/README.md`](../backend/README.md).

## API y compilación

`src/services/api-client.ts` centraliza las solicitudes REST, el formato JSON, los errores y el encabezado Bearer para operaciones autenticadas.

- Si `VITE_API_URL` no está definida, el cliente usa `/api/v3` relativo al mismo dominio.
- GitHub Pages necesita una URL absoluta; el workflow de despliegue define `VITE_API_URL` al compilar la app.
- El `base` de Vite para producción es `/MediReservasApp/`.
- No pongas contraseñas, tokens privados ni secretos en variables `VITE_*`: sus valores quedan incluidos en los archivos públicos del frontend.

Compilar y revisar el build:

```bash
npm run build
npm run preview
```

Para desplegar una copia local detrás de Nginx, compila sin `VITE_API_URL` para que use `/api/v3` y consulta [`../docs/deploy-local-server.md`](../docs/deploy-local-server.md).

## Sesión y rutas

- `AuthContext` mantiene el estado de sesión en la aplicación.
- La sesión del navegador se guarda bajo `medireservas_session`; no se guarda la contraseña.
- `AuthGuard` protege rutas autenticadas y `RoleGuard` comprueba los roles permitidos.
- La API también aplica autorización en el Gateway; ocultar o proteger una ruta en el frontend no sustituye la autorización del backend.

## Pruebas y calidad

Desde `frontend/`:

```bash
npm run lint
npm test
npm run test:coverage
npm run test:e2e
```

Instala Chromium para Playwright si hace falta:

```bash
npx playwright install chromium
```

`npm run test:e2e` usa los datos simulados del frontend. La suite E2E real usa un backend y una base aislados, escribe datos sintéticos y tiene precauciones propias: consulta [`e2e/real/README.md`](e2e/real/README.md) antes de ejecutarla.

## Estructura principal

```text
src/
├── app/          # Aplicación y rutas
├── components/   # Componentes compartidos
├── contexts/     # Estado global, incluida autenticación
├── guards/       # Protección por sesión y rol
├── pages/        # Vistas por dominio y perfil
├── services/     # Cliente API y lógica de aplicación
├── storage/      # Persistencia local de sesión/datos de desarrollo
├── tests/        # Tests unitarios y de componentes
└── types/        # Tipos TypeScript
```

## Integración continua

`.github/workflows/frontend-ci.yml` ejecuta lint, tests unitarios, E2E, build y, en la rama configurada, despliegue a GitHub Pages. La URL de API para Pages se define durante el build en ese workflow; consulta la configuración de la rama antes de cambiar el destino.
