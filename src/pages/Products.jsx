import { useAuth } from "react-oidc-context";
import { useProducts } from "../api/products/getProducts";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";

const NoRowsOverlay = () => (
    <div className="flex h-full items-center justify-center text-sm text-slate-500">
        No hay productos disponibles.
    </div>
);

const Products = () => {
    const auth = useAuth();
    const token = auth.user?.id_token;
    const { products, loading, error } = useProducts(token);

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

    const rows = products?.products?.map((product) => ({
        id: product._id,
        ...product,
    })) || [];

    if (error && !loading) {
        return (
            <div className="px-6 py-12 text-center text-sm text-red-500">
                Error al cargar los productos: {error.message}
            </div>
        );
    }

    return (
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
    );
};

export default Products;
