import assert from "node:assert/strict";
import { after, afterEach, beforeEach, test } from "node:test";
import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "https://example.test",
  runScripts: "outside-only",
});

for (const name of ["window", "document", "Node", "Element", "HTMLElement", "localStorage"]) {
  globalThis[name] = dom.window[name];
}

const { render } = await import("@solidjs/web");
const { flush } = await import("solid-js");
const builtin = await import("../dist/index.js");
const { createModeWatcher } = builtin;

const themes = {
  sepia: { classList: ["sepia", "warm"], colorScheme: "light" },
  midnight: { classList: ["dark", "midnight"], colorScheme: "dark" },
};
let dispose;
let media;
let watcher;

beforeEach(() => {
  document.documentElement.className = "app";
  document.documentElement.removeAttribute("style");
  document.body.replaceChildren();
  localStorage.clear();
  media = new window.EventTarget();
  media.matches = false;
  window.matchMedia = () => media;
});

afterEach(() => {
  dispose?.();
  dispose = undefined;
  flush();
});

after(() => dom.window.close());

function mount(props = {}, registry = themes) {
  watcher = createModeWatcher({ themes: registry });
  dispose = render(() => watcher.ModeWatcher(props), document.body);
  flush();
}

function select(value) {
  watcher.setMode(value);
  flush();
}

function changeSystemPreference(dark) {
  media.matches = dark;
  media.dispatchEvent(new window.Event("change"));
  flush();
}

function assertTheme(classes, colorScheme) {
  assert.deepEqual([...document.documentElement.classList].sort(), ["app", ...classes].sort());
  assert.equal(document.documentElement.style.colorScheme, colorScheme);
}

test("switches custom themes, removes old classes, and preserves unrelated classes", () => {
  mount();
  select("sepia");
  assertTheme(["sepia", "warm"], "light");
  assert.equal(watcher.mode(), "sepia");
  assert.equal(localStorage.getItem("ui-mode"), "sepia");

  select("midnight");
  assertTheme(["dark", "midnight"], "dark");
  select("dark");
  assertTheme(["dark"], "dark");
  select("light");
  assertTheme(["light"], "light");
});

test("restores a saved custom theme even when the system prefers dark", () => {
  localStorage.setItem("ui-mode", "sepia");
  media.matches = true;
  mount({ defaultMode: "dark" });
  assertTheme(["sepia", "warm"], "light");
  assert.equal(watcher.mode(), "sepia");
  assert.equal(watcher.defaultMode(), "dark");
});

test("supports a custom default mode and resets to it", () => {
  mount({ defaultMode: "sepia" });
  assertTheme(["sepia", "warm"], "light");
  assert.equal(watcher.defaultMode(), "sepia");
  select("midnight");
  watcher.resetMode();
  flush();
  assertTheme(["sepia", "warm"], "light");
  assert.equal(watcher.mode(), "sepia");
});

for (const savedMode of ["removed-theme", "toString", "constructor", "__proto__"]) {
  test(`falls back to the configured theme for saved value ${savedMode}`, () => {
    localStorage.setItem("ui-mode", savedMode);
    mount({ defaultMode: "sepia" });
    assertTheme(["sepia", "warm"], "light");
    assert.equal(watcher.mode(), "sepia");
    assert.equal(localStorage.getItem("ui-mode"), "sepia");
  });
}

test("falls back for an unregistered selection", () => {
  mount({ defaultMode: "sepia" });
  select("removed-theme");
  assertTheme(["sepia", "warm"], "light");
  assert.equal(watcher.mode(), "sepia");
  assert.equal(localStorage.getItem("ui-mode"), "sepia");
});

test("retains the built-in modes, legacy class props, and toggle behavior", () => {
  mount({ lightClassList: ["day"], darkClassList: ["night"] }, {});
  assertTheme(["day"], "light");
  watcher.toggleMode();
  flush();
  assertTheme(["night"], "dark");
  watcher.toggleMode();
  flush();
  assertTheme(["day"], "light");
});

test("allows theme definitions to override the built-in themes", () => {
  mount(
    { darkClassList: ["legacy-dark"] },
    {
      ...themes,
      dark: { classList: ["night", "custom-dark"], colorScheme: "dark" },
    },
  );
  select("dark");
  assertTheme(["night", "custom-dark"], "dark");
  select("sepia");
  assertTheme(["sepia", "warm"], "light");
});

test("follows system changes only while system is selected and cleans up on unmount", () => {
  mount();
  assertTheme(["light"], "light");
  changeSystemPreference(true);
  assertTheme(["dark"], "dark");
  assert.equal(watcher.mode(), "system");
  assert.equal(localStorage.getItem("ui-mode"), "system");

  select("sepia");
  changeSystemPreference(false);
  changeSystemPreference(true);
  assertTheme(["sepia", "warm"], "light");

  select("system");
  assertTheme(["dark"], "dark");
  dispose();
  dispose = undefined;
  changeSystemPreference(false);
  assertTheme(["dark"], "dark");
});

test("setSystemMode still selects the current system preference once", () => {
  mount({ defaultMode: "sepia" });
  media.matches = true;
  watcher.setSystemMode();
  flush();
  assert.equal(watcher.mode(), "dark");
  assertTheme(["dark"], "dark");
  changeSystemPreference(false);
  assertTheme(["dark"], "dark");
});

test("uses the configured storage key without changing the default key", () => {
  localStorage.setItem("ui-mode", "dark");
  localStorage.setItem("my-theme", "sepia");
  mount({ modeStorageKey: "my-theme" });
  assertTheme(["sepia", "warm"], "light");
  select("midnight");
  assert.equal(localStorage.getItem("my-theme"), "midnight");
  assert.equal(localStorage.getItem("ui-mode"), "dark");
});

test("the initial script restores custom themes and uses the same fallback and system behavior", () => {
  mount({ defaultMode: "sepia" });
  const script = document.querySelector("script").textContent;
  dispose();
  dispose = undefined;

  for (const [saved, dark, expected, scheme] of [
    ["sepia", true, ["sepia", "warm"], "light"],
    ["midnight", false, ["dark", "midnight"], "dark"],
    ["light", true, ["light"], "light"],
    ["dark", false, ["dark"], "dark"],
    ["missing", true, ["sepia", "warm"], "light"],
    ["system", true, ["dark"], "dark"],
    ["system", false, ["light"], "light"],
  ]) {
    localStorage.setItem("ui-mode", saved);
    media.matches = dark;
    dom.window.eval(script);
    assertTheme(expected, scheme);
  }

  localStorage.clear();
  dom.window.eval(script);
  assertTheme(["sepia", "warm"], "light");
});

test("the initial script safely serializes custom names and storage keys", () => {
  const name = 'sepia</script><script>window.injected=true</script>"';
  const key = 'my-"theme</script>';
  mount(
    { defaultMode: name, modeStorageKey: key, scriptId: "theme-init", nonce: "test-nonce" },
    { [name]: themes.sepia },
  );
  const script = document.getElementById("theme-init");
  assert.equal(script.getAttribute("nonce"), "test-nonce");
  assert.equal(script.textContent.includes("</script>"), false);
  document.documentElement.className = "app";
  localStorage.clear();
  dom.window.eval(script.textContent);
  assertTheme(["sepia", "warm"], "light");
  assert.equal(localStorage.getItem(key), name);
  assert.equal(dom.window.injected, undefined);
});

test("custom themes work when local storage is unavailable", () => {
  const blockStorage = {
    configurable: true,
    get() {
      throw new window.DOMException("Storage blocked", "SecurityError");
    },
  };
  const globalDescriptor = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  const windowDescriptor = Object.getOwnPropertyDescriptor(window, "localStorage");
  Object.defineProperty(globalThis, "localStorage", blockStorage);
  Object.defineProperty(window, "localStorage", blockStorage);

  try {
    mount({ defaultMode: "sepia" });
    assertTheme(["sepia", "warm"], "light");
    select("midnight");
    assertTheme(["dark", "midnight"], "dark");
    dom.window.eval(document.querySelector("script").textContent);
    assertTheme(["sepia", "warm"], "light");
  } finally {
    Object.defineProperty(globalThis, "localStorage", globalDescriptor);
    Object.defineProperty(window, "localStorage", windowDescriptor);
  }
});

test("rejects reserved theme names and unregistered defaults", () => {
  assert.throws(
    () => createModeWatcher({ themes: { system: themes.sepia } }).ModeWatcher({}),
    /"system" is reserved/,
  );
  assert.throws(() => builtin.ModeWatcher({ defaultMode: "unknown" }), /not a registered theme/);
});

test("the original exports still control the built-in watcher", () => {
  dispose = render(() => builtin.ModeWatcher({ defaultMode: "dark" }), document.body);
  flush();
  assertTheme(["dark"], "dark");
  builtin.setMode("light");
  flush();
  assertTheme(["light"], "light");
  assert.equal(builtin.mode(), "light");
});

test("factory defaults and state are scoped to their own registry", () => {
  const first = createModeWatcher({ themes, defaultMode: "sepia" });
  const second = createModeWatcher({ themes: { ocean: themes.midnight }, defaultMode: "ocean" });
  assert.equal(first.mode(), "sepia");
  assert.equal(first.defaultMode(), "sepia");
  assert.equal(second.mode(), "ocean");
  second.setMode("dark");
  flush();
  assert.equal(first.mode(), "sepia");
  first.setMode("midnight");
  flush();
  first.resetMode();
  flush();
  assert.equal(first.mode(), "sepia");
  assert.equal(second.mode(), "dark");
});
