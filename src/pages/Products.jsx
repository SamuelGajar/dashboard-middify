import { useState } from "react";
import { useAuth } from "react-oidc-context";
import { useOutletContext } from "react-router-dom";
import { useProducts } from "../api/products/getProducts";
import { postExportProducts } from "../api/products/postExportProducts";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import ProductsTableHeader from "../components/products/productsTableHeadeer";

const NoRowsOverlay = () => (
    <div className="flex h-full items-center justify-center text-sm text-slate-500">
        No hay productos disponibles.
    </div>
);

const Products = () => {
    const auth = useAuth();
    const token = auth.user?.id_token;
    const { selectedTenantId, selectedTenantName } = useOutletContext() || {};

    const { products, loading, error } = useProducts(
        token,
        selectedTenantId,
        selectedTenantName
    );

    const [isExporting, setIsExporting] = useState(false);

    const columns = [
        { field: "sku", headerName: "SKU", width: 150 },
        { field: "name", headerName: "Nombre", width: 250 },
        { field: "tenantName", headerName: "Tenant", width: 150 },
        { field: "warehouse", headerName: "Bodega", width: 150 },
        { field: "quantity", headerName: "Cantidad", width: 100, type: "number" },
        { field: "price", headerName: "Precio", width: 100, type: "number" },
        { field: "state", headerName: "Estado", width: 120 },
        { field: "sync", headerName: "Sincronizado", width: 120, type: "boolean" },
    ];

    const rows = Array.isArray(products?.products)
        ? products.products.map((product, index) => ({
              id: product._id || index,
              ...product,
          }))
        : [];

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
                alert(response.message);
            }
        } catch (err) {
            alert("Error al exportar productos. Por favor intenta de nuevo.");
        } finally {
            setIsExporting(false);
        }
    };

    const infoChips = products
        ? [
              {
                  id: "total",
                  label: "Total",
                  value: products.total || 0,
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
            />

            <div className="p-4">
                <div className="overflow-x-auto">
                    <div className="mx-auto w-full min-w-full md:min-w-[70rem] max-w-full lg:max-w-[94rem]">
                        <Paper
                            elevation={0}
                            sx={{
                                width: "100%",
                                borderRadius: "16px",
                                boxShadow: "none",
                                overflow: "hidden",
                            }}
                        >
                            <DataGrid
                                rows={rows}
                                columns={columns}
                                loading={loading}
                                autoHeight
                                paginationMode="client"
                                initialState={{
                                    pagination: {
                                        paginationModel: { pageSize: 25, page: 0 },
                                    },
                                }}
                                pageSizeOptions={[25, 50, 100]}
                                disableRowSelectionOnClick
                                disableColumnMenu
                                disableColumnSelector
                                disableDensitySelector
                                localeText={{
                                    footerPaginationRowsPerPage: "Filas por página:",
                                }}
                                slots={{
                                    noRowsOverlay: NoRowsOverlay,
                                }}
                                sx={{
                                    border: 0,
                                    "--DataGrid-containerBackground": "transparent",
                                    "& .MuiDataGrid-columnHeaders": {
                                        backgroundColor: "#f8fafc",
                                    },
                                    "& .MuiDataGrid-columnHeaderTitle": {
                                        fontWeight: 600,
                                        fontSize: "0.75rem",
                                        letterSpacing: "0.08em",
                                        textTransform: "uppercase",
                                        color: "#475569",
                                    },
                                    "& .MuiDataGrid-row:hover": {
                                        backgroundColor: "#eaf8ff",
                                    },
                                    "& .MuiDataGrid-cell": {
                                        borderBottomColor: "#e2e8f0",
                                    },
                                    "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": {
                                        outline: "none",
                                    },
                                }}
                            />
                        </Paper>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Products;
