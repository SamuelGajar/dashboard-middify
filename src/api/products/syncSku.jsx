const API_URL =
    "https://957chi25kf.execute-api.us-east-2.amazonaws.com/dev/syncSku";

/**
 * Sincroniza SKUs de productos
 * @param {Object} params
 * @param {string} params.token - Token de autenticación
 * @param {string} params.tenantId - ID del tenant
 * @param {string} params.tenantName - Nombre del tenant
 * @param {Array<string>} params.skus - Array de SKUs a sincronizar
 * @param {AbortSignal} params.signal - Señal de aborto
 */
export const postSyncSku = async ({
    token,
    tenantId,
    tenantName,
    skus,
    signal,
} = {}) => {
    if (!token) {
        throw new Error("Token de autenticación no proporcionado.");
    }

    if (!tenantId) {
        throw new Error("Se requiere el ID del tenant.");
    }

    if (!tenantName) {
        throw new Error("Se requiere el nombre del tenant.");
    }

    if (!skus || !Array.isArray(skus) || skus.length === 0) {
        throw new Error("Se requiere al menos un SKU para sincronizar.");
    }

    // Validar que todos los SKUs sean strings no vacíos
    skus.forEach((sku, index) => {
        if (!sku || typeof sku !== "string" || sku.trim() === "") {
            throw new Error(`SKU ${index + 1}: Debe ser un valor no vacío`);
        }
    });

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                tenantId,
                tenantName,
                skus: skus.map((sku) => sku.trim()),
            }),
            signal,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                errorData.error ||
                    errorData.message ||
                    `Error ${response.status}: ${response.statusText}`
            );
        }

        return response.json();
    } catch (error) {
        // Si es un error de red, proporcionar más información
        if (error.name === "TypeError" && error.message === "Failed to fetch") {
            throw new Error(
                "Error de conexión. Verifica tu conexión a internet y que el servidor esté disponible."
            );
        }
        // Re-lanzar otros errores
        throw error;
    }
};

