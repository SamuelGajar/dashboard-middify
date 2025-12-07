import { useState, useCallback } from "react";
import PropTypes from "prop-types";
import { useProducts } from "../api/products/getProducts";
import RecycleBinHeader from "../components/recycleBin/RecycleBinHeader";
import RecycleBinOrdersTab from "../components/recycleBin/RecycleBinOrdersTab";
import RecycleBinProductsTab from "../components/recycleBin/RecycleBinProductsTab";

const RecycleBin = ({
    token = null,
    selectedTenantId = null,
    onSelectOrder = () => {},
    user = null,
}) => {
    const [activeTab, setActiveTab] = useState("orders");
    const [ordersHeaderProps, setOrdersHeaderProps] = useState({});
    const [productsHeaderProps, setProductsHeaderProps] = useState({});

    // Obtener conteo de productos eliminados
    const { products } = useProducts(token, selectedTenantId, null, 0, "discard");
    const productsCount =
        products?.products?.filter((p) => p.state === "discard")?.length || 0;

    // El conteo de órdenes lo obtiene el componente hijo
    const ordersCount = ordersHeaderProps.ordersTotalCount || 0;

    const handleTabChange = (newTab) => {
        setActiveTab(newTab);
    };

    const handleOrdersHeaderPropsChange = useCallback((props) => {
        setOrdersHeaderProps(props);
    }, []);

    const handleProductsHeaderPropsChange = useCallback((props) => {
        setProductsHeaderProps(props);
    }, []);

    return (
        <div className="flex flex-col gap-4 pt-4">
            <RecycleBinHeader
                activeTab={activeTab}
                onTabChange={handleTabChange}
                ordersCount={ordersCount}
                productsCount={productsCount}
                {...ordersHeaderProps}
                {...productsHeaderProps}
            />

            {activeTab === "orders" && (
                <RecycleBinOrdersTab
                    token={token}
                    selectedTenantId={selectedTenantId}
                    onSelectOrder={onSelectOrder}
                    user={user}
                    onHeaderPropsChange={handleOrdersHeaderPropsChange}
                />
            )}

            {activeTab === "products" && (
                <RecycleBinProductsTab
                    token={token}
                    selectedTenantId={selectedTenantId}
                    user={user}
                    onHeaderPropsChange={handleProductsHeaderPropsChange}
                />
            )}
        </div>
    );
};

RecycleBin.propTypes = {
    token: PropTypes.string,
    selectedTenantId: PropTypes.string,
    onSelectOrder: PropTypes.func,
    user: PropTypes.object,
};

RecycleBin.defaultProps = {
    token: null,
    selectedTenantId: null,
    onSelectOrder: () => {},
    user: null,
};

export default RecycleBin;


