/**
 * WEARO Authentication public API.
 *
 * Keep route/component imports pointed at `@/auth` so the internal Auth
 * implementation can evolve without changing the UI layer. Existing proven
 * customer-session behavior is re-exported from the compatibility layer while
 * the email flows are progressively moved into focused modules.
 */
export {
  getCustomerSession,
  refreshCustomerSession,
  getCustomerUser,
  signOutCustomer,
  isCustomerAuthenticated,
  startCustomerSessionWatcher,
  getSafeReturnPath,
  signInCustomer,
  signInWithGoogle,
  signUpCustomer as signUpCustomerLegacy,
  requestPasswordReset as requestPasswordResetLegacy,
  updateCustomerPassword as updateCustomerPasswordLegacy,
} from "@/lib/auth";

export { signUpCustomer, resendSignupConfirmation } from "./customer/sign-up";
export { signInCustomerWithPassword, sendMagicLink, getGoogleAuthorizeUrl, getFacebookAuthorizeUrl } from "./customer/sign-in";
export { requestPasswordReset, updateCustomerPassword, changeCustomerEmail } from "./customer/password";
export { resolveAuthCallback } from "./callbacks/auth-callback";
export type { AuthUser, AuthResponse, AuthResult, RedirectOptions } from "./auth.types";
