<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=solid-mode-watcher&background=tiles&project=%20" alt="solid-mode-watcher">
</p>

# Solid Mode Watcher

[![bun](https://img.shields.io/badge/Bun-000?logo=bun&logoColor=fff)](https://bun.sh/)

Simple mode watcher library for Solid.js.

This library is a port of [mode-watcher](https://github.com/svecosystem/mode-watcher) for `Svelte`.

## Quick start

Install it:

```bash
npm i solid-mode-watcher
# or
yarn add solid-mode-watcher
# or
pnpm add solid-mode-watcher
# or
bun add solid-mode-watcher
```

## Usage

Add the `ModeWatcher` component to the root of your App:

```tsx
import { ModeWatcher } from "solid-mode-watcher";

function App() {
  return (
    <>
      ...
      <ModeWatcher />
    </>
  );
}
```

To set default mode, use the `defaultMode` property:

```tsx
<ModeWatcher defaultMode="dark" />
```

## Custom themes

Create a watcher with `createModeWatcher` to register custom themes. Each theme
defines the classes applied to the root `html` element and the browser's
`color-scheme` for native controls. The returned component, signals, and functions
share the inferred theme names.

```tsx
import { createModeWatcher } from "solid-mode-watcher";

export const { ModeWatcher, setMode, mode, resetMode } = createModeWatcher({
  defaultMode: "sepia",
  themes: {
    sepia: { classList: ["sepia"], colorScheme: "light" },
    midnight: { classList: ["dark", "midnight"], colorScheme: "dark" },
  },
});

function App() {
  return (
    <>
      <ModeWatcher />
      <button onClick={() => setMode("sepia")}>Sepia</button>
      <button onClick={() => setMode("midnight")}>Midnight</button>
      <button onClick={() => setMode("system")}>System</button>
    </>
  );
}
```

Create the watcher once in a shared module and import its exports throughout your
app. Its `setMode` accepts `"light" | "dark" | "system" | "sepia" | "midnight"`.
Unregistered names produce a TypeScript error in `setMode`, updater functions, and
`defaultMode`. The original package exports remain limited to the built-in modes.

Define the theme's colors in your stylesheet:

```css
:root.sepia {
  --background: #f4ecd8;
  --foreground: #5b4636;
}

:root.midnight {
  --background: #0f172a;
  --foreground: #e2e8f0;
}

body {
  background: var(--background);
  color: var(--foreground);
}
```

The built-in `light` and `dark` themes remain available. Entries named `light` or
`dark` override those themes, including their `lightClassList` or `darkClassList`
settings. Define their colors in your stylesheet when you use them.

`system` is reserved. It selects `light` or `dark` and follows operating system
preference changes. Custom themes remain selected when the system preference changes.

The selected mode is saved in local storage and restored on page load, including by
the initial script. Unregistered saved values fall back to `defaultMode`. Calls from
untyped JavaScript with an unregistered name also fall back to `defaultMode`.

## API

### createModeWatcher

Accepts `themes` and an optional `defaultMode`. Returns `ModeWatcher`, `mode`,
`defaultMode`, `setMode`, `toggleMode`, `resetMode`, and `setSystemMode` for that
registry. Each watcher has its own signals. Mount one `ModeWatcher` at the root of
your app.

Theme names must retain their literal types. For a separate theme configuration,
use `satisfies Record<string, ThemeDefinition>` to validate values while preserving
the keys. A `Record<string, ThemeDefinition>` annotation widens the keys to `string`
and is rejected by `createModeWatcher`.

### toggleMode

A function that toggles the current mode.

It switches between `light` and `dark`. From `system` or a custom theme, it selects `dark`.

```tsx
import { toggleMode } from "solid-mode-watcher";

<button onClick={toggleMode}>Toggle Mode</button>;
```

### setMode

A function that sets the current mode. The package export accepts `"light"`,
`"dark"`, or `"system"`. The function returned by `createModeWatcher` also accepts
the custom names from that registry.

```tsx
import { setMode } from "solid-mode-watcher";

<button onClick={() => setMode("light")}>Light Mode</button>
<button onClick={() => setMode("dark")}>Dark Mode</button>
<button onClick={() => setMode("system")}>System Mode</button>
```

### setSystemMode

A function that sets the current mode to the system preference.

It selects the current `light` or `dark` preference once. To follow future system
preference changes, use `setMode("system")`.

```tsx
import { setSystemMode } from "solid-mode-watcher";

<button onClick={setSystemMode}>System Mode</button>;
```

### resetMode

A function that resets the mode to the default mode.

```tsx
import { resetMode } from "solid-mode-watcher";

<button onClick={resetMode}>Reset Mode</button>;
```

### mode, defaultMode

Accessors to mode and defaultMode signals.

### Mode

The built-in mode type, `"light" | "dark" | "system"`. Pass a literal union to
include custom names, for example `Mode<"sepia" | "midnight">`.

### ThemeDefinition

The configuration for a theme:

```ts
interface ThemeDefinition {
  classList: readonly string[];
  colorScheme: "light" | "dark";
}
```

### ModeWatcherProps

The props accepted by `ModeWatcher`. `ModeWatcherProps<"sepia">` includes `"sepia"`
in the allowed `defaultMode` values. Custom themes are registered through
`createModeWatcher`, rather than component props.

### CreateModeWatcherOptions

The configuration accepted by `createModeWatcher`, parameterized by the theme map.
Its `defaultMode` accepts built-in modes and keys from `themes`. The theme name
`system` is rejected because it represents the operating system preference.
