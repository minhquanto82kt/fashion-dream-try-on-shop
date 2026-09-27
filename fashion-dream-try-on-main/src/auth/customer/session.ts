export {
  getCustomerSession,
  refreshCustomerSession,
  getCustomerUser,
  signOutCustomer,
  isCustomerAuthenticated,
  startCustomerSessionWatcher,
  getSafeReturnPath,
} from "@/lib/auth";

/**
 * Compatibility bridge during the Auth migration.
 * Existing cart/session synchronization remains in the proven implementation
 * until all consumers have moved to the new Auth public API.
 */
export { getCustomerSession as getSession } from "@/lib/auth";
