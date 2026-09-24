# WEARO payment webhook

This Edge Function is the public callback endpoint for SePay VietQR payments.

## Flow

1. SePay sends a POST event to this function.
2. The function validates `x-sepay-signature` and `x-sepay-timestamp` using `SEPAY_WEBHOOK_SECRET`.
3. It rejects expired, malformed, duplicate, wrong-account, outgoing, and amount-mismatched events.
4. It resolves the pending `payments` record by `orders.order_code`.
5. `verify_payment_status()` atomically changes the payment to `paid`.
6. Database triggers write `payment_events` and synchronize `orders.payment_status` / `orders.order_status`.

## Required Supabase Edge Function secrets

- `SUPABASE_URL`
- `SUPABASE_SECRET_KEYS` containing a `default` key, or `SUPABASE_SERVICE_ROLE_KEY`
- `SEPAY_WEBHOOK_SECRET`
- `SEPAY_ACCOUNT_NUMBER`

The function intentionally has JWT verification disabled because SePay is an external webhook caller. Authentication is performed with the HMAC signature and timestamp instead.
