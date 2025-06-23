import type { Component } from 'solid-js'
import { defaultMode, mode, ModeWatcher, resetMode, setMode, setSystemMode, toggleMode } from 'src'

const App: Component = () => {
  return (
    <>
      <div class="h-24 w-24 bg-black dark:bg-white" />
      <div class="flex flex-col items-start">
        <button onClick={toggleMode} class="rounded-md bg-blue-500 p-2 text-white hover:bg-blue-400 active:bg-blue-600">toggle</button>
        <button onClick={() => setMode("system")} class="rounded-md bg-blue-500 p-2 text-white hover:bg-blue-400 active:bg-blue-600">
          System Mode
        </button>
        <button onClick={() => setMode("light")} class="rounded-md bg-blue-500 p-2 text-white hover:bg-blue-400 active:bg-blue-600">
          Light Mode
        </button>
        <button onClick={() => setMode("dark")} class="rounded-md bg-blue-500 p-2 text-white hover:bg-blue-400 active:bg-blue-600">
          Dark Mode
        </button>
        <button onClick={resetMode} class="rounded-md bg-blue-500 p-2 text-white hover:bg-blue-400 active:bg-blue-600">
          Reset Mode
        </button>
        <button onClick={setSystemMode} class="rounded-md bg-blue-500 p-2 text-white hover:bg-blue-400 active:bg-blue-600">
          Set System Mode
        </button>
      </div>
      <p>
        current mode: {mode()}
      </p>
      <p>
        default mode: {defaultMode()}
      </p>
      <ModeWatcher defaultMode='dark' />
    </>
  )
}

export default App
