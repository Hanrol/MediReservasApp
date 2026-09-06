# MediReservas - Frontend

## Descripción del proyecto

Frontend de MediReservas, sistema de reservas médicas cuyo backend está desarrollado bajo una arquitectura de microservicios con Spring Boot (ver [`../backend/README.md`](../backend/README.md)). El objetivo de esta etapa es construir la capa visual del sistema: la interfaz con la que pacientes, médicos, recepcionistas y administradores interactuarán con los servicios de autenticación, usuarios, médicos, especialidades, horarios, reservas, pagos, fichas médicas, recetas, notificaciones y reportes.

## Estado actual: prototipo / mockup

> ⚠️ **Importante:** el frontend se encuentra en una etapa inicial de maquetación (mockup). Por ahora:
>
> * No existe conexión con el backend ni con el API Gateway.
> * Se guarda información del usuario (En `localStorage`).
> * No hay gestión de usuarios, autenticación ni control de roles funcional.
> * El único avance implementado es la **landing page básica** y la hoja de estilos base con Tailwind CSS.

Este prototipo corresponde principalmente a los requerimientos **RF-01 (Visualizar página principal)** y **RF-28 (Navegación mediante menú responsive)**, junto con los requerimientos no funcionales de diseño responsive y uso de Tailwind CSS, definidos en `docs/Planilla_Requerimientos_MediReservas_OTB_v3_formato_profesor.xlsx`.

## Integrantes

* Benjamín Cubillos
* Renato Troncoso
* Cristóbal Pardo

## Tecnologías utilizadas

* **HTML5** — estructura de las vistas (páginas estáticas).
* **Tailwind CSS** — estilos, componentes y diseño responsive (requisito RNF-05).
* **JavaScript básico (vanilla)** — interacciones simples y validaciones del lado del cliente (requisito RNF-02).

No se utilizan frameworks ni librerías de frontend (React, Vue, bundlers, etc.). Todo funciona abriendo los archivos HTML directamente en el navegador o con un servidor estático simple.

## Regla de trabajo: diseño en HTML con Tailwind

* **`assets/css/style.css` se deja sin tocar.** Es la hoja de estilos generada por Tailwind CSS y nadie debe editarla manualmente.
* Todo el diseño se hace **directamente en el HTML** usando clases de utilidad de Tailwind (`flex`, `grid`, `md:`, `bg-`, `text-`, etc.).
* Solo se trabaja en **archivos `.html`** (estructura + diseño con clases Tailwind) y **archivos `.js`** (validaciones e interacciones básicas).
* Si se necesita un estilo que Tailwind no cubre de forma nativa, se comenta con el equipo antes de modificar cualquier CSS.

## Estructura del proyecto

```bash
frontend/
├── assets/
│   ├── css/            # Hojas de estilo Tailwind (NO editar)
│   ├── images/         # Imágenes y recursos visuales
│   ├── js/             # Scripts JavaScript (validaciones e interacciones)
│   └── src/            # Archivos fuente de estilos
├── docs/               # Documentación del proyecto (planilla de requerimientos)
├── dashboard.html      # Vista principal (en desarrollo)
└── README.md
```

## Estructura de páginas propuesta

```bash
frontend/
├── index.html                    # Landing / Home (pública)
├── login.html                    # Inicio de sesión
├── registro.html                 # Registro de paciente
├── dashboard.html                # Dashboard según rol
├── perfil.html                   # Perfil de usuario
├── contacto.html                 # Mapa y contacto
├── medicos-especialidades.html   # Listado de médicos y especialidades
├── medico-detalle.html           # Detalle de médico
├── solicitar-cita.html           # Formulario de solicitud de cita
├── mis-citas.html                # Citas del paciente
├── historial-clinico.html        # Historial clínico básico
├── admin-usuarios.html           # Admin - Gestión de usuarios
├── admin-roles.html              # Admin - Roles y permisos
├── admin-medicos.html            # Admin - Médicos
├── admin-especialidades.html     # Admin - Especialidades
├── recepcion-citas.html          # Recepción - Gestión de citas
└── medico-agenda.html            # Médico - Agenda y observación clínica
```

## Asignación de páginas y JavaScript por integrante

Cada integrante es responsable de las vistas y los scripts de sus vistas. **El CSS no se toca**: el diseño se resuelve con clases Tailwind dentro de cada HTML.

### Integrante 1 — Navegación, autenticación y administración base

**Responsable de:** RF-01, RF-02, RF-03, RF-04, RF-05, RF-06, RF-07, RF-08, RF-09, RF-28, RF-29 y RNF-03, RNF-04.

| Archivo HTML | Contenido |
| ------------ | --------- |
| `index.html` | Landing page: navbar, hero, servicios destacados, enlaces a login, registro, médicos, especialidades y contacto |
| `login.html` | Formulario de inicio de sesión con validación de campos |
| `registro.html` | Formulario de registro de paciente (correo, RUN, datos personales) |
| `dashboard.html` | Dashboard con opciones distintas según rol (mockeado en JS) |
| `perfil.html` | Perfil de usuario con datos personales básicos |
| `admin-usuarios.html` | Tabla de usuarios, crear/editar/desactivar (simulado) |
| `admin-roles.html` | Asignación de roles a usuarios (simulado) |

**JavaScript (`assets/js/`):**

* `navbar.js` — menú hamburguesa responsive y navegación entre vistas (RF-28).
* `login.js` — validación de credenciales y simulación de redirección por rol (RF-03).
* `registro.js` — validación de formato de correo y RUN (RF-02).
* `roles.js` — simulación local de rol para mostrar/ocultar menús (RF-05, RF-29).

### Integrante 2 — Experiencia del paciente y contacto

**Responsable de:** RF-10, RF-12, RF-13, RF-15, RF-16, RF-17, RF-18, RF-25, RF-26, RF-27.

| Archivo HTML | Contenido |
| ------------ | --------- |
| `medicos-especialidades.html` | Listado de médicos y especialidades con buscador/filtros |
| `medico_detalle.html` | Detalle del médico: especialidad, horarios referenciales y botón de cita |
| `solicitar-cita.html` | Formulario de cita: especialidad, médico, fecha, hora y motivo |
| `mis-citas.html` | Citas del paciente con filtro por estado y opción de cancelar |
| `historial-clinico.html` | Historial clínico básico (observaciones mock) |
| `contacto.html` | Datos de contacto, formulario de contacto y mapa (DuocUC San Joaquín) |

**JavaScript (`assets/js/`):**

* `citas.js` — validación completa del formulario de cita: sin especialidad, médico, fecha, hora o motivo no se envía (RF-15, RF-16).
* `miscitas.js` — filtros por estado y confirmación de cancelación (RF-17, RF-18).
* `contacto.js` — validación de nombre, correo y mensaje con confirmación visual (RF-27).
* `buscador.js` — búsqueda/filtrado de médicos y especialidades en el listado (RF-10, RF-12).

### Integrante 3 — Administración clínica, recepción y agenda médica

**Responsable de:** RF-11, RF-14, RF-19, RF-20, RF-21, RF-22, RF-23, RF-24.

| Archivo HTML | Contenido |
| ------------ | --------- |
| `admin-medicos.html` | Mantenedor de médicos: crear, editar, desactivar y asociar especialidad |
| `admin-especialidades.html` | Mantenedor de especialidades médicas (CRUD simulado) |
| `gestion-citas.html` | Tabla de solicitudes de citas: confirmar, cancelar y reagendar |
| `agenda-medica.html` | Agenda del médico por fecha + formulario de observación clínica |

**JavaScript (`assets/js/`):**

* `admin_medicos.js` — validación del formulario y acciones sobre la tabla (RF-14).
* `admin_especialidades.js` — validación de nombre obligatorio y acciones CRUD simuladas (RF-11).
* `recepcion.js` — confirmar/cancelar/reagendar citas con validación de estados (RF-19, RF-20, RF-21, RF-22).
* `agenda.js` — filtro de agenda por fecha y validación de la observación clínica (RF-23, RF-24).

> 📌 Los datos mostrados en todas las vistas son **estáticos o mockeados en JS**. Ninguna vista consume el backend ni persiste información.

## Requerimientos cubiertos en esta etapa

| Código | Requerimiento | Prioridad | Estado |
| ------ | ------------- | --------- | ------ |
| RF-01 | Visualizar página principal (landing) | Esencial | En desarrollo |
| RF-28 | Navegación mediante menú responsive | Esencial | En desarrollo |
| RNF-01 | Diseño responsive (360px, 768px, 1280px) | Esencial | En desarrollo |
| RNF-05 | Uso de Tailwind CSS | Importante | En desarrollo |
| RNF-07 | Mensajes de error claros | Importante | Pendiente |
| RNF-08 | Interfaz simple para usuarios no técnicos | Importante | En desarrollo |

### Criterios de aceptación de la landing (RF-01)

* La vista carga correctamente y muestra navbar, sección principal y servicios destacados.
* Incluye enlaces de navegación (login, registro, médicos, especialidades y contacto).
* Se adapta a móvil, tablet y escritorio sin desbordes importantes.

## Vistas planificadas (roadmap)

Según la planilla de requerimientos, las vistas futuras del frontend son:

| N° | Vista | Tipo | Roles | Requerimientos |
| -- | ----- | ---- | ----- | -------------- |
| 1 | Home / Landing | Pública | Público | RF-01, RF-28 |
| 2 | Login | Pública | Público | RF-03 |
| 3 | Registro | Pública | Paciente | RF-02 |
| 4 | Dashboard | Autenticada | Todos | RF-04, RF-05, RF-29 |
| 5 | Perfil de usuario | Autenticada | Todos | RF-06 |
| 6 | Mapa / Contacto (DuocUC San Joaquín) | Pública/Autenticada | Todos | RF-26, RF-27 |
| 7 | Admin - Gestión de usuarios | Rol Admin | Administrador | RF-07, RF-09 |
| 8 | Admin - Roles y permisos | Rol Admin | Administrador | RF-08 |
| 9 | Admin - Médicos | Rol Admin | Administrador | RF-14 |
| 10 | Admin - Especialidades | Rol Admin | Administrador | RF-11 |
| 11 | Paciente - Buscar médicos y especialidades | Rol Paciente | Paciente | RF-10, RF-12, RF-13 |
| 12 | Paciente - Solicitar cita | Rol Paciente | Paciente | RF-15, RF-16 |
| 13 | Paciente - Mis citas | Rol Paciente | Paciente | RF-17, RF-18 |
| 14 | Paciente - Historial clínico básico | Rol Paciente | Paciente | RF-25 |
| 15 | Recepción - Gestión de citas | Rol Recepcionista | Recepcionista | RF-19, RF-20, RF-21, RF-22 |
| 16 | Médico - Agenda y observación | Rol Médico | Médico | RF-23, RF-24, RF-25 |

## Relación con el backend

Cuando el frontend se conecte al backend, lo hará únicamente a través del **API Gateway** (`http://localhost:9013`), que enruta hacia los microservicios y valida los tokens JWT. Los formularios de esta etapa ya se diseñan considerando los contratos de las rutas públicas del gateway (por ejemplo `POST /api/v1/auth/login` y `POST /api/v1/auth/register`), de modo que la integración posterior sea directa.

Detalle completo de servicios y rutas en [`../backend/README.md`](../backend/README.md).

## Instrucciones de ejecución local

### Requisitos previos

* Navegador web moderno.
* Editor recomendado: Visual Studio Code.
* Opcional: extensión *Live Server* de VS Code para recarga automática.


## Convenciones de trabajo

* Un archivo HTML por vista, con clases de Tailwind CSS en línea.
* **No editar `assets/css/style.css` ni ningún otro CSS**: todo el diseño va en el HTML con Tailwind.
* Validaciones de formularios con JavaScript básico antes de cualquier envío.
* Diseño responsive verificado en 360px, 768px y 1280px (RNF-01).
* Commits progresivos asociados a requerimientos, por ejemplo:

```bash
RF-01: crear estructura base
RF-01: aplicar diseño responsive con Tailwind
RF-01: agregar lógica JavaScript y validaciones
RF-01: probar flujo y ajustar detalles
```

## Repositorio

Repositorio oficial del proyecto:

```bash
https://github.com/Hanrol/MediReservasApp
```
