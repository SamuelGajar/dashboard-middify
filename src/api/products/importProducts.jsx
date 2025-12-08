const API_URL =
    "https://957chi25kf.execute-api.us-east-2.amazonaws.com/dev/importProducts";

/**
 * Importa stock de productos
 * @param {Object} params
 * @param {string} params.token - Token de autenticación
 * @param {string} params.tenantId - ID del tenant
 * @param {string} params.tenantName - Nombre del tenant
 * @param {Array} params.products - Array de productos a importar
 * @param {string} params.products[].SKUSIMPLE - SKU del producto
 * @param {number} params.products[].STOCK - Cantidad de stock
 * @param {string} params.products[].TIPO_OPERACION - AGREGAR_STOCK | DESCONTAR_STOCK | CARGA_COMPLETA
 * @param {string} params.products[].MARCA - Warehouse/Bodega
 * @param {AbortSignal} params.signal - Señal de aborto
 */
export const postImportProducts = async ({
    token,
    tenantId,
    tenantName,
    products,
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

    if (!products || !Array.isArray(products) || products.length === 0) {
        throw new Error("Se requiere al menos un producto para importar.");
    }

    // Validar estructura de productos
    products.forEach((product, index) => {
        if (!product.SKUSIMPLE) {
            throw new Error(`Producto ${index + 1}: Se requiere el campo SKUSIMPLE`);
        }
        if (typeof product.STOCK !== "number") {
            throw new Error(`Producto ${index + 1}: Se requiere el campo STOCK como número`);
        }
        if (!product.TIPO_OPERACION) {
            throw new Error(
                `Producto ${index + 1}: Se requiere el campo TIPO_OPERACION`
            );
        }
        if (!["AGREGAR_STOCK", "DESCONTAR_STOCK", "CARGA_COMPLETA"].includes(product.TIPO_OPERACION)) {
            throw new Error(
                `Producto ${index + 1}: TIPO_OPERACION debe ser AGREGAR_STOCK, DESCONTAR_STOCK o CARGA_COMPLETA`
            );
        }
        if (!product.MARCA) {
            throw new Error(`Producto ${index + 1}: Se requiere el campo MARCA (warehouse)`);
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
                products,
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



