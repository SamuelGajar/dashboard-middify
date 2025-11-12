import { useEffect, useMemo, useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import {
  Box,
  Button,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import Logo from "../assets/logo/logo-removebg-preview.png";

const ORDER_STATE_ITEMS = [
  { id: "ingresada", label: "Ingresada" },
  { id: "pendiente", label: "Pendiente" },
  { id: "procesada", label: "Procesada" },
  { id: "error", label: "Error" },
  { id: "en_proceso", label: "En proceso" },
  { id: "descartada", label: "Descartada" },
];

export const SIDEBAR_WIDTH = 280;

const Sidebar = ({
  tenants = [],
  selectedTenantId = null,
  onChangeTenant,
  activeView = "dashboard",
  onChangeView,
  showTenantFilter = true,
  activeOrderState = null,
  onChangeOrderState,
}) => {
  const { hasValidTenants, tenantOptions } = useMemo(() => {
    if (!Array.isArray(tenants)) {
      return { hasValidTenants: false, tenantOptions: [] };
    }

    const options = tenants.filter(
      (tenant) => tenant?.tenantId && tenant?.tenantName
    );
    return { hasValidTenants: options.length > 0, tenantOptions: options };
  }, [tenants]);

  const handleViewChange = (view) => {
    if (typeof onChangeView === "function") {
      onChangeView(view);
    }
  };

  const handleTenantChange = (event) => {
    if (typeof onChangeTenant === "function") {
      const value = event.target.value;
      onChangeTenant(value === "all" ? null : value);
    }
  };

  const [expandedItems, setExpandedItems] = useState(() =>
    activeView === "orders" ? ["orders-root"] : []
  );

  useEffect(() => {
    if (activeView === "orders") {
      setExpandedItems((prev) =>
        prev.includes("orders-root") ? prev : [...prev, "orders-root"]
      );
    }
  }, [activeView]);

  const selectedOrderNodeId =
    activeView === "orders"
      ? activeOrderState
        ? `orders-${activeOrderState}`
        : "orders-root"
      : null;
  const selectedOrderItems = selectedOrderNodeId ? [selectedOrderNodeId] : [];

  const handleOrderTreeSelect = (_event, itemIds) => {
    const ids = Array.isArray(itemIds) ? itemIds : [itemIds];
    const itemId = ids[ids.length - 1];

    if (!itemId) {
      return;
    }

    if (itemId === "orders-root") {
      handleViewChange("orders");
      if (typeof onChangeOrderState === "function") {
        onChangeOrderState(null);
      }
      return;
    }

    if (itemId.startsWith("orders-")) {
      const stateId = itemId.replace("orders-", "");
      const exists = ORDER_STATE_ITEMS.some((state) => state.id === stateId);
      if (!exists) {
        return;
      }
      handleViewChange("orders");
      if (typeof onChangeOrderState === "function") {
        onChangeOrderState(stateId);
      }
    }
  };

  const handleExpandedItemsChange = (_event, newExpandedItems) => {
    setExpandedItems(
      Array.isArray(newExpandedItems) ? newExpandedItems : [newExpandedItems]
    );
  };

  return (
    <Box
      component="aside"
      sx={{
        display: { xs: "none", lg: "flex" },
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        position: "sticky",
        top: 0,
        height: "100vh",
        alignSelf: "flex-start",
        mr: { lg: 3 },
      }}
    >
      <Paper
        elevation={1}
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          borderColor: "divider",
          overflow: "hidden",
          backgroundColor: "#063279",
        }}
      >
        <Stack
          spacing={3}
          sx={{
            p: 3,
            flex: 1,
            overflowY: "auto",
          }}
        >
          <Stack spacing={2}>
            <img src={Logo} alt="Logo" width={100} height={100} />
            {showTenantFilter && (
            <>
              <Divider />
              <FormControl fullWidth size="small">
                <InputLabel id="tenant-select-label">Tienda</InputLabel>
                <Select
                  labelId="tenant-select-label"
                  id="tenant-select"
                  label="Tienda"
                  value={selectedTenantId ?? "all"}
                  onChange={handleTenantChange}
                >
                  <MenuItem value="all">Todas las tiendas</MenuItem>
                  {hasValidTenants &&
                    tenantOptions.map((tenant) => (
                      <MenuItem key={tenant.tenantId} value={tenant.tenantId}>
                        {tenant.tenantName}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </>
          )}
            <Stack spacing={1}>
              <Button
                fullWidth
                color="primary"
                onClick={() => handleViewChange("dashboard")}
                sx={{
                  justifyContent: "flex-start",
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Dashboard
              </Button>
              <Button
                fullWidth
                color="primary"
                onClick={() => handleViewChange("stores")}
                sx={{
                  justifyContent: "flex-start",
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Tiendas
              </Button>
            </Stack>
            <Box sx={{ px: 1 }}>
              <SimpleTreeView
                aria-label="órdenes"
                expandedItems={expandedItems}
                onExpandedItemsChange={handleExpandedItemsChange}
                selectedItems={selectedOrderItems}
                onSelectedItemsChange={handleOrderTreeSelect}
                multiSelect={false}
                slots={{
                  collapseIcon: ExpandMoreIcon,
                  expandIcon: ChevronRightIcon,
                }}
                sx={{
                  "& .MuiTreeItem-content": {
                    borderRadius: 2,
                    pr: 1,
                    mb: 0.5,
                  },
                  "& .MuiTreeItem-label": {
                    fontSize: "0.875rem",
                    px: 1.5,
                    py: 0.6,
                  },

                  "& .MuiTreeItem-group": {
                    ml: 1.5,
                    pl: 1,
                    borderLeft: "1px dashed rgba(148, 163, 184, 0.4)",
                  },
                }}
              >
                <TreeItem
                  itemId="orders-root"
                  label="órdenes"
                  sx={{
                    "& .MuiTreeItem-label": {
                      fontWeight: 600,
                      textTransform: "capitalize",
                    },
                  }}
                >
                  {ORDER_STATE_ITEMS.map((state) => (
                    <TreeItem
                      key={state.id}
                      itemId={`orders-${state.id}`}
                      label={state.label}
                    />
                  ))}
                </TreeItem>
              </SimpleTreeView>
            </Box>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};

export default Sidebar;
