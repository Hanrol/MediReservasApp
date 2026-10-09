## Frontend de MediReservasApp

#### Ruta propuesta

```text
src/
├── app/
│   ├── App.tsx
│   └── router.tsx
├── components/
│   ├── layout/              # Layout público y layout privado
│   ├── navigation/          # Menús públicos y menú según rol
│   └── ui/                  # Controles reutilizados: Button, Input, etc.
├── contexts/
│   └── AuthContext.tsx
├── hooks/
│   └── useAuth.ts
├── pages/
│   ├── public/              # HomePage, ContactPage, DoctorsPage
│   ├── auth/                # LoginPage, RegisterPage, AccessDeniedPage
│   ├── shared/              # DashboardPage, ProfilePage, MedicalHistoryPage
│   ├── admin/               # UsersPage, RolesPage, AdminDoctorsPage, SpecialtiesPage
│   ├── receptionist/        # ManageAppointmentsPage
│   ├── doctor/              # AgendaPage, ClinicalObservationPage
│   └── patient/             # RequestAppointmentPage, MyAppointmentsPage
├── services/
│   ├── api.ts               # Configuración común para el API Gateway
│   ├── auth.ts
│   ├── appointments.ts
│   ├── doctors.ts
│   └── storage.ts           # Sesión en localStorage, si aún se necesita
├── utils/
│   └── validation.ts
├── data/
│   └── mockData.ts          # Temporal, mientras se usan datos simulados
├── assets/
├── index.css
└── main.tsx
```