import { useLocation, useNavigate } from "react-router-dom";
import type { AppRole } from "../routes/types";
import type { NavKey } from "../types";

interface RoleNavigation {
  activePage: NavKey;
  onNavigate: (page: NavKey) => void;
}

/**
 * Menurunkan halaman aktif dari URL (/<role>/<halaman>) dan
 * menyediakan fungsi navigasi, sehingga layout tidak perlu menerima props.
 */
export function useRoleNavigation(role: AppRole): RoleNavigation {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const segments = pathname.split("/").filter(Boolean);
  const activePage = (segments[1] ?? "dashboard") as NavKey;

  const onNavigate = (page: NavKey): void => {
    navigate(`/${role}/${page}`);
  };

  return { activePage, onNavigate };
}