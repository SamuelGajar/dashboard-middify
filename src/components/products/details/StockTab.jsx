import React from 'react';
import PropTypes from 'prop-types';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper, 
    Chip,
    Typography
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';

const StockTab = ({ history }) => {
    if (!history || history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <TrendingFlatIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                <Typography>No hay movimientos de stock registrados.</Typography>
            </div>
        );
    }

    const getTrendIcon = (prev, current) => {
        const diff = current - prev;
        if (diff > 0) return <TrendingUpIcon fontSize="small" className="text-emerald-500" />;
        if (diff < 0) return <TrendingDownIcon fontSize="small" className="text-red-500" />;
        return <TrendingFlatIcon fontSize="small" className="text-slate-400" />;
    };

    return (
        <TableContainer component={Paper} elevation={0} className="border border-slate-200 rounded-xl overflow-hidden">
            <Table sx={{ minWidth: 650 }} aria-label="historial stock table">
                <TableHead>
                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                        <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Fecha</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Operación</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, color: '#475569' }}>Anterior</TableCell>
                        <TableCell align="center" sx={{ width: 50 }}></TableCell>
                        <TableCell align="left" sx={{ fontWeight: 600, color: '#475569' }}>Nuevo</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Usuario</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {history.map((log, index) => {
                        const stockDiff = log.stockNuevo - log.stockAnterior;
                        return (
                            <TableRow
                                key={index}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: '#f1f5f9' } }}
                            >
                                <TableCell component="th" scope="row" className="text-slate-600">
                                    {new Date(log.fecha).toLocaleString()}
                                </TableCell>
                                <TableCell>
                                    <Chip 
                                        label={log.operacion} 
                                        size="small" 
                                        variant="outlined"
                                        className="capitalize font-medium bg-slate-50"
                                    />
                                </TableCell>
                                <TableCell align="right" className="text-slate-500 font-mono">
                                    {log.stockAnterior}
                                </TableCell>
                                <TableCell align="center">
                                    {getTrendIcon(log.stockAnterior, log.stockNuevo)}
                                </TableCell>
                                <TableCell align="left">
                                    <span className={`font-mono font-bold ${stockDiff > 0 ? 'text-emerald-600' : stockDiff < 0 ? 'text-red-600' : 'text-slate-700'}`}>
                                        {log.stockNuevo}
                                    </span>
                                </TableCell>
                                <TableCell className="text-slate-600">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                                            {log.usuario ? log.usuario.charAt(0).toUpperCase() : '?'}
                                        </div>
                                        <span className="text-sm">{log.usuario || 'Sistema'}</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

StockTab.propTypes = {
    history: PropTypes.array,
};

export default StockTab;
