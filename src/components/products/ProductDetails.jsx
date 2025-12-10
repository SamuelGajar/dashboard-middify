import React, { useEffect, useState } from 'react';
import PropTypes from "prop-types";
import {
    CircularProgress,
    Box,
    Typography,
    Tab,
    Tabs,
    Paper,
    IconButton,
    Chip
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getProductDetails } from "../../api/products/getProductDetails";
import GeneralTab from './details/GeneralTab';
import StockTab from './details/StockTab';
import StatusTab from './details/StatusTab';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined';

const TABS = [
    { id: "general", label: "Detalle General", icon: <Inventory2OutlinedIcon /> },
    { id: "stock", label: "Historial de Stock", icon: <TimelineOutlinedIcon /> },
    { id: "status", label: "Historial de Estados", icon: <HistoryOutlinedIcon /> },
];

const ProductDetails = ({ productId, token, onClose }) => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(TABS[0].id);

    useEffect(() => {
        const fetchProductDetails = async () => {
            if (!productId || !token) return;

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
    }, [productId, token]);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress size={40} thickness={4} sx={{ color: '#6366f1' }} />
            </Box>
        );
    }

    if (error) {
        return (
            <div className="mx-6 mt-6 rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-600 shadow-sm">
                <strong className="font-bold">Error:</strong> {error}
            </div>
        );
    }

    if (!product) {
        return (
             <div className="px-6 py-12 text-center text-slate-500">
                <Typography variant="body1">No se encontró el producto o no se ha seleccionado ninguno.</Typography>
                <button
                    onClick={onClose}
                    className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium underline"
                >
                    Volver
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 w-full h-[calc(100vh-8rem)]">
            {/* Header Section */}
            <div className="flex-none flex items-center gap-5 px-1">
                <IconButton 
                    onClick={onClose} 
                    sx={{ 
                        bgcolor: 'white', 
                        border: '1px solid', 
                        borderColor: '#e2e8f0',
                        width: 44,
                        height: 44,
                        borderRadius: '12px',
                        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                        '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1', transform: 'translateY(-1px)' },
                        transition: 'all 0.2s'
                    }}
                >
                    <ArrowBackIcon fontSize="small" className="text-slate-600" />
                </IconButton>
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1.5">
                        <Typography variant="h5" className="font-bold text-slate-800 tracking-tight">
                            {product.name}
                        </Typography>
                        <Chip 
                            label={product.state === 'active' ? 'Activo' : product.estado || 'Desconocido'} 
                            size="small" 
                            sx={{
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                fontSize: '0.65rem',
                                letterSpacing: '0.05em',
                                height: 24,
                                bgcolor: product.state === 'active' ? '#dcfce7' : '#f1f5f9',
                                color: product.state === 'active' ? '#166534' : '#64748b',
                                border: '1px solid',
                                borderColor: product.state === 'active' ? '#bbf7d0' : '#e2e8f0'
                            }}
                        />
                    </div>
                    <Typography variant="body2" className="text-slate-500 flex items-center gap-2">
                        <span className="font-mono bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-600 text-xs shadow-sm">
                            ID: {productId}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="font-medium">{product.brand || 'Sin Marca'}</span>
                    </Typography>
                </div>
            </div>

            <Paper 
                elevation={0} 
                className="flex-1 flex flex-col rounded-[24px] border border-slate-200/60 overflow-hidden bg-white shadow-xl shadow-slate-200/40 min-h-0"
            >
                <Box sx={{ p: 2, bgcolor: 'white', borderBottom: '1px solid', borderColor: '#f1f5f9' }}>
                    <Tabs 
                        value={activeTab} 
                        onChange={handleTabChange}
                        variant="scrollable"
                        scrollButtons="auto"
                        aria-label="product details tabs"
                        sx={{
                            minHeight: 'auto',
                            '& .MuiTabs-indicator': {
                                display: 'none',
                            },
                            '& .MuiTabs-flexContainer': {
                                gap: 1.5
                            },
                            '& .MuiTab-root': {
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                minHeight: 44,
                                px: 2.5,
                                borderRadius: '12px',
                                color: '#64748b',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                border: '1px solid transparent',
                                '&.Mui-selected': {
                                    color: '#4f46e5',
                                    backgroundColor: '#eef2ff',
                                    borderColor: '#e0e7ff',
                                },
                                '&:hover:not(.Mui-selected)': {
                                    backgroundColor: '#f8fafc',
                                    color: '#334155',
                                    borderColor: '#e2e8f0'
                                }
                            }
                        }}
                    >
                        {TABS.map((tab) => (
                            <Tab 
                                key={tab.id} 
                                label={tab.label} 
                                value={tab.id} 
                                icon={tab.icon} 
                                iconPosition="start"
                                disableRipple
                            />
                        ))}
                    </Tabs>
                </Box>

                <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-[#fafbfc]">
                    <div className="max-w-7xl mx-auto">
                        {activeTab === "general" && (
                            <GeneralTab product={product} />
                        )}

                        {activeTab === "stock" && (
                            <StockTab history={product.historialStock} />
                        )}

                        {activeTab === "status" && (
                            <StatusTab history={product.historialEstados} />
                        )}
                    </div>
                </div>
            </Paper>
        </div>
    );
};

ProductDetails.propTypes = {
    productId: PropTypes.string,
    token: PropTypes.string,
    onClose: PropTypes.func,
};

export default ProductDetails;
