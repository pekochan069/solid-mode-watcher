import { createEffect, createSignal, mergeProps, onMount } from "solid-js"

type Mode = "dark" | "light" | "system"

const [defaultMode, setDefaultMode] = createSignal<Mode>("system");
const [mode, setMode] = createSignal<Mode>("system");

interface ModeWatcherProps {
  /**
   * The default mode to use instead of the user"s preference.
   *
   * @defaultValue `"system"`
   */
  defaultMode?: Mode
  /**
   * The classname to add to the root `html` element when the mode is dark.
   *
   * @defaultValue `["dark"]`
   */
  darkClassList?: string[]
  /**
   * The classname to add to the root `html` element when the mode is light.
   *
   * @defaultValue `["light"]`
   */
  lightClassList?: string[]
  /**
   * Optionally provide a custom local storage key to use for storing the mode.
   *
   * @defaultValue `"ui-mode"`
   */
  modeStorageKey?: string
  /**
   * An optional nonce to use for the injected script tag to allow-list mode-watcher
   * if you are using a Content Security Policy.
   *
   * @defaultValue `undefined`
   */
  nonce?: string
  /**
   * An optional script ID to use for the injected script tag.
   *
   * @defaultValue `"ui-mode-script"`
   */
  scriptId?: string
}

function ModeWatcher(props: ModeWatcherProps) {
  const merged = mergeProps(
    {
      defaultMode: "system" as Mode,
      darkClassList: ["dark"],
      lightClassList: ["light"],
      modeStorageKey: "ui-mode",
      scriptId: "ui-mode-script",
    },
    props,
  )

  onMount(() => {
    setDefaultMode(merged.defaultMode)

    const mode
      = (localStorage.getItem(merged.modeStorageKey) as Mode | undefined) || merged.defaultMode;
    setMode(mode);
  })

  createEffect(() => {
    const currentMode = mode()

    if (currentMode === undefined)
      return

    const isDarkMode = currentMode === "dark"

    if (!isDarkMode) {
      document.documentElement.classList.remove(...merged.darkClassList)
      document.documentElement.classList.add(...merged.lightClassList)
    }
    else {
      document.documentElement.classList.remove(...merged.lightClassList)
      document.documentElement.classList.add(...merged.darkClassList)
    }

    document.documentElement.style.colorScheme = isDarkMode ? "dark" : "light"

    localStorage.setItem(merged.modeStorageKey, currentMode)
  })

  return (
    <>
      <script
        id={merged.scriptId}
        nonce={merged.nonce}
        // eslint-disable-next-line solid/no-innerhtml
        innerHTML={`const mode=(localStorage.getItem(${merged.modeStorageKey}))||${merged.defaultMode};const isDarkMode=window.matchMedia("(prefers-color-scheme: dark)").matches;if(!isDarkMode){document.documentElement.classList.remove(...${merged.darkClassList});document.documentElement.classList.add(...${merged.lightClassList});}else{document.documentElement.classList.remove(...${merged.lightClassList});document.documentElement.classList.add(...${merged.darkClassList});}document.documentElement.style.colorScheme=isDarkMode?"dark":"light";localStorage.setItem("${merged.modeStorageKey}",mode);`}
      />
    </>
  )
}

function toggleMode() {
  setMode(prev => (prev === "dark" ? "light" : "dark"))
}

function resetMode() {
  setMode(defaultMode())
}

function setSystemMode() {
  if (typeof window === "undefined")
    return "light"

  const systemMode = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"

  setMode(systemMode)
}

export { defaultMode, mode, ModeWatcher, resetMode, setMode, setSystemMode, toggleMode }
