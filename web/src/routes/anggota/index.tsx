import { canRoleAccessPage } from '../config'
import RoutePage, { RoleRouteFallback } from '../shared/RoutePage'
import type { RoleRouteProps } from '../types'

export default function AnggotaRoutes(props: RoleRouteProps) {
  if (!canRoleAccessPage('anggota', props.activePage)) {
    return <RoleRouteFallback role="anggota" onNavigate={props.onNavigate} />
  }
  return <RoutePage role="anggota" {...props} />
}
