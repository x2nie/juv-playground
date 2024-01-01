// import './style.css'
// import typescriptLogo from './typescript.svg'
// import viteLogo from '/vite.svg'
// import { setupCounter } from './counter.ts'
// import { App } from './ui/App.ts'
import { Program } from './program.js';
import { Playground } from './ui/playground.js';
import { loadFile, mount, reactive, whenReady } from '@odoo/owl'

// document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
//   <div>
//     <a href="https://vitejs.dev" target="_blank">
//       <img src="${viteLogo}" class="logo" alt="Vite logo" />
//     </a>
//     <a href="https://www.typescriptlang.org/" target="_blank">
//       <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
//     </a>
//     <h1>Vite + TypeScript</h1>
//     <div class="card">
//       <button id="counter" type="button"></button>
//     </div>
//     <p class="read-the-docs">
//       Click on the Vite and TypeScript logos to learn more
//     </p>
//   </div>
// `

// setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)
const [templates,models,palette] = await Promise.all([
    await loadFile("ui-templates.xml"),
    await loadFile("static/models.xml"),
    loadFile("static/resources/palette.xml"),
    whenReady()
]);
const env = { program: reactive(new Program(models, palette)) };
mount(Playground, document.body, {env, templates})



// console.log(env.program.palette)
console.log(models)
console.log(env.program.models)
