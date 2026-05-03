# Security Specification for Grextar

## Data Invariants
1. A Prompt must have a valid `modelId` and `content`.
2. `likes`, `copyCount`, and `downloadCount` can only be incremented or remain unchanged by public users (handled via specific update actions).
3. Suggestions and Messages require basic validation of their fields.
4. Only Admins can create/delete Prompts and Models.

## The Dirty Dozen Payloads (Rejection Tests)

1. **Identity Spoofing**: Attempt to create a prompt with a fake `createdBy` UID.
2. **Elevated Privileges**: Attempt to update a prompt's `name` as a non-admin.
3. **Ghost Fields**: Add an `isVerified` field to a prompt update.
4. **Invalid Type**: Send a string for the `likes` field.
5. **ID Poisoning**: Use a 2KB string as a prompt ID.
6. **Negative Counts**: Update `copyCount` to -1.
7. **Unauthorized Deletion**: A user trying to delete someone else's suggestion.
8. **PII Leak**: Non-admin trying to list all messages (contains user emails).
9. **Spam Suggestion**: Suggestion with content exceeding 5000 characters.
10. **State Shortcut**: Attempt to approve a suggestion directly without admin auth.
11. **Malicious ID Verification**: Creating a model with characters outside `[a-zA-Z0-9_-]`.
12. **Timestamp Fraud**: Sending a client-side timestamp for `createdAt` instead of `request.time`.

## Test Runner (Logic Verification)
These rules will be tested in `DRAFT_firestore.rules` first.
