<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=solid-mode-watcher&background=tiles&project=%20" alt="solid-mode-watcher">
</p>

# Solid Mode Watcher

[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg?style=for-the-badge&logo=pnpm)](https://pnpm.io/)

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
import { ModeWatcher } from 'solid-mode-watcher'

function App() {
  return (
    <>
      ...
      <ModeWatcher />
    </>
  )
}
```

To set default mode, use the `defaultMode` property:

```tsx
<ModeWatcher defaultMode="dark" />
```

## API

### toggleMode

A function that toggles the current mode.

```tsx
import { toggleMode } from 'solid-mode-watcher'

<button onClick={toggleMode}>Toggle Mode</button>
```

### setMode

A function that sets the current mode. It accepts a mode value `"light"`, `"dark"` or `"system"`

```tsx
import { setMode } from "solid-mode-watcher";

<button onClick={() => setMode("light")}>Light Mode</button>
<button onClick={() => setMode("dark")}>Dark Mode</button>
<button onClick={() => setMode("system")}>System Mode</button>
```

### setSystemMode

A function that sets the current mode to the system preference.

```tsx
import { setSystemMode } from 'solid-mode-watcher'

<button onClick={setSystemMode}>System Mode</button>
```

### resetMode

A function that resets the mode to the default mode.

```tsx
import { resetMode } from 'solid-mode-watcher'

<button onClick={resetMode}>Reset Mode</button>
```

### mode, defaultMode

Accessors to mode and defaultMode signals.
