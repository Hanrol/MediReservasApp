# E2E contra backend real

Esta suite usa el frontend real, el Gateway y los servicios/base de datos conectados a este. No intercepta las llamadas HTTP ni usa fixtures mock.

> **Escribe datos.** Reserva, cancela y vuelve a reservar un horario; al terminar cancela las citas pendientes creadas. Ejecutarla únicamente contra un entorno y una base de datos aislados para pruebas, nunca contra producción ni datos clínicos reales.

## Ejecución automatizada local

Desde `frontend`, con Docker Desktop o Docker Engine y Docker Compose v2.24+ instalados:

```powershell
npm run test:e2e:real:local
```

El comando crea un proyecto Compose con nombre aleatorio, una base MySQL y servicios/backend propios, espera al Gateway, crea un ADMIN, un DOCTOR, un PACIENTE y un horario sintéticos mediante la API, ejecuta el E2E y elimina únicamente ese proyecto y su volumen desechable. No usa `.env`, contenedores ni volúmenes del Compose normal. La migración V4 se aplica al arrancar el servicio de citas.

## Requisitos para ejecución contra un backend ya levantado

- Backend completo levantado y accesible desde la máquina que ejecuta Playwright.
- Base de pruebas migrada, incluida la migración de citas V4.
- Cuenta PATIENT de prueba activa con permisos para reservar.
- Al menos un horario público futuro que empiece dentro de más de tres minutos.
- Node y dependencias del frontend instaladas; Playwright Chromium instalado.

## Ejecución en PowerShell

Desde `frontend`:

```powershell
$env:E2E_TEST_DATABASE = "YES"
$env:E2E_PATIENT_EMAIL = "patient-e2e@example.test"
$env:E2E_PATIENT_PASSWORD = "<password-de-prueba>"
$env:E2E_API_PROXY_TARGET = "http://127.0.0.1:9013"
npm run test:e2e:real
```

`E2E_API_PROXY_TARGET` puede apuntar al Gateway de otro entorno de pruebas alcanzable por la máquina. El dev server temporal de Vite hará proxy de `/api` hacia ese Gateway.

El test busca automáticamente un médico y horario público; no requiere IDs fijos. Los nuevos registros usan motivos con un UUID para distinguirlos. Las cancelaciones quedan en el historial de la base de pruebas.
