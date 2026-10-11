import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { DASHBOARD_CONFIG, isValidRole, validateRoleChange } from '../../constants/roles.ts'
import DashboardLayout from '../../components/layout/DashboardLayout.tsx'
import { ROUTES } from '../../constants/routes.ts'
import { changeUserRole, getUsers } from '../../services/users.service.ts'
import type { User } from '../../types/user.ts'

function Roles() {
  const [users, setUsers] = useState<User[]>(getUsers())
  const [query, setQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedRole, setSelectedRole] = useState('')
  const [roleError, setRoleError] = useState('')
  const [confirmationOpen, setConfirmationOpen] = useState(false)

  useEffect(() => { document.title = 'Roles y permisos | MediReservas' }, [])
  useEffect(() => {
    document.body.classList.toggle('overflow-hidden', Boolean(selectedUser))
    return () => document.body.classList.remove('overflow-hidden')
  }, [selectedUser])

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return users.filter((user) => `${user.firstName} ${user.lastName} ${user.run} ${user.email}`.toLowerCase().includes(normalizedQuery))
  }, [query, users])

  function openRoleDialog(user: User) {
    setSelectedUser(user); setSelectedRole(user.role); setRoleError(''); setConfirmationOpen(false)
  }
  function closeDialog() { setSelectedUser(null); setConfirmationOpen(false); setRoleError('') }
  function requestRoleChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedUser) return
    const error = validateRoleChange(selectedUser.role, selectedRole)
    setRoleError(error)
    if (!error) setConfirmationOpen(true)
  }
  function confirmRoleChange() {
    if (!selectedUser || !isValidRole(selectedRole)) return
    changeUserRole(selectedUser.userId, selectedRole)
    setUsers(getUsers()); closeDialog()
  }

  return (
    <DashboardLayout currentPath={ROUTES.roles}>
      <section className="mx-auto max-w-7xl" aria-labelledby="roles-title">
            <header><p className="text-sm font-bold uppercase tracking-widest text-primary">Administración</p><h1 className="mt-3 text-3xl font-bold sm:text-4xl" id="roles-title">Roles y permisos</h1><p className="mt-3 text-muted">Asigna a cada usuario el perfil que corresponda a sus funciones.</p></header>
            <aside className="mt-8 rounded-2xl border border-emerald-200 bg-primary-light p-5 sm:p-6" aria-labelledby="roles-information-title"><h2 className="font-bold text-primary-dark" id="roles-information-title">Perfiles disponibles</h2><ul className="mt-4 grid gap-3 text-sm text-muted sm:grid-cols-2"><li><strong className="text-ink">Administrador:</strong> acceso a la configuración y gestión completa.</li><li><strong className="text-ink">Recepcionista:</strong> gestión de solicitudes y estados de citas.</li><li><strong className="text-ink">Médico:</strong> acceso a agenda, pacientes y observaciones clínicas.</li><li><strong className="text-ink">Paciente:</strong> reserva y consulta de sus propias atenciones.</li></ul></aside>
            <form className="mt-8 rounded-2xl border border-line bg-white p-5 shadow-sm" role="search" onSubmit={(event) => event.preventDefault()}><label className="block text-sm font-semibold">Buscar usuario<input className="mt-2 w-full rounded-xl border border-line px-4 py-3 font-normal outline-none focus:border-primary" type="search" placeholder="Nombre, RUN o correo" value={query} onChange={(event) => setQuery(event.target.value)} /></label></form>
            <p className="mt-6 text-sm font-medium text-muted" aria-live="polite">{filteredUsers.length} {filteredUsers.length === 1 ? 'usuario encontrado' : 'usuarios encontrados'}</p>
            {filteredUsers.length ? <div className="mt-3 overflow-x-auto rounded-2xl border border-line bg-white shadow-sm"><table className="w-full min-w-3xl text-left"><thead className="border-b border-line bg-page text-xs uppercase tracking-wider text-muted"><tr>{['Usuario', 'RUN', 'Correo', 'Rol actual', 'Acción'].map((heading) => <th className={`px-5 py-4 font-semibold ${heading === 'Acción' ? 'text-right' : ''}`} key={heading}>{heading}</th>)}</tr></thead><tbody>
              {filteredUsers.map((user) => <tr className="border-b border-line last:border-0" key={user.userId}><td className="px-5 py-4 font-semibold">{user.firstName} {user.lastName}</td><td className="px-5 py-4">{user.run}</td><td className="px-5 py-4">{user.email}</td><td className="px-5 py-4">{DASHBOARD_CONFIG[user.role].label}</td><td className="px-5 py-4 text-right"><button className="rounded-lg border border-line px-3 py-2 text-sm font-semibold text-primary-dark hover:bg-primary-light" type="button" onClick={() => openRoleDialog(user)}>Cambiar rol</button></td></tr>)}
            </tbody></table></div> : <p className="mt-6 rounded-2xl border border-line bg-white p-8 text-center text-muted">No se encontraron usuarios con ese criterio.</p>}
      </section>

      {selectedUser && !confirmationOpen && <div className="fixed inset-0 z-60 grid place-items-center bg-slate-950/55 p-4" role="dialog" aria-modal="true" aria-labelledby="role-dialog-title"><form className="w-full max-w-lg rounded-3xl bg-white p-5 shadow-xl sm:p-8" noValidate onSubmit={requestRoleChange}>
        <header className="flex justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-widest text-primary">Permisos del usuario</p><h2 className="mt-2 text-2xl font-bold" id="role-dialog-title">Asignar rol</h2></div><button className="grid size-10 shrink-0 place-items-center rounded-xl border border-line text-xl" type="button" onClick={closeDialog}>×</button></header>
        <dl className="mt-6 grid gap-4 rounded-xl bg-page p-4 sm:grid-cols-2"><div><dt className="text-xs font-medium uppercase text-muted">Usuario</dt><dd className="mt-1 font-semibold">{selectedUser.firstName} {selectedUser.lastName}</dd></div><div><dt className="text-xs font-medium uppercase text-muted">Correo</dt><dd className="mt-1 break-words text-sm font-semibold">{selectedUser.email}</dd></div></dl>
        <label className="mt-6 block text-sm font-semibold">Nuevo rol<select className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 font-normal outline-none focus:border-primary" value={selectedRole} aria-invalid={Boolean(roleError)} onChange={(event) => { setSelectedRole(event.target.value); setRoleError('') }}><option value="">Selecciona un rol</option><option value="ADMIN">Administrador</option><option value="RECEPTIONIST">Recepcionista</option><option value="DOCTOR">Médico</option><option value="PATIENT">Paciente</option></select><span className="mt-1.5 block min-h-5 font-normal text-red-600">{roleError}</span></label>
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">El cambio modificará las funciones disponibles para este usuario.</p><footer className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button className="rounded-xl border border-line px-5 py-3 font-semibold text-muted" type="button" onClick={closeDialog}>Cancelar</button><button className="rounded-xl bg-primary px-5 py-3 font-semibold text-white" type="submit">Guardar rol</button></footer>
      </form></div>}

      {selectedUser && confirmationOpen && isValidRole(selectedRole) && <div className="fixed inset-0 z-60 grid place-items-center bg-slate-950/55 p-4" role="alertdialog" aria-modal="true" aria-labelledby="confirmation-title"><section className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl sm:p-8"><p className="text-sm font-bold uppercase tracking-widest text-primary">Confirmar cambio</p><h2 className="mt-2 text-2xl font-bold" id="confirmation-title">Asignar nuevo rol</h2><p className="mt-4 leading-7 text-muted">¿Confirmas la asignación del rol <strong className="text-ink">{DASHBOARD_CONFIG[selectedRole].label}</strong> a {selectedUser.firstName} {selectedUser.lastName}?</p><footer className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button className="rounded-xl border border-line px-5 py-3 font-semibold text-muted" type="button" onClick={() => setConfirmationOpen(false)}>Volver</button><button className="rounded-xl bg-primary px-5 py-3 font-semibold text-white" type="button" onClick={confirmRoleChange}>Confirmar cambio</button></footer></section></div>}

    </DashboardLayout>
  )
}

export default Roles
