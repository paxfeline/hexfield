// see https://codemirror.net/examples/bundle/
// node_modules/.bin/rollup public/codemirror/editor.mjs -f iife \
//  -o editor.bundle.js -p @rollup/plugin-node-resolve

import {EditorView, basicSetup} from "codemirror"
import {javascript} from "@codemirror/lang-javascript"

let editor = new EditorView({
  extensions: [basicSetup, javascript()],
  parent: document.body
})