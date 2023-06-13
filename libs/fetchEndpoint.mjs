// deno-lint-ignore-file 
import { Application, Router } from "https://deno.land/x/oak@v12.5.0/mod.ts";

export function fetchEndpoint() {
  return new Promise(async(resolve) => {
    const abortController = new AbortController();

    const app = new Application();
    const router = new Router();

    router.get("/api/v1/hello", (ctx) => {
      abortController.abort();
      resolve(ctx.request.ip);
    });

    app.use(router.routes());
    app.use(router.allowedMethods());
  
    await app.listen({
      port: 80,
      signal: abortController.signal
    });
  })
}