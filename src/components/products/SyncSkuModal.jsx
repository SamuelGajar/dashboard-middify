import PropTypes from "prop-types";
import { useState } from "react";
import * as XLSX from "xlsx";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    CircularProgress,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DescriptionIcon from "@mui/icons-material/Description";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import SyncIcon from "@mui/icons-material/Sync";
import { postSyncSku } from "../../api/products/syncSku";
import { alertsProducts } from "../../utils/alertsProducts";

const SyncSkuModal = ({ open, onClose, token, tenantId, tenantName, onSyncSuccess }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [parsedData, setParsedData] = useState(null);
    const [parseError, setParseError] = useState(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncResult, setSyncResult] = useState(null);

    const parseFile = async (file) => {
        setParseError(null);
        setParsedData(null);

        try {
            const extension = file.name.split(".").pop().toLowerCase();

            if (extension === "json") {
                // Leer JSON
                const text = await file.text();
                const json = JSON.parse(text);

                // Validar que sea un array
                const skus = Array.isArray(json) ? json : [json];

                // Mapear a estructura esperada si tiene formato diferente
                const mapped = skus.map((item) => ({
                    SKU: item.SKU || item.sku || item.SKUSIMPLE || item.Sku || "",
                })).filter((item) => item.SKU); // Filtrar SKUs vacíos

                if (mapped.length === 0) {
                    throw new Error("No se encontraron SKUs válidos en el archivo.");
                }

                setParsedData(mapped);
            } else if (["xlsx", "xls", "csv"].includes(extension)) {
                // Leer Excel o CSV
                const data = await file.arrayBuffer();
                const workbook = XLSX.read(data, { type: "array" });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet);

                if (!jsonData || jsonData.length === 0) {
                    throw new Error("El archivo está vacío o no tiene datos válidos.");
                }

                // Mapear columnas (flexibilidad en nombres)
                const mapped = jsonData
                    .map((row, index) => {
                        const sku =
                            row.SKU ||
                            row.SKUSIMPLE ||
                            row.sku ||
                            row["SKU SIMPLE"] ||
                            row.Sku ||
                            "";

                        if (!sku) {
                            return null; // Filtrar filas sin SKU
                        }

                        return {
                            SKU: sku,
                        };
                    })
                    .filter((item) => item !== null); // Filtrar nulos

                if (mapped.length === 0) {
                    throw new Error("No se encontraron SKUs válidos en el archivo.");
                }

                setParsedData(mapped);
            } else {
                throw new Error("Formato de archivo no soportado. Usa .xlsx, .xls, .csv o .json");
            }
        } catch (error) {
            console.error("Error al parsear archivo:", error);
            setParseError(error.message);
            setParsedData(null);
        }
    };

    const handleFileSelect = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            parseFile(file);
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (event) => {
        event.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setIsDragging(false);
        const file = event.dataTransfer.files?.[0];
        if (file) {
            setSelectedFile(file);
            parseFile(file);
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setParsedData(null);
        setParseError(null);
        setSyncResult(null);
    };

    const handleClose = () => {
        setSelectedFile(null);
        setParsedData(null);
        setParseError(null);
        setSyncResult(null);
        onClose();
    };

    const handleSync = async () => {
        if (!parsedData || parsedData.length === 0) {
            alertsProducts.noDataToSync();
            return;
        }

        if (!token) {
            alertsProducts.noToken();
            return;
        }

        setIsSyncing(true);
        setSyncResult(null);

        try {
            const response = await postSyncSku({
                token,
                tenantId,
                tenantName,
                skus: parsedData.map((item) => item.SKU),
            });

            setSyncResult(response);

            if (response.success) {
                alertsProducts.syncSuccess(response.succeeded || response.processed || parsedData.length);
                if (typeof onSyncSuccess === "function") {
                    onSyncSuccess(response);
                }
            }
        } catch (error) {
            console.error("Error al sincronizar SKUs:", error);
            alertsProducts.syncError(error.message);
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: "12px",
                },
            }}
        >
            <DialogTitle className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                    <SyncIcon className="text-indigo-600" sx={{ fontSize: 24 }} />
                    <span className="text-lg font-semibold text-slate-800">
                        Sincronizar SKU
                    </span>
                </div>
                <button
                    onClick={handleClose}
                    className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                >
                    <CloseIcon fontSize="small" />
                </button>
            </DialogTitle>

            <DialogContent className="pt-6">
                <div className="space-y-4">
                    {/* Información */}
                    <div className="rounded-lg bg-blue-50 p-3">
                        <p className="text-sm text-blue-700">
                            <strong>Formatos aceptados:</strong> Excel (.xlsx, .xls), CSV (.csv) o JSON (.json)
                        </p>
                        <p className="mt-1 text-xs text-blue-600">
                            El archivo debe contener una lista de SKUs a sincronizar.
                        </p>
                    </div>

                    {/* Área de carga de archivo */}
                    <div
                        className={`relative rounded-xl border-2 border-dashed p-8 text-center transition ${
                            isDragging
                                ? "border-indigo-500 bg-indigo-50"
                                : "border-slate-300 bg-slate-50 hover:border-slate-400"
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        {!selectedFile ? (
                            <>
                                <CloudUploadIcon
                                    sx={{ fontSize: 48 }}
                                    className="mx-auto mb-3 text-slate-400"
                                />
                                <p className="mb-2 text-sm font-medium text-slate-700">
                                    Arrastra y suelta tu archivo aquí
                                </p>
                                <p className="mb-4 text-xs text-slate-500">
                                    o haz clic en el botón de abajo
                                </p>
                                <label
                                    htmlFor="sync-file-upload"
                                    className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <CloudUploadIcon sx={{ fontSize: 18 }} />
                                    Seleccionar archivo
                                </label>
                                <input
                                    id="sync-file-upload"
                                    type="file"
                                    accept=".xlsx,.xls,.csv,.json"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                            </>
                        ) : (
                            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-indigo-100 p-2">
                                        <DescriptionIcon className="text-indigo-600" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-medium text-slate-700">
                                            {selectedFile.name}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {(selectedFile.size / 1024).toFixed(2)} KB
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleRemoveFile}
                                    className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-red-600"
                                >
                                    <CloseIcon fontSize="small" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Error de parseo */}
                    {parseError && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                            <div className="flex items-start gap-2">
                                <ErrorIcon className="text-red-600" sx={{ fontSize: 20 }} />
                                <div>
                                    <p className="text-xs font-semibold text-red-700">
                                        Error al leer el archivo
                                    </p>
                                    <p className="text-xs text-red-600">{parseError}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Preview de datos parseados */}
                    {parsedData && parsedData.length > 0 && !syncResult && (
                        <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                            <div className="mb-2 flex items-center gap-2">
                                <CheckCircleIcon className="text-green-600" sx={{ fontSize: 20 }} />
                                <p className="text-xs font-semibold text-green-700">
                                    {parsedData.length} SKU(s) detectado(s)
                                </p>
                            </div>
                            <div className="max-h-32 overflow-y-auto rounded border border-green-200 bg-white p-2">
                                <table className="w-full text-xs">
                                    <thead className="border-b border-slate-200">
                                        <tr>
                                            <th className="px-2 py-1 text-left text-slate-700">SKU</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {parsedData.slice(0, 10).map((item, index) => (
                                            <tr key={index} className="border-b border-slate-100">
                                                <td className="px-2 py-1 text-slate-600">
                                                    {item.SKU}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {parsedData.length > 10 && (
                                    <p className="mt-2 text-center text-xs text-slate-500">
                                        + {parsedData.length - 10} SKU(s) más...
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Resultado de sincronización */}
                    {syncResult && (
                        <div
                            className={`rounded-lg border p-3 ${
                                syncResult.success && syncResult.failed === 0
                                    ? "border-green-200 bg-green-50"
                                    : "border-yellow-200 bg-yellow-50"
                            }`}
                        >
                            <div className="mb-2 flex items-center gap-2">
                                {syncResult.success && syncResult.failed === 0 ? (
                                    <CheckCircleIcon
                                        className="text-green-600"
                                        sx={{ fontSize: 20 }}
                                    />
                                ) : (
                                    <ErrorIcon
                                        className="text-yellow-600"
                                        sx={{ fontSize: 20 }}
                                    />
                                )}
                                <p className="text-xs font-semibold text-slate-700">
                                    Sincronización completada
                                </p>
                            </div>
                            <div className="space-y-1 text-xs text-slate-600">
                                <p>
                                    ✅ Exitosos: <strong>{syncResult.succeeded || 0}</strong>
                                </p>
                                <p>
                                    ❌ Fallidos: <strong>{syncResult.failed || 0}</strong>
                                </p>
                                <p>📦 Total procesados: {syncResult.processed || 0}</p>
                            </div>
                            {syncResult.results &&
                                syncResult.results.some((r) => r.status === "error") && (
                                    <div className="mt-2 max-h-24 overflow-y-auto rounded border border-red-200 bg-white p-2">
                                        <p className="mb-1 text-xs font-semibold text-red-700">
                                            Errores:
                                        </p>
                                        {syncResult.results
                                            .filter((r) => r.status === "error")
                                            .map((result, index) => (
                                                <p key={index} className="text-xs text-red-600">
                                                    • {result.sku || result.SKU}: {result.error}
                                                </p>
                                            ))}
                                    </div>
                                )}
                        </div>
                    )}

                    {/* Instrucciones adicionales */}
                    {!parsedData && !parseError && (
                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                            <p className="mb-2 text-xs font-semibold text-slate-700">
                                Columnas esperadas en Excel/CSV:
                            </p>
                            <ul className="space-y-1 text-xs text-slate-600">
                                <li className="flex gap-2">
                                    <span>•</span>
                                    <span>
                                        <strong>SKU</strong> o <strong>SKUSIMPLE</strong>: Código
                                        del producto a sincronizar (requerido)
                                    </span>
                                </li>
                            </ul>
                            <p className="mt-2 text-xs text-slate-500">
                                💡 La primera fila debe contener los encabezados. Solo se requiere
                                la columna SKU.
                            </p>
                        </div>
                    )}
                </div>
            </DialogContent>

            <DialogActions className="border-t border-slate-200 px-6 py-4">
                <Button
                    onClick={handleClose}
                    color="inherit"
                    sx={{ textTransform: "none", fontWeight: 600 }}
                    disabled={isSyncing}
                >
                    {syncResult ? "Cerrar" : "Cancelar"}
                </Button>
                {!syncResult && (
                    <Button
                        onClick={handleSync}
                        variant="contained"
                        color="primary"
                        disabled={!parsedData || parsedData.length === 0 || isSyncing}
                        sx={{
                            textTransform: "none",
                            fontWeight: 600,
                            borderRadius: "8px",
                        }}
                    >
                        {isSyncing ? (
                            <>
                                <CircularProgress size={16} sx={{ mr: 1 }} />
                                Sincronizando...
                            </>
                        ) : (
                            `Sincronizar ${parsedData?.length || 0} SKU(s)`
                        )}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

SyncSkuModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    token: PropTypes.string,
    tenantId: PropTypes.string,
    tenantName: PropTypes.string,
    onSyncSuccess: PropTypes.func,
};

SyncSkuModal.defaultProps = {
    token: null,
    tenantId: null,
    tenantName: null,
    onSyncSuccess: null,
};

export default SyncSkuModal;

