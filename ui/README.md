The ui For the sourcemeta one project

## Custom Debugger

The "Custom Debugger" lets you paste any JSON Schema and instance and step
through the real Sourcemeta Blaze evaluation, without needing a connected
registry. It posts directly to a registry's `/self/v1/api/playground/schemas/trace`
endpoint — by default `https://schemas.sourcemeta.com`, Sourcemeta's own
public instance, so it works standalone with no setup. The Custom Debugger UI
lets you point it at a different registry URL if you're running one
elsewhere.
