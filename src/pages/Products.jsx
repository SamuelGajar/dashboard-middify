import { useState, useMemo, useCallback, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useProducts } from "../api/products/getProducts";
import { postExportProducts } from "../api/products/postExportProducts";
import { Snackbar, Alert } from "@mui/material";
import ProductsTableHeader from "../components/products/productsTableHeadeer";
import ProductsTableGrid from "../components/products/ProductsTableGrid";

const Products = () => {
    const { token, selectedTenantId, selectedTenantName, user, resolvedProductState } = useOutletContext() || {};

    const [isExporting, setIsExporting] = useState(false);
    const [selectedRowIds, setSelectedRowIds] = useState(() => new Set());
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "info",
    });

    const { products, loading, error } = useProducts(
        token,
        selectedTenantId,
        selectedTenantName,
        refreshTrigger,
        resolvedProductState
    );

    const filteredProducts = useMemo(() => {
        if (!Array.isArray(products?.products)) {
            return [];
        }

        return products.products.filter((product) => {
            if (resolvedProductState) {
                const targetState = resolvedProductState === "descartada" ? "discard" : resolvedProductState;
                return product.state === targetState;
            }
            return product.state !== "discard";
        });
    }, [products?.products, resolvedProductState]);

    const rows = useMemo(() => {
        return filteredProducts.map((product, index) => ({
              id: product._id || index,
              ...product,
        }));
    }, [filteredProducts]);

    const handleToggleRowSelection = useCallback((rowId) => {
        setSelectedRowIds((prevSelected) => {
            const nextSelected = new Set(prevSelected);
            if (nextSelected.has(rowId)) {
                nextSelected.delete(rowId);
            } else {
                nextSelected.add(rowId);
            }
            return nextSelected;
        });
    }, []);

    useEffect(() => {
        setSelectedRowIds((prevSelected) => {
            const nextSelected = new Set();
            rows.forEach((row) => {
                if (prevSelected.has(row.id)) {
                    nextSelected.add(row.id);
                }
            });
            return nextSelected;
        });
    }, [rows]);

    const handleToggleAllRows = useCallback(() => {
        setSelectedRowIds((prevSelected) => {
            const allRowIds = rows.map((row) => row.id);
            if (allRowIds.every((id) => prevSelected.has(id))) {
                return new Set();
            }
            return new Set(allRowIds);
        });
    }, [rows]);

    const getSelectedProductIds = useCallback(() => {
        const selectedIds = [];
        rows.forEach((row) => {
            if (selectedRowIds.has(row.id)) {
                selectedIds.push(row._id || row.id);
            }
        });
        return selectedIds;
    }, [rows, selectedRowIds]);

    const clearSelection = useCallback(() => {
        setSelectedRowIds(new Set());
    }, []);

    const refreshData = useCallback(() => {
        setRefreshTrigger((prev) => prev + 1);
    }, []);

    const handleExportProducts = async () => {
        if (!token) return;

        setIsExporting(true);
        try {
            const body = {
                tenantId: selectedTenantId || null,
                tenantName: selectedTenantName || null,
            };

            const response = await postExportProducts(token, body);

            if (response?.message) {
                setSnackbar({
                    open: true,
                    message: response.message,
                    severity: "success",
                });
            }
        } catch (err) {
            setSnackbar({
                open: true,
                message: "Error al exportar productos. Por favor intenta de nuevo.",
                severity: "error",
            });
        } finally {
            setIsExporting(false);
        }
    };

    const selectedCount = selectedRowIds.size;

    const infoChips =
        filteredProducts && filteredProducts.length > 0
        ? [
              {
                  id: "total",
                  label: "Total",
                      value: filteredProducts.length,
              },
          ]
        : [];

    if (error && !loading) {
        return (
            <div className="px-6 py-12 text-center text-sm text-red-500">
                Error al cargar los productos: {error.message}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <ProductsTableHeader
                title="Productos"
                subtitle={
                    selectedTenantName
                        ? `Productos de ${selectedTenantName}`
                        : "Gestión de productos del inventario"
                }
                infoChips={infoChips}
                onExportData={handleExportProducts}
                isExportingData={isExporting}
                exportDisabled={loading || !products?.products?.length}
                selectedCount={selectedCount}
                getSelectedProductIds={getSelectedProductIds}
                token={token}
                user={user}
                tenantId={selectedTenantId}
                tenantName={selectedTenantName}
                onDeleteSuccess={() => {
                    refreshData();
                    clearSelection();
                }}
            />

            <ProductsTableGrid
                rows={rows}
                loading={loading}
                error={error}
                selectedRowIds={selectedRowIds}
                onToggleRowSelection={handleToggleRowSelection}
                onToggleAllRows={handleToggleAllRows}
            />

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert
                    onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                    severity={snackbar.severity}
                    sx={{ width: "100%" }}
                    variant="filled"
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default Products;
