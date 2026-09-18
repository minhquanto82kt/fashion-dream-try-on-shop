export type AppRole = "customer" | "staff" | "manager" | "admin";

export const PERMISSIONS = {
  productsRead: "products.read",
  productsWrite: "products.write",
  ordersRead: "orders.read",
  ordersUpdate: "orders.update",
  customersRead: "customers.read",
  inventoryRead: "inventory.read",
  inventoryWrite: "inventory.write",
  aiRead: "ai.read",
  aiGenerate: "ai.generate",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const ROLE_PERMISSIONS: Record<AppRole, readonly Permission[]> = {
  customer: [PERMISSIONS.aiGenerate],
  staff: [
    PERMISSIONS.productsRead,
    PERMISSIONS.ordersRead,
    PERMISSIONS.ordersUpdate,
    PERMISSIONS.customersRead,
    PERMISSIONS.inventoryRead,
    PERMISSIONS.aiRead,
  ],
  manager: [
    PERMISSIONS.productsRead,
    PERMISSIONS.productsWrite,
    PERMISSIONS.ordersRead,
    PERMISSIONS.ordersUpdate,
    PERMISSIONS.customersRead,
    PERMISSIONS.inventoryRead,
    PERMISSIONS.inventoryWrite,
    PERMISSIONS.aiRead,
    PERMISSIONS.aiGenerate,
  ],
  admin: Object.values(PERMISSIONS),
};

export function roleHasPermission(role: AppRole, permission: Permission) {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function assertRolePermission(role: AppRole, permission: Permission) {
  if (!roleHasPermission(role, permission)) {
    throw new Error(`Forbidden: ${permission}`);
  }
}
