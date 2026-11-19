import { createModeWatcher, ModeWatcher, setMode, type Mode, type ThemeDefinition } from "../src";

const watcher = createModeWatcher({
  themes: {
    sepia: { classList: ["sepia"], colorScheme: "light" },
    midnight: { classList: ["dark", "midnight"], colorScheme: "dark" },
  },
  defaultMode: "sepia",
});

watcher.setMode("sepia");
watcher.setMode("midnight");
watcher.setMode("light");
watcher.setMode("dark");
watcher.setMode("system");
watcher.setMode((previous) => (previous === "sepia" ? "midnight" : "sepia"));
watcher.ModeWatcher({ defaultMode: "sepia" });
watcher.ModeWatcher({ defaultMode: "system" });
const selected: Mode<"sepia" | "midnight"> = watcher.mode();
watcher.setMode(selected);

// @ts-expect-error Unregistered custom names are rejected.
watcher.setMode("ocean");
// @ts-expect-error Updaters must return a registered mode.
watcher.setMode(() => "ocean");
// @ts-expect-error Component defaults use the same registered names.
watcher.ModeWatcher({ defaultMode: "ocean" });
// @ts-expect-error The built-in watcher only accepts the built-in modes.
setMode("sepia");
// @ts-expect-error The built-in component cannot select an unregistered theme.
ModeWatcher({ defaultMode: "sepia" });

const builtin = createModeWatcher({ themes: {} });
builtin.setMode("light");
// @ts-expect-error Empty registries do not widen to arbitrary strings.
builtin.setMode("sepia");

const sepia = { classList: ["sepia"], colorScheme: "light" } satisfies ThemeDefinition;
// @ts-expect-error The configured default must exist in the registry.
createModeWatcher({ themes: { sepia }, defaultMode: "ocean" });
// @ts-expect-error The system name is reserved.
createModeWatcher({ themes: { system: sepia } });
// @ts-expect-error Native controls need a light or dark color scheme.
createModeWatcher({ themes: { ocean: { classList: ["ocean"], colorScheme: "blue" } } });

const widened: Record<string, ThemeDefinition> = { sepia };
// @ts-expect-error Registry keys must retain their literal types.
createModeWatcher({ themes: widened });

const other = createModeWatcher({ themes: { ocean: sepia } });
other.setMode("ocean");
// @ts-expect-error Registries do not share their custom names.
other.setMode("sepia");
