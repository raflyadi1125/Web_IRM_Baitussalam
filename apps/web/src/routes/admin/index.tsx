import { canRoleAccessPage } from '../config'
import RoutePage, { RoleRouteFallback } from '../shared/RoutePage'
import type { RoleRouteProps } from '../types'

export default function AdminRoutes(props: RoleRouteProps) {
  if (!canRoleAccessPage('admin', props.activePage)) {
    return <RoleRouteFallback role="admin" onNavigate={props.onNavigate} />
  }
  return <RoutePage role="admin" {...props} />
}
