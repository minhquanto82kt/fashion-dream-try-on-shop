export {
  getCustomerSession,
  getCustomerUser,
  isCustomerAuthenticated,
  signInCustomer,
  signUpCustomer,
  signOutCustomer,
  signInWithGoogle,
  requestPasswordReset,
  updateCustomerPassword,
  refreshCustomerSession,
  handleOAuthCallback,
  getSafeReturnPath,
  startCustomerSessionWatcher,
} from "@/lib/auth";

export type {
  Session as CustomerSession,
} from "@/lib/upthink-supabase";

type CustomerUser = { id: string; email?: string };
export type { CustomerUser };
