import { useEffect, useMemo, useState } from "react";
import {
  fetchUsers,
  updateUserTenants,
} from "../../api/users/assignTenantToUser";

const getUserId = (user) =>
  user?.userId ?? user?.id ?? user?._id ?? user?.email ?? null;

const getUserLabel = (user) => {
  if (!user || typeof user !== "object") {
    return "Usuario desconocido";
  }
  return (
    user?.displayName ||
    user?.name ||
    user?.username ||
    user?.email ||
    getUserId(user) ||
    "Usuario sin nombre"
  );
};

const extractUsers = (payload) => {
  if (!payload) {
    return [];
  }
  if (Array.isArray(payload)) {
    return payload;
  }
  if (Array.isArray(payload?.users)) {
    return payload.users;
  }
  if (Array.isArray(payload?.data)) {
    return payload.data;
  }
  return [];
};

const StoreUsersTab = ({
  token = null,
  storeName = "Tienda",
  storeId = null,
}) => {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [feedback, setFeedback] = useState(null);

  const tenantEntry = useMemo(() => {
    const normalizedId =
      typeof storeId === "number" || typeof storeId === "string"
        ? String(storeId).trim()
        : "";
    const normalizedName =
      typeof storeName === "string" ? storeName.trim() : "";

    if (!normalizedId && !normalizedName) {
      return null;
    }

    return {
      tenantId: normalizedId,
      tenantName: normalizedName || normalizedId || "",
    };
  }, [storeId, storeName]);

  useEffect(() => {
    if (!token) {
      setFeedback({
        type: "error",
        message: "Necesitas iniciar sesión para gestionar usuarios.",
      });
      return;
    }

    const controller = new AbortController();
    let isMounted = true;

    const loadUsers = async () => {
      setLoadingUsers(true);
      setFeedback(null);
      try {
        const result = await fetchUsers({
          token,
          signal: controller.signal,
        });
        if (!isMounted) {
          return;
        }
        setUsers(extractUsers(result));
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }
        if (isMounted) {
          setFeedback({
            type: "error",
            message:
              error.message || "No se pudieron cargar los usuarios disponibles.",
          });
        }
      } finally {
        if (isMounted) {
          setLoadingUsers(false);
        }
      }
    };

    loadUsers();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [token]);

  const handleAssignTenant = async () => {
    if (!token) {
      setFeedback({
        type: "error",
        message: "Necesitas iniciar sesión.",
      });
      return;
    }
    if (!selectedUserId) {
      setFeedback({
        type: "error",
        message: "Selecciona un usuario antes de asignar.",
      });
      return;
    }
    if (!tenantEntry) {
      setFeedback({
        type: "error",
        message: "No se encontró una referencia válida del tenant.",
      });
      return;
    }

    setAssigning(true);
    setFeedback(null);
    try {
      await updateUserTenants({
        token,
        userId: selectedUserId,
        tenantsToAssign: [tenantEntry],
      });
      setFeedback({
        type: "success",
        message: `Tenant asignado correctamente al usuario.`,
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message || "No se pudo asignar el tenant.",
      });
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="space-y-4 p-3">
      <header>
        <h2 className="text-xl font-semibold text-slate-900">
          Usuarios asignados
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Gestiona qué usuarios tienen acceso al tenant{" "}
          <span className="font-semibold text-slate-800">{storeName}</span>.
        </p>
      </header>

      <section className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4 shadow-sm">
        <label className="text-sm font-medium text-slate-700">
          Selecciona un usuario
        </label>
        <select
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none"
          value={selectedUserId}
          disabled={loadingUsers || assigning || !token}
          onChange={(event) => setSelectedUserId(event.target.value)}
        >
          <option value="">
            {loadingUsers
              ? "Cargando usuarios..."
              : "Selecciona un usuario disponible"}
          </option>
          {users.map((user) => {
            const optionValue = getUserId(user);
            if (!optionValue) {
              return null;
            }
            return (
              <option key={optionValue} value={optionValue}>
                {getUserLabel(user)}
              </option>
            );
          })}
        </select>

        <button
          type="button"
          onClick={handleAssignTenant}
          disabled={
            assigning ||
            loadingUsers ||
            !selectedUserId ||
            !tenantEntry ||
            !token
          }
          className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
        >
          {assigning ? "Asignando..." : "Asignar tenant al usuario"}
        </button>

        {feedback?.message && (
          <p
            className={`text-sm ${
              feedback.type === "error" ? "text-red-600" : "text-green-600"
            }`}
          >
            {feedback.message}
          </p>
        )}
      </section>

    </div>
  );
};

export default StoreUsersTab;

