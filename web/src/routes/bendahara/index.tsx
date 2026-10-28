import { canRoleAccessPage } from '../config'
import RoutePage, { RoleRouteFallback } from '../shared/RoutePage'
import type { RoleRouteProps } from '../types'

export default function BendaharaRoutes(props: RoleRouteProps) {
  if (!canRoleAccessPage('bendahara', props.activePage)) {
    return <RoleRouteFallback role="bendahara" onNavigate={props.onNavigate} />
  }
  return <RoutePage role="bendahara" {...props} />
}
