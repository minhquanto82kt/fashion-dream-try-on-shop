export {
  getCustomerUser,
  signInCustomer,
  signUpCustomer,
  signOutCustomer,
  signInWithGoogle,
  requestPasswordReset,
  updateCustomerPassword,
  handleOAuthCallback,
  getSafeReturnPath,
  startCustomerSessionWatcher,
  stopCustomerSessionWatcher,
} from "@/lib/auth";

export type {
  CustomerUser,
  CustomerSession,
} from "@/lib/auth";
