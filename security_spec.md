# Security Spec for Encrypted Storage

## Collections

- `encrypted_records`: Stores encrypted data payloads linked to a user.

## Invariants

- `encrypted_records` documents MUST have a `userId` field matching the `request.auth.uid`.
- Users can only read/write their own records.

## Dirty Dozen Payloads (Security Tests)

- Payload 1: { userId: "other-user", encryptedData: "...", iv: "..." } -> SHOUD BE DENIED
- Payload 2: { userId: "my-user", encryptedData: "...", iv: "..." } -> SHOULD BE ALLOWED
- ... (and so on)
