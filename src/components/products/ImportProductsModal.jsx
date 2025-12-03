import PropTypes from "prop-types";
import { useState } from "react";
import * as XLSX from "xlsx";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    CircularProgress,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DescriptionIcon from "@mui/icons-material/Description";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { postImportProducts } from "../../api/products/importProducts";

const ImportProductsModal = ({ open, onClose, token, tenantId, tenantName, onImportSuccess }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [parsedData, setParsedData] = useState(null);
    const [parseError, setParseError] = useState(null);
    const [isImporting, setIsImporting] = useState(false);
    const [importResult, setImportResult] = useState(null);
    const [operation, setOperation] = useState("AGREGAR_STOCK");

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
                const products = Array.isArray(json) ? json : [json];
                
                // Mapear a estructura esperada si tiene formato diferente
                const mapped = products.map((p) => ({
                    SKUSIMPLE: p.SKUSIMPLE || p.sku || p.SKU,
                    STOCK: parseInt(p.STOCK || p.stock || p.cantidad || 0),
                    TIPO_OPERACION: p.TIPO_OPERACION || operation,
                    MARCA: p.MARCA || p.warehouse || p.bodega || "",
                }));

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
                const mapped = jsonData.map((row, index) => {
                    const sku =
                        row.SKUSIMPLE ||
                        row.SKU ||
                        row.sku ||
                        row["SKU SIMPLE"] ||
                        row.Sku ||
                        "";

                    const stock =
                        row.STOCK ||
                        row.Stock ||
                        row.stock ||
                        row.Cantidad ||
                        row.cantidad ||
                        0;

                    const marca =
                        row.MARCA ||
                        row.Marca ||
                        row.marca ||
                        row.BODEGA ||
                        row.Bodega ||
                        row.bodega ||
                        row.WAREHOUSE ||
                        row.Warehouse ||
                        row.warehouse ||
                        "";

                    if (!sku) {
                        throw new Error(`Fila ${index + 2}: SKU es requerido`);
                    }

                    return {
                        SKUSIMPLE: sku,
                        STOCK: parseInt(stock),
                        TIPO_OPERACION: operation, // Se usa la operación seleccionada
                        MARCA: marca,
                    };
                });

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
        setImportResult(null);
    };

    const handleClose = () => {
        setSelectedFile(null);
        setParsedData(null);
        setParseError(null);
        setImportResult(null);
        setOperation("AGREGAR_STOCK");
        onClose();
    };

    const handleOperationChange = (newOperation) => {
        setOperation(newOperation);
        // Re-parsear archivo con la nueva operación si ya hay uno seleccionado
        if (selectedFile && parsedData) {
            parseFile(selectedFile);
        }
    };

    const handleImport = async () => {
        if (!parsedData || parsedData.length === 0) {
            alert("No hay datos válidos para importar.");
            return;
        }

        if (!token) {
            alert("Error: No hay token de autenticación disponible.");
            return;
        }

        if (!tenantId || !tenantName) {
            alert("Error: Se requiere información del tenant.");
            return;
        }

        setIsImporting(true);
        setImportResult(null);

        try {
            const response = await postImportProducts({
                token,
                tenantId,
                tenantName,
                products: parsedData,
            });

            setImportResult(response);

            if (response.success && typeof onImportSuccess === "function") {
                onImportSuccess(response);
            }
        } catch (error) {
            console.error("Error al importar productos:", error);
            alert(`Error al importar productos: ${error.message || "Error desconocido"}`);
        } finally {
            setIsImporting(false);
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
                <span className="text-lg font-semibold text-slate-800">
                    Importar Productos
                </span>
                <button
                    onClick={handleClose}
                    className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                >
                    <CloseIcon fontSize="small" />
                </button>
            </DialogTitle>

            <DialogContent className="pt-6">
                <div className="space-y-4">
                    {/* Tipo de Operación */}
                    <FormControl fullWidth size="small">
                        <InputLabel id="operation-select-label">Tipo de Operación</InputLabel>
                        <Select
                            labelId="operation-select-label"
                            value={operation}
                            label="Tipo de Operación"
                            onChange={(e) => handleOperationChange(e.target.value)}
                            disabled={isImporting}
                        >
                            <MenuItem value="AGREGAR_STOCK">Agregar Stock</MenuItem>
                            <MenuItem value="DESCONTAR_STOCK">Descontar Stock</MenuItem>
                            <MenuItem value="CARGA_COMPLETA">Carga Completa</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Información */}
                    <div className="rounded-lg bg-blue-50 p-3">
                        <p className="text-sm text-blue-700">
                            <strong>Formatos aceptados:</strong> Excel (.xlsx, .xls), CSV (.csv) o JSON (.json)
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
                                    htmlFor="file-upload"
                                    className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <CloudUploadIcon sx={{ fontSize: 18 }} />
                                    Seleccionar archivo
                                </label>
                                <input
                                    id="file-upload"
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
                    {parsedData && parsedData.length > 0 && !importResult && (
                        <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircleIcon className="text-green-600" sx={{ fontSize: 20 }} />
                                <p className="text-xs font-semibold text-green-700">
                                    {parsedData.length} producto(s) detectado(s)
                                </p>
                            </div>
                            <div className="max-h-32 overflow-y-auto rounded border border-green-200 bg-white p-2">
                                <table className="w-full text-xs">
                                    <thead className="border-b border-slate-200">
                                        <tr>
                                            <th className="px-2 py-1 text-left text-slate-700">SKU</th>
                                            <th className="px-2 py-1 text-left text-slate-700">Stock</th>
                                            <th className="px-2 py-1 text-left text-slate-700">Bodega</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {parsedData.slice(0, 5).map((product, index) => (
                                            <tr key={index} className="border-b border-slate-100">
                                                <td className="px-2 py-1 text-slate-600">
                                                    {product.SKUSIMPLE}
                                                </td>
                                                <td className="px-2 py-1 text-slate-600">
                                                    {product.STOCK}
                                                </td>
                                                <td className="px-2 py-1 text-slate-600">
                                                    {product.MARCA}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {parsedData.length > 5 && (
                                    <p className="mt-2 text-center text-xs text-slate-500">
                                        + {parsedData.length - 5} producto(s) más...
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Resultado de importación */}
                    {importResult && (
                        <div
                            className={`rounded-lg border p-3 ${
                                importResult.success && importResult.failed === 0
                                    ? "border-green-200 bg-green-50"
                                    : "border-yellow-200 bg-yellow-50"
                            }`}
                        >
                            <div className="mb-2 flex items-center gap-2">
                                {importResult.success && importResult.failed === 0 ? (
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
                                    Importación completada
                                </p>
                            </div>
                            <div className="space-y-1 text-xs text-slate-600">
                                <p>
                                    ✅ Exitosos: <strong>{importResult.succeeded}</strong>
                                </p>
                                <p>
                                    ❌ Fallidos: <strong>{importResult.failed}</strong>
                                </p>
                                <p>📦 Total procesados: {importResult.processed}</p>
                            </div>
                            {importResult.results &&
                                importResult.results.some((r) => r.status === "error") && (
                                    <div className="mt-2 max-h-24 overflow-y-auto rounded border border-red-200 bg-white p-2">
                                        <p className="mb-1 text-xs font-semibold text-red-700">
                                            Errores:
                                        </p>
                                        {importResult.results
                                            .filter((r) => r.status === "error")
                                            .map((result, index) => (
                                                <p key={index} className="text-xs text-red-600">
                                                    • {result.sku}: {result.error}
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
                                        del producto (requerido)
                                    </span>
                                </li>
                                <li className="flex gap-2">
                                    <span>•</span>
                                    <span>
                                        <strong>STOCK</strong> o <strong>Cantidad</strong>: Cantidad
                                        a agregar/descontar/cargar
                                    </span>
                                </li>
                                <li className="flex gap-2">
                                    <span>•</span>
                                    <span>
                                        <strong>MARCA</strong> o <strong>Bodega</strong>: Nombre de
                                        la bodega/warehouse
                                    </span>
                                </li>
                            </ul>
                            <p className="mt-2 text-xs text-slate-500">
                                💡 La primera fila debe contener los encabezados
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
                    disabled={isImporting}
                >
                    {importResult ? "Cerrar" : "Cancelar"}
                </Button>
                {!importResult && (
                    <Button
                        onClick={handleImport}
                        variant="contained"
                        color="primary"
                        disabled={!parsedData || parsedData.length === 0 || isImporting}
                        sx={{
                            textTransform: "none",
                            fontWeight: 600,
                            borderRadius: "8px",
                        }}
                    >
                        {isImporting ? (
                            <>
                                <CircularProgress size={16} sx={{ mr: 1 }} />
                                Importando...
                            </>
                        ) : (
                            `Importar ${parsedData?.length || 0} Productos`
                        )}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

ImportProductsModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    token: PropTypes.string,
    tenantId: PropTypes.string,
    tenantName: PropTypes.string,
    onImportSuccess: PropTypes.func,
};

ImportProductsModal.defaultProps = {
    token: null,
    tenantId: null,
    tenantName: null,
    onImportSuccess: null,
};

export default ImportProductsModal;


