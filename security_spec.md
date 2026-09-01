# Security Specification - MultiSports Tournament Database

## Data Invariants
1. Matches belong to a specific sport.
2. Player stats MUST belong to a valid player and match.
3. Users with ADMIN role MUST be able to perform all actions, TABULATOR can only perform score updates.
4. Activity logs MUST be immutable once created.

## The "Dirty Dozen" Payloads
1. Attempt to set `Match.winner` to an invalid type (number instead of string).
2. Attempt to inject a 2MB string into `ActivityLog.message`.
3. Attempt to create a `User` with `role: "GOD"` (invalid role).
4. Attempt to update `Match.match_id` after creation (immutability test).
5. Attempt to create `PlayerStat` without a valid `match_id` (relational test).
6. Attempt to set `Match.status` to "finished" (unauthorized status) as TABULATOR.
7. Attempt to create a match with a start date in the past.
8. Attempt to read PII from `Users` collection as a non-authenticated user.
9. Attempt to inject SQL-like characters into `Team.team_name`.
10. Attempt to update another user's profile.
11. Attempt to create a match with invalid `team1_id` that doesn't exist.
12. Attempt to set `createdAt` timestamp to a future date.
