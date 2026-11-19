import { createEffect, createSignal, merge, onSettled } from "solid-js";
import {
  applyMode,
  createModeScript,
  type Mode,
  type ModeOptions,
  type ThemeDefinition,
} from "./theme";

interface ModeWatcherProps<CustomMode extends string = never> {
  /**
   * The mode to use when no registered mode is stored.
   *
   * @defaultValue `"system"`
   */
  defaultMode?: Mode<CustomMode>;
  /**
   * The classname to add to the root `html` element when the mode is dark.
   *
   * @defaultValue `["dark"]`
   */
  darkClassList?: string[];
  /**
   * The classname to add to the root `html` element when the mode is light.
   *
   * @defaultValue `["light"]`
   */
  lightClassList?: string[];
  /**
   * Optionally provide a custom local storage key to use for storing the mode.
   *
   * @defaultValue `"ui-mode"`
   */
  modeStorageKey?: string;
  /**
   * An optional nonce to use for the injected script tag to allow-list mode-watcher
   * if you are using a Content Security Policy.
   *
   * @defaultValue `undefined`
   */
  nonce?: string;
  /**
   * An optional script ID to use for the injected script tag.
   *
   * @defaultValue `"ui-mode-script"`
   */
  scriptId?: string;
}

interface CreateModeWatcherOptions<Themes extends Record<string, ThemeDefinition>> {
  /** Registered themes with literal names. The name `system` is reserved. */
  themes: Themes & { system?: never } & (string extends keyof Themes ? never : unknown);
  defaultMode?: NoInfer<Mode<Extract<keyof Themes, string>>>;
}

function createModeWatcher<const Themes extends Record<string, ThemeDefinition>>(
  config: CreateModeWatcherOptions<Themes>,
) {
  type CustomMode = Extract<keyof Themes, string>;
  const initialMode: Mode<CustomMode> = config.defaultMode ?? "system";
  const [defaultMode, setDefaultMode] = createSignal<Mode<CustomMode>>(() => initialMode);
  const [mode, setMode] = createSignal<Mode<CustomMode>>(() => initialMode);

  function ModeWatcher(props: ModeWatcherProps<CustomMode>) {
    const merged = merge(
      {
        defaultMode: initialMode,
        darkClassList: ["dark"],
        lightClassList: ["light"],
        modeStorageKey: "ui-mode",
        scriptId: "ui-mode-script",
      } satisfies Partial<ModeWatcherProps<CustomMode>>,
      props,
    );
    const options: ModeOptions<CustomMode> = {
      defaultMode: merged.defaultMode,
      modeStorageKey: merged.modeStorageKey,
      themes: {
        light: { classList: merged.lightClassList, colorScheme: "light" },
        dark: { classList: merged.darkClassList, colorScheme: "dark" },
        ...config.themes,
      },
    };

    if (Object.hasOwn(options.themes, "system")) {
      throw new Error('The theme name "system" is reserved for the operating system preference.');
    }
    if (options.defaultMode !== "system" && !Object.hasOwn(options.themes, options.defaultMode)) {
      throw new Error(`The default mode "${options.defaultMode}" is not a registered theme.`);
    }

    const [initialized, setInitialized] = createSignal(false);

    onSettled(() => {
      if (typeof window === "undefined") return;

      setDefaultMode(() => options.defaultMode);
      setMode(() => applyMode(options));
      setInitialized(true);

      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const updateSystemMode = () => {
        if (mode() === "system") applyMode(options, "system");
      };

      media.addEventListener("change", updateSystemMode);
      return () => media.removeEventListener("change", updateSystemMode);
    });

    createEffect(
      () => (initialized() ? mode() : undefined),
      (theme) => {
        if (theme === undefined) return;
        setMode(() => applyMode(options, theme));
      },
    );

    return (
      <>
        <script
          id={merged.scriptId}
          nonce={merged.nonce}
          // eslint-disable-next-line solid/no-innerhtml
          innerHTML={createModeScript(options)}
        />
      </>
    );
  }

  function toggleMode() {
    setMode((prev) => (prev === "dark" ? "light" : "dark"));
  }

  function resetMode() {
    setMode(() => defaultMode());
  }

  function setSystemMode() {
    if (typeof window === "undefined") return "light";

    const systemMode = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

    setMode(systemMode);
  }

  return { defaultMode, mode, ModeWatcher, resetMode, setMode, setSystemMode, toggleMode };
}

const { defaultMode, mode, ModeWatcher, resetMode, setMode, setSystemMode, toggleMode } =
  createModeWatcher({ themes: {} });

export {
  type CreateModeWatcherOptions,
  type Mode,
  type ModeWatcherProps,
  type ThemeDefinition,
  createModeWatcher,
  defaultMode,
  mode,
  ModeWatcher,
  resetMode,
  setMode,
  setSystemMode,
  toggleMode,
};
