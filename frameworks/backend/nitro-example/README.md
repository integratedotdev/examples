# Nitro starter

Look at the [nitro quick start](https://nitro.build/guide#quick-start) to learn more how to get started.

## Configuration

### Port

The server runs on `process.env.PORT` or defaults to `8080`.

- Development: Set `PORT` environment variable before running `bun run dev`
- Production: Set `PORT` environment variable before running `bun run preview`

Example:

```bash
PORT=3000 bun run dev
```

### CORS

CORS is enabled globally via middleware, allowing all origins with credentials support.
