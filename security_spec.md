# Security Specification

## Data Invariants
1. **Sales and Events**: Restricted to authorized administrative accounts. Non-authenticated users or non-allowed emails are completely blocked.
2. **Suggestions**: Open to submission by anyone (anonymous/guest users for QR Code ease-of-use), but status changes and deletions are strictly restricted to administrators. Upvoting is open to everyone.

## The "Dirty Dozen" Payloads
These represent unauthorized or unsafe payloads that must be rejected:
1. Sales write by an unauthenticated user.
2. Sales write by a user with an email not in the `ALLOWED_EMAILS` list.
3. Deleting a sale by an unauthenticated user or unauthorized email.
4. Modifying sales logs by a standard customer.
5. Modifying agenda events by an unauthenticated user.
6. Deleting agenda events by unauthorized users.
7. Submitting a dish suggestion with an approved status directly by a guest user (must default to pending).
8. Admin operations on suggestions (approve/reject/delete) by a guest or unauthorized user.
9. Upvoting a suggestion by decreasing its upvote counter (negative voting).
10. Creating a suggestion with malicious/oversized fields.
11. Attempting to bypass email verification if email verification checks are strictly enforced.
12. Attempting to update read-only fields.
