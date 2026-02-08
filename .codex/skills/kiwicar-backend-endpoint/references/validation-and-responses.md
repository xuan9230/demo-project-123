# Validation & Response Conventions

## Validation

- Use `zod` schemas for bodies and queries.
- Validate with `parseOr400` from `src/utils/validation.ts`.

Example pattern:

```ts
const parsed = parseOr400(schema, req.body);
if (!parsed.success) {
  return res
    .status(400)
    .json(errorResponse("VALIDATION_ERROR", "Invalid payload", parsed.error));
}
```

For query params, normalize arrays before parsing:

```ts
const normalizeQuery = (query: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(query).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])
  );
```

## Response shapes

- Success: `successResponse(data, meta?)` -> `{ success: true, data, meta? }`
- Error: `errorResponse(code, message, details?)` -> `{ success: false, error: { code, message, details? } }`

## Status code conventions

- `200` OK
- `201` Created
- `204` No Content (deletes)
- `400` Validation errors
- `401` Unauthorized (missing/invalid auth)
- `404` Not found
- `500` DB or unexpected errors
- `501` Not implemented (stub endpoints)
