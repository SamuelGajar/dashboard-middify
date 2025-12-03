import PropTypes from "prop-types";
import { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DescriptionIcon from "@mui/icons-material/Description";
import CloseIcon from "@mui/icons-material/Close";

const ImportProductsModal = ({ open, onClose }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileSelect = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
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
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
    };

    const handleClose = () => {
        setSelectedFile(null);
        onClose();
    };

    const handleImport = () => {
        // TODO: Implementar lógica de importación
        console.log("Importar archivo:", selectedFile);
        handleClose();
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
                    {/* Información */}
                    <div className="rounded-lg bg-blue-50 p-3">
                        <p className="text-sm text-blue-700">
                            <strong>Formato aceptado:</strong> Archivos Excel (.xlsx, .xls) o CSV (.csv)
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
                                    accept=".xlsx,.xls,.csv"
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

                    {/* Instrucciones adicionales */}
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <p className="mb-2 text-xs font-semibold text-slate-700">
                            Instrucciones:
                        </p>
                        <ul className="space-y-1 text-xs text-slate-600">
                            <li className="flex gap-2">
                                <span>•</span>
                                <span>El archivo debe contener las columnas: SKU, Nombre, Cantidad, Precio</span>
                            </li>
                            <li className="flex gap-2">
                                <span>•</span>
                                <span>La primera fila debe contener los encabezados</span>
                            </li>
                            <li className="flex gap-2">
                                <span>•</span>
                                <span>Máximo 1000 productos por importación</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </DialogContent>

            <DialogActions className="border-t border-slate-200 px-6 py-4">
                <Button
                    onClick={handleClose}
                    color="inherit"
                    sx={{ textTransform: "none", fontWeight: 600 }}
                >
                    Cancelar
                </Button>
                <Button
                    onClick={handleImport}
                    variant="contained"
                    color="primary"
                    disabled={!selectedFile}
                    sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        borderRadius: "8px",
                    }}
                >
                    Importar Productos
                </Button>
            </DialogActions>
        </Dialog>
    );
};

ImportProductsModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default ImportProductsModal;

