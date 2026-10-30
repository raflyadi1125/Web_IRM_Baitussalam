import { canRoleAccessPage } from '../config'
import RoutePage, { RoleRouteFallback } from '../shared/RoutePage'
import type { RoleRouteProps } from '../types'

export default function SekretarisRoutes(props: RoleRouteProps) {
  if (!canRoleAccessPage('sekretaris', props.activePage)) {
    return <RoleRouteFallback role="sekretaris" onNavigate={props.onNavigate} />
  }
  return <RoutePage role="sekretaris" {...props} />
}
