# MediReservasApp — Frontend

SPA web para pacientes, médicos, recepción y administración. La interfaz se está migrando de `legacy/` a React + TypeScript; **la aplicación activa es `src/`**. La carpeta `legacy/` se conserva como referencia de comportamiento mientras termina la verificación de paridad.

## Estado y alcance

- La navegación usa React Router con `HashRouter`, compatible con GitHub Pages.
- Los servicios usan datos simulados y `localStorage` separados por dominio. **El frontend todavía no está integrado con la API ni con la base de datos del backend.**
- Los roles y rutas principales están implementados con guards de autenticación y autorización.
- El detalle del médico permite revisar horarios referenciales y comenzar una reserva con médico/especialidad preseleccionados.
- El Excel de requisitos de `Eva 1` es la fuente de verdad para los códigos RF y criterios de aceptación; el PDF ERS está desactualizado.

## Tecnologías

- React 19, TypeScript 6 y Vite 8.
- Tailwind CSS 4.
- Vitest, React Testing Library y cobertura V8.
- Playwright 1.64 para pruebas E2E en Chromium.

## Requisitos y ejecución local

Se recomienda Node.js 22 y npm.

```bash
npm ci
npm run dev
```

Vite inicia la aplicación en `http://localhost:5173`. Para generar y revisar la versión de producción:

```bash
npm run build
npm run preview
```

## Estructura de `src`

```text
src/
├── app/          # App y registro de rutas
├── components/   # Layout, navegación, citas, formularios y UI compartida
├── constants/    # Rutas, roles y estados de citas
├── contexts/     # Contexto de autenticación
├── data/         # Datos simulados
├── guards/       # Protección de rutas por sesión y rol
├── hooks/        # Hooks de autenticación y dominios
├── pages/        # public, shared, admin, recepcion, medico y paciente
├── services/     # Lógica de aplicación por dominio
├── storage/      # Persistencia local temporal
├── tests/        # Unitarias, componentes, hooks y rutas
├── types/        # Tipos TypeScript
└── utils/        # Validaciones y transformaciones
```

`main.tsx` monta `AuthProvider` dentro de `HashRouter`. Las rutas, nombres y roles se centralizan en `src/constants/routes.ts`, `src/constants/roles.ts` y `src/app/routeConfig.ts`.

## Pruebas y cobertura

```bash
npm test                 # Suite Vitest
npm run test:coverage    # Vitest + reporte V8 en coverage/
npm run test:e2e         # Playwright E2E en Chromium
npm run lint             # ESLint
```

Los tests usan identificadores CP trazables al Excel. En el último corte se ejecutaron **127 tests Vitest y 11 E2E Playwright**; el reporte de cobertura registró **95,09 % de líneas**. Vitest aplica umbrales mínimos globales de 95 % líneas, 90 % sentencias, 95 % funciones y 75 % ramas.

Las pruebas Playwright arrancan Vite automáticamente en el puerto 4173 mediante `playwright.config.ts`. Para instalar el navegador localmente:

```bash
npx playwright install chromium
```

Los E2E cubren reserva de paciente, administración/recepción, observación e historial, control de acceso y responsive en vistas seleccionadas. Trabajan con los datos simulados del frontend; **no son pruebas de integración con el backend**. Los reportes de Playwright quedan en `playwright-report/` y `test-results/`.

## Integración continua

`.github/workflows/frontend-ci.yml` ejecuta en GitHub Actions:

1. `npm ci` y ESLint.
2. Vitest con cobertura y umbrales.
3. Instalación de Chromium y suite Playwright.
4. Publicación de reportes de pruebas como artefactos.
5. Build de producción y despliegue en GitHub Pages al hacer push a `main`.

La ejecución del workflow remoto debe verificarse en la pestaña **Actions** del repositorio.

## Usuarios de demostración

Estas credenciales solo sirven para la versión local con datos simulados; no son cuentas de producción.

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | `administrador@medireservas.cl` | `Admin123` |
| Recepción | `recepcion@medireservas.cl` | `Recepcion123` |
| Médico | `medico@medireservas.cl` | `Medico123` |
| Paciente | `paciente@medireservas.cl` | `Paciente123` |

## Migración desde `legacy/`

Las vistas y flujos HTML/JavaScript se trasladan a las páginas y servicios React/TypeScript correspondientes. Antes de retirar `legacy/`, completar la revisión de criterios del Excel, mantener la trazabilidad CP/RF y validar los recorridos por rol y los tamaños de pantalla requeridos.
