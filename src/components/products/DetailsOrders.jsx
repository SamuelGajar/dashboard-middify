import React, { useEffect, useState } from 'react';
import PropTypes from "prop-types";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Typography,
    Box,
    CircularProgress
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { getProductDetails } from "../../api/products/getProductDetails";

const ProductDetailsModal = ({ open, onClose, productId, token }) => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProductDetails = async () => {
            if (!productId || !token || !open) return;

            try {
                setLoading(true);
                setError(null);
                setProduct(null);

                const data = await getProductDetails(token, productId);
                setProduct(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProductDetails();
    }, [productId, token, open]);

    if (!open) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 2, minHeight: "50vh" }
            }}
        >
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" component="div">
                    Detalle del Producto
                </Typography>
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                {loading && (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                        <CircularProgress />
                    </Box>
                )}

                {error && (
                    <div className="text-red-500 text-center p-4">Error: {error}</div>
                )}

                {!loading && !error && !product && (
                    <div className="text-center p-4">No se encontró el producto</div>
                )}

                {!loading && !error && product && (
                    <div className="p-2">
                        <h2 className="text-xl font-bold mb-4 text-slate-800">{product.name}</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="space-y-2">
                                <p className="text-slate-700"><strong>SKU:</strong> {product.sku}</p>
                                <p className="text-slate-700"><strong>Marca:</strong> {product.brand || '-'}</p>
                                <p className="text-slate-700"><strong>ID Origen:</strong> {product.idOrigen}</p>
                                <p className="text-slate-700"><strong>Estado:</strong> {product.estado}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-slate-700"><strong>Stock Actual:</strong> {product.stockNuevo}</p>
                                <p className="text-slate-700"><strong>Ingreso Middify:</strong> {new Date(product.ingresoMiddify).toLocaleString()}</p>
                                <p className="text-slate-700"><strong>Actualización:</strong> {new Date(product.actualizacion).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="font-bold mb-2 text-slate-800">Historial de Stock</h3>
                            {product.historialStock?.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left border-collapse">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="p-2 border-b">Fecha</th>
                                                <th className="p-2 border-b">Operación</th>
                                                <th className="p-2 border-b">Anterior</th>
                                                <th className="p-2 border-b">Nuevo</th>
                                                <th className="p-2 border-b">Usuario</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {product.historialStock.map((log, index) => (
                                                <tr key={index} className="border-b hover:bg-gray-50">
                                                    <td className="p-2">{new Date(log.fecha).toLocaleString()}</td>
                                                    <td className="p-2">{log.operacion}</td>
                                                    <td className="p-2">{log.stockAnterior}</td>
                                                    <td className="p-2">{log.stockNuevo}</td>
                                                    <td className="p-2">{log.usuario}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-gray-500">No hay movimientos de stock.</p>
                            )}
                        </div>

                        <div>
                            <h3 className="font-bold mb-2 text-slate-800">Historial de Estados</h3>
                            {product.historialEstados?.length > 0 ? (
                                <ul className="list-disc pl-5 space-y-1">
                                    {product.historialEstados.map((log, index) => (
                                        <li key={index} className="text-sm text-slate-700">
                                            <span className="font-semibold">{new Date(log.fecha).toLocaleString()}:</span> {log.mensaje} ({log.usuario})
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500">No hay cambios de estado.</p>
                            )}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

ProductDetailsModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    productId: PropTypes.string,
    token: PropTypes.string,
};

export default ProductDetailsModal;
