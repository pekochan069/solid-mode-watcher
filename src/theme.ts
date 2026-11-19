export type Mode<CustomMode extends string = never> = "dark" | "light" | "system" | CustomMode;

export interface ThemeDefinition {
  classList: readonly string[];
  colorScheme: "light" | "dark";
}

export interface ModeOptions<CustomMode extends string> {
  defaultMode: Mode<CustomMode>;
  modeStorageKey: string;
  themes: Record<string, ThemeDefinition> & {
    light: ThemeDefinition;
    dark: ThemeDefinition;
  };
}

// This function also runs as an inline script, so it must not reference module scope.
export function applyMode<CustomMode extends string>(
  options: ModeOptions<CustomMode>,
  preference?: Mode<CustomMode>,
): Mode<CustomMode> {
  let savedMode: string | null | undefined = preference;

  if (savedMode === undefined) {
    try {
      savedMode = localStorage.getItem(options.modeStorageKey);
    } catch {
      // Storage can be unavailable even when the DOM is accessible.
    }
  }

  const isRegisteredMode = (value: string | null | undefined): value is Mode<CustomMode> =>
    typeof value === "string" && (value === "system" || Object.hasOwn(options.themes, value));
  const mode = isRegisteredMode(savedMode) ? savedMode : options.defaultMode;
  const themeName =
    mode === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : mode;
  const theme = options.themes[themeName] ?? options.themes.light;
  const root = document.documentElement;

  root.classList.remove(...Object.values(options.themes).flatMap((theme) => theme.classList));
  root.classList.add(...theme.classList);
  root.style.colorScheme = theme.colorScheme;

  try {
    localStorage.setItem(options.modeStorageKey, mode);
  } catch {
    // Theme changes still work without persistent storage.
  }

  return mode;
}

export function createModeScript<CustomMode extends string>(
  options: ModeOptions<CustomMode>,
): string {
  const config = JSON.stringify(options).replace(/</g, "\\u003c");
  return `(${applyMode.toString()})(${config});`;
}
