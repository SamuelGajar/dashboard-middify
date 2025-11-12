import { useEffect, useMemo, useRef, useState } from "react";
import { useSignOut } from "../auth/useSignOut";

const getInitials = (fullName, email) => {
  if (fullName && typeof fullName === "string") {
    const trimmed = fullName.trim();
    if (!trimmed) {
      return null;
    }

    const parts = trimmed.split(/\s+/);
    if (parts.length === 1) {
      return parts[0][0]?.toUpperCase() ?? null;
    }

    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }

  if (email && typeof email === "string" && email.length > 0) {
    return email[0].toUpperCase();
  }

  return null;
};

const Navbar = ({ user }) => {
  const { signOut } = useSignOut();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const initials = useMemo(
    () => getInitials(user?.fullName, user?.email) ?? "US",
    [user?.fullName, user?.email]
  );

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleSignOut = async () => {
    setIsMenuOpen(false);
    await signOut();
  };

  return (
    <header className="w-full bg-white shadow-sm">
      <nav className="flex h-16 w-full justify-center px-4 sm:px-6 lg:px-8">
        <div className="flex w-full max-w-6xl items-center justify-end">
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={toggleMenu}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500 text-sm font-semibold text-white transition hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
            >
              {initials}
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 z-20 mt-3 w-68 rounded-xl border border-slate-100 bg-white p-4 shadow-lg">
                <div className="flex items-start gap-3 border-b border-slate-100 pb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500 text-base font-semibold text-white">
                    {initials}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-900">
                      {user?.fullName || "Usuario"}
                    </span>
                    <span className="text-xs text-slate-500">
                      {user?.email || "Sin correo disponible"}
                    </span>
                    <span className="mt-1 inline-flex w-fit rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600">
                      {user?.role || "Rol no definido"}
                    </span>
                  </div>
                </div>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center justify-center rounded-lg bg-indigo-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
