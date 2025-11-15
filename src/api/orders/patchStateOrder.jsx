const API_URL =
  "https://957chi25kf.execute-api.us-east-2.amazonaws.com/dev/patchStateOrder";

export const patchStateOrder = async ({
  token,
  ids,
  status,
  user,
  mailUser,
  signal,
} = {}) => {
  if (!token) {
    throw new Error("Token de autenticación no proporcionado.");
  }

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw new Error("Se requiere un array de ids no vacío.");
  }

  if (!status) {
    throw new Error("Se requiere el campo status.");
  }

  if (!user) {
    throw new Error("Se requiere el campo user.");
  }

  const response = await fetch(API_URL, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ids,
      status,
      user,
      mailUser: mailUser || null,
    }),
    signal,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `Error ${response.status}: ${response.statusText}`
    );
  }

  return response.json();
};

