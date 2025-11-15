import PropTypes from "prop-types";

const OrdersTableHeader = ({
  searchTerm,
  onSearchChange,
  selectedCount,
  onDeleteSelected,
  isDeleting,
}) => {
  return (
    <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-slate-800">Órdenes</h1>
        <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
          {selectedCount > 0 && (
            <button
              type="button"
              onClick={onDeleteSelected}
              disabled={isDeleting}
              className="inline-flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Eliminando...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-4 w-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.572.055-1.14.122-1.706.193C2.99 4.322 2.25 5.16 2.25 6.25v11.5A2.75 2.75 0 004.75 20h10.5A2.75 2.75 0 0017.75 17.25V6.25c0-1.09-.74-1.928-1.544-2.314a41.108 41.108 0 00-1.706-.193v-.443A2.75 2.75 0 0011.25 1h-2.5zM10 4.75c-.41 0-.75.34-.75.75v.5h1.5v-.5c0-.41-.34-.75-.75-.75zM4.75 6.5c-.41 0-.75.34-.75.75v10.5c0 .41.34.75.75.75h10.5c.41 0 .75-.34.75-.75V7.25c0-.41-.34-.75-.75-.75H4.75z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Eliminar seleccionadas ({selectedCount})
                </>
              )}
            </button>
          )}
          <div className="w-full max-w-md">
            <label className="relative block">
              <span className="sr-only">Buscar órdenes</span>
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 3.5a5.5 5.5 0 103.473 9.799l3.114 3.114a.75.75 0 101.06-1.06l-3.114-3.114A5.5 5.5 0 009 3.5zm-4 5.5a4 4 0 118 0 4 4 0 01-8 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              <input
                type="search"
                value={searchTerm}
                onChange={onSearchChange}
                placeholder="Buscar en cualquier campo..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-700 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </label>
          </div>
        </div>
      </div>
    </header>
  );
};

OrdersTableHeader.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  selectedCount: PropTypes.number,
  onDeleteSelected: PropTypes.func,
  isDeleting: PropTypes.bool,
};

OrdersTableHeader.defaultProps = {
  selectedCount: 0,
  onDeleteSelected: () => {},
  isDeleting: false,
};

export default OrdersTableHeader;

