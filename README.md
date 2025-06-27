# Hexfield

Hexfield is an IDE designed for coding students.

Hexfield is a progressive web app (PWA). That means you can access Hexfield from the web, and also install it as an app on your device. It is designed to work both online and offline.

Technical Specifications:

Hexfield is built with Rails 8, which comes with a pre-made service worker and manifest skeleton files. These are the files necessary to make a website into a PWA. The `devise` gem is used for handling user accounts. The code editor is `CodeMirror`.

The service worker caches all files that are needed to run the app. It is modified to try to always use the network first, and fall back to the (persistent) cache. It will also be modified to return pages from the origin-private file system (OPFS) in offline mode.

Hexfield uses the OPFS to store local copies of all files, and Google Cloud to store online versions. In both locations, they are stored in a bucket called "hexfield", and named as paths, like `1/foo/bar.html` where `1` is the user ID of the creator, `foo` is the project name, and `bar.html` is the "real" file name.

Idea: Two OPFS dirs, `local` and `cloud`. All projects stored in the local `cloud` dir (projects can be created while signed in but not connected) are copied from local `cloud` to `local` (as projects named `(user name) [(user id)]-(project)`) when and if the user signs out while not connected (they could also choose to lose work done while not connected). If the user is connected when they sign out, the real cloud will be up-to-date, and their local `cloud` dir should be deleted.

Also: when loading edit, should check timestamps and (most likely, since the files would have been removed otherwise) update the real cloud from the local `cloud` dir.

Projects list should include these... I guess it will anyway (unless the page hasn't been loaded since the project was created? Could/should the projects list page be automatically retrieved and cached when a new project is created? Alternatively, the page could use JS to add any projects stored locally that aren't otherwise listed... this seems kind of complicated. I think necessary, because projects can be created while not connected.)