# Supabase & Auth Usage

## Auth middleware

- `requireAuth` rejects missing/invalid `Authorization: Bearer <token>` headers and sets:
  - `req.user`
  - `req.accessToken`
- `optionalAuth` sets the same fields if the token is valid, otherwise continues.
- Use `AuthenticatedRequest` when you need typed access to `req.user` or `req.accessToken`.

## Supabase clients

From `src/config/supabase.ts`:

- `supabase` is the anonymous client for public queries.
- `getSupabaseClient(accessToken)` returns a client scoped to the user token (use for RLS tables).
- `getSupabaseServiceClient()` returns a service-role client or `null` if the key is missing.

## Error handling pattern

```ts
const { data, error } = await supabase.from("table").select("*");
if (error) {
  return res.status(500).json(errorResponse("DB_ERROR", error.message));
}
```
