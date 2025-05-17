// see https://codemirror.net/examples/bundle/
/*
node_modules/.bin/rollup public/codemirror/editor.mjs -f iife \
  -o editor.bundle.js -p @rollup/plugin-node-resolve
cp editor.bundle.js public/codemirror/

*/

import {EditorView, basicSetup} from "codemirror"
import {keymap} from "@codemirror/view"
import {indentWithTab} from "@codemirror/commands"
import {python} from "@codemirror/lang-python"

let editor = new EditorView({
  extensions: [
    basicSetup,
    keymap.of([indentWithTab]),
    python()
  ],
  parent: document.body
})