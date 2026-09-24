# WEARO Payment Compliance Runbook

## Scope

WEARO must not collect, log, store, or transmit raw card numbers, CVV/CVC, PINs, or other sensitive authentication data in the application database, browser local storage, analytics, or server logs.

For card payments, the intended architecture is a hosted payment page supplied by the payment gateway:

```text
WEARO Checkout
  -> create Order (pending)
  -> Mastercard Gateway Hosted Checkout
  -> customer enters card details on gateway-controlled payment page
  -> gateway processes authorization/purchase
  -> gateway return / notification
  -> WEARO server verifies gateway order
  -> payments.status = paid
  -> orders.payment_status = paid
```

The gateway's hosted checkout is important because the gateway, rather than WEARO, handles the card-entry page. Mastercard documents Hosted Checkout as a hosted payment page/embedded interaction and provides a session ID for the Checkout SDK. The SDK then launches the payment page. See the official Mastercard Gateway documentation before production activation.

## PCI DSS position

This repository does **not** claim PCI DSS certification or compliance certification.

Eligibility for a PCI SSC SAQ depends on the actual production implementation and all applicable eligibility criteria. Outsourcing payment processing can reduce the merchant's PCI DSS scope, but it does not automatically make the merchant compliant. PCI SSC states that merchants using a fully outsourced redirect/hosted payment flow may be eligible for SAQ A only when all relevant criteria are satisfied; e-commerce merchants can still have responsibilities such as external vulnerability scanning.

## WEARO controls

- Payment secrets are server-only environment variables.
- No `VITE_` variable may contain Mastercard, MoMo, Supabase service-role, or other payment secrets.
- `payments` is the source of payment state; the browser must never set `paid` directly.
- Provider callbacks/status checks must verify transaction ID and amount before changing payment state.
- Duplicate provider events are handled through provider event/transaction identifiers.
- Orders and payments are retained for audit/history and are not hard-deleted as a normal CRUD operation.
- Raw card data must never be written to Supabase or application logs.
- Test/sandbox credentials must be kept separate from production credentials.

## Production checklist

Before enabling Mastercard production payments:

1. Obtain a Mastercard Gateway merchant account and production merchant ID from the payment service provider/acquirer.
2. Configure the provider's production API password/credentials in Vercel server-side environment variables only.
3. Configure the exact production `PUBLIC_APP_URL` and HTTPS return URL.
4. Enable the Mastercard Gateway webhook/notification URL in Merchant Administration if available for the merchant profile.
5. Verify that gateway notifications are authenticated according to the provider's configured mechanism.
6. Test successful, declined, cancelled, expired, duplicate-notification, amount-mismatch, and gateway-timeout flows in sandbox.
7. Confirm that a successful gateway transaction is the only path that changes `payments.status` to `paid`.
8. Run an external vulnerability scan/PCI assessment required by the applicable SAQ/acquirer arrangement.
9. Review Vercel logs to ensure no cardholder data is logged.
10. Only then enable the Mastercard payment option in production checkout.

## Important

Displaying a Mastercard logo or adding a `mastercard` payment method in code does not mean WEARO can accept real Mastercard transactions. Live acceptance requires a contracted acquiring/payment-gateway account and valid production credentials/configuration.
