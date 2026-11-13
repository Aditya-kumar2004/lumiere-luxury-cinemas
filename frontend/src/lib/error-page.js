import { consumeLastCapturedError, describeError } from "./error-capture";

export function renderErrorPage(err) {
  const captured = err || consumeLastCapturedError();
  const desc = captured ? describeError(captured) : "No error details captured";
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>This page didn't load</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: #fafafa; color: #111; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 48rem; width: 100%; text-align: left; padding: 2rem; background: #fff; border: 1px solid #ddd; border-radius: 8px; }
      h1 { font-size: 1.25rem; margin: 0 0 0.5rem; }
      pre { color: #dc2626; margin: 1rem 0; font-size: 12px; background: #fef2f2; padding: 1rem; border-radius: 4px; overflow-x: auto; white-space: pre-wrap; word-break: break-all; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; margin-top: 1rem; }
      a, button { padding: 0.5rem 1rem; border-radius: 0.375rem; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: #111; color: #fff; }
      .secondary { background: #fff; color: #111; border-color: #d1d5db; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>This page didn't load</h1>
      <pre>${desc}</pre>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Try again</button>
        <a class="secondary" href="/">Go home</a>
      </div>
    </div>
  </body>
</html>`;
}
