import { Navigate, Route, Routes } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import AuthGuard from '../guards/AuthGuard'
import RoleGuard from '../guards/RoleGuard'
import { routeConfig, type AppRoute } from './routeConfig'

function getRouteElement({ component: Page, requiresAuth, allowedRoles }: AppRoute) {
  const page = <Page />

  if (allowedRoles) return <RoleGuard allowedRoles={allowedRoles}>{page}</RoleGuard>
  if (requiresAuth) return <AuthGuard>{page}</AuthGuard>
  return page
}

function AppRoutes() {
  return (
    <Routes>
      {routeConfig.map((route) => (
        <Route key={route.path} path={route.path} element={getRouteElement(route)} />
      ))}
      <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
    </Routes>
  )
}

export default AppRoutes
