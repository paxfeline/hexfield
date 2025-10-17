# Pin npm packages by running ./bin/importmap

pin "application"
pin "@hotwired/turbo-rails", to: "turbo.min.js"
pin "@hotwired/stimulus", to: "stimulus.min.js"
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js"
pin_all_from "app/javascript/controllers", under: "controllers"
pin "@rails/request.js", to: "@rails--request.js.js" # @0.0.12
pin "codemirror" # @6.0.1
pin "@codemirror/autocomplete", to: "@codemirror--autocomplete.js" # @6.18.6
pin "@codemirror/commands", to: "@codemirror--commands.js" # @6.8.1
pin "@codemirror/language", to: "@codemirror--language.js" # @6.11.1
pin "@codemirror/lint", to: "@codemirror--lint.js" # @6.8.5
pin "@codemirror/search", to: "@codemirror--search.js" # @6.5.11
pin "@codemirror/state", to: "@codemirror--state.js" # @6.5.2
pin "@codemirror/view", to: "@codemirror--view.js" # @6.37.2
pin "@lezer/common", to: "@lezer--common.js" # @1.2.3
pin "@lezer/highlight", to: "@lezer--highlight.js" # @1.2.1
pin "@marijn/find-cluster-break", to: "@marijn--find-cluster-break.js" # @1.0.2
pin "crelt" # @1.0.6
pin "style-mod" # @4.1.2
pin "w3c-keyname" # @2.2.8
pin "@codemirror/lang-html", to: "@codemirror--lang-html.js" # @6.4.9
pin "@codemirror/lang-css", to: "@codemirror--lang-css.js" # @6.3.1
pin "@codemirror/lang-javascript", to: "@codemirror--lang-javascript.js" # @6.2.4
pin "@lezer/css", to: "@lezer--css.js" # @1.2.1
pin "@lezer/html", to: "@lezer--html.js" # @1.3.10
pin "@lezer/javascript", to: "@lezer--javascript.js" # @1.5.1
pin "@lezer/lr", to: "@lezer--lr.js" # @1.4.2
pin "parse5" # @8.0.0
pin "entities/decode", to: "entities--decode.js" # @6.0.1
pin "entities/escape", to: "entities--escape.js" # @6.0.1
