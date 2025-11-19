// api/users.js
const BASE_URL = "https://957chi25kf.execute-api.us-east-2.amazonaws.com/dev";

async function callApi({ url, method = "GET", token, body }) {
  if (!token) throw new Error("Falta token");

  const options = {
    method,
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  if (body) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const payload = await response.json().catch(() => null);

  if (!response.ok || payload?.ok === false) {
    throw new Error(payload?.message || payload?.error || `Error ${response.status}`);
  }

  return payload;
}

export async function fetchUsers({ token, search, tenant, role, page = 1, pageSize = 25 }) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (tenant) params.set("tenant", tenant);
  if (role) params.set("role", role);
  params.set("page", page);
  params.set("pageSize", pageSize);

  return callApi({
    url: `${BASE_URL}/users/admin?${params.toString()}`,
    token
  });
}

export async function updateUserTenants({ token, userId, tenantsToAssign, tenantsToRemove, mode, tenants }) {
  const body = { userId };

  if (mode === "replace") {
    body.mode = "replace";
    body.tenants = tenants || [];
  } else {
    if (Array.isArray(tenantsToAssign)) body.tenantsToAssign = tenantsToAssign;
    if (Array.isArray(tenantsToRemove)) body.tenantsToRemove = tenantsToRemove;
  }

  return callApi({
    url: `${BASE_URL}/users/tenants`,
    method: "PATCH",
    token,
    body
  });
}