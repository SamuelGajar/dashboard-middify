import PropTypes from "prop-types";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import CircularProgress from "@mui/material/CircularProgress";

const ProductsTableHeader = ({
    title,
    subtitle,
    infoChips,
    onExportData,
    isExportingData,
    exportDisabled,
}) => {
    const canTriggerExport = typeof onExportData === "function" && !exportDisabled;

    return (
        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col gap-3">
                    <div>
                        <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
                        {subtitle ? (
                            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
                        ) : null}
                    </div>
                    {Array.isArray(infoChips) && infoChips.length > 0 ? (
                        <div className="flex flex-wrap gap-3 text-sm font-medium text-slate-600">
                            {infoChips.map((chip) => (
                                <div
                                    key={chip.id}
                                    className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2"
                                >
                                    <span className="text-[11px] uppercase tracking-[0.25em] text-slate-400">
                                        {chip.label}
                                    </span>
                                    <span
                                        className={`text-sm font-semibold text-slate-700 ${chip.accentClass ?? ""}`}
                                    >
                                        {chip.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : null}
                </div>
                <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
                    <button
                        type="button"
                        onClick={() => {
                            if (!canTriggerExport || isExportingData) {
                                return;
                            }
                            onExportData();
                        }}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-catalina-blue-500 hover:text-catalina-blue-600 focus:outline-none focus:ring-2 focus:ring-catalina-blue-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                        disabled={!canTriggerExport || isExportingData}
                        aria-label="Exportar productos a Excel"
                        title="Exportar productos a Excel"
                    >
                        {isExportingData ? (
                            <>
                                <CircularProgress size={16} />
                                Exportando...
                            </>
                        ) : (
                            <>
                                <FileDownloadOutlinedIcon fontSize="small" />
                                Exportar Excel
                            </>
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
};

ProductsTableHeader.propTypes = {
    title: PropTypes.string,
    subtitle: PropTypes.string,
    infoChips: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
            value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            accentClass: PropTypes.string,
        })
    ),
    onExportData: PropTypes.func,
    isExportingData: PropTypes.bool,
    exportDisabled: PropTypes.bool,
};

ProductsTableHeader.defaultProps = {
    title: "Productos",
    subtitle: "",
    infoChips: [],
    onExportData: undefined,
    isExportingData: false,
    exportDisabled: false,
};

export default ProductsTableHeader;
