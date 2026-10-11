# Guía de migración del frontend legacy

Este documento define dónde debe quedar cada archivo de `frontend/legacy` después de completar la migración a Vite, React y TypeScript.

La reorganización final debe realizarse después de que todos los integrantes hayan migrado sus vistas. Hacerla antes puede provocar conflictos, archivos duplicados y rutas rotas.

## Criterio general

Los archivos legacy no se trasladan literalmente:

- Los archivos HTML se convierten en páginas o componentes `TSX`.
- La manipulación manual del DOM se reemplaza por JSX, propiedades y estado de React.
- La lógica de negocio pasa a servicios.
- El acceso temporal a `localStorage` se separa por dominio dentro de `storage`.
- Los datos simulados quedan en `data`.
- Las validaciones, fechas y formatos quedan en `utils`.
- Los elementos visuales repetidos pasan a componentes reutilizables.

El flujo esperado es:

```text
Página o componente React
        ↓
Servicio del dominio
        ↓
API real o almacenamiento simulado
```

## Estructura final recomendada

```text
frontend/
├── public/
│   └── favicon.svg
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── AppRoutes.tsx
│   │   └── routeConfig.ts
│   ├── assets/
│   │   ├── images/
│   │   │   └── hero.png
│   │   └── icons/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── PublicHeader.tsx
│   │   │   ├── DashboardHeader.tsx
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Breadcrumbs.tsx
│   │   │   └── Footer.tsx
│   │   ├── navigation/
│   │   │   ├── MobileMenu.tsx
│   │   │   ├── NavigationItem.tsx
│   │   │   └── UserMenu.tsx
│   │   ├── forms/
│   │   │   ├── FormField.tsx
│   │   │   ├── FormMessage.tsx
│   │   │   ├── SearchInput.tsx
│   │   │   └── StatusFilter.tsx
│   │   ├── appointments/
│   │   │   ├── AppointmentCard.tsx
│   │   │   ├── AppointmentStatus.tsx
│   │   │   ├── AppointmentTable.tsx
│   │   │   └── ScheduleSelector.tsx
│   │   ├── doctors/
│   │   │   ├── DoctorCard.tsx
│   │   │   ├── DoctorForm.tsx
│   │   │   └── SpecialtyCard.tsx
│   │   ├── users/
│   │   │   ├── UserForm.tsx
│   │   │   ├── UserTable.tsx
│   │   │   └── RoleForm.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── ConfirmDialog.tsx
│   │       ├── EmptyState.tsx
│   │       ├── Modal.tsx
│   │       ├── StatusBadge.tsx
│   │       └── SummaryCard.tsx
│   ├── pages/
│   │   ├── public/
│   │   │   ├── Home.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Registro.tsx
│   │   │   ├── Contacto.tsx
│   │   │   └── MedicosEspecialidades.tsx
│   │   ├── shared/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Perfil.tsx
│   │   │   ├── HistorialClinico.tsx
│   │   │   └── AccesoDenegado.tsx
│   │   ├── admin/
│   │   │   ├── Usuarios.tsx
│   │   │   ├── Roles.tsx
│   │   │   ├── Medicos.tsx
│   │   │   └── Especialidades.tsx
│   │   ├── recepcion/
│   │   │   └── GestionCitas.tsx
│   │   ├── medico/
│   │   │   ├── Agenda.tsx
│   │   │   └── ObservacionClinica.tsx
│   │   └── paciente/
│   │       ├── SolicitarCita.tsx
│   │       └── MisCitas.tsx
│   ├── guards/
│   │   ├── AuthGuard.tsx
│   │   └── RoleGuard.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useAppointments.ts
│   │   ├── useDoctors.ts
│   │   ├── useLocalStorage.ts
│   │   └── useMobileMenu.ts
│   ├── services/
│   │   ├── api/
│   │   │   ├── apiClient.ts
│   │   │   ├── authApi.ts
│   │   │   ├── appointmentsApi.ts
│   │   │   ├── doctorsApi.ts
│   │   │   ├── specialtiesApi.ts
│   │   │   └── usersApi.ts
│   │   ├── auth.service.ts
│   │   ├── appointments.service.ts
│   │   ├── clinical.service.ts
│   │   ├── dashboard.service.ts
│   │   ├── doctors.service.ts
│   │   ├── specialties.service.ts
│   │   └── users.service.ts
│   ├── storage/
│   │   ├── storageKeys.ts
│   │   ├── session.storage.ts
│   │   ├── users.storage.ts
│   │   ├── doctors.storage.ts
│   │   ├── specialties.storage.ts
│   │   ├── appointments.storage.ts
│   │   ├── clinical.storage.ts
│   │   └── schedules.storage.ts
│   ├── data/
│   │   ├── mockUsers.ts
│   │   ├── mockDoctors.ts
│   │   ├── mockSpecialties.ts
│   │   └── mockAppointments.ts
│   ├── types/
│   │   ├── auth.ts
│   │   ├── appointment.ts
│   │   ├── clinical.ts
│   │   ├── doctor.ts
│   │   ├── role.ts
│   │   ├── schedule.ts
│   │   ├── specialty.ts
│   │   └── user.ts
│   ├── utils/
│   │   ├── appointmentStatus.ts
│   │   ├── dates.ts
│   │   ├── formatters.ts
│   │   ├── run.ts
│   │   └── validations.ts
│   ├── constants/
│   │   ├── appointmentStatuses.ts
│   │   ├── roles.ts
│   │   └── routes.ts
│   ├── styles/
│   │   └── index.css
│   └── main.tsx
├── tests/
│   ├── auth/
│   ├── appointments/
│   ├── clinical/
│   ├── dashboard/
│   ├── doctors/
│   ├── layout/
│   ├── users/
│   ├── utils/
│   └── setup.ts
├── e2e/
│   ├── auth.spec.ts
│   ├── admin.spec.ts
│   ├── medico.spec.ts
│   ├── paciente.spec.ts
│   └── recepcion.spec.ts
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```

## Correspondencia de páginas HTML

| Archivo legacy | Destino recomendado | Responsabilidad |
|---|---|---|
| `legacy/index.html` | `src/pages/public/Home.tsx` | Página pública principal. |
| `pages/login.html` | `src/pages/public/Login.tsx` | Inicio de sesión. |
| `pages/registro.html` | `src/pages/public/Registro.tsx` | Registro de pacientes. |
| `pages/dashboard.html` | `src/pages/shared/Dashboard.tsx` | Panel dinámico según el rol. |
| `pages/perfil.html` | `src/pages/shared/Perfil.tsx` | Perfil común para los usuarios autenticados. |
| `pages/usuarios.html` | `src/pages/admin/Usuarios.tsx` | Administración de cuentas. |
| `pages/roles.html` | `src/pages/admin/Roles.tsx` | Asignación de roles. |
| `pages/acceso-denegado.html` | `src/pages/shared/AccesoDenegado.tsx` | Acceso rechazado por falta de permisos. |
| `pages/contacto.html` | `src/pages/public/Contacto.tsx` | Formulario público de contacto. |
| `pages/medicos-especialidades.html` | `src/pages/public/MedicosEspecialidades.tsx` | Búsqueda de médicos y especialidades. |
| `pages/admin-medicos.html` | `src/pages/admin/Medicos.tsx` | Administración de profesionales. |
| `pages/admin-especialidades.html` | `src/pages/admin/Especialidades.tsx` | Administración de especialidades. |
| `pages/gestion-citas.html` | `src/pages/recepcion/GestionCitas.tsx` | Gestión de solicitudes y estados de citas. |
| `pages/agenda-medica.html` | `src/pages/medico/Agenda.tsx` | Agenda del médico autenticado. |
| `pages/observacion-clinica.html` | `src/pages/medico/ObservacionClinica.tsx` | Registro de observaciones médicas. |
| `pages/solicitar-cita.html` | `src/pages/paciente/SolicitarCita.tsx` | Reserva de horas médicas. |
| `pages/mis-citas.html` | `src/pages/paciente/MisCitas.tsx` | Consulta y administración de citas del paciente. |
| `pages/historial-clinico.html` | `src/pages/shared/HistorialClinico.tsx` | Historial adaptado según el rol médico o paciente. |

El historial puede seguir siendo una sola ruta si conserva el mismo diseño general. El componente puede presentar contenido diferente según `session.role`.

## Correspondencia de JavaScript

| Archivo legacy | Destino recomendado | Tratamiento |
|---|---|---|
| `main.js` | `Home.tsx` y `hooks/useMobileMenu.ts` | Estado del menú y comportamiento de inicio. |
| `login.js` | `Login.tsx` y `services/auth.service.ts` | Formulario en la página y autenticación en el servicio. |
| `registro.js` | `Registro.tsx` y `services/users.service.ts` | Formulario en la página y creación en el servicio. |
| `dashboard.js` | `Dashboard.tsx` | Renderizado mediante JSX. |
| `dashboard-data.js` | `services/dashboard.service.ts` | Cálculo del resumen por rol. |
| `perfil.js` | `Perfil.tsx` | Consulta y presentación del perfil. |
| `perfil-data.js` | `utils/formatters.ts` | Iniciales, nombre completo, fechas y estado. |
| `usuarios.js` | `Usuarios.tsx` y `services/users.service.ts` | Interfaz en TSX y operaciones en el servicio. |
| `roles-admin.js` | `Roles.tsx` y `services/users.service.ts` | Interfaz en TSX y actualización del usuario. |
| `roles.js` | `constants/roles.ts` | Configuración, nombres, accesos y permisos por rol. |
| `admin-medicos.js` | `pages/admin/Medicos.tsx` y `services/doctors.service.ts` | Administración de médicos. |
| `admin-especialidades.js` | `pages/admin/Especialidades.tsx` y `services/specialties.service.ts` | Administración de especialidades. |
| `gestion-citas.js` | `GestionCitas.tsx` y `services/appointments.service.ts` | Gestión visual y operaciones de citas. |
| `agenda-medica.js` | `pages/medico/Agenda.tsx` y `services/appointments.service.ts` | Consulta de agenda y filtros. |
| `observacion-clinica.js` | `pages/medico/ObservacionClinica.tsx` y `services/clinical.service.ts` | Formulario y almacenamiento clínico. |
| `solicitar-cita.js` | `pages/paciente/SolicitarCita.tsx` y servicios de citas, médicos y horarios | Flujo de reserva. |
| `mis-citas.js` | `pages/paciente/MisCitas.tsx` y `services/appointments.service.ts` | Consulta y cambios de citas. |
| `historial.js` | `pages/shared/HistorialClinico.tsx` y `services/clinical.service.ts` | Historial según el usuario autenticado. |
| `buscar.js` | `pages/public/MedicosEspecialidades.tsx` y `services/doctors.service.ts` | Búsqueda y filtros de profesionales. |
| `contacto.js` | `pages/public/Contacto.tsx` | Estado y validación del formulario. |
| `auth.js` | `services/auth.service.ts` y `hooks/useAuth.ts` | Autenticación y sesión. |
| `logout.js` | `hooks/useAuth.ts` | Función compartida de cierre de sesión. |
| `route-guard.js` | `guards/AuthGuard.tsx` y `guards/RoleGuard.tsx` | Protección declarativa de rutas. |
| `navigation.js` | Componentes dentro de `components/layout` y `components/navigation` | Header, sidebar, menú móvil y breadcrumbs. |
| `storage.js` | Archivos separados dentro de `storage` | Persistencia temporal dividida por dominio. |
| `clinical-storage.js` | `storage/clinical.storage.ts` | Información clínica simulada. |
| `schedule-storage.js` | `storage/schedules.storage.ts` | Horarios disponibles de médicos. |
| `mock-data.js` | Archivos separados dentro de `data` | Datos simulados por entidad. |
| `citas-utils.js` | `utils/appointmentStatus.ts` y `utils/dates.ts` | Estados, filtros y fechas. |
| `validaciones.js` | `utils/validations.ts` y `utils/run.ts` | Validaciones generales y RUN chileno. |
| `ui-utils.js` | Componentes dentro de `components/ui` | Tablas, badges, botones, errores y estados vacíos. |

## Correspondencia de archivos actuales de `src/lib`

Los archivos usados durante la primera etapa de migración también deberán reorganizarse:

| Archivo actual | Destino final |
|---|---|
| `src/lib/auth.ts` | `src/services/auth.service.ts` |
| `src/lib/data.ts` | Archivos dentro de `src/data` |
| `src/lib/profile.ts` | `src/utils/formatters.ts` |
| `src/lib/roles.ts` | `src/constants/roles.ts` |
| `src/lib/storage.ts` | Archivos separados dentro de `src/storage` |
| `src/lib/types.ts` | Archivos separados dentro de `src/types` |
| `src/lib/validations.ts` | `src/utils/validations.ts` y `src/utils/run.ts` |

## Correspondencia de estilos y configuración

| Archivo legacy | Destino o acción |
|---|---|
| `assets/src/style.css` | Integrar en `src/styles/index.css`. |
| `assets/css/style.css` | Eliminar cuando deje de usarse; es un archivo compilado. |
| `package.json` | Trasladar scripts y dependencias necesarias al `frontend/package.json`. |
| `package-lock.json` | Eliminar junto con el paquete legacy cuando termine la migración. |
| `README.md` | Integrar la información vigente en `frontend/README.md`. |

## Correspondencia de pruebas

```text
frontend/tests/
├── auth/
│   ├── auth.test.ts
│   └── route-guards.test.tsx
├── appointments/
│   ├── appointment-utils.test.ts
│   ├── appointments.test.ts
│   └── schedules.test.ts
├── clinical/
│   └── clinical-storage.test.ts
├── dashboard/
│   └── dashboard-data.test.ts
├── doctors/
│   ├── doctors.test.ts
│   └── specialties.test.ts
├── layout/
│   └── navigation.test.tsx
├── users/
│   ├── users.test.ts
│   ├── roles.test.ts
│   └── profile.test.ts
├── utils/
│   ├── ui.test.tsx
│   └── validations.test.ts
└── setup.ts
```

| Prueba legacy | Destino recomendado |
|---|---|
| `auth.test.js` | `tests/auth/auth.test.ts` |
| `route-guard.test.js` | `tests/auth/route-guards.test.tsx` |
| `citas-utils.test.js` | `tests/appointments/appointment-utils.test.ts` |
| `citas.test.js` | `tests/appointments/appointments.test.ts` |
| `schedule-storage.test.js` | `tests/appointments/schedules.test.ts` |
| `clinical-storage.test.js` | `tests/clinical/clinical-storage.test.ts` |
| `dashboard-data.test.js` | `tests/dashboard/dashboard-data.test.ts` |
| `medicos.test.js` | `tests/doctors/doctors.test.ts` |
| `especialidades.test.js` | `tests/doctors/specialties.test.ts` |
| `navigation.test.js` | `tests/layout/navigation.test.tsx` |
| `navigation-markup.test.js` | Integrar en `tests/layout/navigation.test.tsx`. |
| `usuarios.test.js` | `tests/users/users.test.ts` |
| `roles.test.js` | `tests/users/roles.test.ts` |
| `perfil.test.js` | `tests/users/profile.test.ts` |
| `ui-utils.test.js` | `tests/utils/ui.test.tsx` |
| `validaciones.test.js` | `tests/utils/validations.test.ts` |

## Orden recomendado para la reorganización

1. Migrar todas las páginas legacy a React y comprobar sus flujos.
2. Crear componentes compartidos para header, sidebar, navegación, modales, tablas y formularios.
3. Separar `lib` y los JavaScript legacy en servicios, almacenamiento, tipos, datos, constantes y utilidades.
4. Migrar las pruebas a TypeScript y React Testing Library o Vitest.
5. Comprobar que ninguna ruta o importación dependa de `frontend/legacy`.
6. Eliminar `frontend/legacy` en un commit independiente.

## Condición para eliminar `legacy`

La carpeta `frontend/legacy` solo debe eliminarse cuando:

- Todas las rutas se encuentren registradas en React Router.
- Los enlaces del dashboard ya no apunten a archivos HTML.
- Todos los roles puedan completar sus flujos principales.
- Los datos simulados funcionen desde la nueva estructura.
- El proyecto pase compilación, lint y pruebas.
- No existan referencias a `/legacy/` dentro de `src`.
